"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ChefHat,
  ChevronDown,
  ClipboardCheck,
  PackageCheck,
  RefreshCw,
} from "lucide-react";
import { SurfaceCard } from "@/shared/components";
import { ORDER_STATUS_LABELS } from "@/shared/constants";
import {
  orderService,
  subscribeToNewOrders,
  subscribeToOrderStatus,
  type OrderStatus,
  type RoomOrder,
  type TableOrders,
} from "@/shared/services";
import { formatCop } from "@/shared/utils/currency";
import { RoomOrderDetail } from "./RoomOrderDetail";

/** Respaldo por si el canal en tiempo real se cae: los sockets son la vía principal. */
const POLL_INTERVAL_MS = 60_000;
/** Cuánto tiempo se destaca un pedido recién llegado. */
const NEW_ORDER_HIGHLIGHT_MS = 30_000;

const ACTIONS: { estado: OrderStatus; label: string; Icon: typeof ChefHat }[] = [
  { estado: "confirmado", label: "Confirmar", Icon: ClipboardCheck },
  { estado: "en_preparacion", label: "En preparación", Icon: ChefHat },
  { estado: "listo", label: "Marcar como Listo", Icon: CheckCircle2 },
  { estado: "entregado", label: "Marcar como Entregado", Icon: PackageCheck },
];

const TIME = new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit" });

/**
 * GP-05 / GP-08: panel de sala. Los pedidos en curso de la sede se muestran
 * por mesa, con lo que falta pagar en cada una (GP-05 CA3). Cada botón de
 * estado se habilita solo si la API permite esa transición.
 */
export function OrderStatusPanel({ locationId }: { locationId: string }) {
  const [tables, setTables] = useState<TableOrders[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<ReadonlySet<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  // Nota opcional por pedido: se envía con el próximo cambio de estado y queda en el historial.
  const [notes, setNotes] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    try {
      const response = await orderService.listRoomByTable(locationId);
      setTables(response.data);
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
      const nota = notes[order.id]?.trim() || undefined;
      await orderService.updateStatus(order.id, estado, nota);
      setNotes((current) => {
        const next = { ...current };
        delete next[order.id];
        return next;
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos actualizar el pedido.");
    } finally {
      setUpdatingId(null);
      // Se recarga siempre: cambian los pedidos en curso y el saldo de la mesa, y
      // si otro compañero se adelantó se ve el estado real.
      void load();
    }
  };

  const hasContent = tables.length > 0;

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
      {!loading && !hasContent && (
        <p className="px-5 py-4 text-sm text-gray-500">No hay pedidos pendientes en tu sede.</p>
      )}

      {tables.map((table) => (
        <section key={table.mesa?.id ?? "sin-mesa"} className="border-b border-gray-100">
          <header className="flex items-center justify-between gap-3 bg-gray-50 px-5 py-2.5">
            <h3 className="text-sm font-semibold text-gray-900">
              {table.mesa?.codigo ?? "Sin mesa (para llevar)"}
            </h3>
            {table.totalPendiente !== null && (
              <p className="text-sm">
                <span className="text-gray-500">Pendiente de pago: </span>
                <span className="font-bold text-gray-900">{formatCop(table.totalPendiente)}</span>
              </p>
            )}
          </header>
          {table.pedidos.length === 0 ? (
            <p className="px-5 py-3 text-xs text-gray-500">
              Sin pedidos en curso: queda por cobrar lo ya entregado.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {table.pedidos.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  isNew={newOrderIds.has(order.id)}
                  expanded={expandedId === order.id}
                  onToggle={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  busy={updatingId === order.id}
                  onChangeStatus={(estado) => void changeStatus(order, estado)}
                  note={notes[order.id] ?? ""}
                  onNoteChange={(value) =>
                    setNotes((current) => ({ ...current, [order.id]: value }))
                  }
                />
              ))}
            </ul>
          )}
        </section>
      ))}
    </SurfaceCard>
  );
}

function OrderRow({
  order,
  isNew,
  expanded,
  onToggle,
  busy,
  onChangeStatus,
  note,
  onNoteChange,
}: {
  order: RoomOrder;
  isNew: boolean;
  expanded: boolean;
  onToggle: () => void;
  busy: boolean;
  onChangeStatus: (estado: OrderStatus) => void;
  note: string;
  onNoteChange: (value: string) => void;
}) {
  return (
    <li className={`space-y-3 px-5 py-4 ${isNew ? "bg-orange-50/60" : ""}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900">Pedido #{order.numero}</p>
            {isNew && (
              <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">
                Nuevo
              </span>
            )}
            <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
              {ORDER_STATUS_LABELS[order.estado]}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {order.confirmadoEn ? `Recibido ${TIME.format(new Date(order.confirmadoEn))} · ` : ""}
            {formatCop(order.total)}
          </p>
          <button
            type="button"
            onClick={onToggle}
            aria-expanded={expanded}
            className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-primary"
          >
            {expanded ? "Ocultar detalle" : "Ver detalle"}
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
            />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map(({ estado, label, Icon }) => (
            <button
              key={estado}
              type="button"
              disabled={!order.siguientesEstados.includes(estado) || busy}
              onClick={() => onChangeStatus(estado)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 enabled:hover:border-primary enabled:hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
      </div>
      {expanded && (
        <>
          <RoomOrderDetail order={order} />
          <label className="block text-xs text-gray-600">
            Nota para el próximo cambio (opcional)
            <input
              type="text"
              maxLength={300}
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              placeholder="Ej.: sale por la ventanilla 2"
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900"
            />
          </label>
        </>
      )}
    </li>
  );
}
