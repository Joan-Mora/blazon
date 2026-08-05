import { apiFetch } from "@/lib/api";
import { requireOrgAdmin } from "@/lib/admin";
import { MemberForm } from "@/components/dashboard/MemberForm";

interface Member {
  id: string;
  role: string;
  user: { id: string; email: string; name: string };
}

const ROLE_LABELS: Record<string, string> = {
  ORG_OWNER: "Propietario",
  ORG_ADMIN: "Admin",
  ORG_STAFF: "Staff",
  PLAYER: "Jugador",
  COACH: "Coach",
  ANALYST: "Analista",
  FAN: "Fan",
};

export default async function MembersAdminPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org: orgSlug } = await params;
  const { session, org } = await requireOrgAdmin(orgSlug);

  const members = await apiFetch<Member[]>(`/orgs/${org.id}/members`, {
    token: session.token,
  });

  return (
    <main>
      <h1 className="text-2xl font-black mb-10">Miembros</h1>

      <div className="mb-12">
        <MemberForm orgId={org.id} orgSlug={orgSlug} />
      </div>

      <ul className="space-y-2 max-w-2xl">
        {members.map((member) => (
          <li
            key={member.id}
            className="rounded-md bg-neutral-900 border border-neutral-800 px-5 py-3 flex items-center justify-between gap-4 text-sm"
          >
            <div>
              <span className="font-bold">{member.user.name}</span>{" "}
              <span className="text-neutral-500">{member.user.email}</span>
            </div>
            <span className="text-xs uppercase tracking-widest text-neutral-400">
              {ROLE_LABELS[member.role] ?? member.role}
            </span>
          </li>
        ))}
      </ul>
    </main>
  );
}
