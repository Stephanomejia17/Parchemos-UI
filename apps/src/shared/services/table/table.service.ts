import { apiFetch } from "../http/api-client";
import type { Table, TableStatus } from "../../types/table";

export const tableService = {
  listByLocation: (locationId: string, signal?: AbortSignal) =>
    apiFetch<Table[]>(`/mesas/sede/${encodeURIComponent(locationId)}`, { signal }),

  create: (locationId: string, code: string) =>
    apiFetch<Table>(`/mesas/sede/${encodeURIComponent(locationId)}`, {
      method: "POST",
      body: { code },
    }),

  updateStatus: (tableId: string, status: TableStatus) =>
    apiFetch<Table>(`/mesas/${encodeURIComponent(tableId)}`, {
      method: "PATCH",
      body: { status },
    }),
};
