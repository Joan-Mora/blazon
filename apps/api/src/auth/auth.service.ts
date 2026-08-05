import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import type { SessionUser } from "@blazon/shared";
import { PrismaService } from "../prisma/prisma.service";

interface OauthProfile {
  provider: "google" | "twitch";
  providerAccountId: string;
  email: string;
  name: string;
  avatarUrl?: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  // ── OAuth URL builders ──────────────────────────────────────────────────

  getAuthorizeUrl(provider: string): string {
    const apiUrl = process.env.API_URL ?? "http://localhost:4000";
    const redirectUri = `${apiUrl}/auth/${provider}/callback`;

    if (provider === "google") {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) throw new BadRequestException("Google OAuth not configured");
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        prompt: "select_account",
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    }

    if (provider === "twitch") {
      const clientId = process.env.TWITCH_CLIENT_ID;
      if (!clientId) throw new BadRequestException("Twitch OAuth not configured");
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "user:read:email",
      });
      return `https://id.twitch.tv/oauth2/authorize?${params}`;
    }

    throw new BadRequestException(`Unknown provider: ${provider}`);
  }

  // ── OAuth code exchange ─────────────────────────────────────────────────

  async handleCallback(provider: string, code: string): Promise<string> {
    let profile: OauthProfile;
    if (provider === "google") profile = await this.exchangeGoogle(code);
    else if (provider === "twitch") profile = await this.exchangeTwitch(code);
    else throw new BadRequestException(`Unknown provider: ${provider}`);

    const user = await this.upsertUser(profile);
    return this.signToken(user);
  }

  private async exchangeGoogle(code: string): Promise<OauthProfile> {
    const apiUrl = process.env.API_URL ?? "http://localhost:4000";
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID ?? "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        redirect_uri: `${apiUrl}/auth/google/callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!res.ok) throw new UnauthorizedException("Google token exchange failed");
    const tokens = (await res.json()) as { access_token: string };

    const profileRes = await fetch(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      { headers: { Authorization: `Bearer ${tokens.access_token}` } },
    );
    if (!profileRes.ok) throw new UnauthorizedException("Google profile fetch failed");
    const p = (await profileRes.json()) as {
      sub: string;
      email: string;
      name?: string;
      picture?: string;
    };
    return {
      provider: "google",
      providerAccountId: p.sub,
      email: p.email,
      name: p.name ?? p.email.split("@")[0],
      avatarUrl: p.picture,
    };
  }

  private async exchangeTwitch(code: string): Promise<OauthProfile> {
    const apiUrl = process.env.API_URL ?? "http://localhost:4000";
    const clientId = process.env.TWITCH_CLIENT_ID ?? "";
    const res = await fetch("https://id.twitch.tv/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: process.env.TWITCH_CLIENT_SECRET ?? "",
        redirect_uri: `${apiUrl}/auth/twitch/callback`,
        grant_type: "authorization_code",
      }),
    });
    if (!res.ok) throw new UnauthorizedException("Twitch token exchange failed");
    const tokens = (await res.json()) as { access_token: string };

    const profileRes = await fetch("https://api.twitch.tv/helix/users", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
        "Client-Id": clientId,
      },
    });
    if (!profileRes.ok) throw new UnauthorizedException("Twitch profile fetch failed");
    const body = (await profileRes.json()) as {
      data: {
        id: string;
        login: string;
        display_name?: string;
        email?: string;
        profile_image_url?: string;
      }[];
    };
    const p = body.data[0];
    if (!p) throw new UnauthorizedException("Twitch profile empty");
    return {
      provider: "twitch",
      providerAccountId: p.id,
      email: p.email ?? `${p.login}@users.twitch.tv`,
      name: p.display_name ?? p.login,
      avatarUrl: p.profile_image_url,
    };
  }

  // ── Dev login (local only) ──────────────────────────────────────────────

  async devLogin(email: string, name?: string): Promise<string> {
    if (process.env.ALLOW_DEV_LOGIN !== "true") {
      throw new UnauthorizedException("Dev login disabled");
    }
    const user = await this.upsertUser({
      provider: "google", // stored under synthetic dev account below
      providerAccountId: `dev:${email}`,
      email,
      name: name ?? email.split("@")[0],
    });
    return this.signToken(user);
  }

  // ── Shared helpers ──────────────────────────────────────────────────────

  private async upsertUser(profile: OauthProfile) {
    const account = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
        },
      },
      include: { user: true },
    });
    if (account) return account.user;

    // Link to existing user by email, or create a new one
    const user = await this.prisma.user.upsert({
      where: { email: profile.email },
      update: { avatarUrl: profile.avatarUrl ?? undefined },
      create: {
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl,
      },
    });
    await this.prisma.account.create({
      data: {
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
        userId: user.id,
      },
    });
    return user;
  }

  private signToken(user: { id: string; email: string; name: string }): string {
    return this.jwt.sign({ sub: user.id, email: user.email, name: user.name });
  }

  verifyToken(token: string): SessionUser {
    try {
      const payload = this.jwt.verify<{ sub: string; email: string; name: string }>(
        token,
      );
      return { id: payload.sub, email: payload.email, name: payload.name };
    } catch {
      throw new UnauthorizedException("Invalid token");
    }
  }
}
