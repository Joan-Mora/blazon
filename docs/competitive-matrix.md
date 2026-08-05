# Matriz competitiva y gap analysis — Blazon

**Tesis:** nadie hoy es "Battlefy + Wombo + b.stage + Enkelt" en un solo SaaS multi-tenant con sitio público autogestionable. Una org T3→T1 usa 6–10 herramientas; Blazon las une en un tenant.

## Mapa de competidores por categoría

| Categoría | Players | Qué hacen bien | Qué les falta |
|---|---|---|---|
| Torneos / brackets | [Battlefy](https://battlefy.com), [Toornament](https://www.toornament.com), [start.gg](https://www.start.gg), [Challonge](https://challonge.com), [Challengermode](https://www.challengermode.com), [FACEIT](https://www.faceit.com), Rivals, XPULZ, Netgen | Brackets, check-in, seeding, embeds, discovery, white-label, ladders | Sitio de marca completo + fans + reclutamiento social |
| Premios / monetización | [Matcherino](https://matcherino.com) | Crowdfunding de prize pool, sponsor quests, payouts, ticketing | Red de orgs / career / site builder |
| Reclutamiento / career | [Curry.gg](https://curry.gg), [Seek Team](https://www.seek-team.com), Metch, Gamrly, (legado Wombo) | CV gamer, LFT/LFP, filtros, multigaming, staff offers | Torneos profundos + sitio org + fans |
| Ops de organización | [Enkelt.ai](https://enkelt.ai) | Roster, contratos, scrim market, finanzas, VOD/táctica, Discord bot | No es marketplace de torneos ni fan site público |
| Fans / membresías / merch | [b.stage](https://bstage.in), Espo | Memberships, fan chat, merch, perks | No gestiona brackets T3 ni career path |
| Hubs LATAM / ligas | LigaHub, Amber.gg, Pro Play | Torneos+teams+stats regionales, team finder, academia | Menos profundidad white-label SaaS global |
| Datos / broadcast | GRID.gg, PandaScore | Feeds oficiales, widgets | No son SaaS de org |

## ¿Resolvemos las problemáticas del mercado?

| Problema | Quién lo sufre | ¿Blazon lo resuelve? | Plus vs mercado |
|---|---|---|---|
| Stack fragmentado (Discord + Sheets + Challonge + Shopify) | Orgs | **Sí (tesis central)** | Nadie une marca pública autogestionable + career + torneos |
| Sin sitio de marca serio | Orgs amateur | **Sí** — page builder + tema | Battlefy da página de *evento*, no de *organización* |
| Brackets manuales / check-in caótico | TOs | **Sí** (F1 básico → F2 multi-stage) | Paridad Battlefy; plus: vive en el sitio de la org |
| Sin discovery de torneos | Jugadores | **Sí** (F2) | Discovery + perfil career en la misma cuenta |
| Reclutamiento = spam Discord/Twitter | Jugadores/orgs | **Sí** (F3) | Paridad Curry + historial de torneos real in-platform |
| Fans sin hogar ni membresía | Orgs/fans | **Sí** (F3) | Ligamos fan ↔ roster ↔ torneos |
| Premios / entry fees / confianza payout | TOs/jugadores | **Parcial** (F3–4 Stripe Connect) | Escrow transparente; no Matcherino-class global en F1 |
| Scrims y roster ops en 10 tabs | Semi-pro/pro | **Sí** (F4) | Paridad Enkelt + sitio público + red |
| Contratos / compliance T1 | Orgs T1 | **Parcial / tarde** | Enkelt más maduro; no prioridad LATAM T3 |
| Anti-cheat / lobbies CS2 | Escena FACEIT | **No** (fuera de meta F1–3) | No competimos con cliente anti-cheat |
| Alianzas publisher | Enterprise | **No al día 1** | Grassroots→T2 primero |
| Academia / path to pro | Amateurs | **Sí** (F2) | Academia + torneos + call-up en un grafo |
| Multi-game / white-label / API | Multigaming/ligas | **Sí** (schema F1, WL F4) | Paridad Enkelt/Toornament |
| IA útil | Todos | **Sí** (F5) | IA por rol sobre datos propios del tenant |

**Veredicto:** no resolvemos todo el universo esports el día 1 (anti-cheat y payouts enterprise son trampas de scope). Atacamos el dolor #1 — fragmentación + ausencia de casa digital de la org — con una combinación que nadie ofrece.

## Diferenciadores duros

1. **Page builder + identidad total** (el brief LD como plantilla, no un widget de torneo)
2. **Red competitive career** embebida en la misma cuenta que juega torneos
3. **Fans y merch** en el mismo dominio de marca
4. **Ops (roster/scrims)** sin salir del dashboard
5. **Game-agnostic** con LoL como vertical de lanzamiento LATAM
6. **IA por rol** encima del grafo de datos propio

## Backlog de absorción competitiva → fases

| Módulo | Fuentes | Fase |
|---|---|---|
| Org site + theme + page blocks | LD brief, LigaHub, Netgen | 1 |
| Torneos core + single elim + check-in | Battlefy, Challonge | 1 |
| Multi-stage + embeds + discovery | Toornament, start.gg | 2 |
| Ladders / hubs / Discord automation | FACEIT, Challengermode, Rivals | 2–4 |
| Rankings, player cards, Riot verify | LigaHub, Amber, LD brief | 2 |
| Academia / mentores | LD, Wombo Academy | 2 |
| Streaming overlays + casteo | LD, Matcherino, start.gg | 2 |
| Recruitment + resumes + tryouts | Curry, Seek, Metch, Gamrly | 3 |
| Fans / memberships / loyalty | b.stage, Espo | 3 |
| Merch store | LD, b.stage | 3 |
| Prize crowdfunding + escrow + sponsor quests | Matcherino | 3–4 |
| Roster ops + contracts + availability | Enkelt | 4 |
| Scrim marketplace | Enkelt, Metch | 4 |
| Custom domains + white-label + API/widgets | Toornament, Netgen | 4 |
| Finance light + payouts | Enkelt, Matcherino | 4 |
| AI copilot | Netgen Fluxion + visión propia | 5 |
| Multi-game expansion packs | Enkelt, Battlefy | 2→5 |
