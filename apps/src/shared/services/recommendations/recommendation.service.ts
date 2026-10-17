import { apiFetch } from "../http/api-client";
import type { Location } from "../../types/restaurant";

export type RecommendedLocation = Location & {
  /** Por qué se sugiere: cocina preferida, pedido previo, popularidad... */
  motivo?: string | null;
};

export interface RecommendationList {
  /** `false` cuando no hay gustos ni historial y se muestran las mejor calificadas (PU-03 E2). */
  personalizado: boolean;
  /** `false` si no hay gustos registrados: el front invita a completarlos (PARCHE-350). */
  tienePreferencias: boolean;
  items: RecommendedLocation[];
}

export const recommendationService = {
  list: (signal?: AbortSignal) => apiFetch<RecommendationList>("/recomendaciones", { signal }),
};
