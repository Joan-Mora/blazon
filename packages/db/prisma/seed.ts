import { PrismaClient } from "@prisma/client";
import { PLAN_DEFS, PLAN_CODES } from "@blazon/shared";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Blazon…");

  // ── Games ────────────────────────────────────────────────────────────────
  const lol = await prisma.game.upsert({
    where: { slug: "lol" },
    update: {},
    create: { slug: "lol", name: "League of Legends" },
  });

  // ── Plans ────────────────────────────────────────────────────────────────
  for (const code of PLAN_CODES) {
    const def = PLAN_DEFS[code];
    await prisma.plan.upsert({
      where: { code },
      update: {
        name: def.name,
        priceMonthlyUsd: def.priceMonthlyUsd,
        features: def.features as object,
      },
      create: {
        code,
        name: def.name,
        priceMonthlyUsd: def.priceMonthlyUsd,
        features: def.features as object,
      },
    });
  }

  // ── LD admin user ────────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: "admin@lenguetazodivino.gg" },
    update: {},
    create: {
      email: "admin@lenguetazodivino.gg",
      name: "LD Admin",
    },
  });

  // ── Organization: Lengüetazo Divino ─────────────────────────────────────
  const existing = await prisma.organization.findUnique({
    where: { slug: "ld" },
  });
  if (existing) {
    console.log("LD org already seeded, skipping.");
    return;
  }

  const org = await prisma.organization.create({
    data: {
      slug: "ld",
      name: "Lengüetazo Divino",
      tagline: "La central de torneos de eSports",
      mission:
        "Lengüetazo Divino es la central de torneos: la plataforma definitiva para la gestión, participación y consumo de contenido competitivo. Del Tier 3 al Tier 1, esta es tu casa.",
      theme: {
        create: {
          background: "#0a0a0a",
          surface: "#161616",
          primary: "#e11d2e",
          accent: "#f5e642",
          text: "#ffffff",
          textMuted: "#a3a3a3",
          fontFamily: "'Poppins', 'Montserrat', sans-serif",
          logoText: "LENGÜETAZO DIVINO",
          faviconEmoji: "♥",
        },
      },
      memberships: { create: { userId: admin.id, role: "ORG_OWNER" } },
    },
  });

  // ── Pages + blocks (from the LD design brief) ────────────────────────────
  const pages: {
    slug: string;
    title: string;
    blocks: { type: string; data: object }[];
  }[] = [
    {
      slug: "home",
      title: "Inicio",
      blocks: [
        {
          type: "HERO_COUNTDOWN",
          data: {
            subtitle: "Torneos del Lengüetazo Divino",
            ctaLabel: "¡Regístrate en el Torneo!",
            secondaryCtaLabel: "Ver Stream en Vivo",
          },
        },
        {
          type: "CLIPS_GRID",
          data: { heading: "Clips Destacados", clips: [] },
        },
        {
          type: "MISSION",
          data: {
            heading: "Nuestra Misión",
            body: "Lengüetazo Divino es la central de torneos: la plataforma definitiva para la gestión, participación y consumo de contenido competitivo. Pasión, competencia y comunidad en un solo lugar.",
          },
        },
        {
          type: "TOURNAMENT_LIST",
          data: { heading: "Próximos Torneos", scope: "upcoming" },
        },
      ],
    },
    {
      slug: "torneos",
      title: "Torneos",
      blocks: [],
    },
    {
      slug: "ranking",
      title: "Ranking",
      blocks: [
        {
          type: "RICH_TEXT",
          data: {
            heading: "Tablas de Liderazgo",
            body: "Ranking detallado por juego, con filtros por región y temporada. Los perfiles de jugadores destacados y sus estadísticas llegan en la próxima actualización de la plataforma.",
          },
        },
      ],
    },
    {
      slug: "academia",
      title: "Academia",
      blocks: [
        {
          type: "RICH_TEXT",
          data: {
            heading: "Programas de Entrenamiento",
            body: "Clases enfocadas en estrategia, mecánicas y comunicación, con mentores del más alto nivel competitivo. Horarios y tarifas disponibles muy pronto.",
          },
        },
      ],
    },
    {
      slug: "streaming",
      title: "Streaming & Casteo",
      blocks: [
        {
          type: "RICH_TEXT",
          data: {
            heading: "Stream en Vivo",
            body: "Integración del stream principal, calendario de transmisiones y perfiles de los casters oficiales de Lengüetazo Divino. Disponible en la Fase 2 de la plataforma.",
          },
        },
      ],
    },
    {
      slug: "clips",
      title: "Clips",
      blocks: [
        {
          type: "RICH_TEXT",
          data: {
            heading: "Momentos Estelares",
            body: "Galería navegable de las mejores jugadas: clutch, ace y más. Filtros por juego, jugador y tipo de jugada llegan en la Fase 2.",
          },
        },
      ],
    },
    {
      slug: "tienda",
      title: "Tienda",
      blocks: [
        {
          type: "RICH_TEXT",
          data: {
            heading: "Merch Oficial",
            body: "Gorras, sudaderas, camisetas y accesorios con el logo de Lengüetazo Divino ♥. La tienda abre en la Fase 3 de la plataforma.",
          },
        },
      ],
    },
    {
      slug: "reclutamiento",
      title: "Reclutamiento",
      blocks: [
        {
          type: "RICH_TEXT",
          data: {
            heading: "Únete al equipo",
            body: "Tryouts, vacantes de roster y staff. El hub de reclutamiento con perfiles y aplicaciones llega en la Fase 3.",
          },
        },
      ],
    },
  ];

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    await prisma.organizationPage.create({
      data: {
        organizationId: org.id,
        slug: page.slug,
        title: page.title,
        sortOrder: i,
        published: true,
        blocks: {
          create: page.blocks.map((block, j) => ({
            type: block.type,
            sortOrder: j,
            data: block.data,
          })),
        },
      },
    });
  }

  // ── Demo tournament (hero countdown target) ─────────────────────────────
  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + 14);
  startsAt.setHours(19, 0, 0, 0);

  const tournament = await prisma.tournament.create({
    data: {
      organizationId: org.id,
      gameId: lol.id,
      slug: "copa-lenguetazo-divino-1",
      name: "Copa Lengüetazo Divino #1",
      description:
        "El primer torneo oficial de Lengüetazo Divino en Blazon. Single elimination, BO1 hasta semifinales, BO3 la final. ¡Demuestra que mereces el Lengüetazo!",
      rules:
        "1. Formato single elimination.\n2. Check-in obligatorio 30 minutos antes.\n3. Toxicidad = descalificación.\n4. Las decisiones de los admins son finales.",
      prizePool: "$100 USD + Skin del split",
      maxParticipants: 16,
      startsAt,
      status: "REGISTRATION",
    },
  });

  // ── Demo players + registrations ─────────────────────────────────────────
  const demoPlayers = [
    { email: "topdiff@ld.gg", name: "TopDiff", team: "Los Del Baron" },
    { email: "junglegap@ld.gg", name: "JungleGap", team: "Smite Robado" },
    { email: "midorfeed@ld.gg", name: "MidOrFeed", team: "Roam Eterno" },
    { email: "adcarry@ld.gg", name: "ADCarry", team: "Kite Perfecto" },
  ];
  for (const player of demoPlayers) {
    const user = await prisma.user.upsert({
      where: { email: player.email },
      update: {},
      create: { email: player.email, name: player.name },
    });
    await prisma.registration.create({
      data: {
        tournamentId: tournament.id,
        userId: user.id,
        teamName: player.team,
        status: "CONFIRMED",
      },
    });
  }

  // ── Comp subscription for the pilot org ──────────────────────────────────
  const elitePlan = await prisma.plan.findUnique({ where: { code: "ELITE" } });
  if (elitePlan) {
    await prisma.subscription.create({
      data: {
        organizationId: org.id,
        planId: elitePlan.id,
        status: "COMPED",
      },
    });
  }

  console.log("Seed complete:");
  console.log("  Org:        /o/ld");
  console.log("  Admin:      admin@lenguetazodivino.gg (dev login)");
  console.log(`  Tournament: ${tournament.name} — ${startsAt.toISOString()}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
