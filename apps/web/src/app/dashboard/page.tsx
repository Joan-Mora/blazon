import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import type { MyMembership, MyRegistration } from "@/lib/types";

export default async function DashboardHome({
  searchParams,
}: {
  searchParams: Promise<{ billing?: string }>;
}) {
  const session = (await getSessionUser())!;
  const { billing } = await searchParams;

  const [registrations, memberships] = await Promise.all([
    apiFetch<MyRegistration[]>("/auth/session/registrations", {
      token: session.token,
    }),
    apiFetch<MyMembership[]>("/auth/session/orgs", { token: session.token }),
  ]);

  const adminOrgs = memberships.filter((m) =>
    ["ORG_OWNER", "ORG_ADMIN"].includes(m.role),
  );

  return (
    <main>
      <h1 className="text-3xl font-black mb-2">Hola, {session.name}</h1>
      <p className="text-neutral-400 mb-10">Tu hub personal en Blazon.</p>

      {billing === "success" && (
        <p className="mb-8 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-200 px-4 py-3 text-sm">
          Suscripción activada correctamente.
        </p>
      )}
      {billing === "activated" && (
        <p className="mb-8 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-200 px-4 py-3 text-sm">
          Plan gratuito activado.
        </p>
      )}

      {adminOrgs.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-black mb-4">Mis organizaciones</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {adminOrgs.map((m) => (
              <Link
                key={m.id}
                href={`/dashboard/${m.organization.slug}`}
                className="rounded-md bg-neutral-900 border border-neutral-800 px-6 py-5 transition hover:border-neutral-600"
              >
                <p className="font-black text-lg">{m.organization.name}</p>
                <p className="text-sm text-neutral-500">
                  {m.role === "ORG_OWNER" ? "Propietario" : "Admin"} · Gestionar →
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-xl font-black mb-4">Mis torneos</h2>
        {registrations.length === 0 ? (
          <p className="text-neutral-500 text-sm">
            Aún no estás inscrito en ningún torneo.{" "}
            <Link href="/o/ld/torneos" className="underline">
              Explora torneos
            </Link>
            .
          </p>
        ) : (
          <ul className="space-y-3">
            {registrations.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/o/${r.tournament.organization.slug}/torneos/${r.tournament.slug}`}
                  className="rounded-md bg-neutral-900 border border-neutral-800 px-6 py-4 flex flex-wrap items-center justify-between gap-3 transition hover:border-neutral-600 block"
                >
                  <div>
                    <p className="font-bold">{r.tournament.name}</p>
                    <p className="text-sm text-neutral-500">
                      {r.tournament.organization.name} ·{" "}
                      {new Date(r.tournament.startsAt).toLocaleDateString("es", {
                        day: "numeric",
                        month: "long",
                      })}
                      {r.teamName ? ` · ${r.teamName}` : ""}
                    </p>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                    {r.status === "CHECKED_IN" ? "Check-in ✓" : r.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
