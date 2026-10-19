import { apiFetch, buildApiUrl, tokenStore, tryRefresh } from "../http/api-client";

export interface StatisticsEnvelope<T> { success: boolean; data: T; message: string }
export interface RestaurantStatistics {
  rango: { desde: string; hasta: string };
  totales: { ingresosBrutos: number; comisionTotal: number; pedidos: number };
  serie: { fecha: string; ingresosBrutos: number; comision: number; pedidos: number }[];
  sinDatos: boolean;
}
export interface AffiliateRow {
  tipo: "restaurante" | "repartidor"; afiliadoId: string; nombre: string;
  montoBruto: number | null; comisionOPago: number; pedidos: number;
}
export interface AffiliateStatistics {
  rango: { desde: string; hasta: string }; filas: AffiliateRow[]; sinDatos: boolean;
}
export interface TrendsStatistics {
  rango: { desde: string; hasta: string }; suficiente: boolean;
  serie: { fecha: string; usuariosActivos: number; usuariosNuevos: number; publicaciones: number; likes: number }[];
  topContenido: { postId: string; descripcion: string; autor: string; sede: string | null; likes: number; visualizaciones: number; imagenes: number; videos: number }[];
}

const query = (params: Record<string, string>) => new URLSearchParams(params).toString();

export const statisticsService = {
  restaurant: (desde: string, hasta: string, restauranteId?: string) =>
    apiFetch<StatisticsEnvelope<RestaurantStatistics>>(`/estadisticas/restaurante/resumen?${query({ desde, hasta, ...(restauranteId ? { restauranteId } : {}) })}`),
  affiliates: (desde: string, hasta: string, tipo: string) =>
    apiFetch<StatisticsEnvelope<AffiliateStatistics>>(`/estadisticas/admin/afiliados?${query({ desde, hasta, ...(tipo ? { tipo } : {}) })}`),
  trends: (desde: string, hasta: string, restauranteId?: string) =>
    apiFetch<StatisticsEnvelope<TrendsStatistics>>(`/estadisticas/admin/tendencias?${query({ desde, hasta, ...(restauranteId ? { restauranteId } : {}) })}`),
  async downloadRestaurantReport(desde: string, hasta: string, formato: "pdf" | "xlsx", restauranteId?: string) {
    const path = `/estadisticas/restaurante/reporte?${query({ desde, hasta, formato, ...(restauranteId ? { restauranteId } : {}) })}`;
    const request = () => fetch(buildApiUrl(path), {
      credentials: "include",
      headers: tokenStore.get() ? { Authorization: `Bearer ${tokenStore.get()}` } : {},
    });
    let response = await request();
    if (response.status === 401 && (await tryRefresh())) response = await request();
    if (!response.ok) {
      let message = "No se pudo generar el reporte. Intenta nuevamente.";
      try {
        const payload = await response.json();
        if (typeof payload.message === "string") message = payload.message;
      } catch { /* respuesta sin JSON */ }
      throw new Error(message);
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `estadisticas-restaurante-${desde}-${hasta}.${formato}`;
    anchor.click();
    URL.revokeObjectURL(url);
  },
};
