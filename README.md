# Forge — The AI Sales Operating System

> AI-powered sales platform for powersports salespeople. Not another CRM — built for people who sell.

## Quick Start

```bash
# Install dependencies
npm install

# Start Postgres + Redis
docker compose up -d postgres redis

# Setup database
npx prisma db push
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo login:** `sales@forge.app` / `forge123!`

## Stack

- **Frontend:** Next.js 16, React 19, Tailwind 4, shadcn/ui, Framer Motion
- **Backend:** Next.js API Routes, Prisma 7, PostgreSQL + pgvector, Redis, BullMQ
- **Auth:** Better Auth (email/password, magic link, OAuth-ready)
- **AI:** Provider abstraction (dev/OpenAI/Anthropic/Gemini/Ollama)

## Features

- Customer profiles with full relationship data
- AI Deal Brief — tap a name, get a walk-up briefing
- Voice capture with auto-transcription and CRM updates
- Pipeline Kanban with drag-and-drop
- Inventory search with instant filters
- Payment calculator and trade estimator
- Follow-up engine with configurable sequences
- Messaging center with templates and AI drafts
- Events, calendar, QR business cards
- Knowledge base with semantic search
- Gamification (XP, streaks, achievements)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run worker` | Start background workers |
| `npm run test` | Run unit tests |
| `npm run test:e2e` | Run Playwright tests |
| `npm run db:seed` | Seed demo data |

## Documentation

See [`docs/`](docs/) for architecture, ERD, deployment, and checklists.

## License

Private — All rights reserved.
