# MasterMyTrack.ai

End-to-end AI mastering SaaS with React + Vite, Node/Express, Prisma/PostgreSQL, and BullMQ.

## Features
- Upload MP3/WAV/FLAC/OGG/AAC and stream originals.
- Choose mastering styles (free + premium locked).
- Async mastering jobs with progress/status.
- A/B comparison and mastered download (forced attachment download).
- Stripe Checkout subscription for €4/mo.
- Dashboard history with playback and downloads.

## Tech Stack
- **Frontend**: React, Vite, TypeScript, Tailwind, React Query, Wavesurfer
- **Backend**: Node.js, Express, TypeScript, Multer, BullMQ, Redis
- **DB**: PostgreSQL via Prisma
- **Audio**: FFmpeg/FFprobe

## Setup

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Environment variables

Copy `.env.example` into `.env` in both `backend/` and `frontend/` and update values.

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3. Database + Redis

Start Postgres + Redis (example docker-compose):

```yaml
version: '3.9'
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: mastermytrack
    ports:
      - "5432:5432"
  redis:
    image: redis:7
    ports:
      - "6379:6379"
```

Run migrations + seed styles:

```bash
cd backend
npm run db:migrate
npm run db:seed
```

### 4. FFmpeg

Install FFmpeg + FFprobe and make them available in PATH.

macOS (brew):
```bash
brew install ffmpeg
```

Ubuntu:
```bash
sudo apt-get install ffmpeg
```

### 5. Run the app

```bash
# backend
cd backend
npm run dev

# frontend
cd frontend
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:4000

## Stripe Setup

1. Create a Stripe account and get test keys.
2. Set `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`.
3. Use Stripe CLI to forward events:

```bash
stripe listen --forward-to localhost:4000/api/billing/webhook
```

## Scripts

Backend:
- `npm run dev` — start API + worker
- `npm run db:migrate` — run Prisma migrations
- `npm run db:seed` — seed mastering styles

Frontend:
- `npm run dev` — start Vite dev server

## Required API Endpoints

All endpoints required by the spec are implemented:
- Auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`, `/api/auth/me`
- Uploads: `/api/uploads` (multipart), `/api/uploads/:id/stream`
- Masters: `/api/masters`, `/api/masters/:id`, `/api/masters/:id/stream/original`, `/api/masters/:id/stream/master`, `/api/masters/:id/download`
- Billing: `/api/billing/create-checkout-session`, `/api/billing/webhook`, `/api/billing/status`

## Notes
- Local uploads stored in `uploads/`.
- Mastered downloads use `Content-Disposition: attachment` to trigger browser save.
- Premium styles are locked until a subscription is active.
