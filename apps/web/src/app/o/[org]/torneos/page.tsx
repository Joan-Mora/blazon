import Link from "next/link";
import { apiFetch } from "@/lib/api";
import type { TournamentSummary } from "@/lib/types";

export default async function TournamentsPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org: slug } = await params;
  const [upcoming, past] = await Promise.all([
    apiFetch<TournamentSummary[]>(`/orgs/${slug}/tournaments?scope=upcoming`),
    apiFetch<TournamentSummary[]>(`/orgs/${slug}/tournaments?scope=past`),
  ]);

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <h1 className="text-4xl font-black mb-12">Torneos</h1>

      <section className="mb-16">
        <h2 className="text-2xl font-black mb-6 org-primary">Próximos Torneos</h2>
        <TournamentTable tournaments={upcoming} orgSlug={slug} emptyText="No hay torneos próximos. ¡Vuelve pronto!" />
      </section>

      <section>
        <h2 className="text-2xl font-black mb-6 org-primary">Torneos Concluidos</h2>
        <TournamentTable tournaments={past} orgSlug={slug} emptyText="Aún no hay torneos concluidos." />
      </section>
    </main>
  );
}

function TournamentTable({
  tournaments,
  orgSlug,
  emptyText,
}: {
  tournaments: TournamentSummary[];
  orgSlug: string;
  emptyText: string;
}) {
  if (tournaments.length === 0) {
    return <p style={{ color: "var(--org-text-muted)" }}>{emptyText}</p>;
  }
  return (
    <ul className="space-y-4">
      {tournaments.map((t) => (
        <li key={t.id}>
          <Link
            href={`/o/${orgSlug}/torneos/${t.slug}`}
            className="org-surface rounded-md px-6 py-5 flex flex-wrap items-center justify-between gap-4 transition hover:brightness-125 block"
          >
            <div>
              <p className="font-black text-lg">{t.name}</p>
              <p className="text-sm" style={{ color: "var(--org-text-muted)" }}>
                {t.game.name} ·{" "}
                {new Date(t.startsAt).toLocaleDateString("es", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
                {t.prizePool ? ` · Premio: ${t.prizePool}` : ""} ·{" "}
                {t._count.registrations}/{t.maxParticipants} inscritos
              </p>
            </div>
            <span
              className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
              style={{
                background: "color-mix(in srgb, var(--org-primary) 20%, transparent)",
                color: "var(--org-primary)",
              }}
            >
              {statusLabel(t.status)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function statusLabel(status: string): string {
  switch (status) {
    case "REGISTRATION":
      return "Inscripciones abiertas";
    case "LIVE":
      return "En juego";
    case "COMPLETED":
      return "Finalizado";
    default:
      return status;
  }
}
