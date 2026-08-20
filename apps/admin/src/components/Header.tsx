"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { STATUS_COLORS } from "@parchemos/shared/components";
import { alerts } from "@/lib/shared-mock-data";
import { NAV_ITEMS } from "./nav-items";

const ACCENT = "#FF6B35";

export function Header() {
  const pathname = usePathname();
  const item = NAV_ITEMS.find(n => pathname.startsWith(n.href));
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-4 flex-shrink-0">
      <div className="flex-1">
        <h1 className="text-[15px] font-semibold text-gray-900">{item?.label || "Dashboard"}</h1>
      </div>

      <div className="relative">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          placeholder="Buscar en consola..."
          className="pl-8 pr-4 py-2 text-[12px] bg-gray-50 border border-gray-100 rounded-xl w-52 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 focus:bg-white transition-colors"
        />
      </div>

      <div className="relative">
        <button
          onClick={() => setNotifOpen(o => !o)}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-gray-100 transition-colors relative"
        >
          <Bell size={16} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full" style={{ background: ACCENT }} />
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-11 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-gray-900">Notificaciones</span>
              <span className="text-[11px]" style={{ color: ACCENT }}>
                3 nuevas
              </span>
            </div>
            {alerts.map((a, i) => (
              <div key={i} className={`px-4 py-3 border-b border-gray-50 last:border-0 ${STATUS_COLORS[a.level]?.split(" ")[0]}`}>
                <p className="text-[12px] text-gray-700">{a.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  hace {i + 1} hora{i > 0 ? "s" : ""}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF8559] flex items-center justify-center cursor-pointer">
        <span className="text-white font-bold text-[12px]">A</span>
      </div>
    </header>
  );
}
