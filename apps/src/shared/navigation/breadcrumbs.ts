import type { BreadcrumbItem, NavigationItem } from "./types";

/**
 * Construye la URL canónica de la sección de mesas.
 *
 * Los breadcrumbs y la pantalla de mesas deben usar exactamente la misma
 * forma de navegación; así, volver a un restaurante o a una sede restaura
 * la selección a partir de los parámetros de la URL.
 */
export function tablesHref(restaurantId?: string, locationId?: string): string {
  const params = new URLSearchParams();
  if (restaurantId) params.set("restaurantId", restaurantId);
  if (locationId) params.set("locationId", locationId);
  const query = params.toString();
  return query ? `/tables?${query}` : "/tables";
}

const DETAIL_LABELS: Record<string, string> = {
  menu: "Menú",
  dashboard: "Dashboard",
  "order-summary": "Resumen del pedido",
  payment: "Confirmar pedido",
  restaurant: "Restaurante",
};

export function breadcrumbsForPath(
  pathname: string,
  items: NavigationItem[],
  searchParams?: { get(name: string): string | null },
): BreadcrumbItem[] {
  const active = items.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
  const parts = pathname.split("/").filter(Boolean);
  const detail = parts.find((part) => DETAIL_LABELS[part]);
  const fallback = DETAIL_LABELS[parts[0] ?? ""];
  const result: BreadcrumbItem[] = [
    { label: active?.label ?? (fallback ? "Pedido" : "Parchemos"), href: active?.href },
  ];
  const restaurantId = searchParams?.get("restaurantId");
  const locationId = searchParams?.get("locationId");
  const restaurantName = searchParams?.get("restaurantName");
  const locationName = searchParams?.get("locationName");

  if (restaurantId) {
    result.push({
      label: restaurantName ?? "Restaurante",
      href: tablesHref(restaurantId),
    });
  }
  if (locationId) {
    result.push({
      label: locationName ?? "Sede",
      href: tablesHref(restaurantId ?? undefined, locationId),
    });
  }
  if (detail) result.push({ label: DETAIL_LABELS[detail] });
  return result;
}

export function backHrefForPath(pathname: string, sectionHref?: string, hasNestedView = false) {
  if (
    pathname === "/home" ||
    pathname === "/profile/dashboard" ||
    pathname === "/" ||
    (pathname === sectionHref && !hasNestedView)
  )
    return undefined;
  return sectionHref ?? "/home";
}
