"use client";

import { AlertCircle, CreditCard, DollarSign, Download, Percent, RefreshCw } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { StatusBadge as Badge, SurfaceCard as Card } from "@parchemos/shared/components";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { ChartTooltip } from "@/components/ChartTooltip";
import { ordersData } from "@/lib/shared-mock-data";
import { paymentMethodBreakdown, transactions } from "./data";

const ACCENT = "#FF6B35";

export function Finances() {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Finanzas"
        sub="Ingresos, comisiones, reembolsos y transacciones"
        action={
          <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Download size={13} /> Exportar reporte
          </button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Ingresos del mes" value="$28.4M" change="+22.3%" up icon={DollarSign} accent />
        <StatCard label="Comisiones" value="$2.84M" sub="10% promedio" change="+19.1%" up icon={Percent} />
        <StatCard label="Reembolsos" value="$124K" sub="14 transacciones" change="+2.1%" up={false} icon={RefreshCw} />
        <StatCard label="Pagos fallidos" value="$84K" sub="8 transacciones" change="-12.4%" up icon={AlertCircle} />
      </div>

      <div className="grid xl:grid-cols-3 gap-5">
        <Card className="xl:col-span-2 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-[14px] font-semibold text-gray-900">Ingresos diarios</h3>
            <div className="flex items-center gap-2 text-[12px] text-gray-500">
              <span className="text-[13px] font-semibold text-gray-900">$8.34M</span> esta semana
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={ordersData} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={ACCENT} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v / 1000}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Ingresos" stroke={ACCENT} strokeWidth={2} fill="url(#gRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-4">Resumen</h3>
          <div className="space-y-3">
            {paymentMethodBreakdown.map(p => (
              <div key={p.label} className="flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-medium text-gray-800">{p.label}</div>
                  <div className="text-[11px] text-gray-400">{p.val} del total</div>
                </div>
                <span className="text-[13px] font-semibold text-gray-900">{p.amount}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-[14px] font-semibold text-gray-900">Transacciones recientes</h3>
          <button className="text-[12px] text-[#FF6B35] font-medium">Ver todas</button>
        </div>
        <div className="divide-y divide-gray-50">
          {transactions.map(t => (
            <div key={t.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50/50">
              <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                <CreditCard size={14} className="text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-gray-900">{t.restaurant}</div>
                <div className="text-[11px] text-gray-400">
                  {t.id} · {t.date}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-semibold text-gray-900">${t.amount.toLocaleString("es-CO")}</div>
                <div className="text-[11px] text-emerald-600">+${t.commission.toLocaleString("es-CO")} comisión</div>
              </div>
              <Badge status={t.status} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
