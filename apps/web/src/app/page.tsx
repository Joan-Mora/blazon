import Link from "next/link";

export default function BlazonLanding() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero — brand first */}
      <section
        className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24 relative overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(225,29,46,0.28), transparent), radial-gradient(ellipse 60% 40% at 80% 110%, rgba(245,197,66,0.12), transparent), var(--blazon-bg)",
        }}
      >
        <p className="text-sm tracking-[0.4em] uppercase text-[var(--blazon-gold)] mb-6">
          Org OS · Esports
        </p>
        <h1
          className="text-7xl sm:text-8xl md:text-9xl font-black tracking-tight mb-6"
          style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
        >
          BLAZON
        </h1>
        <p className="max-w-xl text-lg text-neutral-300 mb-10">
          Build your crest. Run your circuit. Grow your fans. La plataforma que
          unifica el sitio de tu organización, torneos, reclutamiento y
          comunidad.
        </p>
        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            href="/login"
            className="px-8 py-3 rounded-md font-bold text-white transition hover:brightness-110"
            style={{ background: "var(--blazon-red)" }}
          >
            Entrar
          </Link>
          <Link
            href="/o/ld"
            className="px-8 py-3 rounded-md font-bold border-2 transition hover:bg-[var(--blazon-gold)] hover:text-black"
            style={{ borderColor: "var(--blazon-gold)", color: "var(--blazon-gold)" }}
          >
            Ver demo: Lengüetazo Divino
          </Link>
        </div>
      </section>

      <footer className="py-6 text-center text-sm text-neutral-500">
        Blazon — the operating system for competitive esports organizations
      </footer>
    </main>
  );
}
