import { redirect, notFound } from "next/navigation";
import { apiFetch, apiFetchOrNull } from "@/lib/api";
import { getSessionUser } from "@/lib/session";
import type { MyMembership, PublicOrgData } from "@/lib/types";

/**
 * Loads session + org and verifies the current user administers the org.
 * Shared by every /dashboard/[org]/* page.
 */
export async function requireOrgAdmin(orgSlug: string) {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  const org = await apiFetchOrNull<PublicOrgData>(`/orgs/${orgSlug}`);
  if (!org) notFound();

  const memberships = await apiFetch<MyMembership[]>("/auth/session/orgs", {
    token: session.token,
  });
  const membership = memberships.find(
    (m) =>
      m.organization.slug === orgSlug &&
      ["ORG_OWNER", "ORG_ADMIN"].includes(m.role),
  );
  if (!membership) redirect("/dashboard");

  return { session, org, membership };
}
