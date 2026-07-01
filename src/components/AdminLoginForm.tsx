"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { sanitizeRedirect } from "@/lib/sanitize-redirect";

const googleErrorMessages: Record<string, string> = {
  "google-not-configured":
    "Google sign-in isn't set up yet. See docs/google-login-setup.md.",
  "google-failed": "Google sign-in failed. Please try again.",
  "google-not-allowed":
    "That Google account isn't authorized for this dashboard.",
};

export function AdminLoginForm({
  googleEnabled = false,
}: {
  googleEnabled?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = sanitizeRedirect(searchParams.get("from"));
  const googleError = googleErrorMessages[searchParams.get("error") ?? ""];

  const [status, setStatus] = useState<"idle" | "submitting" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    const formData = new FormData(event.currentTarget);
    const payload = {
      email: formData.get("email"),
      password: formData.get("password"),
    };

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        router.push(redirectTo);
        router.refresh();
        return;
      }

      const body = await response.json().catch(() => null);
      setError(body?.error ?? "Invalid email or password");
      setStatus("error");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      {googleEnabled ? (
        <div>
          <a
            href={`/api/admin/auth/google?from=${encodeURIComponent(redirectTo)}`}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-black/15 bg-surface px-6 py-3 text-sm font-semibold text-foreground/80 transition-colors hover:bg-background"
          >
            <svg aria-hidden viewBox="0 0 24 24" className="h-4 w-4">
              <path
                fill="#4285F4"
                d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l3.7 2.8c2.3-2 3.7-5 3.7-8.8z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.7-2.8c-1 .7-2.4 1.2-4.2 1.2-3.2 0-5.9-2.1-6.9-5L1.3 17.4C3.3 21.4 7.3 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.1 14.5c-.3-.8-.4-1.6-.4-2.5s.2-1.7.4-2.5L1.3 6.6C.5 8.3 0 10.1 0 12s.5 3.7 1.3 5.4l3.8-2.9z"
              />
              <path
                fill="#EA4335"
                d="M12 4.6c1.8 0 3 .8 3.7 1.4L19 2.8C17.9 1.1 15.2 0 12 0 7.3 0 3.3 2.6 1.3 6.6l3.8 2.9c1-2.9 3.7-4.9 6.9-4.9z"
              />
            </svg>
            Sign in with Google
          </a>
          {googleError ? (
            <p role="alert" className="mt-2 text-sm font-medium text-red-600">
              {googleError}
            </p>
          ) : null}
          <div className="mt-6 flex items-center gap-3 text-xs uppercase text-foreground/40">
            <span className="h-px flex-1 bg-black/10" />
            or with email
            <span className="h-px flex-1 bg-black/10" />
          </div>
        </div>
      ) : null}
      <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-foreground/80">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-foreground/80">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="mt-1 w-full rounded-lg border border-black/10 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-brand/30"
        />
      </div>
      {error ? (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Signing in..." : "Sign in"}
      </button>
      </form>
    </div>
  );
}
