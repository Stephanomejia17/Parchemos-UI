"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { RequireAuth } from "@parchemos/shared/auth";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

/**
 * Marco de la consola.
 *
 * El login se pinta sin barra lateral ni cabecera; todo lo demás exige sesión
 * con rol `administrador` (GU-02 Esc. 1 y 6).
 */
export function ConsoleShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  if (pathname === "/login") {
    return <>{children}</>;
  }

  return (
    <RequireAuth loginPath="/login" allowedRoles={["administrador"]}>
      <div className="flex" style={{ height: "100vh" }}>
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Header />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </RequireAuth>
  );
}
