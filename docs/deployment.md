# Deployment

## Vercel (Recommended for App)

1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel **before** the first deploy (see table below)
3. Add Postgres (Neon/Supabase with pgvector)
4. Deploy — `npm run build` runs `prisma generate && next build`

> **Note:** `DATABASE_URL` must be set in Vercel env vars for runtime. A placeholder is used during `prisma generate` if missing at build time, but the app will not work until a real database URL is configured.

## Docker (Self-Hosted)

```bash
docker compose up -d
docker compose exec app npx prisma db push
docker compose exec app npm run db:seed
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| DATABASE_URL | Yes | PostgreSQL with pgvector |
| REDIS_URL | Yes | Redis for BullMQ |
| BETTER_AUTH_SECRET | Yes | Min 32 chars |
| NEXT_PUBLIC_APP_URL | Yes | Public app URL |
| AI_PROVIDER | No | Default: dev |

## Health Check

`GET /api/health` — returns `{ status: "healthy" }`

## Worker Process

Run separately: `npm run worker`
