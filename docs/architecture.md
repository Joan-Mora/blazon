# Arquitectura — Blazon

> Org OS multi-tenant de esports. Un tenant = sitio público + dashboard de administración + red de plataforma.

## Decisión: Monorepo + Modular Monolith

Dos ejes independientes:

| Eje | Decisión |
|---|---|
| Repositorio | **Monorepo** (pnpm workspaces + Turborepo) |
| Runtime | **Modular monolith**: dos deployables (`web`, `api`), backend partido en módulos de dominio |

Un monorepo no implica monolito eterno: `web` y `api` se despliegan por separado, y cualquier módulo NestJS puede extraerse a un servicio propio cuando lo justifique la carga o el equipo (brackets en vivo, workers de IA, media, notificaciones).

Alternativas descartadas al inicio:

- **Polyrepo:** web y api comparten tipos, DTOs, planes y contratos a diario; versionar paquetes internos frena a un equipo pequeño.
- **Microservicios día 1:** complejidad operativa (red, tracing, consistencia eventual) antes de tener product-market fit.
- **Monolito sin módulos:** degenera en "big ball of mud" con torneos + CMS + billing + red + IA.

## Estructura

```
/
├── apps/
│   ├── web/          # Next.js (App Router) — sitios públicos + dashboards
│   └── api/          # NestJS modular monolith
├── packages/
│   ├── db/           # Prisma schema + migrations + seed
│   ├── shared/       # types, DTOs, constants, plan entitlements
│   └── ui/           # tokens de tema → CSS variables
└── docs/             # arquitectura, roadmap, matriz competitiva, pilot LD
```

Módulos NestJS (Fase 1): `Auth` (Identity) · `Organizations` (org + theme + pages + memberships) · `Tournaments` · `Billing`. Fronteras futuras: `Rankings` · `Recruitment` · `Merch` · `Network` · `Ai`.

## Multi-tenancy

- **Modelo:** shared DB + `organizationId` en las tablas de tenant; control de acceso a nivel de servicio (`assertOrgAdmin`).
- **Routing público:** Fase 1 path-based `/o/[orgSlug]/...`; Fase 4 custom domains.
- **Roles:** `ORG_OWNER` · `ORG_ADMIN` · `ORG_STAFF` · `PLAYER` · `COACH` · `ANALYST` · `FAN` (enum `OrgRole` en `@blazon/shared`).
- **Game-agnostic:** `Game` / `GameAccount` desde el día 1; LoL es el primer título, no una dependencia del schema.

## Dominio de datos (núcleo Fase 1)

- `Organization`, `OrganizationTheme`, `OrganizationPage`, `PageBlock`
- `User`, `Account` (OAuth), `Membership` (user↔org + rol)
- `Game`, `GameAccount`
- `Tournament`, `Registration`, `Match`
- `Plan`, `Subscription` (Stripe)

Extensiones roadmap: `PlayerProfile`, `Resume`, `RecruitmentPost`, `Tryout`, `Roster`, `Contract`, `ScrimOffer`, `FanClub`, `MembershipTier`, `Clip`, `Product`, `Order`, `PrizePool`, `SponsorQuest`, `Hub`, `Ladder`, `AiConversation`.

## Autenticación y sesión

- OAuth **Google** y **Twitch** manejados por el API (`/auth/google`, `/auth/twitch` → callback → upsert user → JWT).
- Sesión: JWT en cookie `httpOnly` del dominio web; las Server Actions de Next.js leen la cookie y llaman al API con `Authorization: Bearer`.
- `ALLOW_DEV_LOGIN=true` habilita login por email solo en local.

## Personalización por tenant

- **Tema:** tokens (colores, fuente, logo, hero) en `OrganizationTheme` → CSS variables inyectadas en el layout público (`packages/ui`).
- **Páginas:** CMS por bloques (`PageBlock`): `HERO_COUNTDOWN`, `MISSION`, `CLIPS_GRID`, `TOURNAMENT_LIST`, `RICH_TEXT`, `CTA_BUTTONS`, …
- **Límites por plan:** definidos en `PLAN_DEFS` (`@blazon/shared`) y aplicables como feature flags.

## Despliegue

| Etapa | Dónde |
|---|---|
| Fase 1–2 | **Render**: `web` + `api` + Postgres managed, staging separado |
| Fase 3 | Front en Vercel/Cloudflare; API en Render/Fly/Cloud Run; DB Neon/RDS; media S3/R2 + CDN |
| Fase 4–5 | AWS/GCP contenedores + colas; extracción de workers (brackets, IA, media) |

Siempre: Postgres gestionado, object storage S3-compatible, secrets en el proveedor, staging ≠ production, backups probados, observabilidad mínima (logs, uptime, Sentry).
