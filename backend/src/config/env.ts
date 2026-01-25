import dotenv from 'dotenv';

dotenv.config();

const required = [
  'DATABASE_URL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'FRONTEND_URL',
  'REDIS_URL'
];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[env] Missing ${key}.`);
  }
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL ?? '',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  redisUrl: process.env.REDIS_URL ?? 'redis://localhost:6379',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
  uploadsDir: process.env.UPLOADS_DIR ?? 'uploads'
};
