import type { NavigationItem } from "./types";

/**
 * Item del menú que corresponde a la ruta. Gana el href más específico:
 * `/feed/new` pertenece a "Publicar" aunque `/feed` ("Para ti") también sea
 * prefijo suyo.
 */
export function findActiveItem(
  pathname: string,
  items: NavigationItem[],
): NavigationItem | undefined {
  return items
    .filter((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    .sort((a, b) => b.href.length - a.href.length)[0];
}
