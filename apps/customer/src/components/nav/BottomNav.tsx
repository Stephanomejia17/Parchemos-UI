"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItemsFor } from "./nav-items";
import { useActiveTab } from "./active-tab-context";
import { useAuth } from "@parchemos/shared/auth";

const DETAIL_ROUTES = ["/restaurant", "/menu", "/order-summary", "/profile/dashboard"];

export function BottomNav() {
  const activeTab = useActiveTab();
  const pathname = usePathname();
  const { user } = useAuth();
  const onDetailRoute = DETAIL_ROUTES.some(route => pathname.startsWith(route));

  return (
    <div className="bg-white border-t border-border px-2 py-2 flex-shrink-0">
      <div className="flex">
        {navItemsFor(user?.role).map(({ id, href, icon: Icon, label }) => {
          const isActive = activeTab === id && !onDetailRoute;
          return (
            <Link
              key={id}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-1.5 rounded-2xl transition-all ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-gray-700"
              }`}
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? "bg-orange-50" : ""}`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
