"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { tokenStore, tryRefresh } from "../services/http/api-client";
import { authService } from "../services/auth";
import type { AuthUser, LoginPayload, RegisterPayload, RegisterResult } from "./types";

type SessionStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  user: AuthUser | null;
  status: SessionStatus;
  login: (payload: LoginPayload) => Promise<AuthUser>;
  register: (payload: RegisterPayload) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<SessionStatus>("loading");

  // Al cargar la app se intenta reconstruir la sesion con la cookie httpOnly.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const renewed = await tryRefresh();
      if (cancelled) return;
      if (!renewed) {
        setUser(null);
        setStatus("anonymous");
        return;
      }
      try {
        const data = await authService.me();
        if (cancelled) return;
        setUser(data.user);
        setStatus("authenticated");
      } catch {
        if (cancelled) return;
        setUser(null);
        setStatus("anonymous");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const data = await authService.login(payload);
    tokenStore.set(data.accessToken);
    setUser(data.user);
    setStatus("authenticated");
    return data.user;
  }, []);

  // GU-01: el registro no inicia sesion; devuelve al login.
  const register = useCallback(
    (payload: RegisterPayload) => authService.register(payload),
    [],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      // Aunque la llamada falle, la sesion local se descarta igual.
      tokenStore.set(null);
      setUser(null);
      setStatus("anonymous");
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const data = await authService.me();
    setUser(data.user);
  }, []);

  const value = useMemo(
    () => ({ user, status, login, register, logout, refreshUser }),
    [user, status, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de <AuthProvider>.");
  }
  return context;
}
