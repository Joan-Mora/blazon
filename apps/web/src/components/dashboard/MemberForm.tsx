"use client";

import { useState, useTransition } from "react";
import { addMemberAction } from "@/app/actions";

const ROLES = [
  { value: "ORG_ADMIN", label: "Admin" },
  { value: "ORG_STAFF", label: "Staff" },
  { value: "PLAYER", label: "Jugador" },
  { value: "COACH", label: "Coach" },
  { value: "ANALYST", label: "Analista" },
  { value: "FAN", label: "Fan" },
];

export function MemberForm({
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
          const result = await addMemberAction(orgId, orgSlug, formData);
          setMessage(result.ok ? "Miembro agregado ✓" : result.error);
        })
      }
      className="rounded-md bg-neutral-900 border border-neutral-800 p-6 space-y-4 max-w-xl"
    >
      <h2 className="font-black">Agregar miembro</h2>
      <div className="flex flex-wrap gap-3">
        <input
          name="email"
          type="email"
          required
          placeholder="email@ejemplo.com"
          className="flex-1 min-w-[200px] rounded-md bg-neutral-950 border border-neutral-700 px-4 py-3 text-sm"
        />
        <select
          name="role"
          className="rounded-md bg-neutral-950 border border-neutral-700 px-4 py-3 text-sm"
        >
          {ROLES.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
        <button
          disabled={pending}
          className="rounded-md px-6 py-3 font-bold text-white transition hover:brightness-110 disabled:opacity-50"
          style={{ background: "var(--blazon-red)" }}
        >
          {pending ? "…" : "Agregar"}
        </button>
      </div>
      {message && <p className="text-sm text-neutral-400">{message}</p>}
    </form>
  );
}
