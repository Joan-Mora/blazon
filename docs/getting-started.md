# Guía de arranque — Blazon (desarrollo local)

## Requisitos

- Node.js 22+
- pnpm 11+ (`npm i -g pnpm`)
- Docker Desktop (para PostgreSQL)

## Setup

```bash
# 1. Instalar dependencias
pnpm install

# 2. Variables de entorno
cp .env.example .env
# packages/db necesita DATABASE_URL (ya incluido si copias el default):
#   packages/db/.env  →  DATABASE_URL=postgresql://blazon:blazon@localhost:5432/blazon
# apps/web/.env.local:
#   NEXT_PUBLIC_API_URL=http://localhost:4000
#   API_URL=http://localhost:4000
#   ALLOW_DEV_LOGIN=true

# 3. Base de datos
pnpm db:up          # levanta postgres en Docker
pnpm db:migrate     # aplica migraciones (prisma migrate dev)
pnpm db:seed        # crea el piloto LD: org, tema, páginas, torneo demo, admin

# 4. Desarrollo
pnpm dev            # turbo: web (:3000) + api (:4000)
```

## URLs locales

| Qué | URL |
|---|---|
| Landing Blazon | http://localhost:3000 |
| Sitio público LD | http://localhost:3000/o/ld |
| Torneo demo | http://localhost:3000/o/ld/torneos/copa-lenguetazo-divino-1 |
| Login | http://localhost:3000/login |
| Dashboard org LD | http://localhost:3000/dashboard/ld |
| API | http://localhost:4000 |

## Cuenta de prueba

Con `ALLOW_DEV_LOGIN=true`, el formulario "Dev login" del `/login` permite entrar con cualquier email sin OAuth.

- **Admin LD:** `admin@lenguetazodivino.gg` (owner de la org, acceso total al dashboard)
- Cualquier otro email crea un usuario normal (puede inscribirse en torneos).

## OAuth y Stripe (opcional en local)

- **Google:** crear credenciales en [Google Cloud Console](https://console.cloud.google.com/apis/credentials); redirect URI `http://localhost:4000/auth/google/callback`. Setear `GOOGLE_CLIENT_ID/SECRET` en `.env`.
- **Twitch:** crear app en [dev.twitch.tv](https://dev.twitch.tv/console/apps); redirect `http://localhost:4000/auth/twitch/callback`. Setear `TWITCH_CLIENT_ID/SECRET`.
- **Stripe:** setear `STRIPE_SECRET_KEY` (test) y `STRIPE_WEBHOOK_SECRET`; sin claves, la página de suscripción lista planes desde la DB pero el checkout devuelve error controlado.

## Comandos útiles

```bash
pnpm db:generate                  # regenerar Prisma Client
pnpm --filter @blazon/api dev     # solo API
pnpm --filter @blazon/web dev     # solo web
pnpm build                        # build de todo el monorepo
```

## Estructura

Ver [architecture.md](./architecture.md). Roadmap de fases en [roadmap.md](./roadmap.md). Análisis de mercado en [competitive-matrix.md](./competitive-matrix.md). Brief original del piloto en `pilot-ld/`.
