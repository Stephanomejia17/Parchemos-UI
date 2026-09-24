import { apiFetch } from "../http/api-client";

/** GP-08: estados del pedido, tal como los devuelve la API. */
export type OrderStatus =
  | "borrador"
  | "pendiente"
  | "confirmado"
  | "en_preparacion"
  | "listo"
  | "en_camino"
  | "entregado"
  | "cancelado";

export type OrderFulfillment = "en_mesa" | "para_llevar" | "domicilio";

export interface OrderStatusInfo {
  id: string;
  numero: number;
  restauranteId: string;
  sedeId: string;
  sedeNombre: string;
  modalidad: OrderFulfillment;
  estado: OrderStatus;
  siguientesEstados: OrderStatus[];
  finalizado: boolean;
  total: number;
  confirmadoEn: string | null;
  entregadoEn: string | null;
  actualizadoEn: string;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
}

export const ordersService = {
  listMine: () => apiFetch<ApiEnvelope<OrderStatusInfo[]>>("/pedidos/mios"),

  getStatus: (orderId: string) =>
    apiFetch<ApiEnvelope<OrderStatusInfo>>(`/pedidos/${orderId}/estado`),
};
