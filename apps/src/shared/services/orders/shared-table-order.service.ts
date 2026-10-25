import { apiFetch } from "../http/api-client";

export interface SharedTableOrder {
  sessionId: string;
  status: "abierto" | "enviado";
  table: { id: string; code: string; locationId: string };
  payer: { id: string; name: string } | null;
  participants: Array<{
    id: string;
    name: string;
    contributed: boolean;
    isPayer: boolean;
  }>;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    contributorId: string;
    contributorName: string;
  }>;
  order: {
    id: string;
    number: string;
    status: string;
    paymentStatus: string;
    total: number;
  } | null;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
}

async function unwrap(response: Promise<ApiEnvelope<SharedTableOrder>>) {
  return (await response).data;
}

function sessionPath(tableId: string): string {
  return `/pedidos/mesas/${encodeURIComponent(tableId)}/sesion`;
}

export const sharedTableOrderService = {
  join: (tableId: string) =>
    unwrap(apiFetch<ApiEnvelope<SharedTableOrder>>(sessionPath(tableId), {
      method: "POST",
    })),
  get: (tableId: string) =>
    unwrap(apiFetch<ApiEnvelope<SharedTableOrder>>(sessionPath(tableId))),
  replaceContribution: (
    tableId: string,
    items: Array<{ productId: string; quantity: number }>,
  ) =>
    unwrap(apiFetch<ApiEnvelope<SharedTableOrder>>(
      `${sessionPath(tableId)}/contribucion`,
      { method: "PUT", body: { items } },
    )),
  setPayer: (tableId: string, payerId: string) =>
    unwrap(apiFetch<ApiEnvelope<SharedTableOrder>>(
      `${sessionPath(tableId)}/pagador`,
      { method: "PATCH", body: { payerId } },
    )),
  submit: (tableId: string) =>
    unwrap(apiFetch<ApiEnvelope<SharedTableOrder>>(
      `${sessionPath(tableId)}/confirmar`,
      { method: "POST" },
    )),
};
