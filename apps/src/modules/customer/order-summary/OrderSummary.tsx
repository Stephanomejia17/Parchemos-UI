"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { PrimaryButton } from "@/shared/components";
import { RemoteImage } from "@/shared/components/media/RemoteImage";
import { useOrder } from "@/shared/context/order-context";
import { useRestaurantContext } from "@/shared/context/location-context";
import { TableAssociation, type PublicTable } from "@/modules/customer/tables/TableAssociation";
import { sharedTableOrderService } from "@/shared/services";
import { useAuth } from "@/shared/auth";
import { ApiError } from "@/shared/auth/types";

function OrderSummaryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mesaId, setMesaId] = useState<string | null>(null);
  const [tableCode, setTableCode] = useState<string | null>(null);
  const [showAssociation, setShowAssociation] = useState(true);
  const [checkingTable, setCheckingTable] = useState(true);
  const [linkingTable, setLinkingTable] = useState(false);
  const [associationError, setAssociationError] = useState("");
  // Este es el mismo pedido que se armó en /menu (misma clave de localStorage)
  const {
    lines,
    subtotal,
    decrementQuantity,
    incrementQuantity,
    removeItem,
    updateNotes,
    availabilityStatus,
    unavailableLines,
    refreshAvailability,
  } = useOrder();
  const { restaurantId: contextLocationId } = useRestaurantContext();
  const restaurantId = searchParams.get("locationId") ?? contextLocationId;
  const { user, status: authStatus } = useAuth();

  useEffect(() => {
    const storedLocation = window.localStorage.getItem("parchemos:location");
    const storedTable = window.localStorage.getItem("parchemos:mesa");
    const candidate =
      searchParams.get("mesa") ?? (storedLocation === restaurantId ? storedTable : null);
    let active = true;
    setCheckingTable(true);
    setAssociationError("");

    if (!candidate || authStatus !== "authenticated" || user?.role !== "comensal") {
      setMesaId(null);
      setTableCode(null);
      setShowAssociation(true);
      setCheckingTable(false);
      return;
    }

    void sharedTableOrderService
      .get(candidate)
      .then((session) => {
        if (!active) return;
        if (session.table.locationId !== restaurantId) {
          setMesaId(null);
          setTableCode(null);
          setShowAssociation(true);
          setAssociationError("La mesa seleccionada no pertenece a esta sede. Ingresa otra mesa.");
          return;
        }
        setMesaId(candidate);
        setTableCode(session.table.code);
        setShowAssociation(false);
      })
      .catch((reason: unknown) => {
        if (!active) return;
        setMesaId(null);
        setTableCode(null);
        setShowAssociation(true);
        if (!(reason instanceof ApiError) || ![400, 401, 403, 404].includes(reason.status)) {
          setAssociationError(
            "No pudimos verificar la vinculación. Revisa tu conexión o ingresa nuevamente el número de mesa.",
          );
        }
      })
      .finally(() => {
        if (active) setCheckingTable(false);
      });

    return () => {
      active = false;
    };
  }, [authStatus, restaurantId, searchParams, user?.role]);

  const linkTable = async (table: PublicTable) => {
    if (authStatus !== "authenticated" || user?.role !== "comensal") {
      setAssociationError("Inicia sesión con una cuenta de comensal para vincularte a la mesa.");
      return;
    }
    setLinkingTable(true);
    setAssociationError("");
    try {
      await sharedTableOrderService.join(table.tableId);
      window.localStorage.setItem("parchemos:mesa", table.tableId);
      window.localStorage.setItem("parchemos:location", table.locationId);
      window.localStorage.setItem("parchemos:activeLocation", table.locationId);
      setMesaId(table.tableId);
      setTableCode(table.tableCode);
      setShowAssociation(false);
    } catch (reason) {
      setAssociationError(
        reason instanceof Error
          ? reason.message
          : "No pudimos vincularte a esa mesa. Verifica el número e inténtalo de nuevo.",
      );
    } finally {
      setLinkingTable(false);
    }
  };

  const goToPayment = (tableId: string) => {
    const params = new URLSearchParams();
    if (restaurantId) params.set("locationId", restaurantId);
    params.set("mesa", tableId);
    router.push(`/payment?${params.toString()}`);
  };

  const continueOrder = async () => {
    if (!mesaId) {
      setAssociationError("Ingresa y vincula el número de mesa para continuar con el pedido.");
      setShowAssociation(true);
      return;
    }
    if (authStatus !== "authenticated" || user?.role !== "comensal") {
      setAssociationError(
        authStatus === "anonymous"
          ? "Inicia sesión con una cuenta de comensal para enviar tu pedido."
          : "Solo una cuenta de comensal puede enviar este pedido.",
      );
      return;
    }
    if (!(await refreshAvailability())) return;
    if (!restaurantId) {
      setAssociationError(
        "No pudimos identificar la sede del pedido. Vuelve al menú e inténtalo de nuevo.",
      );
      return;
    }
    if (mesaId) {
      try {
        const session = await sharedTableOrderService.get(mesaId);
        if (session.table.locationId === restaurantId) {
          goToPayment(mesaId);
          return;
        }
      } catch (reason) {
        if (!(reason instanceof ApiError) || ![400, 401, 403, 404].includes(reason.status)) {
          setAssociationError(
            "No pudimos verificar la vinculación con la mesa. Revisa tu conexión e inténtalo de nuevo.",
          );
          return;
        }
      }
    }
    setMesaId(null);
    setTableCode(null);
    setShowAssociation(true);
  };

  const service = Math.round(subtotal * 0.1);
  const total = subtotal + service;
  const canContinue =
    lines.length > 0 && availabilityStatus === "checked" && unavailableLines.length === 0;
  const goMenu = () =>
    router.push(restaurantId ? `/menu?locationId=${encodeURIComponent(restaurantId)}` : "/menu");

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="sticky top-0 z-10 border-b border-border bg-white px-4 pb-3 pt-4 md:hidden">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 font-heading">Mi Pedido</h2>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
        {availabilityStatus === "loading" && lines.length > 0 && (
          <p role="status" className="mb-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
            Verificando disponibilidad de los productos...
          </p>
        )}
        {availabilityStatus === "error" && lines.length > 0 && (
          <div role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
            No pudimos confirmar la disponibilidad del pedido. Vuelve al menú e inténtalo de nuevo.
            <button type="button" onClick={goMenu} className="ml-2 font-bold underline">
              Ir al menú
            </button>
          </div>
        )}
        {unavailableLines.length > 0 && (
          <div role="alert" className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            No puedes enviar el pedido todavía. Estos productos ya no están disponibles:
            <ul className="mt-1 list-inside list-disc">
              {unavailableLines.map(({ item }) => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
            <button type="button" onClick={goMenu} className="mt-2 font-bold underline">
              Volver al menú para actualizar el pedido
            </button>
          </div>
        )}
        <div className="flex w-full flex-col gap-4">
          <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
            <div className="border-b border-border px-5 py-4">
              <h3 className="font-semibold text-gray-900">Resumen del pedido</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Revisa los productos y ajusta las cantidades antes de continuar.
              </p>
            </div>
            {lines.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">
                Tu pedido está vacío.
              </p>
            ) : (
              lines.map(({ item, quantity, notes }, i) => (
                <div key={item.id} className={i < lines.length - 1 ? "border-b border-border" : ""}>
                  <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-4">
                    <div className="flex min-w-0 items-center gap-3">
                      {item.imageUrl ? (
                        <RemoteImage
                          src={item.imageUrl}
                          alt={item.name}
                          className="h-14 w-14 shrink-0 rounded-xl"
                          sizes="56px"
                        />
                      ) : (
                        <div
                          aria-hidden="true"
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-primary"
                        >
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="block truncate text-sm font-medium text-gray-800">
                          {item.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ${item.price.toLocaleString()} c/u
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => decrementQuantity(item.id)}
                          aria-label={`Disminuir cantidad de ${item.name}`}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-bold">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => incrementQuantity(item.id)}
                          aria-label={`Aumentar cantidad de ${item.name}`}
                          disabled={!item.available}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white disabled:opacity-40"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          aria-label={`Eliminar ${item.name} del pedido`}
                          className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg bg-red-50 text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">
                      ${(item.price * quantity).toLocaleString()} total
                    </span>
                  </div>
                  <textarea
                    value={notes ?? ""}
                    onChange={(event) => updateNotes(item.id, event.target.value)}
                    maxLength={300}
                    placeholder="Observaciones para este producto (opcional)"
                    aria-label={`Observaciones para ${item.name}`}
                    className="mx-3 mb-3 min-h-16 w-[calc(100%-1.5rem)] rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm sm:mx-4 sm:w-[calc(100%-2rem)]"
                  />
                </div>
              ))
            )}

            <div className="border-t border-border bg-gray-50 px-5 py-4">
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="text-sm text-gray-700">${subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between mb-1.5">
                <span className="text-sm text-muted-foreground">Servicio (10%)</span>
                <span className="text-sm text-gray-700">${service.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t border-border">
                <span className="text-gray-900">Total</span>
                <span className="text-primary text-lg">${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
          {restaurantId && mesaId && (
            <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              <span>Mesa vinculada{tableCode ? ` · ${tableCode}` : ""}</span>
              <button
                type="button"
                onClick={() => setShowAssociation(true)}
                className="font-bold underline"
              >
                Cambiar
              </button>
            </div>
          )}
          {restaurantId && showAssociation && (
            <section
              aria-labelledby="order-table-title"
              className="rounded-2xl border border-orange-200 bg-white p-4 shadow-sm"
            >
              <h3 id="order-table-title" className="font-semibold text-gray-900">
                Vincula una mesa para realizar tu pedido
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Ingresa el número de una mesa habilitada de esta sede. Puedes explorar el menú sin
                vincularte, pero necesitas hacerlo para enviar el pedido.
              </p>
              {authStatus !== "authenticated" || user?.role !== "comensal" ? (
                <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 p-3 text-sm">
                  <p className="text-orange-900">
                    Inicia sesión con una cuenta de comensal para vincularte a la mesa.
                  </p>
                  <Link
                    href={`/login?returnTo=${encodeURIComponent(`/order-summary?locationId=${restaurantId}`)}`}
                    className="mt-2 inline-block font-bold text-primary underline"
                  >
                    Iniciar sesión
                  </Link>
                </div>
              ) : (
                <div className="mt-4">
                  <TableAssociation
                    locationId={restaurantId}
                    manualOnly
                    onAssociated={(table) => void linkTable(table)}
                  />
                  {linkingTable && (
                    <p role="status" className="mt-3 text-sm text-gray-600">
                      Vinculándote a la mesa…
                    </p>
                  )}
                </div>
              )}
            </section>
          )}
          {associationError && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {associationError}
            </p>
          )}
          <PrimaryButton
            onClick={continueOrder}
            size="lg"
            className="w-full sm:w-auto sm:self-center"
            disabled={!canContinue || !mesaId || checkingTable || linkingTable}
          >
            {checkingTable
              ? "Verificando mesa..."
              : availabilityStatus === "loading" && lines.length > 0
                ? "Verificando disponibilidad..."
                : mesaId
                  ? `Continuar con el pedido · $${total.toLocaleString()}`
                  : "Vincula una mesa para continuar"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export function OrderSummary() {
  return <OrderSummaryContent />;
}
