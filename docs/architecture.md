# Forge — Architecture

## Overview

Forge is a multi-tenant AI Sales Operating System built as a Next.js 16 monolith with background workers.

```
Browser (PWA) → Next.js App Router → Services → Prisma/pgvector
                                      ↓
                              BullMQ Workers → Redis
```

## Key Layers

| Layer | Location | Purpose |
|-------|----------|---------|
| Routes | `src/app/` | Thin pages and API routes |
| Features | `src/features/` | UI components + hooks per domain |
| Services | `src/server/services/` | Business logic |
| Lib | `src/lib/` | Auth, AI, storage, messaging adapters |
| Workers | `src/workers/` | Background job processors |

## Multi-Tenancy

All data is scoped by `dealershipId`. Users belong to one dealership with roles: ADMIN, MANAGER, SALESPERSON.

## AI Provider Abstraction

`src/lib/ai/` exposes a unified interface. Default `dev` provider enables full end-to-end flows without API keys. Switch via `AI_PROVIDER` env var.

## Authentication

Better Auth with Prisma adapter. Email/password + magic link + optional Google/Apple OAuth.

## Database

PostgreSQL with pgvector for semantic search on notes and knowledge articles. Soft deletes via `deletedAt`. Audit trail in `activity_logs`.
