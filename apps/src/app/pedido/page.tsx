"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MenuScreen } from "@/modules/customer/menu/MenuScreen";
import { mapMenuItem } from "@/lib/api/menu";
import type { Dish } from "@/shared/types/menu";
import { LocationProvider } from "@/shared/context/location-context";
import { OrderProvider } from "@/shared/context/order-context";
import { apiFetch } from "@/shared/services/http/api-client";
import type { PublicTable } from "@/modules/customer/tables/TableAssociation";

function PedidoContent() {
  const params = useSearchParams();
  const mesaId = params.get("mesa");
  const [table, setTable] = useState<PublicTable | null>(null);
  const [dishes, setDishes] = useState<Dish[] | null>(null);
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
  useEffect(() => {
    if (!table) return;
    setDishes(null);
    void apiFetch<{ data: { items: Array<Parameters<typeof mapMenuItem>[0]> } }>(`/publicos/${encodeURIComponent(table.locationId)}/menu`)
      .then((response) => setDishes(response.data.items.filter((item) => item.status !== "inactivo").map(mapMenuItem)))
      .catch(() => setError("No pudimos cargar el menú de esta sede."));
  }, [table]);
  if (error)
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <p className="max-w-sm rounded-2xl bg-white p-6 font-semibold text-gray-800 shadow-sm">
          {error}
        </p>
      </main>
    );
  if (!table || !dishes)
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
          <MenuScreen dishes={dishes} />
        </OrderProvider>
      </LocationProvider>
    </main>
  );
}

export default function PedidoPage() {
  // useSearchParams (la mesa del QR) necesita una frontera de Suspense.
  return (
    <Suspense fallback={null}>
      <PedidoContent />
    </Suspense>
  );
}
