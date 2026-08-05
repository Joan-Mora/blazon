import { apiFetch } from "@/lib/api";
import { requireOrgAdmin } from "@/lib/admin";
import type { OrgPage } from "@/lib/types";
import { PageToggle } from "@/components/dashboard/PageToggle";

export default async function PagesAdminPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org: orgSlug } = await params;
  const { session, org } = await requireOrgAdmin(orgSlug);

  const pages = await apiFetch<OrgPage[]>(`/orgs/${org.id}/pages`, {
    token: session.token,
  });

  return (
    <main>
      <h1 className="text-2xl font-black mb-2">Páginas del sitio</h1>
      <p className="text-neutral-400 mb-10 text-sm">
        Controla qué secciones son visibles en tu vista pública.
      </p>

      <ul className="space-y-3 max-w-2xl">
        {pages.map((page) => (
          <li
            key={page.id}
            className="rounded-md bg-neutral-900 border border-neutral-800 px-6 py-4 flex items-center justify-between gap-4"
          >
            <div>
              <p className="font-bold">{page.title}</p>
              <p className="text-sm text-neutral-500">
                /o/{orgSlug}/{page.slug === "home" ? "" : page.slug} ·{" "}
                {page.blocks.length} bloque{page.blocks.length === 1 ? "" : "s"}
              </p>
            </div>
            <PageToggle
              orgId={org.id}
              orgSlug={orgSlug}
              pageId={page.id}
              published={page.published}
            />
          </li>
        ))}
      </ul>
    </main>
  );
}
