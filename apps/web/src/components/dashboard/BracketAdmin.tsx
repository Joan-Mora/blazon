"use client";

import { useState, useTransition } from "react";
import { generateBracketAction, reportResultAction } from "@/app/actions";
import type { MatchData } from "@/lib/types";

export function GenerateBracketButton({
  orgId,
  orgSlug,
  tournamentId,
  hasMatches,
}: {
  orgId: string;
  orgSlug: string;
  tournamentId: string;
  hasMatches: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-4">
      <button
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            const result = await generateBracketAction(
              orgId,
              orgSlug,
              tournamentId,
            );
            if (!result.ok) setError(result.error);
          })
        }
        className="rounded-md px-6 py-3 font-bold text-white transition hover:brightness-110 disabled:opacity-50"
        style={{ background: "var(--blazon-red)" }}
      >
        {pending
          ? "Generando…"
          : hasMatches
            ? "Regenerar bracket (borra resultados)"
            : "Generar bracket"}
      </button>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

export function MatchResultForm({
  orgId,
  orgSlug,
  tournamentId,
  match,
  nameA,
  nameB,
}: {
  orgId: string;
  orgSlug: string;
  tournamentId: string;
  match: MatchData;
  nameA: string;
  nameB: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const ready = match.participantA && match.participantB;
  const completed = match.status === "COMPLETED";

  return (
    <div className="rounded-md bg-neutral-900 border border-neutral-800 px-5 py-4">
      <p className="text-xs text-neutral-500 mb-2">
        Ronda {match.round} · Partida {match.position + 1}
      </p>
      <div className="flex items-center justify-between gap-3 text-sm font-bold mb-3">
        <span className={match.winnerId === match.participantA?.id ? "text-emerald-400" : ""}>
          {nameA}
        </span>
        <span className="text-neutral-600">vs</span>
        <span className={match.winnerId === match.participantB?.id ? "text-emerald-400" : ""}>
          {nameB}
        </span>
      </div>

      {completed ? (
        <p className="text-sm text-neutral-400 tabular-nums">
          Resultado: {match.scoreA} — {match.scoreB}
        </p>
      ) : ready ? (
        <form
          action={(formData) =>
            startTransition(async () => {
              setError(null);
              const result = await reportResultAction(
                orgId,
                orgSlug,
                tournamentId,
                match.id,
                formData,
              );
              if (!result.ok) setError(result.error);
            })
          }
          className="flex items-center gap-2"
        >
          <input
            name="scoreA"
            type="number"
            min={0}
            required
            placeholder="0"
            className="w-16 rounded-md bg-neutral-950 border border-neutral-700 px-2 py-2 text-sm text-center"
          />
          <span className="text-neutral-600">—</span>
          <input
            name="scoreB"
            type="number"
            min={0}
            required
            placeholder="0"
            className="w-16 rounded-md bg-neutral-950 border border-neutral-700 px-2 py-2 text-sm text-center"
          />
          <button
            disabled={pending}
            className="rounded-md px-4 py-2 text-sm font-bold bg-neutral-800 hover:bg-neutral-700 transition disabled:opacity-50"
          >
            {pending ? "…" : "Reportar"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-neutral-600">Esperando participantes…</p>
      )}
      {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
    </div>
  );
}
