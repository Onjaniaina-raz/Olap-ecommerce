import type { Metadata } from "next";
import "./globals.css";
import CubeClientProvider from "@/components/CubeProvider";
import NavLink from "@/components/NavLink";

export const metadata: Metadata = {
  title: "OLAP Dashboard",
  description: "E-commerce Analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-gray-50">
        <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-2">
          <span className="text-sm font-bold text-gray-800 mr-4">OLAP</span>
          <NavLink href="/" label="Dashboard" />
          <NavLink href="/explore" label="Exploration OLAP" />
        </nav>
        <CubeClientProvider>{children}</CubeClientProvider>
      </body>
    </html>
  );
}
