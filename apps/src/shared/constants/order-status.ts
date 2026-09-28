import type { OrderStatus } from "../services/orders/order.service";

/** Nombre visible de cada estado del pedido (GP-08), para comensal y personal. */
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  borrador: "Sin confirmar",
  pendiente: "Recibido",
  confirmado: "Confirmado",
  en_preparacion: "En preparación",
  listo: "Listo",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};
