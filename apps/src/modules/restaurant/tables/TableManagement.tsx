"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Download, Loader2, Plus, Power, QrCode } from "lucide-react";
import { apiFetch } from "@/shared/services/http/api-client";

type Table = { id: string; code: string; capacity: number; status: "activa" | "inactiva"; qrImageUrl: string };
type Location = { id: string; name: string };
type Restaurant = { locations: Location[] };
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api").replace(/\/$/, "");

export function TableManagement() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [locationId, setLocationId] = useState("");
  const [tables, setTables] = useState<Table[]>([]);
  const [form, setForm] = useState({ code: "", capacity: "2" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const locations = useMemo(() => restaurants.flatMap((restaurant) => restaurant.locations), [restaurants]);

  useEffect(() => { void loadRestaurants(); }, []);
  useEffect(() => { if (locationId) void loadTables(locationId); }, [locationId]);
  async function loadRestaurants() {
    try { const data = await apiFetch<Restaurant[]>("/restaurantes/mios"); setRestaurants(data); const first = data.flatMap((item) => item.locations)[0]; if (first) setLocationId(first.id); }
    catch { setError("No pudimos cargar las sedes."); } finally { setLoading(false); }
  }
  async function loadTables(id: string) { try { setTables(await apiFetch<Table[]>(`/mesas/sede/${id}`)); } catch { setError("No pudimos cargar las mesas."); } }
  async function createTable(event: FormEvent) { event.preventDefault(); setSaving(true); setError(null); try { await apiFetch(`/mesas/sede/${locationId}`, { method: "POST", body: { code: form.code, capacity: Number(form.capacity) } }); setForm({ code: "", capacity: "2" }); await loadTables(locationId); } catch (cause) { setError(cause instanceof Error ? cause.message : "No pudimos crear la mesa."); } finally { setSaving(false); } }
  async function toggle(table: Table) { await apiFetch(`/mesas/${table.id}`, { method: "PATCH", body: { status: table.status === "activa" ? "inactiva" : "activa" } }); await loadTables(locationId); }
  function download(table: Table) { const link = document.createElement("a"); link.href = `${API_URL}${table.qrImageUrl.replace(/^\/api/, "")}`; link.download = `mesa-${table.code}-qr.png`; link.target = "_blank"; link.click(); }

  if (loading) return <div className="flex items-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Cargando mesas...</div>;
  return <section className="rounded-2xl border border-border bg-white p-4 shadow-sm md:p-6">
    <div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-primary">Operación</p><h2 className="text-xl font-bold text-gray-900">Mesas y códigos QR</h2><p className="mt-1 text-sm text-muted-foreground">Cada QR abre el pedido de su mesa.</p></div><QrCode className="h-8 w-8 text-primary" /></div>
    {locations.length > 1 && <select value={locationId} onChange={(event) => setLocationId(event.target.value)} className="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm">{locations.map((location) => <option key={location.id} value={location.id}>{location.name}</option>)}</select>}
    <form onSubmit={createTable} className="mb-6 flex flex-wrap items-end gap-3 rounded-xl bg-orange-50 p-3"><label className="flex flex-col gap-1 text-xs font-semibold text-gray-700">Código<input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} className="w-28 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" /></label><label className="flex flex-col gap-1 text-xs font-semibold text-gray-700">Capacidad<input required min="1" max="50" type="number" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} className="w-28 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm" /></label><button disabled={saving || !locationId} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"><Plus className="h-4 w-4" />Crear mesa</button></form>
    {error && <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{tables.map((table) => <article key={table.id} className={`rounded-2xl border p-4 ${table.status === "activa" ? "border-border" : "border-gray-200 bg-gray-50 opacity-70"}`}><div className="flex items-start justify-between"><div><h3 className="font-bold text-gray-900">Mesa {table.code}</h3><p className="text-xs text-muted-foreground">Capacidad: {table.capacity} personas</p></div><span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${table.status === "activa" ? "bg-green-50 text-green-700" : "bg-gray-200 text-gray-600"}`}>{table.status === "activa" ? "Activa" : "Inactiva"}</span></div>{table.status === "activa" ? <img src={`${API_URL}${table.qrImageUrl.replace(/^\/api/, "")}`} alt={`Código QR de la mesa ${table.code}`} className="mx-auto my-4 h-40 w-40 rounded-lg border border-gray-100" /> : <div className="my-4 flex h-40 items-center justify-center rounded-lg bg-gray-100 text-center text-xs text-muted-foreground">QR no válido<br />Mesa inactiva</div>}<div className="flex gap-2"><button disabled={table.status !== "activa"} onClick={() => download(table)} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-orange-50 px-2 py-2 text-xs font-semibold text-primary disabled:opacity-50"><Download className="h-3.5 w-3.5" />Descargar QR</button><button onClick={() => void toggle(table)} className="rounded-xl bg-gray-100 p-2 text-gray-700" aria-label="Cambiar estado"><Power className="h-4 w-4" /></button></div></article>)}</div>
  </section>;
}
