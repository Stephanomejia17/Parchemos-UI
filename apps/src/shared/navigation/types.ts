import type { LucideIcon } from "lucide-react";

export type NavigationItem = {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  /** Contador opcional mostrado junto al item (ej. pendientes de moderación). */
  badge?: string;
  /** Acción principal: en móvil se dibuja como botón central destacado (p. ej. publicar). */
  featured?: boolean;
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};
