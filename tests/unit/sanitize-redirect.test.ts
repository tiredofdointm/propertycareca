import { describe, expect, it } from "vitest";
import { sanitizeRedirect } from "@/lib/sanitize-redirect";

describe("sanitizeRedirect", () => {
  it("allows a same-origin relative path", () => {
    expect(sanitizeRedirect("/admin/bookings")).toBe("/admin/bookings");
  });

  it("falls back to the dashboard when null", () => {
    expect(sanitizeRedirect(null)).toBe("/admin/leads");
  });

  it("rejects an absolute external URL", () => {
    expect(sanitizeRedirect("https://evil.example.com")).toBe("/admin/leads");
  });

  it("rejects a protocol-relative URL", () => {
    expect(sanitizeRedirect("//evil.example.com")).toBe("/admin/leads");
  });

  it("rejects a backslash-prefixed path some browsers treat as protocol-relative", () => {
    expect(sanitizeRedirect("/\\evil.example.com")).toBe("/admin/leads");
  });

  it("rejects a path with no leading slash", () => {
    expect(sanitizeRedirect("admin/leads")).toBe("/admin/leads");
  });
});
