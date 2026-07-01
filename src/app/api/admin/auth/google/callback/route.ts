import { NextRequest, NextResponse } from "next/server";
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  allowedAdminEmails,
  exchangeCodeForEmail,
  isGoogleLoginConfigured,
} from "@/lib/google-oauth";
import {
  ADMIN_SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
  createSessionToken,
} from "@/lib/auth";
import { sanitizeRedirect } from "@/lib/sanitize-redirect";

function loginRedirect(request: NextRequest, error: string): NextResponse {
  const response = NextResponse.redirect(
    new URL(`/admin/login?error=${error}`, request.url)
  );
  response.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  if (!isGoogleLoginConfigured()) {
    return loginRedirect(request, "google-not-configured");
  }

  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const stateCookie = request.cookies.get(GOOGLE_OAUTH_STATE_COOKIE)?.value;

  let parsedState: { nonce?: string; from?: string } | null = null;
  try {
    parsedState = stateCookie ? JSON.parse(stateCookie) : null;
  } catch {
    parsedState = null;
  }

  if (!code || !state || !parsedState?.nonce || parsedState.nonce !== state) {
    return loginRedirect(request, "google-failed");
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  const redirectUri = `${base.replace(/\/$/, "")}/api/admin/auth/google/callback`;

  const email = await exchangeCodeForEmail(code, redirectUri);
  if (!email) {
    return loginRedirect(request, "google-failed");
  }

  if (!allowedAdminEmails().includes(email)) {
    return loginRedirect(request, "google-not-allowed");
  }

  const token = await createSessionToken(email);
  const response = NextResponse.redirect(
    new URL(sanitizeRedirect(parsedState.from ?? null), request.url)
  );
  response.cookies.delete(GOOGLE_OAUTH_STATE_COOKIE);
  response.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
