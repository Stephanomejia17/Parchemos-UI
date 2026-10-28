"use client";

import { useEffect, useState } from "react";
import { AlertCircle, DollarSign, Percent, RefreshCw, ShoppingBag } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { AiInsightsPanel, SurfaceCard as Card } from "@/shared/components";
import { statisticsService, type RestaurantStatistics as Statistics } from "@/shared/services/statistics/statistics.service";

const today = new Date();
const asDate = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
const start = new Date(today); start.setDate(start.getDate() - 29);
const money = (value: number) => `$${value.toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;

export function ProfileDashboard() {
  const [desde, setDesde] = useState(asDate(start));
  const [hasta, setHasta] = useState(asDate(today));
  const [data, setData] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const invalid = desde > hasta;

  useEffect(() => {
    if (invalid) return;
    let active = true;
    setLoading(true);
    setError("");
    setData(null);
    statisticsService.restaurant(desde, hasta)
      .then((response) => { if (active) setData(response.data); })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar el dashboard."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [desde, hasta, invalid, retry]);

  const totals = data?.totales;
  return <div className="flex h-full flex-col overflow-y-auto bg-background">
    <div className="flex flex-col gap-4 p-4 md:gap-5 md:p-6">
      <Card className="flex flex-wrap items-end gap-3 p-4">
        <label className="flex flex-col gap-1 text-xs text-gray-500">Desde<input type="date" aria-label="Desde" value={desde} max={hasta} onChange={(event) => setDesde(event.target.value)} className="box-border h-10 w-44 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800" /></label>
        <label className="flex flex-col gap-1 text-xs text-gray-500">Hasta<input type="date" aria-label="Hasta" value={hasta} min={desde} onChange={(event) => setHasta(event.target.value)} className="box-border h-10 w-44 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800" /></label>
        {loading && <span className="flex items-center gap-2 pb-2 text-sm text-gray-500"><RefreshCw size={14} className="animate-spin"/> Actualizando…</span>}
      </Card>
      {invalid && <p role="alert" className="text-sm text-red-600">La fecha final debe ser igual o posterior a la inicial.</p>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}<button onClick={() => setRetry((value) => value + 1)} className="ml-2 underline">Reintentar</button></div>}
      <AiInsightsPanel scope="restaurante" desde={desde} hasta={hasta} disabled={invalid} />
      {data && !data.sinDatos && totals && <>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Metric icon={DollarSign} label="Ingresos brutos" value={money(totals.ingresosBrutos)}/>
          <Metric icon={Percent} label="Comisiones" value={money(totals.comisionTotal)}/>
          <Metric icon={ShoppingBag} label="Pedidos" value={totals.pedidos.toLocaleString("es-CO")}/>
        </div>
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Card className="p-4 md:p-5"><h2 className="font-semibold text-gray-900">Ingresos y comisiones</h2><p className="mb-4 mt-1 text-xs text-gray-500">Valores diarios para el período seleccionado</p>
            <ResponsiveContainer width="100%" height={220}><AreaChart data={data.serie} margin={{ left: 2, right: 10 }}><defs><linearGradient id="restaurantDashboardGross" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF6B35" stopOpacity={0.18}/><stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5"/><XAxis dataKey="fecha" tick={{ fontSize: 10 }} tickFormatter={(value: string) => value.slice(5)}/><YAxis tick={{ fontSize: 10 }} tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}/><Tooltip formatter={(value) => money(Number(value))}/><Area type="monotone" dataKey="ingresosBrutos" name="Ingresos brutos" stroke="#FF6B35" fill="url(#restaurantDashboardGross)"/><Area type="monotone" dataKey="comision" name="Comisión" stroke="#5667D8" fill="transparent"/></AreaChart></ResponsiveContainer>
          </Card>
          <Card className="p-4 md:p-5"><h2 className="font-semibold text-gray-900">Pedidos por día</h2><p className="mb-4 mt-1 text-xs text-gray-500">Pedidos no cancelados con comisión o total registrado</p>
            <ResponsiveContainer width="100%" height={220}><BarChart data={data.serie} margin={{ left: 2, right: 10 }}><CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" vertical={false}/><XAxis dataKey="fecha" tick={{ fontSize: 10 }} tickFormatter={(value: string) => value.slice(5)}/><YAxis allowDecimals={false} tick={{ fontSize: 10 }}/><Tooltip/><Bar dataKey="pedidos" name="Pedidos" fill="#F4B400" radius={[5, 5, 0, 0]}/></BarChart></ResponsiveContainer>
          </Card>
        </div>
        <Card className="overflow-hidden"><div className="border-b border-gray-100 px-4 py-3 md:px-5"><h2 className="font-semibold text-gray-900">Detalle diario</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="px-4 py-3 font-medium">Fecha</th><th className="px-4 py-3 text-right font-medium">Ingresos brutos</th><th className="px-4 py-3 text-right font-medium">Comisión</th><th className="px-4 py-3 text-right font-medium">Pedidos</th></tr></thead><tbody className="divide-y divide-gray-100">{data.serie.filter((point) => point.pedidos > 0).map((point) => <tr key={point.fecha}><td className="px-4 py-3 text-gray-700">{new Date(`${point.fecha}T12:00:00`).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })}</td><td className="px-4 py-3 text-right text-gray-700">{money(point.ingresosBrutos)}</td><td className="px-4 py-3 text-right text-gray-700">{money(point.comision)}</td><td className="px-4 py-3 text-right text-gray-700">{point.pedidos}</td></tr>)}</tbody></table></div></Card>
      </>}
      {data?.sinDatos && !loading && !error && <Card className="p-8 text-center"><AlertCircle className="mx-auto mb-3 text-gray-400"/><h2 className="font-semibold text-gray-900">Sin ventas en este período</h2><p className="mt-1 text-sm text-gray-500">No hay pedidos no cancelados registrados en las fechas seleccionadas.</p></Card>}
    </div>
  </div>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof DollarSign; label: string; value: string }) {
  return <Card className="p-4"><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF1EB]"><Icon size={17} className="text-[#FF6B35]"/></div><p className="text-xl font-bold text-gray-900">{value}</p><p className="mt-1 text-xs text-muted-foreground">{label}</p></Card>;
}
