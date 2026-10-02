"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Menu } from "@/modules/customer/menu/Menu";
import { LocationProvider } from "@/shared/context/location-context";
import { OrderProvider } from "@/shared/context/order-context";
import { apiFetch } from "@/shared/services/http/api-client";
import type { PublicTable } from "@/modules/customer/tables/TableAssociation";

export default function PedidoPage() {
  const params = useSearchParams();
  const mesaId = params.get("mesa");
  const [table, setTable] = useState<PublicTable | null>(null);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!mesaId) {
      setError("El enlace no contiene una mesa válida.");
      return;
    }
    void apiFetch<PublicTable>(`/mesas/${mesaId}/public`)
      .then(setTable)
      .catch(() => setError("Esta mesa está inactiva o el QR ya no es válido."));
  }, [mesaId]);
  useEffect(() => {
    if (!table) return;
    // Corrección QR: conservar ambos identificadores para que el pedido llegue
    // al backend con su sede y mesa, incluso al navegar entre pantallas.
    window.localStorage.setItem("parchemos:mesa", table.tableId);
    window.localStorage.setItem("parchemos:location", table.locationId);
  }, [table]);
  if (error)
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <p className="max-w-sm rounded-2xl bg-white p-6 font-semibold text-gray-800 shadow-sm">
          {error}
        </p>
      </main>
    );
  if (!table)
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Cargando menú...
      </main>
    );
  return (
    <main className="h-screen">
      <div className="sr-only">
        {table.restaurantName} · Mesa {table.tableCode}
      </div>
      <LocationProvider initialLocationId={table.locationId}>
        <OrderProvider>
          <Menu mesaId={table.tableId} locationId={table.locationId} />
        </OrderProvider>
      </LocationProvider>
    </main>
  );
}

