"use client";

import { useState, useTransition } from "react";
import { createTournamentAction } from "@/app/actions";

export function TournamentForm({
  orgId,
  orgSlug,
}: {
  orgId: string;
  orgSlug: string;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          setMessage(null);
          const result = await createTournamentAction(orgId, orgSlug, formData);
          setMessage(result.ok ? "Torneo creado ✓" : result.error);
        })
      }
      className="rounded-md bg-neutral-900 border border-neutral-800 p-6 space-y-4 max-w-xl"
    >
      <h2 className="font-black">Nuevo torneo</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        <input
          name="name"
          required
          placeholder="Nombre del torneo"
          className="rounded-md bg-neutral-950 border border-neutral-700 px-4 py-3 text-sm"
        />
        <input
          name="slug"
          required
          pattern="[a-z0-9-]{2,60}"
          placeholder="slug-del-torneo"
          className="rounded-md bg-neutral-950 border border-neutral-700 px-4 py-3 text-sm"
        />
        <input
          name="prizePool"
          placeholder="Premio (ej. $500 USD)"
          className="rounded-md bg-neutral-950 border border-neutral-700 px-4 py-3 text-sm"
        />
        <input
          name="maxParticipants"
          type="number"
          min={2}
          defaultValue={16}
          className="rounded-md bg-neutral-950 border border-neutral-700 px-4 py-3 text-sm"
        />
        <input
          name="startsAt"
          type="datetime-local"
          required
          className="rounded-md bg-neutral-950 border border-neutral-700 px-4 py-3 text-sm sm:col-span-2"
        />
      </div>
      <textarea
        name="description"
        placeholder="Descripción"
        rows={3}
        className="w-full rounded-md bg-neutral-950 border border-neutral-700 px-4 py-3 text-sm"
      />
      <input type="hidden" name="gameSlug" value="lol" />
      <div className="flex items-center gap-4">
        <button
          disabled={pending}
          className="rounded-md px-6 py-3 font-bold text-white transition hover:brightness-110 disabled:opacity-50"
          style={{ background: "var(--blazon-red)" }}
        >
          {pending ? "Creando…" : "Crear torneo"}
        </button>
        {message && <p className="text-sm text-neutral-400">{message}</p>}
      </div>
    </form>
  );
}
