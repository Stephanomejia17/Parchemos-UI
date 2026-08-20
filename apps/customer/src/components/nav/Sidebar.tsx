"use client";

import Link from "next/link";
import { useState } from "react";
import { LogOut, Menu as MenuIcon } from "lucide-react";
import { RemoteImage } from "@/components/media/RemoteImage";
import { NAV_ITEMS } from "./nav-items";
import { useActiveTab } from "./active-tab-context";

export function Sidebar() {
  const activeTab = useActiveTab();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-border flex-shrink-0 transition-all duration-300 ${
        collapsed ? "w-16" : "w-56 lg:w-60"
      }`}
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-border gap-3 flex-shrink-0">
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-orange-100">
          <span className="text-base">🍽️</span>
        </div>
        {!collapsed && <span className="font-extrabold text-gray-900 text-lg truncate font-heading">Parchemos</span>}
        <button
          onClick={() => setCollapsed(p => !p)}
          className="ml-auto w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors text-muted-foreground flex-shrink-0"
        >
          <MenuIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV_ITEMS.map(({ id, href, icon: Icon, label }) => {
          const isActive = activeTab === id;
          return (
            <Link
              key={id}
              href={href}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 transition-all ${
                isActive ? "bg-primary text-white shadow-sm shadow-orange-200" : "text-muted-foreground hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="w-4.5 h-4.5 flex-shrink-0" />
              {!collapsed && <span className={`text-sm font-medium ${isActive ? "text-white" : ""}`}>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className={`p-3 border-t border-border flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
        <RemoteImage
          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&auto=format"
          alt="user"
          className="w-8 h-8 rounded-xl flex-shrink-0"
        />
        {!collapsed && (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">Juan Sebastián M.</p>
              <p className="text-xs text-muted-foreground">@juanse.foodie</p>
            </div>
            <button className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </>
        )}
      </div>
    </aside>
  );
}
