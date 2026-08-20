"use client";

import { useState } from "react";
import { AlertCircle, Check, Eye, Trash2 } from "lucide-react";
import { InitialsAvatar as Avatar, StatusBadge as Badge, STATUS_LABELS, SurfaceCard as Card } from "@parchemos/shared/components";
import { SectionHeader } from "@/components/SectionHeader";
import { moderationItems } from "./data";

const TYPE_STYLES: Record<string, string> = {
  post: "bg-blue-50 text-blue-700",
  review: "bg-purple-50 text-purple-700",
  story: "bg-emerald-50 text-emerald-700",
  comment: "bg-gray-100 text-gray-600",
};

const TYPE_LABELS: Record<string, string> = { post: "Publicación", review: "Reseña", story: "Historia", comment: "Comentario" };

const FILTERS = ["all", "pending", "reported", "approved"] as const;

export function Moderation() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const filtered = moderationItems.filter(m => filter === "all" || m.status === filter);

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Moderación de contenido"
        sub="Publicaciones, reseñas, historias y comentarios"
        action={
          <div className="flex items-center gap-2 text-[12px]">
            <span className="px-2.5 py-1 bg-red-50 text-red-700 rounded-lg font-medium">{moderationItems.filter(m => m.status === "reported").length} reportados</span>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 rounded-lg font-medium">{moderationItems.filter(m => m.status === "pending").length} pendientes</span>
          </div>
        }
      />

      <div className="flex items-center gap-2">
        {FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-2 text-[12px] font-medium rounded-xl transition-colors border ${filter === s ? "border-[#FF6B35]/30 bg-[#FFF1EB] text-[#FF6B35]" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            {s === "all" ? "Todo" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(item => {
          const typeClass = TYPE_STYLES[item.type] || "bg-gray-100 text-gray-600";
          const typeLabel = TYPE_LABELS[item.type] || item.type;
          return (
            <Card key={item.id} className="p-5">
              <div className="flex items-start gap-4">
                <Avatar initials={item.author.slice(0, 2).toUpperCase()} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="text-[13px] font-semibold text-gray-900">{item.author}</span>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${typeClass}`}>{typeLabel}</span>
                    <span className="text-[12px] text-gray-400">
                      en <span className="text-gray-600">{item.restaurant}</span>
                    </span>
                    <span className="text-[11px] text-gray-400 ml-auto">{item.time}</span>
                  </div>
                  <p className="text-[13px] text-gray-700 leading-relaxed mb-3">{item.content}</p>
                  <div className="flex items-center gap-3">
                    <Badge status={item.status} />
                    {item.reports > 0 && (
                      <span className="flex items-center gap-1 text-[11px] text-red-600 font-medium">
                        <AlertCircle size={11} /> {item.reports} reportes
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
                        <Check size={11} /> Aprobar
                      </button>
                      <button className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                        <Eye size={11} /> Ocultar
                      </button>
                      <button className="flex items-center gap-1 px-2.5 py-1.5 text-[12px] font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                        <Trash2 size={11} /> Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
