import { notFound } from "next/navigation";
import { apiFetchOrNull, apiFetch } from "@/lib/api";
import type { PublicOrgData, TournamentSummary } from "@/lib/types";
import { BlockRenderer } from "@/components/org/BlockRenderer";

/**
 * Generic CMS page renderer: any published org page (ranking, academia,
 * streaming, clips, tienda, reclutamiento, custom…) renders its blocks here.
 * Explicit routes (torneos) take precedence over this dynamic segment.
 */
export default async function OrgCmsPage({
  params,
}: {
  params: Promise<{ org: string; page: string }>;
}) {
  const { org: slug, page: pageSlug } = await params;
  const org = await apiFetchOrNull<PublicOrgData>(`/orgs/${slug}`);
  if (!org) notFound();

  const page = org.pages.find((p) => p.slug === pageSlug && p.published);
  if (!page) notFound();

  const needsTournaments = page.blocks.some((b) => b.type === "TOURNAMENT_LIST");
  const tournaments = needsTournaments
    ? await apiFetch<TournamentSummary[]>(`/orgs/${slug}/tournaments?scope=all`)
    : [];

  return (
    <main>
      <section className="px-6 pt-16 pb-4 max-w-5xl mx-auto">
        <h1 className="text-4xl font-black">{page.title}</h1>
      </section>
      {page.blocks.length === 0 ? (
        <section className="px-6 py-16 max-w-5xl mx-auto">
          <p style={{ color: "var(--org-text-muted)" }}>
            Esta sección estará disponible muy pronto.
          </p>
        </section>
      ) : (
        <BlockRenderer
          blocks={page.blocks}
          ctx={{ orgSlug: slug, tournaments }}
        />
      )}
    </main>
  );
}
