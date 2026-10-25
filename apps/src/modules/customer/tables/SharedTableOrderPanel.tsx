"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Check, LoaderCircle, Users } from "lucide-react";
import { useAuth } from "@/shared/auth";
import {
  sharedTableOrderService,
  subscribeToTableUpdates,
  type SharedTableOrder,
} from "@/shared/services";
import { formatCop } from "@/shared/utils/currency";

type CartLine = { item: { id: string; name: string }; quantity: number };

export function SharedTableOrderPanel({
  tableId,
  lines,
  refreshAvailability,
  availabilityReady,
}: {
  tableId: string;
  lines: CartLine[];
  refreshAvailability: () => Promise<boolean>;
  availabilityReady: boolean;
}) {
  const { user, status: authStatus } = useAuth();
  const [order, setOrder] = useState<SharedTableOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const value = await sharedTableOrderService.get(tableId);
    setOrder(value);
  }, [tableId]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !user) {
      setLoading(authStatus === "loading");
      return;
    }
    let active = true;
    setLoading(true);
    sharedTableOrderService
      .get(tableId)
      .then((value) => {
        if (active) {
          setOrder(value);
          setError("");
        }
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : "No pudimos vincularte a la mesa.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [authStatus, tableId, user]);

  useEffect(() => {
    if (!order || order.status !== "abierto") return;
    const refresh = () => {
      void load().catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "No se pudo actualizar el pedido compartido.");
      });
    };
    const unsubscribe = subscribeToTableUpdates((event) => {
      if (event.mesaId === tableId) refresh();
    });
    const timer = window.setInterval(refresh, 10_000);
    return () => {
      unsubscribe();
      window.clearInterval(timer);
    };
  }, [load, order, tableId]);

  const run = async (action: () => Promise<SharedTableOrder>) => {
    setBusy(true);
    setError("");
    try {
      setOrder(await action());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo actualizar el pedido compartido.");
    } finally {
      setBusy(false);
    }
  };

  const contribute = async () => {
    if (!(await refreshAvailability())) {
      setError("Hay productos no disponibles. Revisa tu selección antes de agregarla.");
      return;
    }
    await run(() =>
      sharedTableOrderService.replaceContribution(
        tableId,
        lines.map(({ item, quantity }) => ({ productId: item.id, quantity })),
      ),
    );
  };

  if (authStatus === "loading" || loading) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white p-4" aria-live="polite">
        <p className="flex items-center gap-2 text-sm text-gray-600">
          <LoaderCircle className="h-4 w-4 animate-spin" /> Conectando con la mesa...
        </p>
      </section>
    );
  }

  if (!user) {
    return (
      <section className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
        <h2 className="font-semibold text-gray-900">Inicia sesión para unirte al pedido grupal</h2>
        <p className="mt-1 text-sm text-gray-600">
          Las personas de la mesa se identifican con su cuenta para compartir el pedido.
        </p>
        <Link
          href={`/login?returnTo=${encodeURIComponent(`/pedido?mesa=${tableId}`)}`}
          className="mt-3 inline-flex rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white"
        >
          Iniciar sesión
        </Link>
      </section>
    );
  }

  if (user.role !== "comensal") {
    return (
      <section className="rounded-2xl border border-orange-200 bg-orange-50 p-4">
        <p className="text-sm text-gray-700">
          El pedido grupal solo está disponible para cuentas de comensal.
        </p>
      </section>
    );
  }

  if (!order) {
    return (
      <section className="rounded-2xl border border-red-100 bg-red-50 p-4">
        <p role="alert" className="text-sm text-red-700">
          {error || "No se pudo cargar el pedido de la mesa."}
        </p>
        <button type="button" onClick={() => void run(() => sharedTableOrderService.join(tableId))} className="mt-2 text-sm font-semibold text-red-800 underline">
          Vincularme de nuevo
        </button>
      </section>
    );
  }

  const ownItems = order.items.filter((item) => item.contributorId === user.id);
  const total = order.items.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <section className="space-y-4 rounded-2xl border border-orange-200 bg-orange-50/60 p-4">
      <div>
        <h2 className="flex items-center gap-2 font-semibold text-gray-900">
          <Users className="h-5 w-5 text-primary" />
          Pedido compartido · Mesa {order.table.code}
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          {order.participants.length} {order.participants.length === 1 ? "persona vinculada" : "personas vinculadas"}.
          {" "}Las selecciones se consolidan en un solo pedido.
        </p>
      </div>

      <ul className="space-y-1.5 text-sm">
        {order.participants.map((participant) => (
          <li key={participant.id} className="flex justify-between gap-3">
            <span className="font-medium text-gray-800">
              {participant.name}{participant.id === user.id ? " (tú)" : ""}
              {participant.isPayer ? " · responsable del pago" : ""}
            </span>
            <span className="text-gray-500">
              {participant.contributed ? "Productos agregados" : "Aún no agrega productos"}
            </span>
          </li>
        ))}
      </ul>

      {order.items.length > 0 && (
        <div className="rounded-xl border border-orange-100 bg-white p-3">
          <h3 className="text-sm font-semibold text-gray-900">Productos del grupo</h3>
          <ul className="mt-2 space-y-2">
            {order.items.map((item) => (
              <li key={item.id} className="flex justify-between gap-3 text-sm">
                <span className="min-w-0 text-gray-800">
                  {item.quantity} × {item.productName}
                  <span className="block text-xs text-gray-500">Agregado por {item.contributorName}</span>
                </span>
                <span className="shrink-0 text-gray-700">{formatCop(item.subtotal)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between border-t border-gray-100 pt-2 font-bold text-gray-900">
            <span>Total de productos</span><span>{formatCop(total)}</span>
          </p>
        </div>
      )}

      {order.status === "abierto" ? (
        <>
          <button
            type="button"
            onClick={() => void contribute()}
            disabled={busy || !availabilityReady || lines.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-900 ring-1 ring-orange-200 hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            {ownItems.length ? "Actualizar mis productos" : "Agregar mis productos al pedido"}
          </button>

          <label className="block text-sm font-semibold text-gray-800">
            Responsable de pagar el pedido completo
            <select
              value={order.payer?.id ?? ""}
              onChange={(event) =>
                void run(() => sharedTableOrderService.setPayer(tableId, event.target.value))
              }
              disabled={busy || order.participants.length === 0}
              className="mt-1 block w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 font-normal"
            >
              {!order.payer && <option value="">Selecciona una persona</option>}
              {order.participants.map((participant) => (
                <option key={participant.id} value={participant.id}>{participant.name}</option>
              ))}
            </select>
          </label>

          {order.payer?.id === user.id && (
            <button
              type="button"
              onClick={() => void run(() => sharedTableOrderService.submit(tableId))}
              disabled={busy || order.items.length === 0}
              className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Confirmando pedido..." : `Confirmar pedido compartido · ${formatCop(total + Math.round(total * 0.1))}`}
            </button>
          )}
          <p className="text-xs text-gray-600">
            El responsable confirma un solo pedido. El pago en línea no está habilitado; el restaurante registrará el pago pendiente.
          </p>
        </>
      ) : (
        <div className="rounded-xl bg-white p-3 text-sm">
          <p className="font-semibold text-gray-900">
            Pedido #{order.order?.number} confirmado · Pago {order.order?.paymentStatus}
          </p>
          {order.order && (
            <Link className="mt-2 inline-block font-semibold text-primary underline" href={`/orders/${order.order.id}`}>
              Ver estado del pedido compartido
            </Link>
          )}
        </div>
      )}

      {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    </section>
  );
}
