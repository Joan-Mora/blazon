import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { requireOrgAdmin } from "@/lib/admin";
import type { AdminTournament } from "@/lib/types";
import { TournamentForm } from "@/components/dashboard/TournamentForm";

export default async function TournamentsAdminPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org: orgSlug } = await params;
  const { session, org } = await requireOrgAdmin(orgSlug);

  const tournaments = await apiFetch<AdminTournament[]>(
    `/admin/orgs/${org.id}/tournaments`,
    { token: session.token },
  );

  return (
    <main>
      <h1 className="text-2xl font-black mb-10">Torneos</h1>

      <div className="mb-12">
        <TournamentForm orgId={org.id} orgSlug={orgSlug} />
      </div>

      {tournaments.length === 0 ? (
        <p className="text-neutral-500 text-sm">Aún no hay torneos.</p>
      ) : (
        <ul className="space-y-3">
          {tournaments.map((t) => (
            <li key={t.id}>
              <Link
                href={`/dashboard/${orgSlug}/tournaments/${t.id}`}
                className="rounded-md bg-neutral-900 border border-neutral-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4 transition hover:border-neutral-600 block"
              >
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-sm text-neutral-500">
                    {new Date(t.startsAt).toLocaleString("es", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}{" "}
                    · {t._count.registrations}/{t.maxParticipants} inscritos ·{" "}
                    {t._count.matches} partidas
                  </p>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                  {t.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
