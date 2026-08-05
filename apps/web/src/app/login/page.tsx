import Link from "next/link";
import { API_URL } from "@/lib/api";
import { devLoginAction } from "@/app/actions";

export const metadata = { title: "Entrar — Blazon" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const devLoginEnabled = process.env.ALLOW_DEV_LOGIN === "true";

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="block text-center text-4xl font-black tracking-tight mb-10"
          style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
        >
          BLAZON
        </Link>

        {error && (
          <p className="mb-6 rounded-md bg-red-950 border border-red-800 text-red-200 px-4 py-3 text-sm">
            Error al iniciar sesión. Intenta de nuevo.
          </p>
        )}

        <div className="space-y-3">
          <a
            href={`${API_URL}/auth/google`}
            className="block w-full text-center rounded-md bg-white text-black font-semibold py-3 transition hover:bg-neutral-200"
          >
            Continuar con Google
          </a>
          <a
            href={`${API_URL}/auth/twitch`}
            className="block w-full text-center rounded-md font-semibold py-3 text-white transition hover:brightness-110"
            style={{ background: "#9146FF" }}
          >
            Continuar con Twitch
          </a>
        </div>

        {devLoginEnabled && (
          <form
            action={devLoginAction}
            className="mt-10 border-t border-neutral-800 pt-8 space-y-3"
          >
            <p className="text-xs uppercase tracking-widest text-neutral-500">
              Dev login (solo local)
            </p>
            <input
              name="email"
              type="email"
              required
              placeholder="email@ejemplo.com"
              className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-4 py-3 text-sm"
            />
            <input
              name="name"
              type="text"
              placeholder="Nombre (opcional)"
              className="w-full rounded-md bg-neutral-900 border border-neutral-700 px-4 py-3 text-sm"
            />
            <button
              type="submit"
              className="w-full rounded-md py-3 font-semibold text-white transition hover:brightness-110"
              style={{ background: "var(--blazon-red)" }}
            >
              Entrar como dev
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
