import { NextRequest, NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/session";

export function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const url = new URL(token ? "/dashboard" : "/login?error=missing-token", req.url);
  const res = NextResponse.redirect(url);
  if (token) {
    res.cookies.set(TOKEN_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }
  return res;
}
