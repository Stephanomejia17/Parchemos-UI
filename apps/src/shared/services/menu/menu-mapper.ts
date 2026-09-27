import type { Category, Product } from "./menu.service";
import type { MenuItem, MenuSection } from "../../types/menu";

const CATEGORY_LABELS: Record<Category, string> = {
  entradas: "Entradas",
  platos_fuertes: "Platos Fuertes",
  postres: "Postres",
  bebidas: "Bebidas",
};

const CATEGORY_ORDER: Category[] = ["entradas", "platos_fuertes", "postres", "bebidas"];

export function mapProductToMenuItem(product: Product): MenuItem {
  return {
    id: product.id,
    name: product.name,
    description: product.description ?? "",
    price: product.price,
    imageUrl: product.imageUrl,
    // TODO(producto): el backend no distingue "destacado" de "recomendado".
    // Reusamos `featured` para ambos usos en la UI. Si el negocio necesita
    // que diverjan, hay que pedir un campo nuevo en Product (p. ej.
    // `recommended: boolean`) — no hay forma honesta de derivarlo hoy.
    featured: product.featured,
    available: product.status === "activo",
  };
}

export function groupProductsIntoSections(products: Product[]): MenuSection[] {
  const byCategory = new Map<Category, MenuItem[]>();
  for (const product of products) {
    const list = byCategory.get(product.category) ?? [];
    list.push(mapProductToMenuItem(product));
    byCategory.set(product.category, list);
  }
  return CATEGORY_ORDER.filter((c) => byCategory.has(c)).map((c) => ({
    title: CATEGORY_LABELS[c],
    items: byCategory.get(c)!,
  }));
}

export function getRecommendedItems(products: Product[]): MenuItem[] {
  // Ranking inicial para comensales: productos disponibles, priorizando los
  // destacados configurados por el restaurante. La marca de destacado sigue
  // siendo independiente y se muestra en cada tarjeta del menú.
  return products
    .filter((product) => product.status === "activo")
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, 6)
    .map(mapProductToMenuItem);
}
