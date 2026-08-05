# Blazon

**Blazon** is the operating system for competitive esports organizations — public brand site, tournaments, recruitment, fans, and team ops in one multi-tenant SaaS.

> *Build your crest. Run your circuit. Grow your fans.*

## Pilot

First organization tenant: **Lengüetazo Divino (LD)** — live at `/o/ld`. Conceptual design brief lives in [`docs/pilot-ld/`](docs/pilot-ld/).

## Stack

- **Monorepo** (pnpm + Turborepo) + modular monolith
- `apps/web` — Next.js (App Router) — public org sites + dashboards
- `apps/api` — NestJS — auth, orgs, tournaments, billing
- `packages/db` — PostgreSQL + Prisma
- `packages/shared` — types, DTOs, plan entitlements
- `packages/ui` — theme tokens → CSS variables
- Stripe (org subscriptions)
- Deploy: Render (Phase 1)

## Quick start

```bash
pnpm install
cp .env.example .env
pnpm db:up && pnpm db:migrate && pnpm db:seed
pnpm dev   # web :3000 · api :4000
```

Full instructions: [`docs/getting-started.md`](docs/getting-started.md).

## Status — Phase 1 (LD pilot MVP) ✅

- Multi-tenant orgs with themed public sites (`/o/[slug]`) and block-based CMS pages
- Google/Twitch OAuth + personal dashboard (dev login for local)
- Tournament engine: registration, check-in, single-elim brackets, admin results
- Org admin dashboard: theme, pages, tournaments, members, subscription
- Stripe plans + test checkout (LD runs on a comped Elite plan)

## Docs

- [Architecture](docs/architecture.md)
- [Roadmap (Phases 1–5)](docs/roadmap.md)
- [Competitive matrix & gap analysis](docs/competitive-matrix.md)
- [Getting started](docs/getting-started.md)

## License

Proprietary — all rights reserved.
