# Blazon

**Blazon** is the operating system for competitive esports organizations — public brand site, tournaments, recruitment, fans, and team ops in one multi-tenant SaaS.

> *Build your crest. Run your circuit. Grow your fans.*

## Pilot

First organization tenant: **Lenguetazo Divino (LD)**. Conceptual design brief lives in [`docs/pilot-ld/`](docs/pilot-ld/).

## Stack (planned)

- **Monorepo** + modular monolith
- `apps/web` — Next.js (App Router)
- `apps/api` — NestJS
- PostgreSQL + Prisma
- Stripe (org subscriptions)
- Deploy: Render (Phase 1)

## Status

Repository bootstrap. Phase 1 implementation starts next (auth, multi-tenant org sites, tournament engine, LD seed).

## License

Proprietary — all rights reserved.
