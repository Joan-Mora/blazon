import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { apiFetchOrNull } from "@/lib/api";
import type { PublicOrgData } from "@/lib/types";

async function getOrg(slug: string): Promise<PublicOrgData | null> {
  return apiFetchOrNull<PublicOrgData>(`/orgs/${slug}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ org: string }>;
}): Promise<Metadata> {
  const { org: slug } = await params;
  const org = await getOrg(slug);
  if (!org) return { title: "Organización no encontrada" };
  return {
    title: `${org.name}`,
    description: org.tagline ?? `Sitio oficial de ${org.name}`,
    icons: {
      icon: `data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>${encodeURIComponent(org.theme.faviconEmoji || "♥")}</text></svg>`,
    },
  };
}

export default async function OrgLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org: slug } = await params;
  const org = await getOrg(slug);
  if (!org) notFound();

  const theme = org.theme;
  const navPages = org.pages.filter((p) => p.published && p.slug !== "home");

  return (
    <div
      className="org-site"
      style={
        {
          "--org-bg": theme.background,
          "--org-surface": theme.surface,
          "--org-primary": theme.primary,
          "--org-accent": theme.accent,
          "--org-text": theme.text,
          "--org-text-muted": theme.textMuted,
          "--org-font": theme.fontFamily,
        } as React.CSSProperties
      }
    >
      <header
        className="sticky top-0 z-40 border-b"
        style={{
          background: "color-mix(in srgb, var(--org-bg) 85%, transparent)",
          backdropFilter: "blur(8px)",
          borderColor: "color-mix(in srgb, var(--org-text) 12%, transparent)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <Link
            href={`/o/${org.slug}`}
            className="text-xl font-black tracking-tight whitespace-nowrap"
          >
            <span className="org-primary">{theme.faviconEmoji}</span>{" "}
            {theme.logoText || org.name}
          </Link>
          <nav className="flex gap-5 text-sm font-semibold overflow-x-auto">
            {navPages.map((page) => (
              <Link
                key={page.id}
                href={`/o/${org.slug}/${page.slug}`}
                className="whitespace-nowrap transition hover:text-[var(--org-accent)]"
                style={{ color: "var(--org-text-muted)" }}
              >
                {page.title}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {children}

      <footer
        className="border-t py-10 text-center"
        style={{
          borderColor: "color-mix(in srgb, var(--org-text) 12%, transparent)",
          color: "var(--org-text-muted)",
        }}
      >
        <p className="text-lg font-black mb-1" style={{ color: "var(--org-text)" }}>
          <span className="org-primary">{theme.faviconEmoji}</span>{" "}
          {theme.logoText || org.name}
        </p>
        <p className="text-xs">
          Powered by <span className="font-bold">Blazon</span>
        </p>
      </footer>
    </div>
  );
}
