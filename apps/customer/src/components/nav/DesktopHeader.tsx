"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { RemoteImage } from "@/components/media/RemoteImage";
import { NAV_ITEMS } from "./nav-items";
import { useActiveTab } from "./active-tab-context";

export function DesktopHeader() {
  const activeTab = useActiveTab();
  const currentLabel = NAV_ITEMS.find(n => n.id === activeTab)?.label ?? "Parchemos";

  return (
    <header className="hidden md:flex h-16 bg-white border-b border-border items-center px-6 gap-4 flex-shrink-0">
      <div>
        <p className="text-sm font-bold text-gray-900">{currentLabel}</p>
        <p className="text-xs text-muted-foreground">Bogotá, Colombia</p>
      </div>
      <div className="flex-1 flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2.5 max-w-sm ml-4">
        <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <input className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-muted-foreground" placeholder="Buscar restaurantes, platos..." />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button className="relative w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
          <Bell className="w-4 h-4" />
          <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-primary border-2 border-white" />
        </button>
        <Link href="/profile">
          <RemoteImage
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&auto=format"
            alt="user"
            className="w-9 h-9 rounded-xl cursor-pointer"
          />
        </Link>
      </div>
    </header>
  );
}
