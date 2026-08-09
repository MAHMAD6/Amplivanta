# Amplivanta

Full-service digital marketing agency website. Next.js 15 (App Router) · TypeScript · Tailwind v3 · Prisma/PostgreSQL · NextAuth v5 · Framer Motion.

## Features

- **Public site**: Home, About, Services (+ detail), Portfolio (+ detail, filterable), Reviews (+ submission), Contact (form + FAQ), Blog (+ post).
- **Admin panel** (`/admin`): dashboard, CRUD for services, portfolio, blog, team; review moderation; contact messages; site settings. Auth-gated.
- **API**: REST routes for all entities + contact/review submission + image upload.
- Mock-data fallback: the site renders even before the database is connected.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy env and adjust:

```bash
cp .env.example .env
```

3. Start PostgreSQL (either use the included compose file or any Postgres instance and point `DATABASE_URL` at it):

```bash
docker compose up -d
```

4. Push schema and seed:

```bash
npm run db:push
npm run db:seed
```

5. Run:

```bash
npm run dev
```

## Admin login

- URL: `/login`
- Email / password: from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` (defaults `admin@amplivanta.com` / `Admin@123456`).

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run db:push` | Sync Prisma schema to DB |
| `npm run db:seed` | Seed initial data |

## Notes

- Design tokens: primary lime `#B5FF2D`, dark green `#1A3C2B`. See `tailwind.config.ts`.
- If no database is reachable, pages fall back to `lib/mock-data.ts`.
