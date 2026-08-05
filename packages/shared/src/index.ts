// ─── Roles ───────────────────────────────────────────────────────────────────

export const ORG_ROLES = [
  "ORG_OWNER",
  "ORG_ADMIN",
  "ORG_STAFF",
  "PLAYER",
  "COACH",
  "ANALYST",
  "FAN",
] as const;
export type OrgRole = (typeof ORG_ROLES)[number];

export const ADMIN_ROLES: OrgRole[] = ["ORG_OWNER", "ORG_ADMIN"];

// ─── Plans ───────────────────────────────────────────────────────────────────

export const PLAN_CODES = ["STARTER", "PRO", "ELITE", "NETWORK"] as const;
export type PlanCode = (typeof PLAN_CODES)[number];

export interface PlanFeatures {
  maxTournamentsPerMonth: number | null; // null = unlimited
  maxPages: number;
  customCss: boolean;
  customDomain: boolean;
  removeBranding: boolean;
  staffSeats: number;
}

export const PLAN_DEFS: Record<
  PlanCode,
  { name: string; priceMonthlyUsd: number; features: PlanFeatures }
> = {
  STARTER: {
    name: "Starter",
    priceMonthlyUsd: 0,
    features: {
      maxTournamentsPerMonth: 2,
      maxPages: 5,
      customCss: false,
      customDomain: false,
      removeBranding: false,
      staffSeats: 3,
    },
  },
  PRO: {
    name: "Pro",
    priceMonthlyUsd: 29,
    features: {
      maxTournamentsPerMonth: null,
      maxPages: 15,
      customCss: true,
      customDomain: false,
      removeBranding: true,
      staffSeats: 10,
    },
  },
  ELITE: {
    name: "Elite",
    priceMonthlyUsd: 99,
    features: {
      maxTournamentsPerMonth: null,
      maxPages: 50,
      customCss: true,
      customDomain: true,
      removeBranding: true,
      staffSeats: 25,
    },
  },
  NETWORK: {
    name: "Network+",
    priceMonthlyUsd: 299,
    features: {
      maxTournamentsPerMonth: null,
      maxPages: 200,
      customCss: true,
      customDomain: true,
      removeBranding: true,
      staffSeats: 100,
    },
  },
};

// ─── Page blocks ─────────────────────────────────────────────────────────────

export const BLOCK_TYPES = [
  "HERO_COUNTDOWN",
  "CTA_BUTTONS",
  "MISSION",
  "CLIPS_GRID",
  "TOURNAMENT_LIST",
  "RICH_TEXT",
] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export interface HeroCountdownData {
  title: string;
  subtitle?: string;
  /** ISO date the countdown targets; usually next tournament start */
  targetDate?: string;
  ctaLabel?: string;
  ctaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

export interface CtaButtonsData {
  buttons: { label: string; href: string; variant?: "primary" | "outline" }[];
}

export interface MissionData {
  heading: string;
  body: string;
}

export interface ClipsGridData {
  heading: string;
  clips: { title: string; embedUrl: string }[];
}

export interface TournamentListData {
  heading: string;
  scope: "upcoming" | "past";
}

export interface RichTextData {
  heading?: string;
  body: string;
}

// ─── Theme ───────────────────────────────────────────────────────────────────

export interface OrgThemeTokens {
  background: string;
  surface: string;
  primary: string;
  accent: string;
  text: string;
  textMuted: string;
  fontFamily: string;
}

/** LD brief default: black bg, vibrant red, neon-yellow highlights, bold sans. */
export const DEFAULT_THEME: OrgThemeTokens = {
  background: "#0a0a0a",
  surface: "#161616",
  primary: "#e11d2e",
  accent: "#f5e642",
  text: "#ffffff",
  textMuted: "#a3a3a3",
  fontFamily: "'Poppins', 'Montserrat', sans-serif",
};

// ─── Tournaments ─────────────────────────────────────────────────────────────

export const TOURNAMENT_FORMATS = ["SINGLE_ELIM"] as const;
export type TournamentFormat = (typeof TOURNAMENT_FORMATS)[number];

export const TOURNAMENT_STATUSES = [
  "DRAFT",
  "REGISTRATION",
  "LIVE",
  "COMPLETED",
] as const;
export type TournamentStatus = (typeof TOURNAMENT_STATUSES)[number];

export const REGISTRATION_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CHECKED_IN",
  "REJECTED",
] as const;
export type RegistrationStatus = (typeof REGISTRATION_STATUSES)[number];

// ─── API DTOs (subset shared by web + api) ──────────────────────────────────

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
}

export interface PublicOrg {
  id: string;
  slug: string;
  name: string;
  tagline?: string | null;
  theme: OrgThemeTokens & { logoText: string; logoUrl?: string | null };
}
