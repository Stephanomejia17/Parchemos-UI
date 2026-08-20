"use client";

import { useRouter } from "next/navigation";
import { Clock, Star } from "lucide-react";
import { RemoteImage } from "@/components/media/RemoteImage";
import { ORDER_HISTORY } from "./data";

export function Orders() {
  const router = useRouter();
  const goOrderSummary = () => router.push("/order-summary");

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-border sticky top-0 z-10 md:px-6 md:pt-6">
        <h2 className="text-xl font-bold text-gray-900 font-heading">Pedidos</h2>
      </div>

      <div className="p-4 md:p-6 flex flex-col gap-4">
        {/* Active order */}
        <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-4 border border-orange-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <p className="text-sm font-semibold text-primary">Pedido activo</p>
          </div>
          <div className="flex items-center gap-3">
            <RemoteImage
              src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=60&h=60&fit=crop&auto=format"
              alt="rest"
              className="w-14 h-14 rounded-xl"
              sizes="56px"
            />
            <div className="flex-1">
              <p className="font-bold text-gray-900">La Paloma Gastrobar</p>
              <p className="text-sm text-muted-foreground">Mesa 12 · 4 items</p>
              <div className="flex items-center gap-1 mt-1">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="text-sm text-primary font-semibold">~18 min restantes</span>
              </div>
            </div>
          </div>
          <button onClick={goOrderSummary} className="w-full mt-3 bg-white border border-orange-200 rounded-xl py-2.5 text-sm font-semibold text-primary hover:bg-orange-50 transition-colors">
            Ver estado del pedido
          </button>
        </div>

        {/* History */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="font-semibold text-gray-900">Historial de pedidos</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 divide-y md:divide-y-0 divide-border">
            {ORDER_HISTORY.map((order, i) => (
              <div key={i} className="px-4 py-3.5 border-b last:border-b-0 md:border-b-0 md:border-r last:border-r-0 border-border">
                <div className="flex gap-3">
                  <RemoteImage src={order.img} alt={order.restaurant} className="w-12 h-12 rounded-xl flex-shrink-0" sizes="48px" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-gray-900">{order.restaurant}</p>
                      <p className="text-sm font-bold text-gray-900">${order.total.toLocaleString()}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{order.items}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">{order.date}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <Star key={si} className={`w-3 h-3 ${si < order.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <button className="w-full mt-2 bg-gray-50 border border-gray-200 rounded-xl py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors">Repetir pedido</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
