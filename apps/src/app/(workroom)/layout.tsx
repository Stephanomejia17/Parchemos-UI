import type { ReactNode } from "react";
import { WorkroomShell } from "./_components/WorkroomShell";

/**
 * Skeleton del rol workroom (sala) — mapea a UserRole "personal_restaurante".
 * Sin contenido funcional todavía; roleHomePath sigue enviando a este rol a
 * /profile/dashboard hasta que exista una home propia de workroom.
 */
export default function WorkroomLayout({ children }: { children: ReactNode }) {
  return <WorkroomShell>{children}</WorkroomShell>;
}
