"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, ChefHat, ChevronLeft, CircleX, PackageCheck, RefreshCw } from "lucide-react";
import { ordersService, type OrderStatusChange, type OrderStatusInfo } from "@/shared/services";
import { formatCop } from "@/shared/utils/currency";
import {
  ORDER_STATUS_DESCRIPTIONS,
  ORDER_STATUS_LABELS,
  currentStepIndex,
  formatDateTime,
  timelineFor,
} from "./order-status";
import { OrderStatusHistory } from "./OrderStatusHistory";

/** Respaldo por si el canal en tiempo real no está disponible. */
const POLL_INTERVAL_MS = 20_000;

export function OrderTracking({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<OrderStatusInfo | null>(null);
  const [history, setHistory] = useState<OrderStatusChange[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [status, changes] = await Promise.all([
        ordersService.getStatus(orderId),
        ordersService.getHistory(orderId),
      ]);
      setOrder(status.data);
      setHistory(changes.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pudimos consultar el pedido.");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!order || order.finalizado) return;
    const timer = window.setInterval(() => void load(), POLL_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [order, load]);

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-border sticky top-0 z-10 md:px-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/orders")}
            aria-label="Volver a pedidos"
            className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </button>
          <h2 className="text-lg font-bold text-gray-900 font-heading">
            {order ? `Pedido #${order.numero}` : "Seguimiento del pedido"}
          </h2>
          <button
            onClick={() => void load()}
            aria-label="Actualizar estado"
            className="ml-auto w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center"
          >
            <RefreshCw className="w-4 h-4 text-gray-700" />
          </button>
        </div>
      </div>

      <div className="p-4 md:p-6 md:max-w-2xl md:mx-auto md:w-full flex flex-col gap-4">
        {loading && <p className="text-sm text-muted-foreground">Consultando tu pedido...</p>}

        {!loading && error && (
          <div className="bg-red-50 border border-red-100 text-red-700 rounded-2xl p-4 text-sm">
            {error}
          </div>
        )}

        {order && <OrderStatusCard order={order} />}
        {order && <OrderStatusHistory changes={history} />}
      </div>
    </div>
  );
}

function OrderStatusCard({ order }: { order: OrderStatusInfo }) {
  const steps = timelineFor(order.modalidad);
  const current = currentStepIndex(order.modalidad, order.estado);
  const cancelled = order.estado === "cancelado";
  const StatusIcon = cancelled ? CircleX : order.estado === "entregado" ? PackageCheck : ChefHat;

  return (
    <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
      <p className="text-xs text-muted-foreground">{order.sedeNombre}</p>

      <div className="flex items-center gap-3 mt-2 mb-4">
        <div
          className={`w-11 h-11 rounded-2xl flex items-center justify-center ${cancelled ? "bg-red-50" : "bg-accent/10"}`}
        >
          <StatusIcon className={`w-5 h-5 ${cancelled ? "text-red-600" : "text-accent"}`} />
        </div>
        <div>
          <p className="font-bold text-gray-900">{ORDER_STATUS_LABELS[order.estado]}</p>
          <p className="text-sm text-muted-foreground">{ORDER_STATUS_DESCRIPTIONS[order.estado]}</p>
        </div>
      </div>

      {!cancelled && current >= 0 && (
        <ol className="flex items-start" aria-label="Progreso del pedido">
          {steps.map((step, i) => {
            const done = i <= current;
            return (
              <li key={step.label} className="flex-1 flex flex-col items-center relative">
                {i > 0 && (
                  <span
                    className={`absolute top-3 right-1/2 w-full h-0.5 ${i <= current ? "bg-primary" : "bg-gray-200"}`}
                    aria-hidden
                  />
                )}
                <span
                  className={`relative w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${done ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}
                  aria-current={i === current ? "step" : undefined}
                >
                  {done ? <Check className="w-3 h-3" /> : i + 1}
                </span>
                <span
                  className={`mt-1 text-xs text-center ${i === current ? "font-semibold text-gray-900" : "text-muted-foreground"}`}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      <dl className="mt-4 pt-3 border-t border-border grid grid-cols-2 gap-y-2 text-sm">
        <dt className="text-muted-foreground">Confirmado</dt>
        <dd className="text-right text-gray-900">{formatDateTime(order.confirmadoEn) || "—"}</dd>
        {order.entregadoEn && (
          <>
            <dt className="text-muted-foreground">Entregado</dt>
            <dd className="text-right text-gray-900">{formatDateTime(order.entregadoEn)}</dd>
          </>
        )}
        <dt className="text-muted-foreground">Total</dt>
        <dd className="text-right font-bold text-gray-900">{formatCop(order.total)}</dd>
      </dl>
    </div>
  );
}
