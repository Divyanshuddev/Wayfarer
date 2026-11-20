/**
 * Resolves the backend API base URL safely across both local dev and production (Vercel / Render).
 * Strips trailing slashes and redundant /api/v1 prefixes so calls like `${getApiBaseUrl()}/api/v1/trips`
 * always format cleanly regardless of how NEXT_PUBLIC_API_URL is configured in Vercel.
 */
export function getApiBaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";
  url = url.trim().replace(/\/$/, "");
  if (url.endsWith("/api/v1")) {
    url = url.slice(0, -"/api/v1".length);
  }
  return url;
}
