"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Download, Percent, ShoppingBag, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { SurfaceCard as Card } from "@/shared/components";
import { statisticsService, type RestaurantStatistics as Data } from "@/shared/services/statistics/statistics.service";
import { restaurantService } from "@/shared/services/restaurant/restaurant.service";
import type { Restaurant } from "@/shared/types/restaurant";

const today = new Date();
const dateValue = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
const initial = new Date(today); initial.setDate(initial.getDate() - 29);
const money = (n: number) => `$${n.toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;

export function RestaurantStatistics() {
  const [desde, setDesde] = useState(dateValue(initial)); const [hasta, setHasta] = useState(dateValue(today));
  const [data, setData] = useState<Data | null>(null); const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); const [retry, setRetry] = useState(0); const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState(""); const [failedFormat, setFailedFormat] = useState<"pdf" | "xlsx">("pdf"); const invalid = desde > hasta;
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]); const [restauranteId, setRestauranteId] = useState(""); const [restaurantsError, setRestaurantsError] = useState("");
  useEffect(() => {
    let alive = true;
    restaurantService.listMyRestaurants().then((items) => { if (alive) setRestaurants(items); })
      .catch((e: unknown) => { if (alive) setRestaurantsError(e instanceof Error ? e.message : "No se pudieron cargar tus restaurantes."); });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    if (invalid) return;
    let alive = true; setLoading(true); setError(""); setData(null);
    statisticsService.restaurant(desde, hasta, restauranteId || undefined).then((r) => { if (alive) setData(r.data); })
      .catch((e: unknown) => { if (alive) setError(e instanceof Error ? e.message : "No se pudieron consultar las estadísticas."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [desde, hasta, restauranteId, invalid, retry]);
  async function download(formato: "pdf" | "xlsx") {
    setDownloading(true); setDownloadError(""); setFailedFormat(formato);
    try { await statisticsService.downloadRestaurantReport(desde, hasta, formato, restauranteId || undefined); }
    catch (e) { setDownloadError(e instanceof Error ? e.message : "No se pudo generar el reporte. Intenta nuevamente."); }
    finally { setDownloading(false); }
  }
  const metrics = data?.totales;
  return <div className="space-y-5 p-4 md:p-6">
    <div><h1 className="text-xl font-bold text-gray-900">Ingresos y comisiones</h1><p className="mt-1 text-sm text-gray-500">Ventas registradas, comisiones descontadas y reportes de tu restaurante</p></div>
    <Card className="flex flex-wrap items-end gap-3 p-4">
      <label className="flex flex-col gap-1 text-xs text-gray-500">Restaurante<select aria-label="Restaurante" value={restauranteId} onChange={(e) => setRestauranteId(e.target.value)} className="box-border h-10 w-60 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800"><option value="">Todos mis restaurantes</option>{restaurants.map((restaurant) => <option key={restaurant.id} value={restaurant.id}>{restaurant.businessName}</option>)}</select></label>
      <label className="flex flex-col gap-1 text-xs text-gray-500">Desde<input type="date" aria-label="Desde" value={desde} max={hasta} onChange={(e) => setDesde(e.target.value)} className="box-border h-10 w-44 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800" /></label>
      <label className="flex flex-col gap-1 text-xs text-gray-500">Hasta<input type="date" aria-label="Hasta" value={hasta} min={desde} onChange={(e) => setHasta(e.target.value)} className="box-border h-10 w-44 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800" /></label>
      <div className="flex h-10 items-center gap-2"><button disabled={downloading || loading || invalid || !data || data.sinDatos} onClick={() => void download("pdf")} className="flex h-10 items-center gap-2 rounded-xl bg-[#FF6B35] px-3 text-sm font-semibold text-white disabled:opacity-50"><Download size={15}/>{downloading ? "Generando…" : "Descargar PDF"}</button><button disabled={downloading || loading || invalid || !data || data.sinDatos} onClick={() => void download("xlsx")} className="h-10 rounded-xl border border-gray-200 px-3 text-sm font-semibold text-gray-700 disabled:opacity-50">Excel</button></div>
      {loading && <span className="pb-2 text-sm text-gray-500">Actualizando…</span>}
    </Card>
    {restaurantsError && <p role="alert" className="text-sm text-amber-700">{restaurantsError} Se muestran los datos consolidados de tu cuenta.</p>}
    {invalid && <p role="alert" className="text-sm text-red-600">La fecha final debe ser igual o posterior a la inicial. No se consultarán datos ni se generará el reporte.</p>}
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}<button onClick={() => setRetry((x) => x + 1)} className="ml-2 underline">Reintentar</button></div>}
    {downloadError && <div role="alert" className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><span>{downloadError}</span><button disabled={downloading} onClick={() => void download(failedFormat)} className="ml-3 underline">Reintentar {failedFormat === "pdf" ? "PDF" : "Excel"}</button></div>}
    {data && !data.sinDatos && metrics && <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3"><Metric icon={TrendingUp} label="Ingresos brutos" value={money(metrics.ingresosBrutos)}/><Metric icon={Percent} label="Comisión total" value={money(metrics.comisionTotal)}/><Metric icon={ShoppingBag} label="Pedidos" value={metrics.pedidos.toLocaleString("es-CO")}/></div>
      <Card className="p-5"><h2 className="font-semibold text-gray-900">Tendencia de ventas</h2><p className="mb-4 text-xs text-gray-500">Ingresos brutos y comisiones por día · COP</p><ResponsiveContainer width="100%" height={260}><AreaChart data={data.serie} margin={{ left: 4, right: 12 }}><defs><linearGradient id="restaurantGross" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF6B35" stopOpacity={0.2}/><stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5"/><XAxis dataKey="fecha" tick={{ fontSize: 10 }} tickFormatter={(v: string) => v.slice(5)}/><YAxis tick={{ fontSize: 10 }} tickFormatter={(v: number) => `${Math.round(v / 1000)}k`}/><Tooltip formatter={(value) => money(Number(value))}/><Area type="monotone" dataKey="ingresosBrutos" name="Ingresos brutos" stroke="#FF6B35" fill="url(#restaurantGross)"/><Area type="monotone" dataKey="comision" name="Comisión" stroke="#5667D8" fill="transparent"/></AreaChart></ResponsiveContainer></Card>
    </>}
    {data?.sinDatos && !loading && !error && <Card className="p-8 text-center"><AlertCircle className="mx-auto mb-3 text-gray-400"/><h2 className="font-semibold text-gray-900">Sin ventas en este período</h2><p className="mt-1 text-sm text-gray-500">Prueba con otro rango de fechas. Cuando haya pedidos registrados, verás aquí los ingresos y comisiones.</p></Card>}
  </div>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof TrendingUp; label: string; value: string }) {
  return <Card className="p-5"><div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#FFF1EB]"><Icon size={17} className="text-[#FF6B35]"/></div><p className="text-2xl font-semibold text-gray-900">{value}</p><p className="mt-1 text-sm text-gray-500">{label}</p></Card>;
}
