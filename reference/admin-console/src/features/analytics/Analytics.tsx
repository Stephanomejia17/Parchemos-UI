"use client";

import { Activity, DollarSign, Target, TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SurfaceCard as Card } from "@parchemos/shared/components";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { ChartTooltip } from "@/components/ChartTooltip";
import { cityRevData } from "@/lib/shared-mock-data";
import { funnelSteps, retentionData } from "./data";

const ACCENT = "#FF6B35";

const RETENTION_LEGEND = [
  { label: "D7", color: ACCENT },
  { label: "D30", color: "#212529" },
  { label: "D90", color: "#ADB5BD" },
];

export function Analytics() {
  return (
    <div className="space-y-6">
      <SectionHeader title="Analítica de plataforma" sub="Métricas clave, retención, embudos y rendimiento" />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Usuarios activos (30d)" value="32,100" change="+14.6%" up icon={Activity} accent />
        <StatCard label="Retención 7 días" value="88%" change="+3.2pp" up icon={TrendingUp} />
        <StatCard label="Ticket promedio" value="$68.400" change="+5.1%" up icon={DollarSign} />
        <StatCard label="Tasa de conversión" value="27%" change="-1.2pp" up={false} icon={Target} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-1">Retención de usuarios</h3>
          <p className="text-[12px] text-gray-500 mb-4">Tasas de retención D7, D30 y D90</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={retentionData} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} domain={[20, 100]} />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="r7" name="D7" stroke={ACCENT} strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="r30" name="D30" stroke="#212529" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="r90" name="D90" stroke="#ADB5BD" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-3">
            {RETENTION_LEGEND.map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-gray-500">
                <span className="w-3 h-0.5 rounded" style={{ background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-[14px] font-semibold text-gray-900 mb-1">Ingresos por ciudad</h3>
          <p className="text-[12px] text-gray-500 mb-4">Millones COP — últimos 30 días</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={cityRevData} layout="vertical" margin={{ top: 4, right: 24, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="city" type="category" tick={{ fontSize: 11, fill: "#6C757D" }} axisLine={false} tickLine={false} width={80} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="revenue" name="Ingresos ($M)" fill={ACCENT} radius={[0, 5, 5, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Funnel */}
      <Card className="p-5">
        <h3 className="text-[14px] font-semibold text-gray-900 mb-1">Embudo de conversión</h3>
        <p className="text-[12px] text-gray-500 mb-5">Registro → Descubrimiento → Reserva → Pedido → Pago</p>
        <div className="flex flex-col gap-2">
          {funnelSteps.map((step, i) => (
            <div key={step.label} className="flex items-center gap-4">
              <div className="w-24 text-right text-[12px] text-gray-500">{step.label}</div>
              <div className="flex-1 h-9 bg-gray-50 rounded-xl overflow-hidden relative">
                <div
                  className="h-full rounded-xl flex items-center justify-end pr-3 transition-all duration-500"
                  style={{
                    width: `${step.pct}%`,
                    background: i === 0 ? ACCENT : `rgba(255,107,53,${1 - i * 0.15})`,
                  }}
                >
                  <span className="text-[11px] font-semibold text-white/90">{step.value.toLocaleString("es-CO")}</span>
                </div>
              </div>
              <div className="w-10 text-left text-[12px] font-semibold" style={{ color: i === 0 ? ACCENT : "#6C757D" }}>
                {step.pct}%
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
