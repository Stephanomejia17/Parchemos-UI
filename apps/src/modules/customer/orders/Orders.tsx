"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Clock, RefreshCw } from "lucide-react";
import { orderService, type CreatedOrder } from "@/shared/services/orders/order.service";

const STATUS_LABELS: Record<string, string> = {
  borrador: "Borrador",
  pendiente: "Pendiente de confirmación",
  confirmado: "Confirmado",
  en_preparacion: "En preparación",
  listo: "Listo",
  en_camino: "En camino",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export function Orders() {
  const router = useRouter();
  const [orders, setOrders] = useState<CreatedOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderService.listMine();
      setOrders(response.data);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudieron consultar tus pedidos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background">
      <div className="sticky top-0 z-10 border-b border-border bg-white px-4 py-4 md:px-6">
        <h2 className="font-heading text-xl font-bold text-gray-900">Pedidos</h2>
      </div>

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 p-4 md:p-6">
        {loading && (
          <p role="status" className="text-sm text-muted-foreground">
            Cargando tus pedidos…
          </p>
        )}
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            <p>{error}</p>
            <button
              onClick={() => void loadOrders()}
              className="mt-2 inline-flex items-center gap-2 font-semibold underline"
            >
              <RefreshCw className="h-4 w-4" /> Reintentar
            </button>
          </div>
        )}
        {!loading && !error && orders.length === 0 && (
          <div className="rounded-2xl border border-border bg-white p-6 text-center">
            <p className="font-semibold text-gray-900">Aún no tienes pedidos</p>
            <button
              onClick={() => router.push("/discover")}
              className="mt-3 font-semibold text-primary underline"
            >
              Explorar restaurantes
            </button>
          </div>
        )}
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl border border-border bg-white p-4 shadow-sm md:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-gray-900">{order.location?.name ?? "Restaurante"}</h3>
                <p className="text-sm text-muted-foreground">Pedido #{order.orderNumber}</p>
              </div>
              <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-primary">
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <ul className="my-4 space-y-2 border-y border-border py-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex justify-between gap-4 text-sm">
                  <span>
                    {item.quantity} × {item.productName}
                  </span>
                  <span className="shrink-0 font-medium">${item.lineTotal.toLocaleString()}</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                {order.createdAt ? new Date(order.createdAt).toLocaleString("es-CO") : ""}
                {order.paymentStatus === "pendiente" ? " · Pago pendiente" : ""}
              </span>
              <span className="font-bold text-gray-900">Total ${order.total.toLocaleString()}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
