"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { LogOut } from "lucide-react";
import type { NavigationItem } from "@/shared/navigation/types";

const initialOf = (name?: string | null) => (name?.trim()[0] ?? "A").toUpperCase();

export function Sidebar({
  items,
  activeId,
  user,
  onLogout,
  footer,
}: {
  items: NavigationItem[];
  activeId: string;
  user?: { fullName?: string | null; email?: string | null };
  onLogout?: () => void;
  footer?: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-border flex-shrink-0 transition-all ${collapsed ? "w-16" : "w-56 lg:w-60"}`}
    >
      <div className="h-16 flex items-center px-4 border-b border-border gap-3">
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center">
          <span>🍽️</span>
        </div>
        {!collapsed && (
          <span className="font-extrabold text-gray-900 text-lg font-heading">Parchemos</span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className="ml-auto text-muted-foreground"
        >
          ☰
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {items.map(({ id, href, icon: Icon, label }) => (
          <Link
            key={id}
            href={href}
            title={collapsed ? label : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 ${activeId === id ? "bg-primary text-white" : "text-muted-foreground hover:bg-gray-100"}`}
          >
            <Icon className="h-4 w-4" />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>
      {footer ??
        (!collapsed && (
          <div className="border-t border-border p-2">
            <div className="flex items-center gap-2.5 px-1.5 py-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center flex-shrink-0">
                <span className="text-[11px] font-bold text-gray-600">
                  {initialOf(user?.fullName)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-semibold text-gray-800 truncate">
                  {user?.fullName ?? "Mi cuenta"}
                </div>
                <div className="text-[10px] text-gray-400 truncate">{user?.email ?? ""}</div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                title="Cerrar sesión"
                aria-label="Cerrar sesión"
                className="text-gray-300 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <LogOut size={13} />
              </button>
            </div>
          </div>
        ))}
    </aside>
  );
}
