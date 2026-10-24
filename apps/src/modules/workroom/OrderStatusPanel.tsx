"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Check,
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

/** Orden fijo del flujo: de aquí salen la barra de progreso y la secuencia de botones. */
const FLOW: OrderStatus[] = ["confirmado", "en_preparacion", "listo", "entregado"];

const ACTIONS: { estado: OrderStatus; label: string; Icon: typeof ChefHat }[] = [
  { estado: "confirmado", label: "Confirmar", Icon: ClipboardCheck },
  { estado: "en_preparacion", label: "En preparación", Icon: ChefHat },
  { estado: "listo", label: "Marcar como Listo", Icon: CheckCircle2 },
  { estado: "entregado", label: "Marcar como Entregado", Icon: PackageCheck },
];

/** Clases completas (no dinámicas) para que Tailwind las detecte. */
const BADGE_STYLES: Partial<Record<OrderStatus, string>> = {
  confirmado: "bg-blue-50 text-blue-700",
  en_preparacion: "bg-amber-50 text-amber-700",
  listo: "bg-emerald-50 text-emerald-700",
  entregado: "bg-gray-100 text-gray-600",
};
const BADGE_FALLBACK = "bg-orange-50 text-primary";

const TIME = new Intl.DateTimeFormat("es-CO", { hour: "numeric", minute: "2-digit" });

/**
 * GP-05 / GP-08: panel de sala. Los pedidos en curso de la sede se muestran
 * por mesa, con lo que falta pagar en cada una (GP-05 CA3). Cada pedido muestra
 * su progreso y solo permite avanzar al siguiente estado si la API lo permite.
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
      if (event.sedeId !== locationId) return;
      setTables((current) =>
        current.map((table) => ({
          ...table,
          pedidos: table.pedidos.map((order) =>
            order.id === event.id ? { ...order, estado: event.estado } : order,
          ),
        })),
      );
      void load();
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

      // Actualización inmediata: la barra avanza y los botones quedan bloqueados
      // hasta que el load() de abajo traiga los nuevos siguientesEstados.
      setTables((current) =>
        current.map((table) => ({
          ...table,
          pedidos: table.pedidos.map((o) =>
            o.id === order.id ? { ...o, estado, siguientesEstados: [] } : o,
          ),
        })),
      );

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

/** Barra de progreso del pedido: pasos completados en color primario, el actual con aro. */
function OrderProgress({ estado }: { estado: OrderStatus }) {
  const current = FLOW.indexOf(estado);

  return (
    <ol aria-label="Progreso del pedido" className="flex items-start">
      {FLOW.map((step, i) => {
        const done = i <= current;
        const active = i === current;
        const isLast = i === FLOW.length - 1;

        return (
          <li key={step} className={`flex items-start ${isLast ? "" : "flex-1"}`}>
            <div className="flex w-16 flex-col items-center gap-1">
              <span
                aria-current={active ? "step" : undefined}
                className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold transition-colors duration-500 ${
                  done ? "bg-primary text-white" : "bg-gray-200 text-gray-500"
                } ${active && !isLast ? "ring-4 ring-primary/20" : ""}`}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <span
                className={`text-center text-[10px] leading-tight ${
                  done ? "font-semibold text-gray-900" : "text-gray-400"
                }`}
              >
                {ORDER_STATUS_LABELS[step]}
              </span>
            </div>
            {!isLast && (
              <span
                className={`mt-[10px] h-1 flex-1 rounded-full transition-colors duration-500 ${
                  i < current ? "bg-primary" : "bg-gray-200"
                }`}
              />
            )}
          </li>
        );
      })}
    </ol>
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
  const currentIndex = FLOW.indexOf(order.estado);
  const nextEstado = FLOW[currentIndex + 1]; // undefined si ya está entregado
  const isFinished = order.estado === "entregado";

  return (
    <li className={`space-y-3 px-5 py-4 ${isNew ? "bg-orange-50/60" : ""}`}>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900">Pedido #{order.numero}</p>
              {isNew && (
                <span className="rounded-full bg-primary px-2 py-0.5 text-[11px] font-semibold text-white">
                  Nuevo
                </span>
              )}
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                BADGE_STYLES[order.estado] ?? BADGE_FALLBACK
              }`}
            >
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

        <div className="space-y-3 md:w-[26rem]">
          <OrderProgress estado={order.estado} />

          {isFinished ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
              <PackageCheck className="h-4 w-4" />
              Pedido entregado · no hay más acciones
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {ACTIONS.map(({ estado, label, Icon }) => {
                const index = FLOW.indexOf(estado);
                const alreadyDone = index <= currentIndex;
                // Solo se habilita el siguiente paso, y únicamente si la API lo permite.
                const enabled =
                  estado === nextEstado && order.siguientesEstados.includes(estado) && !busy;

                return (
                  <button
                    key={estado}
                    type="button"
                    disabled={!enabled}
                    onClick={() => onChangeStatus(estado)}
                    className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${
                      alreadyDone
                        ? "border-transparent bg-gray-100 text-gray-400"
                        : enabled
                          ? "border-primary text-primary hover:bg-primary hover:text-white"
                          : "border-gray-200 text-gray-700 opacity-40"
                    }`}
                  >
                    {alreadyDone ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                    {label}
                  </button>
                );
              })}
            </div>
          )}
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