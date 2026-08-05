"use client";

import { useState, useTransition } from "react";
import { registerForTournamentAction } from "@/app/actions";

export function RegisterButton({
  tournamentId,
  orgSlug,
  tournamentSlug,
  isLoggedIn,
  alreadyRegistered,
}: {
  tournamentId: string;
  orgSlug: string;
  tournamentSlug: string;
  isLoggedIn: boolean;
  alreadyRegistered: boolean;
}) {
  const [teamName, setTeamName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (alreadyRegistered) {
    return (
      <p className="font-bold org-accent">Ya estás inscrito en este torneo ✓</p>
    );
  }

  if (!isLoggedIn) {
    return (
      <a href="/login" className="org-btn-primary">
        Inicia sesión para inscribirte
      </a>
    );
  }

  return (
    <div className="space-y-3 max-w-sm">
      <input
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        placeholder="Nombre de equipo (opcional)"
        className="w-full rounded-md px-4 py-3 text-sm org-surface"
        style={{
          border: "1px solid color-mix(in srgb, var(--org-text) 15%, transparent)",
          color: "var(--org-text)",
        }}
      />
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await registerForTournamentAction(
              tournamentId,
              orgSlug,
              tournamentSlug,
              teamName || undefined,
            );
            if (!result.ok) setError(result.error);
          })
        }
        className="org-btn-primary disabled:opacity-50"
      >
        {pending ? "Inscribiendo…" : "¡Regístrate en el Torneo!"}
      </button>
      {error && <p className="text-sm org-primary">{error}</p>}
    </div>
  );
}
