import type { BreadcrumbItem, NavigationItem } from "./types";

const DETAIL_LABELS: Record<string, string> = {
  menu: "Menú",
  dashboard: "Dashboard",
  "order-summary": "Resumen del pedido",
  payment: "Confirmar pedido",
  restaurant: "Restaurante",
};

export function breadcrumbsForPath(pathname: string, items: NavigationItem[], searchParams?: { get(name: string): string | null }): BreadcrumbItem[] {
  const active = items.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const parts = pathname.split("/").filter(Boolean);
  const detail = parts.find((part) => DETAIL_LABELS[part]);
  const fallback = DETAIL_LABELS[parts[0] ?? ""];
  const result: BreadcrumbItem[] = [{ label: active?.label ?? (fallback ? "Pedido" : "Parchemos"), href: active?.href }];
  const restaurantName = searchParams?.get("restaurantName");
  const locationName = searchParams?.get("locationName");
  if (restaurantName) result.push({ label: restaurantName, href: `/tables?restaurantId=${encodeURIComponent(searchParams?.get("restaurantId") ?? "")}&restaurantName=${encodeURIComponent(restaurantName)}` });
  if (locationName) result.push({ label: locationName, href: `/tables?restaurantId=${encodeURIComponent(searchParams?.get("restaurantId") ?? "")}&restaurantName=${encodeURIComponent(restaurantName ?? "")}` });
  if (detail) result.push({ label: DETAIL_LABELS[detail] });
  return result;
}

export function backHrefForPath(pathname: string, sectionHref?: string, hasNestedView = false) {
  if (pathname === "/home" || pathname === "/profile/dashboard" || pathname === "/" || (pathname === sectionHref && !hasNestedView))
    return undefined;
  return sectionHref ?? "/home";
}
