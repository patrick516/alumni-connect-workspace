/**
 * Base URL for Socket.IO (no path). Matches API host from VITE_API_BASE_URL,
 * or falls back to the current page origin (works with Vite proxy for /socket.io).
 */
export function getSocketBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "";
}
