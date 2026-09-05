import { AlertCircle, CheckCircle2, Clock, Edit3, Eye, MessageSquare, Plus } from "lucide-react";
import { IconButton as ActionBtn, StatusBadge as Badge, SurfaceCard as Card } from "@parchemos/shared/components";
import { SectionHeader } from "@/components/SectionHeader";
import { StatCard } from "@/components/StatCard";
import { tickets } from "./data";

const ACCENT = "#FF6B35";

const PRIORITY_DOT: Record<string, string> = {
  critical: "bg-red-500",
  high: "bg-red-400",
  medium: "bg-amber-400",
  low: "bg-gray-300",
};

export function Support() {
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Centro de soporte"
        sub={`${tickets.filter(t => t.status === "open" || t.status === "escalated").length} tickets activos`}
        action={
          <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-white rounded-xl" style={{ background: ACCENT }}>
            <Plus size={13} /> Crear ticket
          </button>
        }
      />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Abiertos" value={`${tickets.filter(t => t.status === "open").length}`} icon={MessageSquare} />
        <StatCard label="En progreso" value={`${tickets.filter(t => t.status === "in_progress").length}`} icon={Clock} accent />
        <StatCard label="Escalados" value={`${tickets.filter(t => t.status === "escalated").length}`} icon={AlertCircle} />
        <StatCard label="Cerrados hoy" value={`${tickets.filter(t => t.status === "closed").length}`} icon={CheckCircle2} />
      </div>

      <Card>
        <div className="divide-y divide-gray-50">
          {tickets.map(ticket => (
            <div key={ticket.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors group">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[ticket.priority] || "bg-gray-300"}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[13px] font-semibold text-gray-900">{ticket.subject}</span>
                  <span className="text-[11px] text-gray-400 font-mono">{ticket.id}</span>
                </div>
                <div className="flex items-center gap-3 text-[12px] text-gray-500">
                  <span>{ticket.user}</span>
                  <span className="text-gray-300">·</span>
                  <span>{ticket.category}</span>
                  <span className="text-gray-300">·</span>
                  <span>{ticket.created}</span>
                </div>
              </div>
              <Badge status={ticket.priority} />
              <Badge status={ticket.status} />
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <ActionBtn icon={Eye} label="Ver" />
                <ActionBtn icon={Edit3} label="Responder" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
