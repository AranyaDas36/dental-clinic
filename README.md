# Dental Clinic Website + Admin CMS

Production-minded, database-driven website for a single dental clinic with an authenticated admin dashboard for content, theme, services, media, reviews, appointments, and publishing.

> Demo/placeholder content is clearly labeled and must be replaced with verified clinic information before going live.

## Stack

| Area         | Technology                                                             |
| ------------ | ---------------------------------------------------------------------- |
| Monorepo     | pnpm workspaces                                                        |
| Shared       | TypeScript + Zod (`@dental/shared`)                                    |
| API          | Node.js, Express 5, Mongoose, Argon2, Helmet                           |
| Web          | React, Vite, TypeScript, Tailwind CSS, React Router, TanStack Query    |
| Data / media | MongoDB Atlas, Cloudinary                                              |
| Tests        | Vitest, Supertest, React Testing Library (Playwright in a later phase) |

## Packages

- `shared/` — API contracts, theme/section Zod schemas, defaults
- `server/` — Express API (`/api/v1`)
- `client/` — Public site + `/admin` dashboard UI

## Prerequisites

- Node.js 20+
- pnpm 10+
- MongoDB Atlas connection string (or local MongoDB)
- Cloudinary account (required for media uploads in later phases)

## Setup

```bash
pnpm install
cp .env.example .env
cp .env.example client/.env   # optional; set VITE_API_BASE_URL if needed
```

Edit `.env` with real `MONGODB_URI`, admin seed credentials, and Cloudinary values. Never commit `.env`.

## Development

```bash
# shared types + API + Vite client
pnpm dev

# or separately
pnpm dev:server
pnpm dev:client
```

- Public site: http://localhost:5173
- Admin scaffold: http://localhost:5173/admin
- API health: http://localhost:4000/api/v1/health

## Scripts

| Command           | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `pnpm build`      | Build shared, server, and client                         |
| `pnpm typecheck`  | TypeScript checks across packages                        |
| `pnpm lint`       | ESLint                                                   |
| `pnpm format`     | Prettier write                                           |
| `pnpm test`       | Unit/API/component tests                                 |
| `pnpm seed:admin` | Create initial administrator (Phase 3 completes this)    |
| `pnpm seed:demo`  | Seed placeholder clinic content (Phase 3 completes this) |

## Environment variables

See `.env.example`. Backend secrets must never be exposed as `VITE_*` variables.

Important pairs for separate FE/BE hosts:

- `CORS_ORIGIN` — exact frontend origin (no wildcards with credentials)
- `VITE_API_BASE_URL` — public API base including `/api/v1`
- `COOKIE_SECURE=true` in production (HTTPS)
- Cookie + CSRF names used by session auth (Phase 3)

## Current phase status

**Phase 2 — Project foundation** is in place:

- Monorepo tooling, shared Zod schemas, Express app/server split, env validation, Mongo connection helper, Vite client routing, health endpoint, smoke tests

**Not yet implemented:** Mongoose models, session auth, public/admin CRUD, publishing, Cloudinary uploads, Playwright e2e, full documentation for deployment/backups.

## License

Private project — all rights reserved unless otherwise stated.
