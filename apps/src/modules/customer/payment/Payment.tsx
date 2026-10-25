"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronLeft } from "lucide-react";
import { ConfirmDialog, PrimaryButton } from "@/shared/components";
import { useOrder } from "@/shared/context/order-context";
import { useRestaurantContext } from "@/shared/context/location-context";
import { orderService, type CreatedOrder } from "@/shared/services/orders/order.service";
import { tableSessionService } from "@/shared/services";
import { useAuth } from "@/shared/auth";
import { ApiError } from "@/shared/auth/types";

type MessageDialogState = {
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm?: () => void;
};

export function Payment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { restaurantId: contextLocationId } = useRestaurantContext();
  const locationId =
    searchParams.get("locationId") ??
    contextLocationId ??
    (typeof window !== "undefined" ? window.localStorage.getItem("parchemos:location") : null);
  const [tableId, setTableId] = useState<string | null>(null);
  const { lines, subtotal, availabilityStatus, unavailableLines, refreshAvailability, clearOrder } =
    useOrder();
  const { user, status: authStatus } = useAuth();
  const [submittedOrder, setSubmittedOrder] = useState<CreatedOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [messageDialog, setMessageDialog] = useState<MessageDialogState | null>(null);
  const unavailableProductNames = unavailableLines.map(({ item }) => item.name).join(", ");
  const unavailableProductCount = unavailableLines.length;

  useEffect(() => {
    const storedLocation = window.localStorage.getItem("parchemos:location");
    const storedTable = window.localStorage.getItem("parchemos:mesa");
    const candidate =
      searchParams.get("mesa") ?? (storedLocation === locationId ? storedTable : null);
    let active = true;
    setTableId(candidate);
    if (!candidate) {
      setMessageDialog({
        title: "Vincula una mesa para continuar",
        description: "Vuelve al resumen del pedido e ingresa el número de una mesa habilitada.",
        confirmLabel: "Volver al resumen",
        onConfirm: () =>
          router.push(`/order-summary?locationId=${encodeURIComponent(locationId ?? "")}`),
      });
      return;
    }

    void tableSessionService
      .get(candidate)
      .then((session) => {
        if (!active) return;
        if (session.table.locationId !== locationId) {
          setTableId(null);
          setMessageDialog({
            title: "La mesa no corresponde a esta sede",
            description: "Vuelve al resumen del pedido para vincular una mesa de esta sede.",
            confirmLabel: "Volver al resumen",
            onConfirm: () =>
              router.push(`/order-summary?locationId=${encodeURIComponent(locationId ?? "")}`),
          });
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          if (reason instanceof ApiError && [400, 401, 403, 404].includes(reason.status)) {
            setTableId(null);
            setMessageDialog({
              title: "La vinculación ya no está activa",
              description: "Vuelve al resumen del pedido e ingresa nuevamente el número de mesa.",
              confirmLabel: "Volver al resumen",
              onConfirm: () =>
                router.push(`/order-summary?locationId=${encodeURIComponent(locationId ?? "")}`),
            });
          } else {
            setTableId(null);
            setMessageDialog({
              title: "No pudimos verificar la mesa",
              description: "Revisa tu conexión e inténtalo de nuevo desde el resumen del pedido.",
              confirmLabel: "Volver al resumen",
              onConfirm: () =>
                router.push(`/order-summary?locationId=${encodeURIComponent(locationId ?? "")}`),
            });
          }
        }
      });
    return () => {
      active = false;
    };
  }, [locationId, router, searchParams]);

  useEffect(() => {
    if (availabilityStatus === "error" && lines.length > 0) {
      setMessageDialog({
        title: "No se pudo confirmar la disponibilidad",
        description: "Regresa al resumen del pedido, revisa los productos e inténtalo de nuevo.",
        confirmLabel: "Volver al resumen",
        onConfirm: () =>
          router.push(`/order-summary?locationId=${encodeURIComponent(locationId ?? "")}`),
      });
      return;
    }
    if (unavailableProductCount > 0) {
      setMessageDialog({
        title: "Hay productos no disponibles",
        description: `No puedes confirmar el pedido todavía. Revisa estos productos: ${unavailableProductNames}.`,
        confirmLabel: "Corregir pedido",
        onConfirm: () =>
          router.push(`/order-summary?locationId=${encodeURIComponent(locationId ?? "")}`),
      });
    }
  }, [
    availabilityStatus,
    lines.length,
    locationId,
    router,
    unavailableProductCount,
    unavailableProductNames,
  ]);
  const total = subtotal + Math.round(subtotal * 0.1);
  const canSubmit =
    lines.length > 0 &&
    Boolean(locationId) &&
    availabilityStatus === "checked" &&
    unavailableLines.length === 0 &&
    !submitting;

  const submitOrder = async () => {
    if (!canSubmit || !locationId) return;
    if (!tableId) {
      setMessageDialog({
        title: "Vincula una mesa para continuar",
        description: "Vuelve al resumen del pedido e ingresa el número de una mesa habilitada.",
        confirmLabel: "Volver al resumen",
        onConfirm: () => router.push(`/order-summary?locationId=${encodeURIComponent(locationId)}`),
      });
      return;
    }
    if (authStatus !== "authenticated" || user?.role !== "comensal") {
      setMessageDialog({
        title: "Inicia sesión para realizar el pedido",
        description:
          authStatus === "anonymous"
            ? "Necesitas iniciar sesión con una cuenta de comensal para enviar tu pedido."
            : "Solo una cuenta de comensal puede enviar este pedido.",
        confirmLabel: "Entendido",
      });
      return;
    }
    setSubmitting(true);
    try {
      if (!(await refreshAvailability())) {
        setMessageDialog({
          title: "No se pudo verificar el pedido",
          description: "Revisa la disponibilidad de los productos e inténtalo de nuevo.",
          confirmLabel: "Volver al resumen",
          onConfirm: () =>
            router.push(`/order-summary?locationId=${encodeURIComponent(locationId)}`),
        });
        return;
      }
      let session: Awaited<ReturnType<typeof tableSessionService.get>>;
      try {
        session = await tableSessionService.get(tableId);
      } catch (error) {
        if (error instanceof ApiError && [400, 401, 403, 404].includes(error.status)) {
          setTableId(null);
          setMessageDialog({
            title: "La vinculación ya no está activa",
            description: "Vuelve al resumen del pedido e ingresa nuevamente el número de mesa.",
            confirmLabel: "Volver al resumen",
            onConfirm: () =>
              router.push(`/order-summary?locationId=${encodeURIComponent(locationId)}`),
          });
          return;
        }
        throw error;
      }
      if (session.table.locationId !== locationId) {
        setTableId(null);
        setMessageDialog({
          title: "La mesa no corresponde a esta sede",
          description: "Vuelve al resumen del pedido para vincular una mesa de esta sede.",
          confirmLabel: "Volver al resumen",
          onConfirm: () =>
            router.push(`/order-summary?locationId=${encodeURIComponent(locationId)}`),
        });
        return;
      }
      const order = await orderService.create({
        locationId,
        tableId,
        items: lines.map(({ item, quantity, notes }) => ({
          productId: item.id,
          quantity,
          ...(notes?.trim() ? { notes: notes.trim() } : {}),
        })),
      });
      setSubmittedOrder(order);
      clearOrder();
    } catch (error) {
      setMessageDialog({
        title: "No se pudo registrar el pedido",
        description:
          error instanceof Error ? error.message : "Inténtalo de nuevo en unos momentos.",
        confirmLabel: "Entendido",
      });
    } finally {
      setSubmitting(false);
    }
  };

  let submitButtonLabel = "Vincula una mesa para continuar";
  if (submitting) {
    submitButtonLabel = "Registrando pedido…";
  } else if (tableId) {
    submitButtonLabel = `Enviar pedido · $${total.toLocaleString()}`;
  }

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
      <div className="sticky top-0 z-10 border-b border-border bg-white px-4 pb-3 pt-4 md:hidden">
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
          <output className="mb-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
            Verificando disponibilidad de los productos…
          </output>
        )}
       
        <section className="flex flex-col gap-4">
          <div className="rounded-2xl bg-gradient-to-r from-primary to-orange-400 p-5 text-white">
            <p className="text-sm font-medium opacity-80">
              {tableId ? "Mi selección" : "Total del pedido"}
            </p>
            <p className="mt-1 text-4xl font-extrabold">${total.toLocaleString()}</p>
            <p className="mt-3 text-sm opacity-80">Subtotal + tarifa de servicio</p>
          </div>
          <button
            onClick={submitOrder}
            disabled={!canSubmit || !tableId}
            className="w-full rounded-2xl bg-accent py-4 text-base font-bold text-white shadow-lg shadow-green-200 transition-all hover:bg-green-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitButtonLabel}
          </button>
          {lines.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">
              No hay productos en el pedido para confirmar.
            </p>
          )}
          <p className="text-center text-xs text-muted-foreground">
            El pago se realiza presencialmente en el restaurante.
          </p>
        </section>
      </div>
      {messageDialog && (
        <ConfirmDialog
          title={messageDialog.title}
          description={messageDialog.description}
          confirmLabel={messageDialog.confirmLabel ?? "Entendido"}
          cancelLabel={null}
          onCancel={() => setMessageDialog(null)}
          onConfirm={() => {
            setMessageDialog(null);
            messageDialog.onConfirm?.();
          }}
        />
      )}
    </div>
  );
}
