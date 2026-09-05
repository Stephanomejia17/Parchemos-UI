"use client";

import type { ReactNode } from "react";
import { RequireAuth } from "@/shared/auth";

export function WorkroomShell({ children }: { children: ReactNode }) {
  return <RequireAuth loginPath="/login" allowedRoles={["personal_restaurante"]}>{children}</RequireAuth>;
}
