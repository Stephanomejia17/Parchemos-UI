import { apiFetch, apiUpload } from "../http/api-client";
import type { RestaurantSummary } from "../../types/restaurant";

export type Category = "entradas" | "platos_fuertes" | "postres" | "bebidas";
export type Status = "activo" | "inactivo";

export interface Product {
  id: string;
  restaurantId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  category: Category;
  price: number;
  status: Status;
  featured: boolean;
}

export interface ProductPageResponse {
  success: boolean;
  data: { items: Product[]; pagination: { total: number } };
  message: string;
}

export interface ProductResponse {
  success: boolean;
  data: Product;
  message: string;
}

export interface ProductFilters {
  category?: string;
  status?: string;
}

export interface ProductInput {
  name: string;
  description?: string;
  category: Category;
  price: number;
  status: Status;
}

export const menuService = {
  listMyRestaurants: () => apiFetch<RestaurantSummary[]>("/restaurantes/mios"),

  listProducts: (restaurantId: string, filters: ProductFilters = {}) => {
    const params = new URLSearchParams({ page: "1", limit: "100" });
    if (filters.category) params.set("category", filters.category);
    if (filters.status) params.set("status", filters.status);
    return apiFetch<ProductPageResponse>(`/restaurantes/${restaurantId}/productos?${params}`);
  },

  createProduct: (restaurantId: string, body: ProductInput) =>
    apiFetch<ProductResponse>(`/restaurantes/${restaurantId}/productos`, {
      method: "POST",
      body,
    }),

  updateProduct: (productId: string, body: ProductInput) =>
    apiFetch<ProductResponse>(`/productos/${productId}`, { method: "PATCH", body }),

  uploadProductImage: (productId: string, image: File) => {
    const formData = new FormData();
    formData.append("file", image);
    return apiUpload<ProductResponse>(`/productos/${productId}/imagen`, formData);
  },

  setFeatured: (productId: string, featured: boolean) =>
    apiFetch<ProductResponse>(`/productos/${productId}/destacado`, {
      method: "PATCH",
      body: { featured },
    }),

  activateProduct: (productId: string) =>
    apiFetch<ProductResponse>(`/productos/${productId}`, {
      method: "PATCH",
      body: { status: "activo" },
    }),

  deactivateProduct: (productId: string) =>
    apiFetch<ProductResponse>(`/productos/${productId}`, { method: "DELETE" }),
};
