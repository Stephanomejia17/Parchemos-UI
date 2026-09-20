"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useAuth } from "@/shared/auth";
import { SidebarUserFooter } from "@/shared/components";
import { navigationForRole } from "@/shared/navigation";

const ACCENT = "#FF6B35";

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const items = navigationForRole(user?.role);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`flex flex-col border-r border-gray-100 bg-white transition-all duration-300 flex-shrink-0 ${collapsed ? "w-16" : "w-56"}`}
      style={{ height: "100vh" }}
    >
      {/* Logo */}
      <div
        className={`flex items-center gap-2.5 px-4 py-5 border-b border-gray-50 ${collapsed ? "justify-center" : ""}`}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: ACCENT }}
        >
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
        {items.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] transition-all ${
                active
                  ? "bg-[#FFF1EB] text-[#FF6B35] font-semibold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 font-medium"
              } ${collapsed ? "justify-center" : ""}`}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={16} className="flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${active ? "bg-[#FF6B35] text-white" : "bg-gray-100 text-gray-500"}`}
                    >
                      {item.badge}
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
          onClick={() => setCollapsed((c) => !c)}
          className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-xl transition-colors ${collapsed ? "justify-center" : ""}`}
        >
          <ChevronLeft
            size={14}
            className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
          {!collapsed && <span className="text-[12px]">Colapsar</span>}
        </button>
        <SidebarUserFooter user={user} collapsed={collapsed} logout={logout} />
      </div>
    </aside>
  );
}
