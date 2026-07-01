import type { z } from "zod";

/** Flattens a ZodError into a single first-message-per-field record for form UIs. */
export function zodFieldErrors(error: z.ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (key && !(key in fieldErrors)) {
      fieldErrors[key] = issue.message;
    }
  }
  return fieldErrors;
}

/** Parses a request body as JSON, returning {ok:false} instead of throwing. */
export async function readJsonBody<T = unknown>(
  request: Request
): Promise<{ ok: true; data: T } | { ok: false }> {
  try {
    return { ok: true, data: (await request.json()) as T };
  } catch {
    return { ok: false };
  }
}

/** Parses a route param as a positive integer id, or null if invalid. */
export function parseIdParam(id: string): number | null {
  const value = Number(id);
  return Number.isInteger(value) && value > 0 ? value : null;
}
