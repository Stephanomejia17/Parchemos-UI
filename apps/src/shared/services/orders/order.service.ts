import type { UserRole } from "../../auth/types";
import { apiFetch } from "../http/api-client";

export interface CreateOrderInput {
  locationId: string;
  items: Array<{ productId: string; quantity: number }>;
}

export interface CreatedOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  location?: { name: string };
  createdAt?: string;
  items: Array<{
    id: string;
    productId: string | null;
    productName: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }>;
}

interface OrderResponse {
  success: boolean;
  data: CreatedOrder;
  message: string;
}

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

/** GP-08 CA6: una transición del historial del pedido. */
export interface OrderStatusChange {
  desde: OrderStatus | null;
  hacia: OrderStatus;
  fecha: string;
  /** Rol de quien hizo el cambio; null si lo hizo el sistema. */
  cambiadoPorRol: UserRole | null;
  nota: string | null;
}

export interface TableRef {
  id: string;
  codigo: string;
}

export interface RoomOrderItem {
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  notas: string | null;
}

/** GP-05 CA2: pedido con lo que el personal necesita para atenderlo. */
export interface RoomOrder extends OrderStatusInfo {
  mesa: TableRef | null;
  estadoPago: string;
  items: RoomOrderItem[];
}

/** GP-05: pedidos en curso de una mesa; `mesa` null agrupa los que no tienen mesa. */
export interface TableOrders {
  mesa: TableRef | null;
  /** GP-05 CA3: lo que falta pagar en la mesa; null para el grupo sin mesa. */
  totalPendiente: number | null;
  pedidos: RoomOrder[];
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
}

export const orderService = {
  create: async (input: CreateOrderInput) =>
    (await apiFetch<OrderResponse>("/pedidos", { method: "POST", body: input })).data,
  listMine: () =>
    apiFetch<{ success: boolean; data: CreatedOrder[]; message: string }>("/pedidos/mios"),

  getStatus: (orderId: string) =>
    apiFetch<ApiEnvelope<OrderStatusInfo>>(`/pedidos/${orderId}/estado`),

  getHistory: (orderId: string) =>
    apiFetch<ApiEnvelope<OrderStatusChange[]>>(`/pedidos/${orderId}/historial`),

  /** Panel de sala: pedidos en curso de una sede agrupados por mesa, con su detalle. */
  listRoomByTable: (locationId: string) =>
    apiFetch<ApiEnvelope<TableOrders[]>>(`/pedidos/sede/${locationId}/mesas`),

  updateStatus: (orderId: string, estado: OrderStatus, nota?: string) =>
    apiFetch<ApiEnvelope<OrderStatusInfo>>(`/pedidos/${orderId}/estado`, {
      method: "PATCH",
      body: nota ? { estado, nota } : { estado },
    }),
};
