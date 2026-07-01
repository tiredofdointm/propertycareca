import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  GOOGLE_OAUTH_STATE_COOKIE,
  buildGoogleAuthUrl,
  isGoogleLoginConfigured,
} from "@/lib/google-oauth";
import { sanitizeRedirect } from "@/lib/sanitize-redirect";

function callbackUrl(request: NextRequest): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;
  return `${base.replace(/\/$/, "")}/api/admin/auth/google/callback`;
}

export async function GET(request: NextRequest) {
  if (!isGoogleLoginConfigured()) {
    return NextResponse.redirect(
      new URL("/admin/login?error=google-not-configured", request.url)
    );
  }

  const nonce = crypto.randomBytes(16).toString("hex");
  const from = sanitizeRedirect(request.nextUrl.searchParams.get("from"));

  const response = NextResponse.redirect(
    buildGoogleAuthUrl(callbackUrl(request), nonce)
  );
  // The callback verifies Google echoed back the same nonce this browser
  // started with (CSRF protection) and uses `from` to finish the redirect.
  response.cookies.set(
    GOOGLE_OAUTH_STATE_COOKIE,
    JSON.stringify({ nonce, from }),
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/admin/auth/google",
      maxAge: 60 * 10,
    }
  );
  return response;
}
