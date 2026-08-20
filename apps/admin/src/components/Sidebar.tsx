"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, LogOut } from "lucide-react";
import { NAV_BADGES, NAV_ITEMS } from "./nav-items";

const ACCENT = "#FF6B35";

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col border-r border-gray-100 bg-white transition-all duration-300 flex-shrink-0 ${collapsed ? "w-16" : "w-56"}`}
      style={{ height: "100vh" }}
    >
      {/* Logo */}
      <div className={`flex items-center gap-2.5 px-4 py-5 border-b border-gray-50 ${collapsed ? "justify-center" : ""}`}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: ACCENT }}>
          <span className="text-white font-bold text-[12px]">P</span>
        </div>
        {!collapsed && (
          <div>
            <div className="text-[13px] font-bold text-gray-900 leading-none">Parchemos</div>
            <div className="text-[10px] text-gray-400 mt-0.5">Console</div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map(item => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] transition-all ${
                active ? "bg-[#FFF1EB] text-[#FF6B35] font-semibold" : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={16} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {NAV_BADGES[item.id] && (
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${active ? "bg-[#FF6B35] text-white" : "bg-gray-100 text-gray-500"}`}>
                      {NAV_BADGES[item.id]}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-2 border-t border-gray-50 space-y-1">
        <button
          onClick={() => setCollapsed(c => !c)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <ChevronLeft size={14} className={`transition-transform ${collapsed ? "rotate-180" : ""}`} />
          {!collapsed && <span className="text-[12px]">Colapsar</span>}
        </button>
        {!collapsed && (
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
              <span className="text-[11px] font-bold text-gray-600">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-gray-800 truncate">Admin</div>
              <div className="text-[10px] text-gray-400 truncate">admin@parchemos.co</div>
            </div>
            <LogOut size={13} className="text-gray-300 hover:text-gray-500 cursor-pointer" />
          </div>
        )}
      </div>
    </aside>
  );
}
