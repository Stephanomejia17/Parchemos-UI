import type { BreadcrumbItem, NavigationItem } from "./types";

const DETAIL_LABELS: Record<string, string> = {
  menu: "Menú",
  dashboard: "Dashboard",
  "order-summary": "Resumen del pedido",
  restaurant: "Restaurante",
};

export function breadcrumbsForPath(pathname: string, items: NavigationItem[]): BreadcrumbItem[] {
  const active = items.find(item => pathname === item.href || pathname.startsWith(`${item.href}/`));
  const parts = pathname.split("/").filter(Boolean);
  const detail = parts.find(part => DETAIL_LABELS[part]);
  const result: BreadcrumbItem[] = [{ label: active?.label ?? "Parchemos", href: active?.href }];
  if (detail) result.push({ label: DETAIL_LABELS[detail] });
  return result;
}

export function backHrefForPath(pathname: string, sectionHref?: string) {
  if (pathname === "/home" || pathname === "/profile/dashboard" || pathname === "/") return undefined;
  return pathname === sectionHref ? "/home" : sectionHref ?? "/home";
}
