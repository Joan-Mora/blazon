import { cookies } from "next/headers";
import type { SessionUser } from "@blazon/shared";
import { apiFetchOrNull } from "./api";

export const TOKEN_COOKIE = "blazon_token";

export async function getToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(TOKEN_COOKIE)?.value ?? null;
}

export async function getSessionUser(): Promise<
  (SessionUser & { token: string }) | null
> {
  const token = await getToken();
  if (!token) return null;
  try {
    const user = await apiFetchOrNull<SessionUser>("/auth/session/me", { token });
    return user ? { ...user, token } : null;
  } catch {
    return null;
  }
}
