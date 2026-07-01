/**
 * Minimal Google OAuth 2.0 (OpenID Connect) helpers for admin sign-in.
 *
 * The flow: /api/admin/auth/google redirects to Google's consent screen;
 * Google redirects back to /api/admin/auth/google/callback with a code; we
 * exchange the code for an id_token straight from Google's token endpoint
 * (server-to-server over TLS, so its claims are trustworthy after checking
 * the audience) and sign in the admin if the Google email is allowlisted.
 *
 * Setup steps live in docs/google-login-setup.md.
 */

export const GOOGLE_OAUTH_STATE_COOKIE = "pc_google_oauth_state";

const AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

export function isGoogleLoginConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET
  );
}

/** Emails allowed into the admin: ADMIN_EMAIL plus GOOGLE_ADMIN_EMAILS (comma-separated). */
export function allowedAdminEmails(): string[] {
  const emails = [
    process.env.ADMIN_EMAIL ?? "",
    ...(process.env.GOOGLE_ADMIN_EMAILS ?? "").split(","),
  ];
  return emails
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

export function buildGoogleAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_OAUTH_CLIENT_ID ?? "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state,
    prompt: "select_account",
  });
  return `${AUTH_ENDPOINT}?${params.toString()}`;
}

type GoogleIdTokenClaims = {
  aud?: string;
  email?: string;
  email_verified?: boolean;
};

function decodeIdTokenClaims(idToken: string): GoogleIdTokenClaims | null {
  const parts = idToken.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

/**
 * Exchanges an authorization code for the user's verified Google email.
 * Returns null when the exchange fails or the token isn't for this app.
 */
export async function exchangeCodeForEmail(
  code: string,
  redirectUri: string
): Promise<string | null> {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  if (!response.ok) return null;

  const body = (await response.json().catch(() => null)) as {
    id_token?: string;
  } | null;
  if (!body?.id_token) return null;

  const claims = decodeIdTokenClaims(body.id_token);
  if (!claims || claims.aud !== clientId) return null;
  if (!claims.email || claims.email_verified !== true) return null;
  return claims.email.toLowerCase();
}
