import type { Metadata } from "next";
import { Poppins, Montserrat } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Blazon — Org OS for esports organizations",
  description:
    "Build your crest. Run your circuit. Grow your fans. Blazon unifies your org site, tournaments, recruitment and fans in one platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${poppins.variable} ${montserrat.variable} antialiased`}
        style={{ fontFamily: "var(--font-poppins), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
