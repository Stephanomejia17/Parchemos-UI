"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, ChefHat, ChevronDown, PackageCheck, RefreshCw } from "lucide-react";
import { SurfaceCard } from "@/shared/components";
import { ORDER_STATUS_LABELS } from "@/shared/constants";
import {
  orderService,
  subscribeToNewOrders,
  subscribeToOrderStatus,
  type OrderStatus,
  type RoomOrder,
} from "@/shared/services";
import { formatCop } from "@/shared/utils/currency";
import { RoomOrderDetail } from "./RoomOrderDetail";

/** Respaldo por si el canal en tiempo real se cae: los sockets son la vía principal. */
const POLL_INTERVAL_MS = 60_000;
/** Cuánto tiempo se destaca un pedido recién llegado. */
const NEW_ORDER_HIGHLIGHT_MS = 30_000;

const ACTIONS: { estado: OrderStatus; label: string; Icon: typeof ChefHat }[] = [
  { estado: "en_preparacion", label: "En preparación", Icon: ChefHat },
  { estado: "listo", label: "Marcar como Listo", Icon: CheckCircle2 },
  { estado: "entregado", label: "Marcar como Entregado", Icon: PackageCheck },
];

const TIME = new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit" });

/**
 * GP-08 CA3/CA4: el personal de la sede avanza los pedidos. Cada botón se
 * habilita solo si la API permite esa transición desde el estado actual.
 */
export function OrderStatusPanel({ locationId }: { locationId: string }) {
  const [orders, setOrders] = useState<RoomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<ReadonlySet<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await orderService.listRoomByTable(locationId);
      setOrders(response.data.flatMap((mesa) => mesa.pedidos));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos consultar los pedidos.");
    } finally {
      setLoading(false);
    }
  }, [locationId]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [load]);

  // GP-05 CA1: los pedidos nuevos y los cambios de otros compañeros llegan por socket.
  useEffect(() => {
    const unsubscribeNew = subscribeToNewOrders((event) => {
      if (event.sedeId !== locationId) return;
      setNewOrderIds((current) => new Set(current).add(event.id));
      window.setTimeout(() => {
        setNewOrderIds((current) => {
          const next = new Set(current);
          next.delete(event.id);
          return next;
        });
      }, NEW_ORDER_HIGHLIGHT_MS);
      void load();
    });
    const unsubscribeStatus = subscribeToOrderStatus((event) => {
      if (event.sedeId === locationId) void load();
    });
    return () => {
      unsubscribeNew();
      unsubscribeStatus();
    };
  }, [locationId, load]);

  const changeStatus = async (order: RoomOrder, estado: OrderStatus) => {
    setUpdatingId(order.id);
    try {
      const { data } = await orderService.updateStatus(order.id, estado);
      setOrders((current) =>
        data.finalizado
          ? current.filter((o) => o.id !== data.id)
          : current.map((o) => (o.id === data.id ? { ...o, ...data } : o)),
      );
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos actualizar el pedido.");
      // Otro compañero pudo cambiarlo antes: se recarga el estado real.
      void load();
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <SurfaceCard className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <h2 className="font-semibold text-gray-900">Pedidos en curso</h2>
          <p className="text-xs text-gray-500">
            Los pedidos nuevos aparecen solos; actualiza el estado para avisarle al comensal
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          aria-label="Actualizar pedidos"
          className="rounded-xl p-2 text-gray-500 hover:bg-gray-100"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <p
          role="alert"
          className="border-b border-red-100 bg-red-50 px-5 py-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {loading && <p className="px-5 py-4 text-sm text-gray-500">Cargando pedidos…</p>}
      {!loading && orders.length === 0 && (
        <p className="px-5 py-4 text-sm text-gray-500">No hay pedidos pendientes en tu sede.</p>
      )}

      <ul className="divide-y divide-gray-100">
        {orders.map((order) => (
          <li
            key={order.id}
            className={`space-y-3 px-5 py-4 ${newOrderIds.has(order.id) ? "bg-orange-50/60" : ""}`}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">Pedido #{order.numero}</p>
                  {newOrderIds.has(order.id) && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">
                      Nuevo
                    </span>
                  )}
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                    {ORDER_STATUS_LABELS[order.estado]}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {order.confirmadoEn
                    ? `Recibido ${TIME.format(new Date(order.confirmadoEn))} · `
                    : ""}
                  {formatCop(order.total)}
                  {order.mesa ? ` · ${order.mesa.codigo}` : ""}
                </p>
                <button
                  type="button"
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  aria-expanded={expandedId === order.id}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary"
                >
                  {expandedId === order.id ? "Ocultar detalle" : "Ver detalle"}
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${expandedId === order.id ? "rotate-180" : ""}`}
                  />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {ACTIONS.map(({ estado, label, Icon }) => {
                  const allowed = order.siguientesEstados.includes(estado);
                  return (
                    <button
                      key={estado}
                      type="button"
                      disabled={!allowed || updatingId === order.id}
                      onClick={() => void changeStatus(order, estado)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 enabled:hover:border-primary enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            {expandedId === order.id && <RoomOrderDetail order={order} />}
          </li>
        ))}
      </ul>
    </SurfaceCard>
  );
}
