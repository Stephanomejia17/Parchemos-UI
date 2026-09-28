"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChevronLeft } from "lucide-react";
import { PrimaryButton } from "@/shared/components";
import { useOrder } from "@/shared/context/order-context";
import { useRestaurantContext } from "@/shared/context/location-context";
import { orderService, type CreatedOrder } from "@/shared/services/orders/order.service";

export function Payment() {
  const router = useRouter();
  const { restaurantId: locationId } = useRestaurantContext();
  const { lines, subtotal, availabilityStatus, unavailableLines, refreshAvailability, clearOrder } =
    useOrder();
  const [submittedOrder, setSubmittedOrder] = useState<CreatedOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const total = subtotal + Math.round(subtotal * 0.1);
  const canSubmit =
    lines.length > 0 &&
    Boolean(locationId) &&
    availabilityStatus === "checked" &&
    unavailableLines.length === 0 &&
    !submitting;

  const submitOrder = async () => {
    if (!canSubmit || !locationId) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      if (!(await refreshAvailability())) {
        setSubmitError(
          "Hay productos no disponibles o no se pudo verificar el menú. Revisa tu pedido e inténtalo de nuevo.",
        );
        return;
      }
      const order = await orderService.create({
        locationId,
        items: lines.map(({ item, quantity }) => ({ productId: item.id, quantity })),
      });
      setSubmittedOrder(order);
      clearOrder();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "No se pudo registrar el pedido.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submittedOrder) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white px-6 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-accent shadow-xl shadow-green-200">
          <Check className="h-12 w-12 text-white" />
        </div>
        <h2 className="mb-2 font-heading text-2xl font-bold text-gray-900">¡Pedido registrado!</h2>
        <p className="mb-8 text-muted-foreground">
          El restaurante recibió tu pedido. El pago queda pendiente.
        </p>
        <div className="mb-8 w-full max-w-sm rounded-2xl bg-gray-50 p-5">
          <div className="mb-2 flex justify-between">
            <span className="text-sm text-muted-foreground">Pedido</span>
            <span className="text-sm font-semibold">#{submittedOrder.orderNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-sm font-bold text-accent">
              ${submittedOrder.total.toLocaleString()}
            </span>
          </div>
        </div>
        <PrimaryButton onClick={() => router.push("/home")} size="lg" className="w-full max-w-sm">
          Volver al inicio
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-white px-4 pb-3 pt-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            aria-label="Volver"
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5 text-gray-900" />
          </button>
          <h2 className="font-heading text-lg font-bold text-gray-900">Confirmar pedido</h2>
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl p-4 md:p-6">
        {availabilityStatus === "loading" && lines.length > 0 && (
          <p role="status" className="mb-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
            Verificando disponibilidad de los productos…
          </p>
        )}
        {availabilityStatus === "error" && lines.length > 0 && (
          <p role="alert" className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">
            No se pudo confirmar la disponibilidad. Regresa al menú e inténtalo de nuevo.
          </p>
        )}
        {unavailableLines.length > 0 && (
          <div role="alert" className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            No puedes confirmar el pedido todavía. Productos no disponibles:
            <ul className="mt-1 list-inside list-disc">
              {unavailableLines.map(({ item }) => (
                <li key={item.id}>{item.name}</li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => router.push("/order-summary")}
              className="mt-2 font-bold underline"
            >
              Volver al pedido para corregirlo
            </button>
          </div>
        )}
        <section className="flex flex-col gap-4">
          <div className="rounded-2xl bg-gradient-to-r from-primary to-orange-400 p-5 text-white">
            <p className="text-sm font-medium opacity-80">Total del pedido</p>
            <p className="mt-1 text-4xl font-extrabold">${total.toLocaleString()}</p>
            <p className="mt-3 text-sm opacity-80">Subtotal + tarifa de servicio</p>
          </div>
          {submitError && (
            <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">
              {submitError}
            </p>
          )}
          <button
            onClick={submitOrder}
            disabled={!canSubmit}
            className="w-full rounded-2xl bg-accent py-4 text-base font-bold text-white shadow-lg shadow-green-200 transition-all hover:bg-green-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? "Registrando pedido…" : `Confirmar pedido · $${total.toLocaleString()}`}
          </button>
          {lines.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No hay productos en el pedido para confirmar.
            </p>
          )}
          <p className="text-center text-xs text-muted-foreground">
            El pago no se procesa en esta versión y quedará pendiente en el pedido.
          </p>
        </section>
      </div>
    </div>
  );
}
