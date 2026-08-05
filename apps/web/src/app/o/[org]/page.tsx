import { notFound } from "next/navigation";
import { apiFetchOrNull, apiFetch } from "@/lib/api";
import type { PublicOrgData, TournamentSummary } from "@/lib/types";
import { BlockRenderer } from "@/components/org/BlockRenderer";

export default async function OrgHomePage({
  params,
}: {
  params: Promise<{ org: string }>;
}) {
  const { org: slug } = await params;
  const org = await apiFetchOrNull<PublicOrgData>(`/orgs/${slug}`);
  if (!org) notFound();

  const home = org.pages.find((p) => p.slug === "home");

  const [nextTournament, tournaments] = await Promise.all([
    apiFetchOrNull<{ name: string; startsAt: string; slug: string } | null>(
      `/orgs/${slug}/tournaments/next`,
    ),
    apiFetch<TournamentSummary[]>(`/orgs/${slug}/tournaments?scope=upcoming`),
  ]);

  if (!home || home.blocks.length === 0) {
    return (
      <main className="px-6 py-32 text-center">
        <h1 className="text-5xl font-black mb-4">{org.name}</h1>
        {org.tagline && (
          <p style={{ color: "var(--org-text-muted)" }}>{org.tagline}</p>
        )}
      </main>
    );
  }

  return (
    <main>
      <BlockRenderer
        blocks={home.blocks}
        ctx={{
          orgSlug: slug,
          heroImageUrl: org.theme.heroImageUrl,
          nextTournament,
          tournaments,
        }}
      />
    </main>
  );
}
