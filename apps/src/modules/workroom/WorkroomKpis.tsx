"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, ClipboardList, Clock3, Users } from "lucide-react";
import { SurfaceCard } from "@/shared/components";
import {
  orderService,
  subscribeToNewOrders,
  subscribeToOrderStatus,
  type LocationSummary,
} from "@/shared/services";

/** Respaldo por si el canal en tiempo real se cae. */
const POLL_INTERVAL_MS = 60_000;

/** GP-05: indicadores del día de la sede, calculados por la API. */
export function WorkroomKpis({ locationId }: { locationId: string }) {
  const [summary, setSummary] = useState<LocationSummary | null>(null);

  const load = useCallback(async () => {
    try {
      const { data } = await orderService.getLocationSummary(locationId);
      setSummary(data);
    } catch {
      // Sin datos se muestran guiones; el panel de pedidos ya informa el error.
      setSummary(null);
    }
  }, [locationId]);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), POLL_INTERVAL_MS);
    const unsubscribeNew = subscribeToNewOrders((event) => {
      if (event.sedeId === locationId) void load();
    });
    const unsubscribeStatus = subscribeToOrderStatus((event) => {
      if (event.sedeId === locationId) void load();
    });
    return () => {
      window.clearInterval(timer);
      unsubscribeNew();
      unsubscribeStatus();
    };
  }, [locationId, load]);

  const value = (n: number | undefined) => (n === undefined ? "—" : String(n));

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Kpi icon={<ClipboardList />} label="Órdenes de hoy" value={value(summary?.ordenesHoy)} />
      <Kpi icon={<Clock3 />} label="Pendientes" value={value(summary?.pendientes)} />
      <Kpi
        icon={<Users />}
        label="Mesas ocupadas"
        value={summary ? `${summary.mesasOcupadas} / ${summary.mesasTotales}` : "—"}
      />
      <Kpi icon={<CheckCircle2 />} label="Entregadas hoy" value={value(summary?.entregadasHoy)} />
    </section>
  );
}

function Kpi({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <SurfaceCard className="p-4">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-primary">
        {icon}
      </div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
    </SurfaceCard>
  );
}
