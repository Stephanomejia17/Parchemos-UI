import { Check, CheckCircle2, Clock, FileText, MapPin, Upload, User, X, AlertCircle } from "lucide-react";
import { StatusBadge as Badge, SurfaceCard as Card } from "@parchemos/shared/components";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { pendingVerifications } from "./data";

const ACCENT = "#FF6B35";

export function Verification() {
  return (
    <div className="space-y-5">
      <SectionHeader title="Verificación de restaurantes" sub="Revisión de documentos, datos bancarios y ubicación" />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <StatCard label="En revisión" value="3" icon={Clock} />
        <StatCard label="Aprobados este mes" value="28" change="+12" up icon={CheckCircle2} accent />
        <StatCard label="Rechazados" value="4" icon={AlertCircle} />
      </div>

      <div className="space-y-4">
        {pendingVerifications.map(v => (
          <Card key={v.id} className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[14px] font-bold text-gray-600 flex-shrink-0">
                {v.name.slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-[15px] font-semibold text-gray-900">{v.name}</h3>
                    <div className="flex items-center gap-3 text-[12px] text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1">
                        <User size={11} /> {v.owner}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={11} /> {v.address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {v.submitted}
                      </span>
                    </div>
                  </div>
                  <Badge status={v.status} />
                </div>

                <div className="flex items-center gap-2 flex-wrap mb-4">
                  {v.docs.map(d => (
                    <span key={d} className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border ${d.includes("✓") ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                      <FileText size={10} className="inline mr-1" />
                      {d}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-semibold text-white rounded-xl transition-colors" style={{ background: ACCENT }}>
                    <Check size={12} /> Aprobar
                  </button>
                  <button className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium text-amber-700 bg-amber-50 rounded-xl hover:bg-amber-100 transition-colors border border-amber-100">
                    <Upload size={12} /> Solicitar cambios
                  </button>
                  <button className="flex items-center gap-1.5 px-3.5 py-2 text-[12px] font-medium text-red-700 bg-red-50 rounded-xl hover:bg-red-100 transition-colors border border-red-100">
                    <X size={12} /> Rechazar
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
