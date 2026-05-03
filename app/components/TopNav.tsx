"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/family", label: "School Week Template" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-amber-100 bg-[#fffaf2]/95 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <Link href="/dashboard" className="text-lg font-bold text-stone-950">
          Family Assistant
        </Link>

        <div className="flex flex-wrap gap-2">
          {links.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-stone-950 text-white shadow-sm"
                    : "bg-white text-stone-700 ring-1 ring-amber-100 hover:bg-amber-50"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
