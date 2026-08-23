# Deployment Guide — Amplivanta

Production-ready Next.js 15 (App Router) app with Postgres, Prisma, Auth.js, and
optional Redis/AI/Stripe/email integrations.

## 1. Prerequisites

- Node.js 20+
- PostgreSQL 16 (a `docker-compose.yml` is provided for local Postgres + Redis)
- Redis 7 (optional — rate limiting and the workflow queue fall back to
  in-memory/inline when absent)

## 2. Environment

Copy `.env.example` to `.env` and fill in values. Required:

| Var | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string |
| `AUTH_SECRET` (or `NEXTAUTH_SECRET`) | Auth.js session secret — `openssl rand -base64 32` |
| `NEXTAUTH_URL` (or `BETTER_AUTH_URL`) | Public base URL |

Recommended in production: `NEXT_PUBLIC_SITE_URL`, `REDIS_URL`. Optional feature
keys: `ANTHROPIC_API_KEY` (AI; stub without it), `STRIPE_SECRET_KEY` +
`STRIPE_WEBHOOK_SECRET` (billing), `SMTP_*` (email), `R2_*` (asset storage),
`GOOGLE_*` / `HUBSPOT_*` (OAuth integrations).

Env is validated at boot (`lib/env.ts` via `instrumentation.ts`): missing
required vars **throw in production** and warn in development.

## 3. Local development

```bash
docker compose up -d          # Postgres :5544, Redis :6390
npm install
npm run db:push               # apply schema to the dev DB
npm run db:seed               # seed admin user + demo workspace data
npm run dev                   # http://localhost:3000 (or PORT)
```

Seed admin login: `ADMIN_EMAIL` / `ADMIN_PASSWORD` (defaults
`admin@amplivanta.com` / `Admin@123456`).

## 4. Database migrations

The dev workflow uses `db push`. For production history, create migrations:

```bash
npm run db:migrate            # create + apply a migration (dev)
npm run db:deploy             # apply committed migrations (prod / CI / container)
```

The Docker image applies migrations automatically on start when
`prisma/migrations/` exists, otherwise it pushes the schema.

## 5. Production build (bare metal)

```bash
npm ci
npm run build                 # Next standalone output
npm run db:deploy             # or db:push on first deploy
node .next/standalone/server.js
```

## 6. Docker

```bash
docker build -t amplivanta .
docker run -p 3000:3000 --env-file .env amplivanta
```

The container runs schema apply + `server.js`, and exposes a `HEALTHCHECK`
against `/api/health`.

## 7. Health check

`GET /api/health` → `200 {status:"ok",db:"up"}` when the database is reachable,
`503` otherwise. Point your load balancer / uptime monitor here.

## 8. CI

`.github/workflows/ci.yml` runs on push/PR to `main`: install → prisma generate
→ typecheck → lint → build.

## 9. Verify

```bash
npm run typecheck
npm run lint
npm run build
curl -fsS http://localhost:3000/api/health
```
