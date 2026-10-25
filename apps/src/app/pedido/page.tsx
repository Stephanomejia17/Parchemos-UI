"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MenuScreen } from "@/modules/customer/menu/MenuScreen";
import { mapMenuItem } from "@/lib/api/menu";
import type { Dish } from "@/shared/types/menu";
import { LocationProvider } from "@/shared/context/location-context";
import { OrderProvider } from "@/shared/context/order-context";
import { apiFetch } from "@/shared/services/http/api-client";
import type { PublicTable } from "@/modules/customer/tables/TableAssociation";
import { useOrder } from "@/shared/context/order-context";
import { formatCop } from "@/shared/utils/currency";
import { TableLinkDialog } from "@/modules/customer/tables/TableLinkDialog";

function PedidoContent() {
  const params = useSearchParams();
  const mesaId = params.get("mesa");
  const requestedLocationId = params.get("locationId");
  const [locationId, setLocationId] = useState<string | null>(requestedLocationId);
  const [table, setTable] = useState<PublicTable | null>(null);
  const [dishes, setDishes] = useState<Dish[] | null>(null);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [startWithNumberEntry, setStartWithNumberEntry] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (requestedLocationId) {
      setLocationId(requestedLocationId);
      return;
    }
    if (!mesaId) {
      setError("El enlace no contiene una sede válida.");
      return;
    }
    void apiFetch<PublicTable>(`/mesas/${mesaId}/public`)
      .then((publicTable) => {
        setTable(publicTable);
        setLocationId(publicTable.locationId);
      })
      .catch(() => setError("No pudimos identificar la sede de este código QR."));
  }, [mesaId, requestedLocationId]);
  useEffect(() => {
    if (!locationId) return;
    window.localStorage.setItem("parchemos:location", locationId);
    window.localStorage.setItem("parchemos:activeLocation", locationId);
  }, [locationId]);
  useEffect(() => {
    if (!locationId) return;
    setDishes(null);
    void apiFetch<{ data: { items: Array<Parameters<typeof mapMenuItem>[0]> } }>(
      `/publicos/${encodeURIComponent(locationId)}/menu`,
    )
      .then((response) =>
        setDishes(
          response.data.items.filter((item) => item.status !== "inactivo").map(mapMenuItem),
        ),
      )
      .catch(() => setError("No pudimos cargar el menú de esta sede."));
  }, [locationId]);
  useEffect(() => {
    if (!locationId || !dishes) return;
    const choiceKey = `parchemos:qr-menu-choice:${locationId}`;
    const forcedPromptKey = `parchemos:qr-menu-link-prompt:${locationId}`;
    const requestedLink = params.get("vincularMesa") === "1";
    if (requestedLink && window.sessionStorage.getItem(forcedPromptKey) !== "seen") {
      window.sessionStorage.setItem(forcedPromptKey, "seen");
      setShowLinkDialog(true);
      setStartWithNumberEntry(true);
      return;
    }
    if (!requestedLink && window.sessionStorage.getItem(choiceKey) !== "seen") {
      setShowLinkDialog(true);
      setStartWithNumberEntry(false);
    }
  }, [dishes, locationId, params]);
  if (error)
    return (
      <main className="flex min-h-screen items-center justify-center bg-background p-6 text-center">
        <p className="max-w-sm rounded-2xl bg-white p-6 font-semibold text-gray-800 shadow-sm">
          {error}
        </p>
      </main>
    );
  if (!locationId || !dishes)
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Cargando menú...
      </main>
    );
  return (
    <main className="h-screen">
      {table && (
        <div className="sr-only">
          {table.restaurantName} · Sede {table.locationId}
        </div>
      )}
      <LocationProvider initialLocationId={locationId}>
        <OrderProvider>
          <QrMenu
            dishes={dishes}
            locationId={locationId}
            showLinkDialog={showLinkDialog}
            startWithNumberEntry={startWithNumberEntry}
            onCloseLinkDialog={() => {
              window.sessionStorage.setItem(`parchemos:qr-menu-choice:${locationId}`, "seen");
              setShowLinkDialog(false);
            }}
            onLinked={() => {
              window.sessionStorage.setItem(`parchemos:qr-menu-choice:${locationId}`, "seen");
              setShowLinkDialog(false);
            }}
          />
        </OrderProvider>
      </LocationProvider>
    </main>
  );
}

function QrMenu({
  dishes,
  locationId,
  showLinkDialog,
  startWithNumberEntry,
  onCloseLinkDialog,
  onLinked,
}: {
  dishes: Dish[];
  locationId: string;
  showLinkDialog: boolean;
  startWithNumberEntry: boolean;
  onCloseLinkDialog: () => void;
  onLinked: (table: PublicTable) => void;
}) {
  const router = useRouter();
  const { totalItems, subtotal } = useOrder();
  const total = subtotal + Math.round(subtotal * 0.1);
  const loginReturnTo = `/pedido?locationId=${encodeURIComponent(locationId)}&vincularMesa=1`;

  return (
    <>
      <MenuScreen dishes={dishes} />
      <TableLinkDialog
        open={showLinkDialog}
        locationId={locationId}
        mode="choose"
        startWithNumberEntry={startWithNumberEntry}
        loginReturnTo={loginReturnTo}
        onDismiss={onCloseLinkDialog}
        onLinked={onLinked}
      />
      {totalItems > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-white/95 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-lg backdrop-blur">
          <button
            type="button"
            onClick={() =>
              router.push(`/order-summary?locationId=${encodeURIComponent(locationId)}`)
            }
            className="mx-auto flex w-full max-w-xl items-center justify-between rounded-xl bg-primary px-4 py-3 font-semibold text-white"
          >
            <span>
              Ver pedido · {totalItems} {totalItems === 1 ? "producto" : "productos"}
            </span>
            <span>{formatCop(total)}</span>
          </button>
        </div>
      )}
    </>
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
