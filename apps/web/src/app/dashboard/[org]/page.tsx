import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { requireOrgAdmin } from "@/lib/admin";
import type { AdminTournament } from "@/lib/types";

export default async function OrgAdminOverview({
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

  const live = tournaments.filter((t) => t.status === "LIVE").length;
  const registration = tournaments.filter(
    (t) => t.status === "REGISTRATION",
  ).length;
  const totalRegistrations = tournaments.reduce(
    (sum, t) => sum + t._count.registrations,
    0,
  );

  return (
    <main>
      <h1 className="text-3xl font-black mb-2">{org.name}</h1>
      <p className="text-neutral-400 mb-10">{org.tagline}</p>

      <div className="grid gap-4 sm:grid-cols-3 mb-12">
        <Stat label="Torneos en juego" value={live} />
        <Stat label="Inscripciones abiertas" value={registration} />
        <Stat label="Inscritos totales" value={totalRegistrations} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href={`/dashboard/${orgSlug}/tournaments`}
          className="rounded-md bg-neutral-900 border border-neutral-800 px-6 py-5 transition hover:border-neutral-600"
        >
          <p className="font-black">Gestionar torneos →</p>
          <p className="text-sm text-neutral-500">
            Crear torneos, brackets y resultados.
          </p>
        </Link>
        <Link
          href={`/dashboard/${orgSlug}/theme`}
          className="rounded-md bg-neutral-900 border border-neutral-800 px-6 py-5 transition hover:border-neutral-600"
        >
          <p className="font-black">Personalizar tema →</p>
          <p className="text-sm text-neutral-500">
            Colores, logo y tipografía de tu sitio.
          </p>
        </Link>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md bg-neutral-900 border border-neutral-800 px-6 py-5">
      <p className="text-3xl font-black">{value}</p>
      <p className="text-sm text-neutral-500">{label}</p>
    </div>
  );
}
