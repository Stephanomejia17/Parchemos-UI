import { apiFetch } from "../http/api-client";

interface TableSession {
  table: { code: string; locationId: string };
}

interface ApiEnvelope<T> {
  data: T;
}

async function unwrap(response: Promise<ApiEnvelope<TableSession>>) {
  return (await response).data;
}

function sessionPath(tableId: string): string {
  return `/pedidos/mesas/${encodeURIComponent(tableId)}/sesion`;
}

export const tableSessionService = {
  join: (tableId: string) =>
    unwrap(
      apiFetch<ApiEnvelope<TableSession>>(sessionPath(tableId), {
        method: "POST",
      }),
    ),
  get: (tableId: string) => unwrap(apiFetch<ApiEnvelope<TableSession>>(sessionPath(tableId))),
};
