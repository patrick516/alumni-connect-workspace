import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

const raw = import.meta.env.VITE_API_BASE_URL?.trim();
/** If VITE_API_BASE_URL is set → http://host:5000/api ; else same-origin /api (Vite proxy). */
export const api = axios.create({
  baseURL: raw ? `${raw.replace(/\/$/, "")}/api` : "/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const stored = localStorage.getItem("alumniConnectUser");
  if (stored) {
    try {
      const token = JSON.parse(stored).token as string | undefined;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      /* ignore */
    }
  }
  return config;
});

/** Turn failed axios responses into readable Error messages. */
export function getErrorMessage(err: unknown, fallback: string): string {
  const ax = err as AxiosError<{ message?: string }>;
  const msg = ax.response?.data?.message;
  if (typeof msg === "string") return msg;
  if (ax.message) return ax.message;
  return fallback;
}
