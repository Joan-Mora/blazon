import Link from "next/link";
import type { OrgBlock, TournamentSummary } from "@/lib/types";
import { Countdown } from "./Countdown";

interface RenderContext {
  orgSlug: string;
  heroImageUrl?: string | null;
  /** Next upcoming tournament, injected for HERO_COUNTDOWN blocks */
  nextTournament?: { name: string; startsAt: string; slug: string } | null;
  /** Tournaments for TOURNAMENT_LIST blocks */
  tournaments?: TournamentSummary[];
}

export function BlockRenderer({
  blocks,
  ctx,
}: {
  blocks: OrgBlock[];
  ctx: RenderContext;
}) {
  return (
    <>
      {blocks.map((block) => (
        <Block key={block.id} block={block} ctx={ctx} />
      ))}
    </>
  );
}

function Block({ block, ctx }: { block: OrgBlock; ctx: RenderContext }) {
  const data = block.data as Record<string, never>;

  switch (block.type) {
    case "HERO_COUNTDOWN": {
      const d = data as {
        title?: string;
        subtitle?: string;
        targetDate?: string;
        ctaLabel?: string;
        ctaHref?: string;
        secondaryCtaLabel?: string;
        secondaryCtaHref?: string;
      };
      const target = ctx.nextTournament?.startsAt ?? d.targetDate;
      const title = ctx.nextTournament?.name ?? d.title ?? "Próximo torneo";
      return (
        <section
          className="relative px-6 py-28 text-center overflow-hidden"
          style={{
            background: ctx.heroImageUrl
              ? `linear-gradient(color-mix(in srgb, var(--org-bg) 70%, transparent), var(--org-bg)), url(${ctx.heroImageUrl}) center/cover`
              : `radial-gradient(ellipse 80% 70% at 50% -20%, color-mix(in srgb, var(--org-primary) 35%, transparent), transparent), var(--org-bg)`,
          }}
        >
          <p
            className="text-xs uppercase tracking-[0.35em] mb-4"
            style={{ color: "var(--org-text-muted)" }}
          >
            {d.subtitle ?? "Torneo destacado"}
          </p>
          <h1 className="text-4xl sm:text-6xl font-black mb-8 max-w-3xl mx-auto leading-tight">
            {title}
          </h1>
          {target && (
            <div className="mb-10">
              <Countdown targetIso={target} />
            </div>
          )}
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href={
                d.ctaHref ??
                (ctx.nextTournament
                  ? `/o/${ctx.orgSlug}/torneos/${ctx.nextTournament.slug}`
                  : `/o/${ctx.orgSlug}/torneos`)
              }
              className="org-btn-primary"
            >
              {d.ctaLabel ?? "¡Regístrate en el Torneo!"}
            </Link>
            {d.secondaryCtaLabel && (
              <Link
                href={d.secondaryCtaHref ?? `/o/${ctx.orgSlug}/streaming`}
                className="org-btn-outline"
              >
                {d.secondaryCtaLabel}
              </Link>
            )}
          </div>
        </section>
      );
    }

    case "MISSION": {
      const d = data as { heading?: string; body?: string };
      return (
        <section className="px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-black mb-5 org-primary">
              {d.heading ?? "Nuestra Misión"}
            </h2>
            <p
              className="text-lg leading-relaxed"
              style={{ color: "var(--org-text-muted)" }}
            >
              {d.body}
            </p>
          </div>
        </section>
      );
    }

    case "CLIPS_GRID": {
      const d = data as {
        heading?: string;
        clips?: { title: string; embedUrl: string }[];
      };
      const clips = d.clips ?? [];
      return (
        <section className="px-6 py-20 org-surface">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-black mb-8 text-center">
              {d.heading ?? "Clips Destacados"}
            </h2>
            {clips.length === 0 ? (
              <p className="text-center" style={{ color: "var(--org-text-muted)" }}>
                Pronto: las mejores jugadas de la semana.
              </p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {clips.map((clip, i) => (
                  <div key={i} className="rounded-md overflow-hidden">
                    <div className="aspect-video">
                      <iframe
                        src={clip.embedUrl}
                        title={clip.title}
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                    <p className="py-3 font-semibold text-sm">{clip.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      );
    }

    case "TOURNAMENT_LIST": {
      const d = data as { heading?: string; scope?: "upcoming" | "past" };
      const tournaments = ctx.tournaments ?? [];
      return (
        <section className="px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-black mb-8 text-center">
              {d.heading ?? "Torneos"}
            </h2>
            {tournaments.length === 0 ? (
              <p className="text-center" style={{ color: "var(--org-text-muted)" }}>
                No hay torneos {d.scope === "past" ? "concluidos" : "próximos"} por
                ahora.
              </p>
            ) : (
              <ul className="space-y-4">
                {tournaments.map((t) => (
                  <li key={t.id}>
                    <Link
                      href={`/o/${ctx.orgSlug}/torneos/${t.slug}`}
                      className="org-surface rounded-md px-6 py-5 flex flex-wrap items-center justify-between gap-4 transition hover:brightness-125 block"
                    >
                      <div>
                        <p className="font-black text-lg">{t.name}</p>
                        <p
                          className="text-sm"
                          style={{ color: "var(--org-text-muted)" }}
                        >
                          {t.game.name} ·{" "}
                          {new Date(t.startsAt).toLocaleDateString("es", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                          {t.prizePool ? ` · Premio: ${t.prizePool}` : ""}
                        </p>
                      </div>
                      <span className="org-btn-primary text-sm">
                        {t.status === "COMPLETED" ? "Resultados" : "Ver torneo"}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      );
    }

    case "RICH_TEXT": {
      const d = data as { heading?: string; body?: string };
      return (
        <section className="px-6 py-16">
          <div className="max-w-3xl mx-auto">
            {d.heading && (
              <h2 className="text-2xl font-black mb-4 org-primary">{d.heading}</h2>
            )}
            <p
              className="leading-relaxed whitespace-pre-line"
              style={{ color: "var(--org-text-muted)" }}
            >
              {d.body}
            </p>
          </div>
        </section>
      );
    }

    case "CTA_BUTTONS": {
      const d = data as {
        buttons?: { label: string; href: string; variant?: string }[];
      };
      return (
        <section className="px-6 py-12 text-center">
          <div className="flex gap-4 justify-center flex-wrap">
            {(d.buttons ?? []).map((btn, i) => (
              <Link
                key={i}
                href={btn.href}
                className={
                  btn.variant === "outline" ? "org-btn-outline" : "org-btn-primary"
                }
              >
                {btn.label}
              </Link>
            ))}
          </div>
        </section>
      );
    }

    default:
      return null;
  }
}
