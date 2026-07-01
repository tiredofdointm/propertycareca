/** Only allow same-origin relative paths, never an absolute/external URL. */
export function sanitizeRedirect(path: string | null): string {
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) {
    return "/admin/leads";
  }
  return path;
}
