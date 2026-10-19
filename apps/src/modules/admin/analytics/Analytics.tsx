"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, Heart, RefreshCw, Store, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SurfaceCard as Card } from "@/shared/components";
import { SectionHeader } from "@/modules/admin/ui/SectionHeader";
import { StatCard } from "@/modules/admin/ui/StatCard";
import { ChartTooltip } from "@/modules/admin/ui/ChartTooltip";
import { adminService, type LocationReview } from "@/shared/services";
import {
  statisticsService,
  type AffiliateRow,
  type TrendsStatistics,
} from "@/shared/services/statistics/statistics.service";

const today = new Date();
const asDate = (date: Date) =>
  new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
const start = new Date(today);
start.setDate(start.getDate() - 29);
const money = (value: number) => `$${value.toLocaleString("es-CO", { maximumFractionDigits: 0 })}`;

export function Analytics() {
  const [desde, setDesde] = useState(asDate(start));
  const [hasta, setHasta] = useState(asDate(today));
  const [trends, setTrends] = useState<TrendsStatistics | null>(null);
  const [locations, setLocations] = useState<LocationReview[]>([]);
  const [restaurants, setRestaurants] = useState<AffiliateRow[]>([]);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState("");
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
      statisticsService.trends(desde, hasta, selectedRestaurantId || undefined),
      statisticsService.affiliates(desde, hasta, "restaurante"),
      adminService.listLocationReviews(),
    ])
      .then(([trendResponse, restaurantResponse, locationResponse]) => {
        if (!active) return;
        setTrends(trendResponse.data);
        setRestaurants(restaurantResponse.data.filas);
        setLocations(locationResponse);
        setSelectedRestaurantId((current) =>
          locationResponse.some((location) => location.restaurant.id === current) ? current : "",
        );
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "No se pudo cargar la analítica.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [desde, hasta, selectedRestaurantId, invalid, retry]);

  const activity = trends?.serie ?? [];
  const activeUsers = activity.reduce((sum, point) => sum + point.usuariosActivos, 0);
  const newUsers = activity.reduce((sum, point) => sum + point.usuariosNuevos, 0);
  const likes = activity.reduce((sum, point) => sum + point.likes, 0);
  const filteredRestaurants = useMemo(
    () => restaurants.filter((row) => !selectedRestaurantId || row.afiliadoId === selectedRestaurantId),
    [restaurants, selectedRestaurantId],
  );
  const restaurantOptions = useMemo(
    () => Array.from(new Map(locations.map((location) => [location.restaurant.id, {
      id: location.restaurant.id,
      name: location.restaurant.businessName,
    }])).values()).sort((a, b) => a.name.localeCompare(b.name, "es")),
    [locations],
  );
  const totals = filteredRestaurants.reduce(
    (sum, row) => ({
      gross: sum.gross + (row.montoBruto ?? 0),
      commission: sum.commission + row.comisionOPago,
      orders: sum.orders + row.pedidos,
    }),
    { gross: 0, commission: 0, orders: 0 },
  );

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Tendencias de usuarios"
        sub="Actividad de plataforma e ingresos por restaurante"
      />

      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-gray-100 bg-white p-4">
        <label className="grid gap-1 text-xs text-gray-500">
          Desde
          <input aria-label="Desde" type="date" value={desde} max={hasta} onChange={(event) => setDesde(event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800" />
        </label>
        <label className="grid gap-1 text-xs text-gray-500">
          Hasta
          <input aria-label="Hasta" type="date" value={hasta} min={desde} onChange={(event) => setHasta(event.target.value)} className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-800" />
        </label>
        <label className="grid gap-1 text-xs text-gray-500">
          Restaurante
          <select value={selectedRestaurantId} onChange={(event) => setSelectedRestaurantId(event.target.value)} className="min-w-56 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800">
            <option value="">Todos los restaurantes</option>
            {restaurantOptions.map((restaurant) => (
              <option key={restaurant.id} value={restaurant.id}>{restaurant.name}</option>
            ))}
          </select>
        </label>
        {loading && <span className="flex items-center gap-2 pb-2 text-sm text-gray-500"><RefreshCw size={14} className="animate-spin" /> Consultando…</span>}
      </div>

      {invalid && <p role="alert" className="text-sm text-red-600">La fecha final debe ser igual o posterior a la inicial.</p>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}<button className="ml-2 underline" onClick={() => setRetry((value) => value + 1)}>Reintentar</button></div>}

      {!invalid && !error && trends && <>
        <div>
          <p className="mb-3 text-xs text-gray-500">{selectedRestaurantId ? "Actividad, usuarios e interacciones asociados al restaurante seleccionado." : "Tendencias generales de toda la plataforma."}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard label={selectedRestaurantId ? "Usuarios activos asociados (suma diaria)" : "Actividad acumulada de usuarios por día"} value={activeUsers.toLocaleString("es-CO")} icon={Users} accent />
            <StatCard label={selectedRestaurantId ? "Usuarios nuevos con actividad en el restaurante" : "Usuarios nuevos"} value={newUsers.toLocaleString("es-CO")} icon={Activity} />
            <StatCard label="Interacciones (likes)" value={likes.toLocaleString("es-CO")} icon={Heart} />
          </div>
        </div>

        <Card className="p-5">
          <h3 className="mb-1 text-sm font-semibold text-gray-900">{selectedRestaurantId ? "Actividad diaria del restaurante" : "Actividad diaria de la plataforma"}</h3>
          <p className="mb-4 text-xs text-gray-500">Usuarios activos asociados, usuarios nuevos y publicaciones{selectedRestaurantId ? " del restaurante" : " nuevas"}</p>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={activity} margin={{ left: -20, right: 8 }}>
              <defs><linearGradient id="activeFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#FF6B35" stopOpacity={0.2} /><stop offset="95%" stopColor="#FF6B35" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F3F5" />
              <XAxis dataKey="fecha" tick={{ fontSize: 10 }} tickFormatter={(value: string) => value.slice(5)} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="usuariosActivos" name="Usuarios activos" stroke="#FF6B35" fill="url(#activeFill)" />
              <Area type="monotone" dataKey="publicaciones" name="Publicaciones" stroke="#5B8DEF" fill="transparent" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
            <div><h3 className="text-sm font-semibold text-gray-900">Ingresos y pedidos por restaurante</h3><p className="text-xs text-gray-500">El filtro usa el rango de fechas seleccionado</p></div>
            {selectedRestaurantId && <span className="rounded-full bg-[#FFF1EB] px-3 py-1 text-xs font-medium text-[#D94F1B]">{restaurantOptions.find((row) => row.id === selectedRestaurantId)?.name}</span>}
          </div>
          {filteredRestaurants.length === 0 ? <p className="p-6 text-center text-sm text-gray-500">No hay restaurantes con pedidos en este período.</p> : <>
            <div className="grid grid-cols-1 gap-3 border-b border-gray-100 p-4 sm:grid-cols-3">
              <Summary label="Ingresos brutos" value={money(totals.gross)} />
              <Summary label="Comisiones" value={money(totals.commission)} />
              <Summary label="Pedidos" value={totals.orders.toLocaleString("es-CO")} />
            </div>
            <div className="overflow-x-auto"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-gray-50 text-xs text-gray-500"><tr><th className="px-5 py-3 font-medium">Restaurante</th><th className="px-5 py-3 text-right font-medium">Ingresos brutos</th><th className="px-5 py-3 text-right font-medium">Comisión</th><th className="px-5 py-3 text-right font-medium">Pedidos</th></tr></thead><tbody className="divide-y divide-gray-100">{filteredRestaurants.map((row) => <tr key={row.afiliadoId}><td className="px-5 py-3 font-medium text-gray-900"><span className="inline-flex items-center gap-2"><Store size={14} className="text-gray-400" />{row.nombre}</span></td><td className="px-5 py-3 text-right text-gray-700">{money(row.montoBruto ?? 0)}</td><td className="px-5 py-3 text-right text-gray-700">{money(row.comisionOPago)}</td><td className="px-5 py-3 text-right text-gray-700">{row.pedidos}</td></tr>)}</tbody></table></div>
          </>}
        </Card>

        <Card>
          <div className="border-b border-gray-100 px-5 py-4"><h3 className="text-sm font-semibold text-gray-900">Contenido más visto e interactuado</h3><p className="text-xs text-gray-500">Ordenado por visualizaciones y likes · {selectedRestaurantId ? "Restaurante seleccionado" : "Plataforma"}</p></div>
          {trends.topContenido.length === 0 ? <p className="p-6 text-center text-sm text-gray-500">No hay publicaciones con vistas o interacciones en este período.</p> : <div className="divide-y divide-gray-50">{trends.topContenido.map((post, index) => <div key={post.postId} className="flex items-center gap-4 px-5 py-4"><span className="w-7 text-sm font-semibold text-gray-400">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-gray-900">{post.descripcion || "Publicación sin descripción"}</p><p className="text-xs text-gray-500">{post.autor}{post.sede ? ` · ${post.sede}` : ""}</p><p className="mt-1 text-xs text-gray-400">{post.imagenes} imágenes · {post.videos} videos</p></div><span className="text-right text-xs font-semibold text-[#FF6B35]">◉ {post.visualizaciones} · ♥ {post.likes}</span></div>)}</div>}
        </Card>
      </>}
    </div>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl bg-gray-50 p-4"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 text-lg font-semibold text-gray-900">{value}</p></div>;
}
