import { notFound } from "next/navigation";
import { apiFetchOrNull } from "@/lib/api";
import { requireOrgAdmin } from "@/lib/admin";
import type { MatchData } from "@/lib/types";
import {
  GenerateBracketButton,
  MatchResultForm,
} from "@/components/dashboard/BracketAdmin";

interface AdminTournamentDetail {
  id: string;
  name: string;
  slug: string;
  status: string;
  startsAt: string;
  maxParticipants: number;
  registrations: {
    id: string;
    teamName: string | null;
    status: string;
    user: { id: string; name: string; email: string };
  }[];
  matches: MatchData[];
}

function participantName(
  p: { teamName: string | null; user: { name: string } } | null,
): string {
  if (!p) return "—";
  return p.teamName || p.user.name;
}

export default async function TournamentAdminDetail({
  params,
}: {
  params: Promise<{ org: string; tid: string }>;
}) {
  const { org: orgSlug, tid } = await params;
  const { session, org } = await requireOrgAdmin(orgSlug);

  const tournament = await apiFetchOrNull<AdminTournamentDetail>(
    `/admin/orgs/${org.id}/tournaments/${tid}`,
    { token: session.token },
  );
  if (!tournament) notFound();

  const pendingMatches = tournament.matches.filter(
    (m) => m.status !== "COMPLETED" && m.participantA && m.participantB,
  );
  const otherMatches = tournament.matches.filter(
    (m) => !pendingMatches.includes(m),
  );

  return (
    <main>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <h1 className="text-2xl font-black">{tournament.name}</h1>
        <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
          {tournament.status}
        </span>
      </div>
      <p className="text-neutral-400 text-sm mb-10">
        {new Date(tournament.startsAt).toLocaleString("es", {
          dateStyle: "long",
          timeStyle: "short",
        })}{" "}
        · {tournament.registrations.length}/{tournament.maxParticipants} inscritos
      </p>

      <section className="mb-12">
        <h2 className="font-black mb-4">Bracket</h2>
        <GenerateBracketButton
          orgId={org.id}
          orgSlug={orgSlug}
          tournamentId={tournament.id}
          hasMatches={tournament.matches.length > 0}
        />
      </section>

      {tournament.matches.length > 0 && (
        <section className="mb-12">
          <h2 className="font-black mb-4">Partidas</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...pendingMatches, ...otherMatches].map((match) => (
              <MatchResultForm
                key={match.id}
                orgId={org.id}
                orgSlug={orgSlug}
                tournamentId={tournament.id}
                match={match}
                nameA={participantName(match.participantA)}
                nameB={participantName(match.participantB)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="font-black mb-4">
          Inscritos ({tournament.registrations.length})
        </h2>
        {tournament.registrations.length === 0 ? (
          <p className="text-neutral-500 text-sm">Aún no hay inscritos.</p>
        ) : (
          <ul className="space-y-2 max-w-2xl">
            {tournament.registrations.map((r) => (
              <li
                key={r.id}
                className="rounded-md bg-neutral-900 border border-neutral-800 px-5 py-3 flex items-center justify-between gap-4 text-sm"
              >
                <span className="font-bold">{r.teamName || r.user.name}</span>
                <span className="text-neutral-500">{r.user.email}</span>
                <span className="text-xs uppercase tracking-widest text-neutral-400">
                  {r.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
