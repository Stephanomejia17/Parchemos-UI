"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-context";
import type { UserRole } from "./types";

interface RequireAuthProps {
  children: ReactNode;
  /** A donde mandar a quien no tiene sesion. */
  loginPath: string;
  /** Roles admitidos en esta zona; vacio = cualquiera autenticado. */
  allowedRoles?: UserRole[];
  fallback?: ReactNode;
}

/**
 * Puerta de las zonas privadas.
 *
 * GU-02 Esc. 6: si no hay sesion valida se redirige al login, incluso cuando
 * se llega con el boton "atras" del navegador (el estado vive en memoria, asi
 * que volver atras no resucita la sesion).
 */
export function RequireAuth({ children, loginPath, allowedRoles, fallback }: RequireAuthProps) {
  const { status, user } = useAuth();
  const router = useRouter();

  const roleAllowed = !allowedRoles?.length || (user !== null && allowedRoles.includes(user.role));

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(loginPath);
      return;
    }
    if (status === "authenticated" && !roleAllowed) {
      router.replace(loginPath);
    }
  }, [status, roleAllowed, router, loginPath]);

  if (status === "loading") {
    return <>{fallback ?? <SessionLoading />}</>;
  }

  if (status === "anonymous" || !roleAllowed) {
    // Nada se pinta mientras el router redirige: asi el contenido privado
    // no llega ni por un instante a una pantalla sin sesion.
    return <>{fallback ?? <SessionLoading />}</>;
  }

  return <>{children}</>;
}

function SessionLoading() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF6B35]" />
        <p className="text-sm text-gray-500">Verificando tu sesion...</p>
      </div>
    </div>
  );
}
