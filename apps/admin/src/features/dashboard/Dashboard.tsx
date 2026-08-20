"use client";

import { Activity, AlertCircle, Calendar, CreditCard, DollarSign, Headphones, Package, Store, TrendingUp, User, Users } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SurfaceCard as Card, STATUS_COLORS } from "@parchemos/shared/components";
import { StatCard } from "@/components/StatCard";
import { ChartTooltip } from "@/components/ChartTooltip";
import { alerts, cityRevData, ordersData } from "@/lib/shared-mock-data";
import { categoryData, recentActivity, userGrowthData } from "./data";

const ACCENT = "#FF6B35";

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard label="Usuarios registrados" value="44,100" change="+18.2%" up icon={Users} />
        <StatCard label="Usuarios activos" value="32,100" change="+14.6%" up icon={Activity} accent />
        <StatCard label="Restaurantes" value="1,284" sub="948 verificados" change="+8.4%" up icon={Store} />
        <StatCard label="Pedidos hoy" value="538" change="+12.1%" up icon={Package} />
        <StatCard label="Reservas hoy" value="214" change="+6.8%" up icon={Calendar} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard label="Pagos procesados" value="$8.4M" change="+22.3%" up icon={CreditCard} accent />
        <StatCard label="Comisiones del mes" value="$842K" change="+19.1%" up icon={DollarSign} />
        <StatCard label="Ticket promedio" value="$68.400" change="+5.2%" up icon={TrendingUp} />
        <StatCard label="Tickets de soporte" value="24 abiertos" change="-8.4%" up={false} icon={Headphones} />
      </div>

      {/* Alerts */}
      {alerts.map((a, i) => (
        <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-[13px] ${STATUS_COLORS[a.level]}`}>
          <AlertCircle size={15} className="flex-shrink-0" />
          <span className="flex-1">{a.message}</span>
          <button className="font-medium underline underline-offset-2 flex-shrink-0">{a.action}</button>
        </div>
      ))}

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-[14px] font-semibold text-gray-900">Crecimiento de usuarios</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">Usuarios registrados vs. activos — 2024</p>
            </div>
            <span className="text-[11px] text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Últimos 8 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={userGrowthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT} stopOpacity={0.12} />
                  <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gActive" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#212529" stopOpacity={0.08} />
                  <stop offset="95%" stopColor="#212529" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="users" name="Registrados" stroke={ACCENT} strokeWidth={2} fill="url(#gUsers)" />
              <Area type="monotone" dataKey="active" name="Activos" stroke="#212529" strokeWidth={2} fill="url(#gActive)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[14px] font-semibold text-gray-900">Pedidos por día</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ordersData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="orders" name="Pedidos" fill={ACCENT} radius={[5, 5, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Activity */}
        <Card className="xl:col-span-2 p-5">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Actividad reciente</h3>
          <div className="space-y-0">
            {recentActivity.map((item, i) => (
              <div key={i} className={`flex items-start gap-3 py-3 ${i < recentActivity.length - 1 ? "border-b border-gray-50" : ""}`}>
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.type === "alert" ? "bg-amber-50" : item.type === "payment" ? "bg-emerald-50" : "bg-gray-50"
                  }`}
                >
                  {item.type === "user" && <User size={12} className="text-gray-500" />}
                  {item.type === "restaurant" && <Store size={12} className="text-gray-500" />}
                  {item.type === "payment" && <DollarSign size={12} className="text-emerald-600" />}
                  {item.type === "alert" && <AlertCircle size={12} className="text-amber-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] text-gray-700">{item.text}</p>
                </div>
                <span className="text-[11px] text-gray-400 flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* City breakdown */}
        <Card className="p-5">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Ingresos por ciudad</h3>
          <div className="space-y-3">
            {cityRevData.map((c, i) => (
              <div key={c.city}>
                <div className="flex items-center justify-between text-[12px] mb-1.5">
                  <span className="text-gray-700 font-medium">{c.city}</span>
                  <span className="text-gray-500">${c.revenue}M</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(c.revenue / 142) * 100}%`,
                      backgroundColor: i === 0 ? ACCENT : `rgba(33,37,41,${0.7 - i * 0.12})`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-50">
            <h4 className="text-[13px] font-medium text-gray-700 mb-3">Categorías top</h4>
            <div className="flex items-center gap-3">
              <div className="w-20 h-20 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={22} outerRadius={36} dataKey="value" strokeWidth={0}>
                      {categoryData.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1.5">
                {categoryData.slice(0, 4).map(c => (
                  <div key={c.name} className="flex items-center gap-1.5 text-[11px]">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: c.color }} />
                    <span className="text-gray-600">{c.name}</span>
                    <span className="text-gray-400 ml-auto">{c.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
