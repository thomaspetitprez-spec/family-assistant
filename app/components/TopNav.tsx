"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/family", label: "Family" },
];

export default function TopNav() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setIsLoggedIn(Boolean(data.user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-stone-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="shrink-0 text-base font-bold text-stone-950 sm:text-lg"
        >
          Family Assistant
        </Link>

        <div className="flex min-w-0 items-center gap-2">
          <div className="flex min-w-0 gap-1 overflow-x-auto rounded-full bg-stone-100 p-1">
            {links.map((link) => {
              const isActive = pathname === link.href;

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold transition sm:px-4 ${
                    isActive
                      ? "bg-stone-950 text-white shadow-sm"
                      : "text-stone-700 hover:bg-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {isLoggedIn ? (
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="whitespace-nowrap rounded-full border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Log out
              </button>
            </form>
          ) : (
            pathname !== "/login" && (
              <Link
                href="/login"
                className="whitespace-nowrap rounded-full border border-stone-300 px-3 py-1.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
              >
                Log in
              </Link>
            )
          )}
        </div>
      </nav>
    </header>
  );
}
