"use client";

import { useRouter } from "next/navigation";
import { ChevronLeft, DollarSign, ShoppingBag, Calendar, Star, ArrowUp, Utensils } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { CustomerBadge as Badge } from "@parchemos/shared/components";
import { SALES_DATA } from "./data";

const KPIS = [
  { label: "Ventas hoy", value: "$3.12M", change: "+18%", icon: DollarSign },
  { label: "Pedidos", value: "128", change: "+24", icon: ShoppingBag },
  { label: "Reservas", value: "34", change: "+5", icon: Calendar },
  { label: "Rating", value: "4.9 ⭐", change: "+0.1", icon: Star },
];

const ACTIVE_ORDERS = [
  { table: "Mesa 3", order: "2x Smash Burger, 1x Papas", time: "8 min", status: "cooking" },
  { table: "Mesa 7", order: "1x Double BBQ, 2x Milkshake", time: "14 min", status: "ready" },
  { table: "Mesa 11", order: "3x Smash Clásica, 3x Aros", time: "3 min", status: "new" },
];

export function ProfileDashboard() {
  const router = useRouter();
  const totalVentas = SALES_DATA.reduce((a, b) => a + b.ventas, 0);
  const totalPedidos = SALES_DATA.reduce((a, b) => a + b.pedidos, 0);

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-border sticky top-0 z-10 md:px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-gray-900" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-gray-900 font-heading">Dashboard Admin</h2>
            <p className="text-xs text-muted-foreground">La Paloma Gastrobar</p>
          </div>
          <div className="ml-auto">
            <Badge color="green">En línea</Badge>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6 flex flex-col gap-4">
        {/* KPIs — 2 cols on mobile, 4 on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {KPIS.map((kpi, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-border shadow-sm">
              <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
              <p className="text-xl font-bold text-gray-900">{kpi.value}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUp className="w-3 h-3 text-accent" />
                <span className="text-xs font-semibold text-accent">{kpi.change}</span>
                <span className="text-xs text-muted-foreground">vs ayer</span>
              </div>
            </div>
          ))}
        </div>

        {/* Charts — stack on mobile, side by side on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900">Ventas esta semana</p>
              <span className="text-xs text-primary font-semibold">${(totalVentas / 1000000).toFixed(1)}M total</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={SALES_DATA}>
                <defs>
                  <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B35" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#FF6B35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6C757D" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v: number) => [`$${(v / 1000).toFixed(0)}K`, "Ventas"]} contentStyle={{ borderRadius: 12, border: "1px solid #E9ECEF", fontSize: 12 }} />
                <Area type="monotone" dataKey="ventas" stroke="#FF6B35" strokeWidth={2.5} fill="url(#salesGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-border shadow-sm p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="font-semibold text-gray-900">Pedidos por día</p>
              <span className="text-xs text-primary font-semibold">{totalPedidos} esta semana</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={SALES_DATA} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#6C757D" }} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip formatter={(v: number) => [v, "Pedidos"]} contentStyle={{ borderRadius: 12, border: "1px solid #E9ECEF", fontSize: 12 }} />
                <Bar dataKey="pedidos" fill="#F4B400" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Active orders */}
        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="font-semibold text-gray-900">Pedidos activos</p>
            <Badge color="orange">12 pendientes</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {ACTIVE_ORDERS.map((order, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Utensils className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{order.table}</p>
                  <p className="text-xs text-muted-foreground truncate">{order.order}</p>
                </div>
                <div className="text-right">
                  <Badge color={order.status === "ready" ? "green" : order.status === "new" ? "blue" : "yellow"}>
                    {order.status === "ready" ? "Listo" : order.status === "new" ? "Nuevo" : "Preparando"}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">{order.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
