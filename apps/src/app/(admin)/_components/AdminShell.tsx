"use client";

import type { ReactNode } from "react";
import { RequireAuth } from "@/shared/auth";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export function AdminShell({ children }: { children: ReactNode }) {
  return <RequireAuth loginPath="/login" allowedRoles={["administrador"]}><div className="flex h-screen"><AdminSidebar /><div className="flex min-w-0 flex-1 flex-col overflow-hidden"><AdminHeader /><main className="flex-1 overflow-y-auto p-6">{children}</main></div></div></RequireAuth>;
}
