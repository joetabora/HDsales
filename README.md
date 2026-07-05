# Forge — The Sales Operating System for Harley Dealers

> Built for salespeople who sell — not managers who report.

## Quick Start

```bash
npm install
docker compose up -d postgres redis   # optional — or use Neon
npx prisma migrate deploy
npm run db:seed
npm run dev
```

**Demo login:** `sales@forge.app` / `forge123!`

## What Forge Does Today

- **Walk-Up Cards** — instant customer intel from real data before every conversation
- **Quick Add** — name + phone + note on the floor, auto-schedules 4 follow-up tasks
- **Customer profiles** — edit, log calls/texts/walk-ins, timeline
- **Pipeline** — drag-and-drop deal stages
- **Tasks & follow-ups** — no Redis required, plain Postgres
- **Inventory** — search, payment calculator, trade estimator
- **QR business card** — `/card/your-slug`

## Stack

Next.js 16 · Prisma · Neon Postgres · Better Auth · Tailwind · Vercel

## Deploy

See [`docs/deployment.md`](docs/deployment.md).

AI provider layer is dormant — re-enable when you're ready by setting `AI_PROVIDER` and adding API keys.
