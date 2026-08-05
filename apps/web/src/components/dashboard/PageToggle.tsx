"use client";

import { useTransition } from "react";
import { togglePageAction } from "@/app/actions";

export function PageToggle({
  orgId,
  orgSlug,
  pageId,
  published,
}: {
  orgId: string;
  orgSlug: string;
  pageId: string;
  published: boolean;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await togglePageAction(orgId, orgSlug, pageId, !published);
        })
      }
      className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full transition disabled:opacity-50 ${
        published
          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
          : "bg-neutral-800 text-neutral-400 border border-neutral-700"
      }`}
    >
      {pending ? "…" : published ? "Publicada" : "Oculta"}
    </button>
  );
}
