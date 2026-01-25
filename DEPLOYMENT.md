# Deployment Guide

This repo contains a **React/Vite frontend** and a **Node/Express backend** with Prisma/PostgreSQL and BullMQ/Redis.

## Stack Detection
- **Frontend:** React + Vite (static build output in `frontend/dist`).
- **Backend:** Express + TypeScript (Node.js), Prisma ORM, BullMQ + Redis, PostgreSQL.

---

## Required Environment Variables

### Backend (`backend/.env`)
- `PORT` — API port (default 4000).
- `DATABASE_URL` — PostgreSQL connection string.
- `JWT_ACCESS_SECRET` — JWT secret for access tokens.
- `JWT_REFRESH_SECRET` — JWT secret for refresh tokens.
- `FRONTEND_URL` — frontend base URL for Stripe redirects.
- `FRONTEND_ORIGINS` — comma-separated list of allowed CORS origins.
- `REDIS_URL` — Redis connection string.
- `STRIPE_SECRET_KEY` — Stripe secret key.
- `STRIPE_WEBHOOK_SECRET` — Stripe webhook signing secret.
- `UPLOADS_DIR` — local path for uploads (default `uploads`).

### Frontend (`frontend/.env`)
- `VITE_API_URL` — backend base URL.

---

## Option A — Managed Hosting (Vercel/Netlify + Render/Railway/Fly)

### Backend (Render or Railway)
1. **Create a PostgreSQL database** (Render/Railway/Fly).
2. **Create a Redis instance** (Render/Railway/Fly).
3. **Deploy backend** from `backend/`:
   - **Build command:** `npm install && npm run build`
   - **Start command:** `npm run start`
   - **Health check:** `/health`
4. **Run migrations** after first deploy:
   ```bash
   npm run db:migrate:deploy
   npm run db:seed
   ```
5. **Set backend env vars** (see list above).

### Frontend (Vercel or Netlify)
1. Deploy `frontend/`.
2. **Build command:** `npm install && npm run build`
3. **Output directory:** `dist`
4. **Set env vars:** `VITE_API_URL` to your backend URL.

> Note: `frontend/vercel.json` and `frontend/netlify.toml` already include SPA rewrites.

---

## Option B — Docker Deployment (single command)

1. Copy env files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```
2. Update values in `backend/.env` + `frontend/.env`.
3. Build & run:
   ```bash
   docker compose up --build
   ```
4. Run migrations + seed in the backend container:
   ```bash
   docker compose exec backend npm run db:migrate:deploy
   docker compose exec backend npm run db:seed
   ```

Frontend: http://localhost:8080
Backend: http://localhost:4000

---

## Production Notes
- Ensure `FRONTEND_ORIGINS` includes your production frontend URL.
- Stripe webhooks must be configured to point to:
  `https://your-api-domain.com/api/billing/webhook`
- Uploads are stored locally in `uploads/` (mount a persistent volume in production).
