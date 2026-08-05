"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { apiFetch, ApiError } from "@/lib/api";
import { TOKEN_COOKIE, getToken } from "@/lib/session";

type ActionResult = { ok: true } | { ok: false; error: string };

function toResult(error: unknown): ActionResult {
  if (error instanceof ApiError) return { ok: false, error: error.message };
  return { ok: false, error: "Unexpected error" };
}

async function requireToken(): Promise<string> {
  const token = await getToken();
  if (!token) redirect("/login");
  return token;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export async function devLoginAction(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "");
  const name = String(formData.get("name") ?? "") || undefined;
  const { token } = await apiFetch<{ token: string }>("/auth/dev", {
    method: "POST",
    body: JSON.stringify({ email, name }),
  });
  const store = await cookies();
  store.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  const store = await cookies();
  store.delete(TOKEN_COOKIE);
  redirect("/");
}

// ── Player ─────────────────────────────────────────────────────────────────

export async function registerForTournamentAction(
  tournamentId: string,
  orgSlug: string,
  tournamentSlug: string,
  teamName?: string,
): Promise<ActionResult> {
  const token = await requireToken();
  try {
    await apiFetch(`/tournaments/${tournamentId}/register`, {
      method: "POST",
      body: JSON.stringify({ teamName }),
      token,
    });
    revalidatePath(`/o/${orgSlug}/torneos/${tournamentSlug}`);
    return { ok: true };
  } catch (error) {
    return toResult(error);
  }
}

export async function checkInAction(
  tournamentId: string,
  orgSlug: string,
  tournamentSlug: string,
): Promise<ActionResult> {
  const token = await requireToken();
  try {
    await apiFetch(`/tournaments/${tournamentId}/checkin`, {
      method: "POST",
      token,
    });
    revalidatePath(`/o/${orgSlug}/torneos/${tournamentSlug}`);
    return { ok: true };
  } catch (error) {
    return toResult(error);
  }
}

// ── Org admin ──────────────────────────────────────────────────────────────

export async function updateThemeAction(
  orgId: string,
  orgSlug: string,
  formData: FormData,
): Promise<ActionResult> {
  const token = await requireToken();
  const fields = [
    "background",
    "surface",
    "primary",
    "accent",
    "text",
    "textMuted",
    "fontFamily",
    "logoText",
    "faviconEmoji",
    "heroImageUrl",
  ];
  const payload: Record<string, string> = {};
  for (const field of fields) {
    const value = formData.get(field);
    if (typeof value === "string" && value.length > 0) payload[field] = value;
  }
  try {
    await apiFetch(`/orgs/${orgId}/theme`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      token,
    });
    revalidatePath(`/o/${orgSlug}`);
    revalidatePath(`/dashboard/${orgSlug}/theme`);
    return { ok: true };
  } catch (error) {
    return toResult(error);
  }
}

export async function updateOrgAction(
  orgId: string,
  orgSlug: string,
  formData: FormData,
): Promise<ActionResult> {
  const token = await requireToken();
  const payload: Record<string, string> = {};
  for (const field of ["name", "tagline", "mission"]) {
    const value = formData.get(field);
    if (typeof value === "string") payload[field] = value;
  }
  try {
    await apiFetch(`/orgs/${orgId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
      token,
    });
    revalidatePath(`/o/${orgSlug}`);
    revalidatePath(`/dashboard/${orgSlug}`);
    return { ok: true };
  } catch (error) {
    return toResult(error);
  }
}

export async function togglePageAction(
  orgId: string,
  orgSlug: string,
  pageId: string,
  published: boolean,
): Promise<ActionResult> {
  const token = await requireToken();
  try {
    await apiFetch(`/orgs/${orgId}/pages/${pageId}`, {
      method: "PATCH",
      body: JSON.stringify({ published }),
      token,
    });
    revalidatePath(`/o/${orgSlug}`);
    revalidatePath(`/dashboard/${orgSlug}/pages`);
    return { ok: true };
  } catch (error) {
    return toResult(error);
  }
}

export async function addMemberAction(
  orgId: string,
  orgSlug: string,
  formData: FormData,
): Promise<ActionResult> {
  const token = await requireToken();
  try {
    await apiFetch(`/orgs/${orgId}/members`, {
      method: "POST",
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        role: String(formData.get("role") ?? "PLAYER"),
      }),
      token,
    });
    revalidatePath(`/dashboard/${orgSlug}/members`);
    return { ok: true };
  } catch (error) {
    return toResult(error);
  }
}

export async function createTournamentAction(
  orgId: string,
  orgSlug: string,
  formData: FormData,
): Promise<ActionResult> {
  const token = await requireToken();
  try {
    await apiFetch(`/admin/orgs/${orgId}/tournaments`, {
      method: "POST",
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        slug: String(formData.get("slug") ?? ""),
        gameSlug: String(formData.get("gameSlug") ?? "lol"),
        description: String(formData.get("description") ?? "") || undefined,
        prizePool: String(formData.get("prizePool") ?? "") || undefined,
        maxParticipants: Number(formData.get("maxParticipants") ?? 16),
        startsAt: new Date(String(formData.get("startsAt"))).toISOString(),
        status: "REGISTRATION",
      }),
      token,
    });
    revalidatePath(`/dashboard/${orgSlug}/tournaments`);
    revalidatePath(`/o/${orgSlug}/torneos`);
    return { ok: true };
  } catch (error) {
    return toResult(error);
  }
}

export async function generateBracketAction(
  orgId: string,
  orgSlug: string,
  tournamentId: string,
): Promise<ActionResult> {
  const token = await requireToken();
  try {
    await apiFetch(`/admin/orgs/${orgId}/tournaments/${tournamentId}/bracket`, {
      method: "POST",
      token,
    });
    revalidatePath(`/dashboard/${orgSlug}/tournaments/${tournamentId}`);
    return { ok: true };
  } catch (error) {
    return toResult(error);
  }
}

export async function reportResultAction(
  orgId: string,
  orgSlug: string,
  tournamentId: string,
  matchId: string,
  formData: FormData,
): Promise<ActionResult> {
  const token = await requireToken();
  try {
    await apiFetch(`/admin/orgs/${orgId}/matches/${matchId}/result`, {
      method: "POST",
      body: JSON.stringify({
        scoreA: Number(formData.get("scoreA") ?? 0),
        scoreB: Number(formData.get("scoreB") ?? 0),
      }),
      token,
    });
    revalidatePath(`/dashboard/${orgSlug}/tournaments/${tournamentId}`);
    return { ok: true };
  } catch (error) {
    return toResult(error);
  }
}

// ── Billing ────────────────────────────────────────────────────────────────

export async function checkoutAction(
  orgId: string,
  planCode: string,
): Promise<ActionResult & { url?: string }> {
  const token = await requireToken();
  try {
    const { url } = await apiFetch<{ url: string }>("/billing/checkout", {
      method: "POST",
      body: JSON.stringify({ organizationId: orgId, planCode }),
      token,
    });
    return { ok: true, url };
  } catch (error) {
    return toResult(error);
  }
}
