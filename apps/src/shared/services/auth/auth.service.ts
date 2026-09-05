import { apiFetch } from "../http/api-client";
import type { AuthUser, LoginPayload, RegisterPayload, RegisterResult } from "../../auth/types";

interface SessionResponse {
  user: AuthUser;
  accessToken: string;
  expiresIn: string;
}

export const authService = {
  me: () => apiFetch<{ user: AuthUser }>("/auth/me"),
  login: (payload: LoginPayload) =>
    apiFetch<SessionResponse>("/auth/login", { method: "POST", body: payload }),
  register: (payload: RegisterPayload) =>
    apiFetch<RegisterResult>("/auth/register", { method: "POST", body: payload }),
  logout: () => apiFetch<void>("/auth/logout", { method: "POST" }),
};

export function requestPasswordReset(email: string): Promise<void> {
  return apiFetch<void>("/auth/forgot-password", {
    method: "POST",
    body: { email },
  });
}

export function resetPassword(token: string, password: string): Promise<void> {
  return apiFetch<void>("/auth/reset-password", {
    method: "POST",
    body: { token, password },
  });
}
