import type { OrgThemeTokens } from "@blazon/shared";

/**
 * Converts org theme tokens into CSS custom properties consumed by the
 * public-site layout. Every tenant page is styled exclusively through these
 * variables so orgs can rebrand without code.
 */
export function themeToCssVars(theme: OrgThemeTokens): Record<string, string> {
  return {
    "--org-bg": theme.background,
    "--org-surface": theme.surface,
    "--org-primary": theme.primary,
    "--org-accent": theme.accent,
    "--org-text": theme.text,
    "--org-text-muted": theme.textMuted,
    "--org-font": theme.fontFamily,
  };
}

export function cssVarsToStyleString(vars: Record<string, string>): string {
  return Object.entries(vars)
    .map(([k, v]) => `${k}: ${v};`)
    .join(" ");
}
