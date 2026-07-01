import { describe, expect, it, beforeAll } from "vitest";
import { createSessionToken, verifySessionToken } from "@/lib/auth";

beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET = "test-secret-not-for-production";
});

describe("session token", () => {
  it("round-trips a valid token", async () => {
    const token = await createSessionToken("admin@propertycare.ca");
    const session = await verifySessionToken(token);
    expect(session?.sub).toBe("admin@propertycare.ca");
  });

  it("rejects an undefined token", async () => {
    expect(await verifySessionToken(undefined)).toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = await createSessionToken("admin@propertycare.ca");
    const [payload, signature] = token.split(".");
    const tampered = `${payload}x.${signature}`;
    expect(await verifySessionToken(tampered)).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken("admin@propertycare.ca");
    process.env.ADMIN_SESSION_SECRET = "a-different-secret";
    expect(await verifySessionToken(token)).toBeNull();
    process.env.ADMIN_SESSION_SECRET = "test-secret-not-for-production";
  });

  it("rejects an expired token", async () => {
    const expiredPayload = { sub: "admin@propertycare.ca", exp: 1 };
    const encoder = new TextEncoder();
    const payloadPart = btoa(
      String.fromCharCode(...encoder.encode(JSON.stringify(expiredPayload)))
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode("test-secret-not-for-production"),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(payloadPart)
    );
    const signaturePart = btoa(
      String.fromCharCode(...new Uint8Array(signature))
    )
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

    expect(await verifySessionToken(`${payloadPart}.${signaturePart}`)).toBeNull();
  });
});
