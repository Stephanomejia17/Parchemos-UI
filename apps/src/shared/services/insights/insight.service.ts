import { apiFetch } from "../http/api-client";

export type InsightScope = "restaurante" | "administrador";

export interface Insight {
  id: string;
  scope: InsightScope;
  fecha: string;
  rango: { desde: string; hasta: string };
  restauranteId: string | null;
  contenido: {
    resumen: string;
    hallazgos: { titulo: string; detalle: string; tipo: "positivo" | "alerta" | "neutral" }[];
    recomendaciones: { accion: string; motivo: string; prioridad: "alta" | "media" | "baja" }[];
  };
  modelo: string;
  generadoEn: string;
}

export interface InsightStatus {
  insight: Insight | null;
  /** true si aún se puede pedir el insight de hoy (una solicitud por día). */
  disponible: boolean;
  proximoDisponible: string;
}

interface Envelope<T> { success: boolean; data: T; message: string }

const base = (scope: InsightScope) => (scope === "restaurante" ? "/insights/restaurante" : "/insights/admin");

export const insightService = {
  today: (scope: InsightScope) => apiFetch<Envelope<InsightStatus>>(`${base(scope)}/hoy`),
  generate: (scope: InsightScope, body: { desde: string; hasta: string; restauranteId?: string }) =>
    apiFetch<Envelope<Insight>>(base(scope), { method: "POST", body }),
};
