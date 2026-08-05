# Roadmap — Blazon

## Fase 1 — MVP piloto LD ✅ (este repo)

**Objetivo:** Lengüetazo Divino opera su sitio y torneos en la plataforma; schema game-agnostic desde el día 1.

- [x] Monorepo Next.js + NestJS + Prisma/PostgreSQL
- [x] Multi-tenant: org LD (`/o/ld`), tema del brief, memberships y roles
- [x] Auth Google + Twitch (+ dev login local); dashboard personal
- [x] Page builder por bloques + páginas del brief (Home, Torneos, stubs Ranking/Academia/Streaming/Clips/Tienda/Reclutamiento)
- [x] Motor de torneos: CRUD, inscripción, check-in, bracket single-elim, resultados, countdown
- [x] Dashboard org: tema, páginas, torneos, miembros, suscripción
- [x] Stripe: planes + checkout en modo test (LD en plan COMPED)
- [x] Seed LD + documentación
- [ ] Deploy en Render (web + api + Postgres) con staging

**Criterios de éxito:** visitante ve el home LD con countdown; usuario se registra e inscribe; admin genera bracket y carga resultados; una segunda org se crea sin código; checkout Stripe test operativo.

## Fase 2 — Competitivo profundo + contenido

Absorbe: Toornament, Battlefy, Amber, brief LD.

- Multi-stage: grupos, double elim, swiss; embeds de bracket/standings
- Discovery global de torneos ("qué jugar hoy")
- Rankings con filtros y gráficos; player cards; verificación Riot ID (LoL)
- Academia (programas, mentores, horarios)
- Streaming/casteo + calendario + overlays stub
- Galería de clips con filtros
- Primer pack multi-game schema-ready

## Fase 3 — Red career + fans + merch

Absorbe: Wombo, Curry, b.stage, Matcherino light.

- Recruitment hub: resumes, LFT/LFP/LFS, tryouts, ofertas staff
- Fan clubs / memberships / perks; loyalty points básico
- Tienda merch (Stripe)
- Entry fees + prize pool tracking (Stripe Connect cuando madure)
- CMS de publicaciones avanzado

## Fase 4 — Org OS + red entre orgs

Absorbe: Enkelt + white-label.

- Roster ops, contratos/expiry, availability
- Scrim marketplace org↔org
- Custom domains + white-label Elite + API/widgets públicos
- Sponsor quests / crowdfunding de prize pool
- Discord bot (reminders, check-ins)
- Finance light; ladders/hubs; escalabilidad (colas, CDN, rate limits)

## Fase 5 — IA + expansión multi-game

- Asistente por rol (jugador, coach, org admin): copy, rulesets, estructura de torneo, scouting, score assist
- Contexto aislado por tenant + políticas de datos
- Game packs: Valorant, CS2, Wild Rift, …
- Data partners (PandaScore/GRID) para broadcast widgets

## Planes de suscripción

| Plan | Enfoque | Incluye (orientativo) |
|---|---|---|
| **Starter** ($0) | Amateur / T3 | 1 sitio, torneos limitados/mes, tema básico, branding plataforma |
| **Pro** ($29) | Academias / orgs serias | Torneos ilimitados, page builder, rankings, academia, sin branding forzado |
| **Elite** ($99) | Semi-pro / T2–T1 | Custom domain, merch, fans/memberships, reclutamiento, analytics, seats staff |
| **Network+** ($299) | Orgs grandes | Todo Elite + red avanzada, AI seats, SLA, white-label |

Usuarios finales (jugadores/fans): cuenta gratuita; la monetización principal es B2B por organización.
