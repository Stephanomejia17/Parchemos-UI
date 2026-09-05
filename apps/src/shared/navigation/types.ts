import type { LucideIcon } from "lucide-react";

export type NavigationItem = {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};
