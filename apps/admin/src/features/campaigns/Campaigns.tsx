import { BarChart3, Clock, MoreHorizontal, Plus, Target, Users, Zap } from "lucide-react";
import { StatusBadge as Badge, SurfaceCard as Card } from "@parchemos/shared/components";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { campaigns } from "./data";

const ACCENT = "#FF6B35";

export function Campaigns() {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Campañas"
        sub="Banners, notificaciones, descuentos y segmentación"
        action={
          <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-white rounded-xl" style={{ background: ACCENT }}>
            <Plus size={13} /> Nueva campaña
          </button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Campañas activas" value="2" icon={Zap} accent />
        <StatCard label="Alcance total" value="73.6K" change="+18%" up icon={Users} />
        <StatCard label="Conversiones" value="3,420" change="+24%" up icon={Target} />
        <StatCard label="CTR promedio" value="4.65%" change="+0.44pp" up icon={BarChart3} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {campaigns.map(c => (
          <Card key={c.id} className="p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-[14px] font-semibold text-gray-900">{c.name}</h3>
                  <Badge status={c.status} />
                </div>
                <div className="flex items-center gap-3 text-[12px] text-gray-500">
                  <span className="px-2 py-0.5 bg-gray-100 rounded-md font-medium text-gray-600">{c.type}</span>
                  <span className="flex items-center gap-1">
                    <Clock size={11} /> {c.ends}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-semibold text-gray-900">${(c.budget / 1000000).toFixed(1)}M</div>
                <div className="text-[11px] text-gray-400">presupuesto</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-[14px] font-semibold text-gray-900">{c.reach > 0 ? c.reach.toLocaleString("es-CO") : "—"}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Alcance</div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-[14px] font-semibold text-gray-900">{c.conversions > 0 ? c.conversions.toLocaleString("es-CO") : "—"}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Conversiones</div>
              </div>
              <div className="bg-[#FFF1EB] rounded-xl p-3 text-center">
                <div className="text-[14px] font-semibold" style={{ color: ACCENT }}>
                  {c.ctr > 0 ? `${c.ctr}%` : "—"}
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: "#FF8559" }}>
                  CTR
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-3 border-t border-gray-50">
              <button className="flex-1 py-2 text-[12px] font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Ver métricas</button>
              <button className="flex-1 py-2 text-[12px] font-medium text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Editar</button>
              <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
