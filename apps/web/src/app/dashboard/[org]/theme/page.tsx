import { requireOrgAdmin } from "@/lib/admin";
import { ThemeForm } from "@/components/dashboard/ThemeForm";

export default async function ThemeAdminPage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org: orgSlug } = await params;
  const { org } = await requireOrgAdmin(orgSlug);

  return (
    <main>
      <h1 className="text-2xl font-black mb-2">Tema del sitio</h1>
      <p className="text-neutral-400 mb-10 text-sm">
        Personaliza los colores, logo y tipografía de tu vista pública. Los
        cambios se aplican al instante.
      </p>
      <ThemeForm orgId={org.id} orgSlug={orgSlug} theme={org.theme} />
    </main>
  );
}
