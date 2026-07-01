import { beforeEach, describe, expect, it, vi } from "vitest";

async function importSettings() {
  vi.resetModules();
  return import("@/lib/settings");
}

describe("settings secret encryption", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
    vi.stubEnv("ADMIN_SESSION_SECRET", "a".repeat(64));
    vi.stubEnv("DATABASE_URL", "postgresql://unused:unused@localhost:5432/unused");
  });

  it("round-trips a secret", async () => {
    const { encryptSecret, decryptSecret } = await importSettings();
    const stored = encryptSecret("sk_test_abc123");
    expect(stored).toMatch(/^enc:v1:/);
    expect(stored).not.toContain("sk_test_abc123");
    expect(decryptSecret(stored)).toBe("sk_test_abc123");
  });

  it("produces a different ciphertext every time (fresh IV)", async () => {
    const { encryptSecret } = await importSettings();
    expect(encryptSecret("same-value")).not.toBe(encryptSecret("same-value"));
  });

  it("returns null when the encryption secret has changed", async () => {
    const { encryptSecret } = await importSettings();
    const stored = encryptSecret("sk_test_abc123");

    vi.stubEnv("ADMIN_SESSION_SECRET", "b".repeat(64));
    const { decryptSecret } = await importSettings();
    expect(decryptSecret(stored)).toBeNull();
  });

  it("passes through legacy unencrypted values", async () => {
    const { decryptSecret } = await importSettings();
    expect(decryptSecret("plain-value")).toBe("plain-value");
  });
});
