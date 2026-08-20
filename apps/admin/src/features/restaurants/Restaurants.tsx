"use client";

import { useState } from "react";
import { Filter, MapPin, MoreHorizontal, Plus, Search, Star } from "lucide-react";
import { StatusBadge as Badge, SurfaceCard as Card } from "@parchemos/shared/components";
import { SectionHeader } from "@/components/SectionHeader";
import { restaurants } from "./data";

const ACCENT = "#FF6B35";

export function Restaurants() {
  const [search, setSearch] = useState("");
  const filtered = restaurants.filter(r => r.name.toLowerCase().includes(search.toLowerCase()) || r.city.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Gestión de restaurantes"
        sub={`${restaurants.length} restaurantes · ${restaurants.filter(r => r.status === "verified").length} verificados`}
        action={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Filter size={13} /> Filtros
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-white rounded-xl" style={{ background: ACCENT }}>
              <Plus size={13} /> Añadir
            </button>
          </div>
        }
      />

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar restaurante..."
          className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(r => (
          <Card key={r.id} className="p-5 hover:shadow-[0_4px_16px_rgba(0,0,0,0.07)] transition-all duration-200 group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-[13px] font-bold text-gray-600">{r.logo}</div>
                <div>
                  <div className="text-[14px] font-semibold text-gray-900">{r.name}</div>
                  <div className="flex items-center gap-1.5 text-[12px] text-gray-500 mt-0.5">
                    <MapPin size={10} /> {r.city} · {r.category}
                  </div>
                </div>
              </div>
              <Badge status={r.status} />
            </div>

            <div className="grid grid-cols-3 gap-3 text-center mb-4">
              <div className="bg-gray-50 rounded-xl py-2.5">
                <div className="flex items-center justify-center gap-1 text-[11px] text-amber-500 font-medium mb-0.5">
                  <Star size={10} /> {r.rating}
                </div>
                <div className="text-[10px] text-gray-400">Rating</div>
              </div>
              <div className="bg-gray-50 rounded-xl py-2.5">
                <div className="text-[11px] font-semibold text-gray-800 mb-0.5">${(r.sales / 1000000).toFixed(1)}M</div>
                <div className="text-[10px] text-gray-400">Ventas</div>
              </div>
              <div className="bg-gray-50 rounded-xl py-2.5">
                <div className="text-[11px] font-semibold text-gray-800 mb-0.5">{r.reservations}</div>
                <div className="text-[10px] text-gray-400">Reservas</div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pt-3 border-t border-gray-50">
              {r.status === "pending" && (
                <button className="flex-1 py-1.5 text-[12px] font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">Aprobar</button>
              )}
              <button className="flex-1 py-1.5 text-[12px] font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">Ver perfil</button>
              <button className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreHorizontal size={14} />
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
