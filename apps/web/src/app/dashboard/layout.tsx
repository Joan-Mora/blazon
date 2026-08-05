import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/session";
import { logoutAction } from "@/app/actions";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionUser();
  if (!session) redirect("/login");

  return (
    <div className="min-h-screen">
      <header className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="text-lg font-black tracking-tight"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            BLAZON
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-neutral-400">{session.name}</span>
            <form action={logoutAction}>
              <button className="text-neutral-500 hover:text-white transition">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-10">{children}</div>
    </div>
  );
}
