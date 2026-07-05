# Deployment

## Vercel (Recommended for App)

1. Connect GitHub repo to Vercel
2. Set environment variables from `.env.example`
3. Add Postgres (Neon/Supabase with pgvector) and Redis (Upstash)
4. Deploy — `npm run build` runs automatically

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
