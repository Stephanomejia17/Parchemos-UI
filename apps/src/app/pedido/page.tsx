"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Menu } from "@/modules/customer/menu/Menu";
import { apiFetch } from "@/shared/services/http/api-client";

type TableDetails = { tableId: string; tableCode: string; restaurantName: string };
export default function PedidoPage() {
  const params = useSearchParams();
  const mesaId = params.get("mesa");
  const [table, setTable] = useState<TableDetails | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { if (!mesaId) { setError("El enlace no contiene una mesa válida."); return; } void apiFetch<TableDetails>(`/mesas/${mesaId}/public`).then(setTable).catch(() => setError("Esta mesa está inactiva o el QR ya no es válido.")); }, [mesaId]);
  useEffect(() => { if (table) window.localStorage.setItem("parchemos:mesa", table.tableId); }, [table]);
  if (error) return <main className="flex min-h-screen items-center justify-center bg-background p-6 text-center"><p className="max-w-sm rounded-2xl bg-white p-6 font-semibold text-gray-800 shadow-sm">{error}</p></main>;
  if (!table) return <main className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">Cargando menú...</main>;
  return <main className="h-screen"><div className="sr-only">{table.restaurantName} · Mesa {table.tableCode}</div><Menu mesaId={table.tableId} /></main>;
}
