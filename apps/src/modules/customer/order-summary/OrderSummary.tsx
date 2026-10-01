"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Minus, Plus, UsersRound, Trash2 } from "lucide-react";
import { PrimaryButton } from "@/shared/components";
import { useOrder } from "@/shared/context/order-context";
import { useRestaurantContext } from "@/shared/context/location-context";

function OrderSummaryContent() {
  const router = useRouter();
  const [splitEnabled, setSplitEnabled] = useState(false);
  const [guests, setGuests] = useState(2);
  // AC6 — este es el mismo pedido que se armó en /menu (misma key de localStorage)
  const {
    lines,
    subtotal,
    decrementQuantity,
    incrementQuantity,
    removeItem,
    availabilityStatus,
    unavailableLines,
    refreshAvailability,
  } = useOrder();
  const { restaurantId } = useRestaurantContext();

  const goPayment = async () => {
    if (await refreshAvailability()) router.push("/payment");
  };

  const service = Math.round(subtotal * 0.1);
  const total = subtotal + service;
  const canPay =
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
            Verificando disponibilidad de los productos…
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
            No puedes pagar todavía. Estos productos ya no están disponibles:
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
              lines.map(({ item, quantity }, i) => (
                <div
                  key={item.id}
                  className={`flex items-center justify-between px-4 py-3 ${i < lines.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center text-xs font-bold text-primary">
                      {quantity}
                    </div>
                    <span className="text-sm text-gray-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
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
                    <span className="min-w-16 text-right text-sm font-semibold text-gray-900">
                      ${(item.price * quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}

            <section
              className="border-t border-border bg-gradient-to-r from-orange-50/80 to-white px-5 py-4"
              aria-labelledby="split-bill-title"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <UsersRound className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0">
                    <span
                      id="split-bill-title"
                      className="block text-sm font-semibold text-gray-900"
                    >
                      Dividir cuenta
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      Calcula cuánto aporta cada persona.
                    </span>
                  </span>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={splitEnabled}
                  aria-label="Activar división de la cuenta"
                  onClick={() => setSplitEnabled((enabled) => !enabled)}
                  className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${splitEnabled ? "bg-primary" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${splitEnabled ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
              </div>
              {splitEnabled && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-orange-100 bg-white p-3 sm:px-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Personas</p>
                    <div className="mt-1 flex items-center gap-3">
                      <button
                        type="button"
                        aria-label="Restar una persona"
                        onClick={() => setGuests((count) => Math.max(1, count - 1))}
                        disabled={guests <= 1}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-40"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-16 text-center text-sm font-semibold text-gray-900">
                        {guests} {guests === 1 ? "persona" : "personas"}
                      </span>
                      <button
                        type="button"
                        aria-label="Agregar una persona"
                        onClick={() => setGuests((count) => count + 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-700 transition-colors hover:bg-gray-200"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-xs text-muted-foreground">Aproximado por persona</p>
                    <p className="mt-0.5 text-lg font-bold text-primary">
                      ${Math.round(total / guests).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </section>

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
          <PrimaryButton
            onClick={goPayment}
            size="lg"
            className="w-full sm:w-auto sm:self-center"
            disabled={!canPay}
          >
            {availabilityStatus === "loading" && lines.length > 0
              ? "Verificando disponibilidad…"
              : `💳 Ir a pagar · $${total.toLocaleString()}`}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

export function OrderSummary() {
  return <OrderSummaryContent />;
}
