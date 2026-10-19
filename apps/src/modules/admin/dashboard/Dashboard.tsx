"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Heart, RefreshCw, Store, Users } from "lucide-react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer,
  Tooltip, XAxis, YAxis,
} from "recharts";
import { SurfaceCard as Card } from "@/shared/components";
import { StatCard } from "@/modules/admin/ui/StatCard";
import { SectionHeader } from "@/modules/admin/ui/SectionHeader";
import { statisticsService, type AffiliateStatistics, type TrendsStatistics } from "@/shared/services/statistics/statistics.service";

const today = new Date();
const asDate = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
const start = new Date(today); start.setDate(start.getDate() - 29);
const money = (value: number) => `$${value.toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;

export function Dashboard() {
  const [desde, setDesde] = useState(asDate(start));
  const [hasta, setHasta] = useState(asDate(today));
  const [trends, setTrends] = useState<TrendsStatistics | null>(null);
  const [affiliates, setAffiliates] = useState<AffiliateStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const invalid = desde > hasta;

  useEffect(() => {
    if (invalid) return;
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([
      statisticsService.trends(desde, hasta),
      statisticsService.affiliates(desde, hasta, ""),
    ]).then(([trendResponse, affiliateResponse]) => {
      if (!active) return;
      setTrends(trendResponse.data);
      setAffiliates(affiliateResponse.data);
    }).catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar el dashboard.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [desde, hasta, invalid, retry]);

  const resumen = useMemo(() => {
    const serie = trends?.serie ?? [];
    const activosDiarios = serie.reduce((sum, point) => sum + point.usuariosActivos, 0);
    return {
      activosPromedio: serie.length ? Math.round(activosDiarios / serie.length) : 0,
      nuevos: serie.reduce((sum, point) => sum + point.usuariosNuevos, 0),
      likes: serie.reduce((sum, point) => sum + point.likes, 0),
      bruto: (affiliates?.filas ?? []).reduce((sum, row) => sum + (row.montoBruto ?? 0), 0),
    };
  }, [trends, affiliates]);
  const mejoresAfiliados = useMemo(() => [...(affiliates?.filas ?? [])]
    .sort((a, b) => b.comisionOPago - a.comisionOPago).slice(0, 6), [affiliates]);

  return <div className="space-y-6">
    <SectionHeader title="Dashboard de administración" sub="Consolidado de la plataforma: actividad global y ventas de todos los restaurantes" />
    <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-100 bg-white p-4">
      <label className="grid gap-1 text-xs text-gray-500">Desde<input aria-label="Desde" type="date" value={desde} max={hasta} onChange={(event) => setDesde(event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800" /></label>
      <label className="grid gap-1 text-xs text-gray-500">Hasta<input aria-label="Hasta" type="date" value={hasta} min={desde} onChange={(event) => setHasta(event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800" /></label>
      {loading && <span className="flex items-center gap-2 pb-2 text-sm text-gray-500"><RefreshCw size={14} className="animate-spin"/> Actualizando…</span>}
    </div>
    {invalid && <p role="alert" className="text-sm text-red-600">La fecha final debe ser igual o posterior a la inicial.</p>}
    {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}<button onClick={() => setRetry((value) => value + 1)} className="ml-2 underline">Reintentar</button></div>}
    {!error && trends && affiliates && <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Promedio de usuarios activos por día" value={resumen.activosPromedio.toLocaleString("es-CO")} icon={Activity} accent />
        <StatCard label="Usuarios nuevos" value={resumen.nuevos.toLocaleString("es-CO")} icon={Users} />
        <StatCard label="Interacciones (likes)" value={resumen.likes.toLocaleString("es-CO")} icon={Heart} />
        <StatCard label="Ventas brutas de restaurantes" value={money(resumen.bruto)} icon={Store} />
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <Card className="p-5"><h3 className="text-sm font-semibold text-gray-900">Actividad de usuarios</h3><p className="mb-4 mt-1 text-xs text-gray-500">Actividad diaria, nuevos usuarios e interacciones</p>
          <ResponsiveContainer width="100%" height={250}><AreaChart data={trends.serie} margin={{ left: -20, right: 8 }}><defs><linearGradient id="adminActive" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF6B35" stopOpacity={0.18}/><stop offset="95%" stopColor="#FF6B35" stopOpacity={0}/></linearGradient></defs><CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5"/><XAxis dataKey="fecha" tick={{ fontSize: 10 }} tickFormatter={(value: string) => value.slice(5)}/><YAxis allowDecimals={false} tick={{ fontSize: 10 }}/><Tooltip/><Area type="monotone" dataKey="usuariosActivos" name="Usuarios activos" stroke="#FF6B35" fill="url(#adminActive)"/><Area type="monotone" dataKey="usuariosNuevos" name="Usuarios nuevos" stroke="#5667D8" fill="transparent"/><Area type="monotone" dataKey="likes" name="Likes" stroke="#25A879" fill="transparent"/></AreaChart></ResponsiveContainer>
        </Card>
        <Card className="p-5"><h3 className="text-sm font-semibold text-gray-900">Afiliados con actividad</h3><p className="mb-4 mt-1 text-xs text-gray-500">Monto bruto para restaurantes y pago/comisión según tipo de afiliado</p>
          {mejoresAfiliados.length === 0 ? <p className="py-12 text-center text-sm text-gray-500">No hay ingresos de afiliados en este período.</p> : <ResponsiveContainer width="100%" height={250}><BarChart data={mejoresAfiliados} layout="vertical" margin={{ left: 8, right: 16 }}><CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" horizontal={false}/><XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={(value: number) => `${Math.round(value / 1000)}k`}/><YAxis type="category" dataKey="nombre" width={100} tick={{ fontSize: 10 }} tickFormatter={(value: string) => value.length > 15 ? `${value.slice(0, 15)}…` : value}/><Tooltip formatter={(value) => money(Number(value))}/><Bar dataKey="comisionOPago" name="Comisión / pago" fill="#FF6B35" radius={[0, 5, 5, 0]}/></BarChart></ResponsiveContainer>}
        </Card>
      </div>
      <Card><div className="border-b border-gray-100 px-5 py-4"><h3 className="text-sm font-semibold text-gray-900">Contenido más visto e interactuado</h3><p className="text-xs text-gray-500">Ordenado por visualizaciones y likes · incluye actividad sobre publicaciones multimedia</p></div>
        {(trends.topContenido ?? []).length === 0 ? <p className="p-6 text-center text-sm text-gray-500">No hay publicaciones con interacciones en este período.</p> : <div className="divide-y divide-gray-50">{trends.topContenido.slice(0, 5).map((post, index) => <div key={post.postId} className="flex items-center gap-3 px-5 py-3"><span className="w-6 text-sm text-gray-400">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-gray-900">{post.descripcion || "Publicación sin descripción"}</p><p className="text-xs text-gray-500">{post.autor}{post.sede ? ` · ${post.sede}` : ""} · {post.imagenes} imágenes · {post.videos} videos</p></div><span className="text-right text-xs font-semibold text-[#FF6B35]">◉ {post.visualizaciones} · ♥ {post.likes}</span></div>)}</div>}
      </Card>
    </>}
  </div>;
}
