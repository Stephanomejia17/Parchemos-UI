"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BellRing, X } from "lucide-react";
import { subscribeToOrderStatus, type OrderStatusEvent } from "@/shared/services";
import { ORDER_STATUS_DESCRIPTIONS } from "@/modules/customer/order-tracking/order-status";

const AUTO_DISMISS_MS = 8000;
const MAX_VISIBLE = 3;

/**
 * GP-08 CA5: aviso en pantalla cada vez que el restaurante cambia el estado de
 * uno de los pedidos del comensal, esté en la pantalla que esté.
 */
type Notice = OrderStatusEvent & { notificacionId: string };

export function OrderStatusNotifications() {
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);

  const dismiss = useCallback((notificacionId: string) => {
    setNotices((current) => current.filter((n) => n.notificacionId !== notificacionId));
  }, []);

  useEffect(
    () =>
      subscribeToOrderStatus((event) => {
        const { notificacionId } = event;
        if (!notificacionId) return;
        setNotices((current) => [{ ...event, notificacionId }, ...current].slice(0, MAX_VISIBLE));
        window.setTimeout(() => dismiss(notificacionId), AUTO_DISMISS_MS);
      }),
    [dismiss],
  );

  if (notices.length === 0) return null;

  return (
    <div
      className="fixed inset-x-4 top-4 z-50 flex flex-col gap-2 md:inset-x-auto md:right-6 md:w-96"
      aria-live="polite"
    >
      {notices.map((notice) => (
        <div
          key={notice.notificacionId}
          role="status"
          className="flex items-start gap-3 rounded-2xl border border-orange-100 bg-white p-4 shadow-lg"
        >
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <BellRing className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">Pedido #{notice.numero}</p>
            <p className="text-sm text-gray-600">{ORDER_STATUS_DESCRIPTIONS[notice.estado]}</p>
            <button
              type="button"
              onClick={() => {
                dismiss(notice.notificacionId);
                router.push(`/orders/${notice.id}`);
              }}
              className="mt-1 text-sm font-semibold text-primary hover:underline"
            >
              Ver pedido
            </button>
          </div>
          <button
            type="button"
            onClick={() => dismiss(notice.notificacionId)}
            aria-label="Cerrar notificación"
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
