"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "signup";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const supabase = createClient();
    const authResponse =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setIsSubmitting(false);

    if (authResponse.error) {
      setMessage(authResponse.error.message);
      return;
    }

    if (mode === "signup" && !authResponse.data.session) {
      setMessage("Check your email to confirm your account, then log in.");
      return;
    }

    const requestedNextPath = searchParams.get("next");
    const nextPath =
      requestedNextPath?.startsWith("/") && !requestedNextPath.startsWith("//")
        ? requestedNextPath
        : "/dashboard";

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-stone-100 px-4 py-10 text-stone-950">
      <section className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase text-stone-500">
            Family Assistant
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {mode === "login" ? "Log in" : "Create account"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Use email and password to access your saved family workspace.
          </p>
        </div>

        <div className="mt-6 grid grid-cols-2 rounded-xl bg-stone-100 p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setMessage(null);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === "login"
                ? "bg-white text-stone-950 shadow-sm"
                : "text-stone-600 hover:text-stone-950"
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setMessage(null);
            }}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === "signup"
                ? "bg-white text-stone-950 shadow-sm"
                : "text-stone-600 hover:text-stone-950"
            }`}
          >
            Sign up
          </button>
        </div>

        <form className="mt-6 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-sm font-semibold text-stone-700">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
              className="rounded-lg border border-stone-300 px-3 py-2 text-base font-normal text-stone-950 outline-none transition focus:border-stone-950 focus:ring-2 focus:ring-stone-200"
            />
          </label>

          <label className="grid gap-2 text-sm font-semibold text-stone-700">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={
                mode === "login" ? "current-password" : "new-password"
              }
              required
              minLength={6}
              className="rounded-lg border border-stone-300 px-3 py-2 text-base font-normal text-stone-950 outline-none transition focus:border-stone-950 focus:ring-2 focus:ring-stone-200"
            />
          </label>

          {message && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-medium text-amber-900">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {isSubmitting
              ? "Please wait"
              : mode === "login"
                ? "Log in"
                : "Sign up"}
          </button>
        </form>
      </section>
    </main>
  );
}
