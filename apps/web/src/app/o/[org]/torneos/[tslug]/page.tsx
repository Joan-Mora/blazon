import { notFound } from "next/navigation";
import { apiFetchOrNull } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import type { TournamentDetail } from "@/lib/types";
import { Bracket } from "@/components/org/Bracket";
import { RegisterButton } from "@/components/org/RegisterButton";
import { Countdown } from "@/components/org/Countdown";

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ org: string; tslug: string }>;
}) {
  const { org: slug, tslug } = await params;
  const [tournament, session] = await Promise.all([
    apiFetchOrNull<TournamentDetail>(`/orgs/${slug}/tournaments/${tslug}`),
    getSessionUser(),
  ]);
  if (!tournament) notFound();

  const alreadyRegistered = Boolean(
    session &&
      tournament.registrations.some((r) => r.user.id === session.id),
  );
  const upcoming = new Date(tournament.startsAt) > new Date();

  return (
    <main className="max-w-5xl mx-auto px-6 py-16">
      <p
        className="text-xs uppercase tracking-[0.3em] mb-3"
        style={{ color: "var(--org-text-muted)" }}
      >
        {tournament.game.name} · {statusLabel(tournament.status)}
      </p>
      <h1 className="text-4xl sm:text-5xl font-black mb-6">{tournament.name}</h1>

      <div
        className="flex flex-wrap gap-6 text-sm mb-10"
        style={{ color: "var(--org-text-muted)" }}
      >
        <span>
          📅{" "}
          {new Date(tournament.startsAt).toLocaleString("es", {
            dateStyle: "long",
            timeStyle: "short",
          })}
        </span>
        {tournament.prizePool && <span>🏆 {tournament.prizePool}</span>}
        <span>
          👥 {tournament.registrations.length}/{tournament.maxParticipants}{" "}
          inscritos
        </span>
      </div>

      {upcoming && tournament.status === "REGISTRATION" && (
        <div className="mb-12">
          <Countdown targetIso={tournament.startsAt} />
        </div>
      )}

      {tournament.description && (
        <p
          className="max-w-2xl leading-relaxed mb-10"
          style={{ color: "var(--org-text-muted)" }}
        >
          {tournament.description}
        </p>
      )}

      {tournament.status === "REGISTRATION" && (
        <section className="mb-14">
          <RegisterButton
            tournamentId={tournament.id}
            orgSlug={slug}
            tournamentSlug={tslug}
            isLoggedIn={Boolean(session)}
            alreadyRegistered={alreadyRegistered}
          />
        </section>
      )}

      {tournament.matches.length > 0 && (
        <section className="mb-14">
          <h2 className="text-2xl font-black mb-6 org-primary">Bracket</h2>
          <Bracket matches={tournament.matches} />
        </section>
      )}

      <section className="mb-14">
        <h2 className="text-2xl font-black mb-6 org-primary">
          Participantes ({tournament.registrations.length})
        </h2>
        {tournament.registrations.length === 0 ? (
          <p style={{ color: "var(--org-text-muted)" }}>
            Sé el primero en inscribirte.
          </p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {tournament.registrations.map((r) => (
              <li key={r.id} className="org-surface rounded-md px-4 py-3 text-sm">
                <span className="font-bold">{r.teamName || r.user.name}</span>
                {r.teamName && (
                  <span style={{ color: "var(--org-text-muted)" }}>
                    {" "}
                    · {r.user.name}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {tournament.rules && (
        <section>
          <h2 className="text-2xl font-black mb-6 org-primary">Reglamento</h2>
          <p
            className="max-w-2xl leading-relaxed whitespace-pre-line"
            style={{ color: "var(--org-text-muted)" }}
          >
            {tournament.rules}
          </p>
        </section>
      )}
    </main>
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
