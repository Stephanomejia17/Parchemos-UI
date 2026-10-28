"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, Lightbulb, RefreshCw, Sparkles } from "lucide-react";
import { SurfaceCard as Card } from "./SurfaceCard";
import { ApiError } from "@/shared/auth/types";
import { insightService, type Insight, type InsightScope } from "@/shared/services/insights/insight.service";

const formatDay = (value: string) =>
  new Date(`${value}T12:00:00`).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" });

const findingStyle = {
  positivo: { icon: CheckCircle2, className: "text-emerald-600" },
  alerta: { icon: AlertTriangle, className: "text-amber-600" },
  neutral: { icon: Info, className: "text-gray-500" },
} as const;

const priorityStyle = {
  alta: "bg-red-50 text-red-700",
  media: "bg-amber-50 text-amber-700",
  baja: "bg-gray-100 text-gray-600",
} as const;

interface Props {
  scope: InsightScope;
  desde: string;
  hasta: string;
  restauranteId?: string;
  /** Deshabilita el botón, p. ej. si el rango de fechas es inválido. */
  disabled?: boolean;
}

/**
 * Insights de IA sobre el dashboard. Se puede generar uno por día: el
 * insight generado queda visible el resto del día aunque se cambie el rango.
 */
export function AiInsightsPanel({ scope, desde, hasta, restauranteId, disabled }: Props) {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [available, setAvailable] = useState(false);
  const [nextAvailable, setNextAvailable] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    insightService.today(scope)
      .then(({ data }) => {
        if (!active) return;
        setInsight(data.insight);
        setAvailable(data.disponible);
        setNextAvailable(data.proximoDisponible);
      })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "No se pudo consultar el insight de hoy."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [scope]);

  async function generate() {
    setGenerating(true);
    setError("");
    try {
      const { data } = await insightService.generate(scope, { desde, hasta, ...(restauranteId ? { restauranteId } : {}) });
      setInsight(data);
      setAvailable(false);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo generar el insight. Intenta nuevamente.");
      // 429: el cupo ya se usó (p. ej. desde otra pestaña); trae el insight guardado.
      if (reason instanceof ApiError && reason.status === 429) {
        setAvailable(false);
        insightService.today(scope).then(({ data }) => {
          setInsight(data.insight);
          setNextAvailable(data.proximoDisponible);
        }).catch(() => undefined);
      }
    } finally {
      setGenerating(false);
    }
  }

  return <Card className="p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="flex items-center gap-2 font-semibold text-gray-900"><Sparkles size={16} className="text-[#FF6B35]"/> Insights con IA</h2>
        <p className="mt-1 text-xs text-gray-500">
          {insight
            ? `Análisis del ${formatDay(insight.rango.desde)} al ${formatDay(insight.rango.hasta)} · generado hoy`
            : "Un análisis automático del período seleccionado. Puedes generar uno por día."}
        </p>
      </div>
      {!loading && available && <button
        onClick={() => void generate()}
        disabled={generating || disabled}
        className="flex h-10 items-center gap-2 rounded-xl bg-[#FF6B35] px-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {generating ? <RefreshCw size={15} className="animate-spin"/> : <Sparkles size={15}/>}
        {generating ? "Analizando…" : "Generar insights"}
      </button>}
      {!loading && !available && nextAvailable && <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">Próximo disponible: {formatDay(nextAvailable)}</span>}
    </div>

    {loading && <p className="mt-4 text-sm text-gray-500">Consultando…</p>}
    {generating && <p className="mt-4 text-sm text-gray-500">Esto puede tardar hasta un minuto.</p>}
    {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

    {insight && <div className="mt-4 space-y-4">
      <p className="text-sm leading-relaxed text-gray-800">{insight.contenido.resumen}</p>
      {insight.contenido.hallazgos.length > 0 && <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Hallazgos</h3>
        <ul className="space-y-2">{insight.contenido.hallazgos.map((finding, index) => {
          const { icon: Icon, className } = findingStyle[finding.tipo] ?? findingStyle.neutral;
          return <li key={index} className="flex gap-3 rounded-xl bg-gray-50 p-3">
            <Icon size={16} className={`mt-0.5 shrink-0 ${className}`}/>
            <div><p className="text-sm font-medium text-gray-900">{finding.titulo}</p><p className="mt-0.5 text-sm text-gray-600">{finding.detalle}</p></div>
          </li>;
        })}</ul>
      </div>}
      {insight.contenido.recomendaciones.length > 0 && <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Recomendaciones</h3>
        <ul className="space-y-2">{insight.contenido.recomendaciones.map((item, index) => <li key={index} className="flex gap-3 rounded-xl border border-gray-100 p-3">
          <Lightbulb size={16} className="mt-0.5 shrink-0 text-[#FF6B35]"/>
          <div className="min-w-0 flex-1"><p className="text-sm font-medium text-gray-900">{item.accion}</p><p className="mt-0.5 text-sm text-gray-600">{item.motivo}</p></div>
          <span className={`h-fit shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${priorityStyle[item.prioridad] ?? priorityStyle.baja}`}>{item.prioridad}</span>
        </li>)}</ul>
      </div>}
      <p className="text-[11px] text-gray-400">Generado con IA a partir de los datos del dashboard. Verifica las cifras antes de tomar decisiones.</p>
    </div>}
  </Card>;
}
