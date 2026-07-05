# Deployment

## Vercel (Recommended for App)

1. Connect GitHub repo to Vercel
2. Set environment variables in Vercel **before** the first deploy (see table below)
3. Add Postgres (Neon/Supabase with pgvector)
4. Deploy — build runs `prisma migrate deploy` to create tables, then `next build`

> **First deploy:** Ensure `DATABASE_URL` points to your Neon database **before** deploying. The build step creates all tables automatically.

### Manual setup (optional)

If tables are missing, run from your machine:

```bash
DATABASE_URL="your-neon-url" npx prisma migrate deploy
DATABASE_URL="your-neon-url" npm run db:seed   # optional demo data
```

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
