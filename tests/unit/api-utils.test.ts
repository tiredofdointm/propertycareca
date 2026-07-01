import { describe, expect, it } from "vitest";
import { z } from "zod";
import { parseIdParam, readJsonBody, zodFieldErrors } from "@/lib/api-utils";

describe("zodFieldErrors", () => {
  it("keeps the first error message per field", () => {
    const schema = z.object({
      email: z.string().email(),
      name: z.string().min(2),
    });
    const result = schema.safeParse({ email: "not-an-email", name: "a" });
    expect(result.success).toBe(false);
    if (result.success) return;

    const fieldErrors = zodFieldErrors(result.error);
    expect(Object.keys(fieldErrors).sort()).toEqual(["email", "name"]);
    expect(typeof fieldErrors.email).toBe("string");
    expect(typeof fieldErrors.name).toBe("string");
  });
});

describe("parseIdParam", () => {
  it("accepts a positive integer string", () => {
    expect(parseIdParam("42")).toBe(42);
  });

  it("rejects zero, negative, decimal, and non-numeric ids", () => {
    expect(parseIdParam("0")).toBeNull();
    expect(parseIdParam("-1")).toBeNull();
    expect(parseIdParam("1.5")).toBeNull();
    expect(parseIdParam("abc")).toBeNull();
  });
});

describe("readJsonBody", () => {
  it("returns the parsed body on success", async () => {
    const request = new Request("http://localhost/api/x", {
      method: "POST",
      body: JSON.stringify({ hello: "world" }),
    });
    const result = await readJsonBody<{ hello: string }>(request);
    expect(result).toEqual({ ok: true, data: { hello: "world" } });
  });

  it("returns ok:false on invalid JSON", async () => {
    const request = new Request("http://localhost/api/x", {
      method: "POST",
      body: "{not json",
    });
    const result = await readJsonBody(request);
    expect(result).toEqual({ ok: false });
  });
});
