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

export const orderService = {
  create: async (input: CreateOrderInput) =>
    (await apiFetch<OrderResponse>("/pedidos", { method: "POST", body: input })).data,
  listMine: () =>
    apiFetch<{ success: boolean; data: CreatedOrder[]; message: string }>("/pedidos/mios"),
};
