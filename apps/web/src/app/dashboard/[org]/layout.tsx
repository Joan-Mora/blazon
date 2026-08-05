import Link from "next/link";

const NAV = [
  { slug: "", label: "Resumen" },
  { slug: "theme", label: "Tema" },
  { slug: "pages", label: "Páginas" },
  { slug: "tournaments", label: "Torneos" },
  { slug: "members", label: "Miembros" },
  { slug: "billing", label: "Suscripción" },
];

export default async function OrgAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org } = await params;

  return (
    <div>
      <nav className="flex gap-1 mb-10 border-b border-neutral-800 overflow-x-auto">
        {NAV.map((item) => (
          <Link
            key={item.slug}
            href={`/dashboard/${org}${item.slug ? `/${item.slug}` : ""}`}
            className="px-4 py-3 text-sm font-semibold text-neutral-400 hover:text-white transition whitespace-nowrap"
          >
            {item.label}
          </Link>
        ))}
        <div className="flex-1" />
        <Link
          href={`/o/${org}`}
          className="px-4 py-3 text-sm font-semibold text-neutral-400 hover:text-white transition whitespace-nowrap"
          target="_blank"
        >
          Ver sitio ↗
        </Link>
      </nav>
      {children}
    </div>
  );
}
