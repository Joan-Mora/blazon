// API response shapes consumed by the web app.

export interface OrgTheme {
  background: string;
  surface: string;
  primary: string;
  accent: string;
  text: string;
  textMuted: string;
  fontFamily: string;
  logoText: string;
  logoUrl: string | null;
  faviconEmoji: string;
  heroImageUrl: string | null;
}

export interface OrgBlock {
  id: string;
  type: string;
  sortOrder: number;
  data: Record<string, unknown>;
}

export interface OrgPage {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  sortOrder: number;
  blocks: OrgBlock[];
}

export interface PublicOrgData {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  mission: string | null;
  theme: OrgTheme;
  pages: OrgPage[];
}

export interface TournamentSummary {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  prizePool: string | null;
  status: string;
  maxParticipants: number;
  startsAt: string;
  game: { slug: string; name: string };
  _count: { registrations: number };
}

export interface MatchParticipant {
  id: string;
  teamName: string | null;
  user: { name: string };
}

export interface MatchData {
  id: string;
  round: number;
  position: number;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: string | null;
  status: string;
  participantA: MatchParticipant | null;
  participantB: MatchParticipant | null;
}

export interface TournamentDetail extends Omit<TournamentSummary, "_count"> {
  rules: string | null;
  organization: { id: string; slug: string; name: string };
  registrations: {
    id: string;
    teamName: string | null;
    status: string;
    user: { id: string; name: string };
  }[];
  matches: MatchData[];
}

export interface MyRegistration {
  id: string;
  status: string;
  teamName: string | null;
  createdAt: string;
  tournament: {
    id: string;
    slug: string;
    name: string;
    startsAt: string;
    status: string;
    organization: { slug: string; name: string };
  };
}

export interface MyMembership {
  id: string;
  role: string;
  organization: { id: string; slug: string; name: string };
}

export interface PlanData {
  id: string;
  code: string;
  name: string;
  priceMonthlyUsd: number;
  features: Record<string, unknown>;
}

export interface AdminTournament extends TournamentSummary {
  _count: { registrations: number; matches: number };
}
