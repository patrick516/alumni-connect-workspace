import type { AuthUser } from "../types";
import { api, getErrorMessage } from "./client";

export async function getBootstrapApi(): Promise<{
  allowFirstAdminRegister: boolean;
}> {
  const { data } = await api.get<{ allowFirstAdminRegister: boolean }>(
    "/bootstrap",
  );
  return data;
}

export async function forgotPasswordApi(email: string): Promise<void> {
  await api.post("/forgot-password", { email });
}

export async function resetPasswordApi(
  token: string,
  newPassword: string,
): Promise<void> {
  await api.post("/reset-password", { token, newPassword });
}

export function getToken(): string {
  const stored = localStorage.getItem("alumniConnectUser");
  if (!stored) return "";
  try {
    return JSON.parse(stored).token || "";
  } catch {
    return "";
  }
}

/** @deprecated Prefer `api` defaults — kept for any code still importing authHeaders */
export const authHeaders = () => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

export async function loginApi(
  email: string,
  password: string,
): Promise<AuthUser> {
  try {
    const { data } = await api.post<{
      user: AuthUser;
      token: string;
    }>("/login", { email, password });
    return { ...data.user, token: data.token };
  } catch (e) {
    throw new Error(getErrorMessage(e, "Login failed"));
  }
}

export async function registerApi(
  data: Record<string, string>,
): Promise<AuthUser> {
  try {
    const { data: body } = await api.post<{
      user: AuthUser;
      token: string;
    }>("/register", data);
    if (!body.user || !body.token) {
      throw new Error("Registration did not return a session");
    }
    return { ...body.user, token: body.token };
  } catch (e) {
    throw new Error(getErrorMessage(e, "Registration failed"));
  }
}
