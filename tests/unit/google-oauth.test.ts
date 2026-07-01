import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  allowedAdminEmails,
  buildGoogleAuthUrl,
  isGoogleLoginConfigured,
} from "@/lib/google-oauth";

describe("google-oauth helpers", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  it("is not configured without both client id and secret", () => {
    expect(isGoogleLoginConfigured()).toBe(false);
    vi.stubEnv("GOOGLE_OAUTH_CLIENT_ID", "id.apps.googleusercontent.com");
    expect(isGoogleLoginConfigured()).toBe(false);
    vi.stubEnv("GOOGLE_OAUTH_CLIENT_SECRET", "GOCSPX-secret");
    expect(isGoogleLoginConfigured()).toBe(true);
  });

  it("allowlists ADMIN_EMAIL plus GOOGLE_ADMIN_EMAILS, normalized", () => {
    vi.stubEnv("ADMIN_EMAIL", "Admin@PropertyCareCA.com ");
    vi.stubEnv(
      "GOOGLE_ADMIN_EMAILS",
      "tiredofdointm@gmail.com, Partner@Example.com ,,"
    );
    expect(allowedAdminEmails()).toEqual([
      "admin@propertycareca.com",
      "tiredofdointm@gmail.com",
      "partner@example.com",
    ]);
  });

  it("builds an auth URL with the expected parameters", () => {
    vi.stubEnv("GOOGLE_OAUTH_CLIENT_ID", "client-123");
    const url = new URL(
      buildGoogleAuthUrl(
        "https://propertycareca.com/api/admin/auth/google/callback",
        "nonce-abc"
      )
    );
    expect(url.origin).toBe("https://accounts.google.com");
    expect(url.searchParams.get("client_id")).toBe("client-123");
    expect(url.searchParams.get("state")).toBe("nonce-abc");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://propertycareca.com/api/admin/auth/google/callback"
    );
    expect(url.searchParams.get("scope")).toBe("openid email profile");
    expect(url.searchParams.get("response_type")).toBe("code");
  });
});
