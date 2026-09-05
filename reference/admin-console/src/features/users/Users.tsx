"use client";

import { useState } from "react";
import { Ban, Download, Edit3, Eye, MapPin, Plus, Search, Trash2 } from "lucide-react";
import { IconButton as ActionBtn, InitialsAvatar as Avatar, StatusBadge as Badge, STATUS_LABELS, SurfaceCard as Card } from "@parchemos/shared/components";
import { SectionHeader } from "@/components/SectionHeader";
import { users } from "./data";

const ACCENT = "#FF6B35";

const STATUS_FILTERS = ["all", "active", "inactive", "suspended", "blocked"] as const;

export function Users() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<(typeof STATUS_FILTERS)[number]>("all");
  const filtered = users.filter(
    u =>
      (filterStatus === "all" || u.status === filterStatus) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())),
  );

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Gestión de usuarios"
        sub={`${users.length} usuarios registrados`}
        action={
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
              <Download size={13} /> Exportar
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 text-[13px] text-white rounded-xl transition-colors" style={{ background: ACCENT }}>
              <Plus size={13} /> Nuevo usuario
            </button>
          </div>
        }
      />

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:border-[#FF6B35]/50"
          />
        </div>
        {STATUS_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-3 py-2 text-[12px] font-medium rounded-xl transition-colors border ${filterStatus === s ? "border-[#FF6B35]/30 bg-[#FFF1EB] text-[#FF6B35]" : "border-gray-200 bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            {s === "all" ? "Todos" : STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-5 py-3">Usuario</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Ciudad</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Rol</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Estado</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Pedidos</th>
                <th className="text-left text-[11px] font-medium text-gray-400 uppercase tracking-wide px-4 py-3">Registro</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar initials={u.avatar} />
                      <div>
                        <div className="text-[13px] font-medium text-gray-900">{u.name}</div>
                        <div className="text-[11px] text-gray-400">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-[13px] text-gray-600">
                      <MapPin size={11} className="text-gray-400" />
                      {u.city}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${u.role === "Premium" ? "bg-[#FFF1EB] text-[#FF6B35]" : "bg-gray-100 text-gray-600"}`}>{u.role}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge status={u.status} />
                  </td>
                  <td className="px-4 py-3.5 text-[13px] text-gray-600 font-medium">{u.orders}</td>
                  <td className="px-4 py-3.5 text-[12px] text-gray-400">{u.joined}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ActionBtn icon={Eye} label="Ver perfil" />
                      <ActionBtn icon={Edit3} label="Editar" />
                      <ActionBtn icon={Ban} label="Suspender" />
                      <ActionBtn icon={Trash2} label="Eliminar" danger />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
