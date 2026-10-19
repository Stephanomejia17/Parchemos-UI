"use client";

import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Store, Truck } from "lucide-react";
import { SurfaceCard as Card } from "@/shared/components";
import { SectionHeader } from "@/modules/admin/ui/SectionHeader";
import { statisticsService, type AffiliateStatistics } from "@/shared/services/statistics/statistics.service";

const today = new Date();
const asDate = (date: Date) => new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
const start = new Date(today); start.setDate(start.getDate() - 29);
const money = (n: number | null) => n == null ? "—" : `$${n.toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;

export function Finances() {
  const [desde, setDesde] = useState(asDate(start)); const [hasta, setHasta] = useState(asDate(today));
  const [tipo, setTipo] = useState(""); const [data, setData] = useState<AffiliateStatistics | null>(null);
  const [afiliadoId, setAfiliadoId] = useState("");
  const [loading, setLoading] = useState(false); const [error, setError] = useState(""); const [retry, setRetry] = useState(0);
  const invalid = desde > hasta;
  useEffect(() => {
    if (invalid) return;
    let alive = true; setLoading(true); setError("");
    statisticsService.affiliates(desde, hasta, tipo).then((r) => { if (alive) setData(r.data); })
      .catch((e: unknown) => { if (alive) setError(e instanceof Error ? e.message : "No se pudieron consultar los ingresos."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [desde, hasta, tipo, invalid, retry]);
  const affiliates = useMemo(() => data?.filas ?? [], [data]);
  const visibleAffiliates = useMemo(() => affiliates.filter((row) => !afiliadoId || row.afiliadoId === afiliadoId), [affiliates, afiliadoId]);
  const gross = visibleAffiliates.reduce((sum, row) => sum + (row.montoBruto ?? 0), 0);
  const payments = visibleAffiliates.reduce((sum, row) => sum + row.comisionOPago, 0);

  return <div className="space-y-5">
    <SectionHeader title="Ingresos de afiliados" sub="Ingresos brutos de restaurantes y pagos a repartidores" />
    <Card className="flex flex-wrap items-end gap-3 p-4">
      <label className="grid gap-1 text-xs text-gray-500">Desde<input type="date" aria-label="Desde" value={desde} max={hasta} onChange={(e) => setDesde(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800" /></label>
      <label className="grid gap-1 text-xs text-gray-500">Hasta<input type="date" aria-label="Hasta" value={hasta} min={desde} onChange={(e) => setHasta(e.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800" /></label>
      <label className="grid gap-1 text-xs text-gray-500">Tipo de afiliado<select value={tipo} onChange={(e) => setTipo(e.target.value)} className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"><option value="">Todos</option><option value="restaurante">Restaurantes</option><option value="repartidor">Repartidores</option></select></label>
      <label className="grid gap-1 text-xs text-gray-500">Afiliado<select value={afiliadoId} onChange={(e) => setAfiliadoId(e.target.value)} className="max-w-64 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800"><option value="">Todos los afiliados</option>{affiliates.map((row) => <option key={row.afiliadoId} value={row.afiliadoId}>{row.nombre} · {row.tipo === "restaurante" ? "Restaurante" : "Repartidor"}</option>)}</select></label>
      {loading && <span className="flex items-center gap-2 pb-2 text-sm text-gray-500"><RefreshCw size={14} className="animate-spin"/> Consultando…</span>}
    </Card>
    {invalid && <p role="alert" className="text-sm text-red-600">La fecha final debe ser igual o posterior a la inicial.</p>}
    {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error} <button className="ml-2 underline" onClick={() => setRetry((x) => x + 1)}>Reintentar</button></p>}
    {data && !loading && !invalid && !error && affiliates.length > 0 && <div className="grid gap-4 sm:grid-cols-2"><Card className="p-5"><p className="text-xs text-gray-500">Ingresos brutos de restaurantes</p><p className="mt-1 text-2xl font-semibold text-gray-900">{money(gross)}</p></Card><Card className="p-5"><p className="text-xs text-gray-500">Comisiones y pagos registrados</p><p className="mt-1 text-2xl font-semibold text-gray-900">{money(payments)}</p><p className="mt-1 text-xs text-gray-400">Comisiones de restaurantes + pagos a repartidores</p></Card></div>}
    {data && !loading && !invalid && !error && visibleAffiliates.length === 0 && <Card className="p-8 text-center"><Store className="mx-auto mb-3 text-gray-400"/><h3 className="font-semibold text-gray-900">Sin información para este período</h3><p className="mt-1 text-sm text-gray-500">No hay afiliados con actividad que coincida con los filtros.</p></Card>}
    {data && visibleAffiliates.length > 0 && <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left"><thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="px-5 py-3 font-medium">Afiliado</th><th className="px-5 py-3 font-medium">Tipo</th><th className="px-5 py-3 text-right font-medium">Monto bruto</th><th className="px-5 py-3 text-right font-medium">Comisión / pago</th><th className="px-5 py-3 text-right font-medium">Pedidos</th></tr></thead><tbody className="divide-y divide-gray-100">{visibleAffiliates.map((row) => <tr key={`${row.tipo}-${row.afiliadoId}`} className="text-sm"><td className="px-5 py-4 font-medium text-gray-900">{row.nombre}</td><td className="px-5 py-4"><span className="inline-flex items-center gap-2 text-gray-600">{row.tipo === "restaurante" ? <Store size={14}/> : <Truck size={14}/>} {row.tipo === "restaurante" ? "Restaurante" : "Repartidor"}</span></td><td className="px-5 py-4 text-right text-gray-700">{money(row.montoBruto)}</td><td className="px-5 py-4 text-right font-medium text-gray-900">{money(row.comisionOPago)}</td><td className="px-5 py-4 text-right text-gray-700">{row.pedidos}</td></tr>)}</tbody></table></div></Card>}
  </div>;
}
