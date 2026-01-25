import { Request, Response } from 'express';
import Stripe from 'stripe';
import { env } from '../config/env.js';
import { prisma } from '../config/prisma.js';
import { AuthRequest } from '../middleware/auth.js';

const stripe = new Stripe(env.stripeSecretKey, { apiVersion: '2023-10-16' });

export async function createCheckoutSession(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: { name: 'MasterMyTrack Premium' },
          recurring: { interval: 'month' },
          unit_amount: 400
        },
        quantity: 1
      }
    ],
    success_url: `${env.frontendUrl}/billing?success=true`,
    cancel_url: `${env.frontendUrl}/pricing?canceled=true`,
    metadata: { userId: user.id }
  });

  return res.json({ id: session.id, url: session.url });
}

export async function webhook(req: Request, res: Response) {
  const signature = req.headers['stripe-signature'];
  if (!signature) {
    return res.status(400).send('Missing signature');
  }
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, env.stripeWebhookSecret);
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${(error as Error).message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      if (userId && session.customer && session.subscription) {
        await prisma.user.update({
          where: { id: userId },
          data: {
            isPremium: true,
            stripeCustomerId: String(session.customer),
            stripeSubscriptionId: String(session.subscription),
            currentPeriodEnd: session.expires_at ? new Date(session.expires_at * 1000) : null
          }
        });
      }
      break;
    }
    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: { isPremium: false }
      });
      break;
    }
    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      await prisma.user.updateMany({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          isPremium: subscription.status === 'active',
          currentPeriodEnd: subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : null
        }
      });
      break;
    }
    default:
      break;
  }

  res.json({ received: true });
}

export async function billingStatus(req: AuthRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  return res.json({
    isPremium: user.isPremium,
    currentPeriodEnd: user.currentPeriodEnd,
    stripeCustomerId: user.stripeCustomerId,
    stripeSubscriptionId: user.stripeSubscriptionId
  });
}
