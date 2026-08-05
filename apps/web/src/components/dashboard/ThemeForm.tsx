"use client";

import { useState, useTransition } from "react";
import { updateThemeAction } from "@/app/actions";
import type { OrgTheme } from "@/lib/types";

const COLOR_FIELDS: { key: keyof OrgTheme; label: string }[] = [
  { key: "background", label: "Fondo" },
  { key: "surface", label: "Superficie" },
  { key: "primary", label: "Primario" },
  { key: "accent", label: "Acento" },
  { key: "text", label: "Texto" },
  { key: "textMuted", label: "Texto secundario" },
];

export function ThemeForm({
  orgId,
  orgSlug,
  theme,
}: {
  orgId: string;
  orgSlug: string;
  theme: OrgTheme;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          setMessage(null);
          const result = await updateThemeAction(orgId, orgSlug, formData);
          setMessage(result.ok ? "Tema guardado ✓" : result.error);
        })
      }
      className="space-y-8 max-w-2xl"
    >
      <section>
        <h2 className="font-black mb-4">Colores</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {COLOR_FIELDS.map((field) => (
            <label key={field.key} className="block">
              <span className="text-xs text-neutral-400 block mb-1">
                {field.label}
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  name={field.key}
                  defaultValue={String(theme[field.key] ?? "#000000")}
                  className="h-10 w-14 rounded cursor-pointer bg-transparent"
                />
                <code className="text-xs text-neutral-500">
                  {String(theme[field.key])}
                </code>
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-black">Marca</h2>
        <label className="block">
          <span className="text-xs text-neutral-400 block mb-1">
            Texto del logo
          </span>
          <input
            name="logoText"
            defaultValue={theme.logoText}
            className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-4 py-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs text-neutral-400 block mb-1">
            Emoji de favicon / marca (ej. ♥)
          </span>
          <input
            name="faviconEmoji"
            defaultValue={theme.faviconEmoji}
            maxLength={4}
            className="w-24 rounded-md bg-neutral-900 border border-neutral-700 px-4 py-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs text-neutral-400 block mb-1">
            Tipografía (CSS font-family)
          </span>
          <input
            name="fontFamily"
            defaultValue={theme.fontFamily}
            className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-4 py-3 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-xs text-neutral-400 block mb-1">
            Imagen de héroe (URL)
          </span>
          <input
            name="heroImageUrl"
            defaultValue={theme.heroImageUrl ?? ""}
            placeholder="https://…"
            className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-4 py-3 text-sm"
          />
        </label>
      </section>

      <div className="flex items-center gap-4">
        <button
          disabled={pending}
          className="rounded-md px-6 py-3 font-bold text-white transition hover:brightness-110 disabled:opacity-50"
          style={{ background: "var(--blazon-red)" }}
        >
          {pending ? "Guardando…" : "Guardar tema"}
        </button>
        {message && <p className="text-sm text-neutral-400">{message}</p>}
      </div>
    </form>
  );
}
