import { apiFetch } from "../http/api-client";
import type { Location } from "../../types/restaurant";

/** Sede del listado de destacados o de "Mis favoritos" (DO-02 / DO-05). */
export type FeaturedLocation = Location & {
  /** Calificación promedio >= `umbral` (4.5). */
  destacado: boolean;
  esFavorito: boolean;
};

export interface FeaturedList {
  umbral: number;
  /** `false` cuando ninguna sede llega al umbral y se muestra el listado alterno (CA2). */
  hayDestacados: boolean;
  items: FeaturedLocation[];
}

export const favoriteService = {
  /** Abierto a visitantes; con sesión marca los favoritos propios. */
  listFeatured: (params?: { limit?: number; signal?: AbortSignal }) =>
    apiFetch<FeaturedList>(
      `/restaurantes/destacados${params?.limit ? `?limit=${params.limit}` : ""}`,
      { signal: params?.signal },
    ),

  /** "Mis favoritos", lo último guardado primero. */
  list: (signal?: AbortSignal) => apiFetch<{ items: FeaturedLocation[] }>("/favoritos", { signal }),

  /** Idempotente: repetirlo no duplica. */
  add: (locationId: string) =>
    apiFetch<{ locationId: string; esFavorito: boolean }>("/favoritos", {
      method: "POST",
      body: { locationId },
    }),

  /** Idempotente: si ya no estaba, no falla. */
  remove: (locationId: string) => apiFetch<void>(`/favoritos/${locationId}`, { method: "DELETE" }),
};
