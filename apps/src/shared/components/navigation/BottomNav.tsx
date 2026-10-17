"use client";

import Link from "next/link";
import type { NavigationItem } from "@/shared/navigation/types";

export function BottomNav({ items, activeId }: { items: NavigationItem[]; activeId: string }) {
  return (
    <nav className="bg-white border-t border-border px-2 py-2 md:hidden">
      <div className="flex items-center">
        {items.map(({ id, href, icon: Icon, label, featured }) =>
          featured ? (
            // Acción principal (publicar): botón central destacado, como en una red social.
            <Link
              key={id}
              href={href}
              aria-label={label}
              className="flex flex-1 items-center justify-center py-0.5"
            >
              <span
                className={`flex h-10 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-md shadow-orange-200 transition-transform active:scale-95 ${
                  activeId === id ? "ring-2 ring-orange-300" : ""
                }`}
              >
                <Icon className="h-6 w-6" strokeWidth={2.5} />
              </span>
            </Link>
          ) : (
            <Link
              key={id}
              href={href}
              className={`flex-1 flex flex-col items-center gap-1 py-1.5 ${activeId === id ? "text-primary" : "text-muted-foreground"}`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          ),
        )}
      </div>
    </nav>
  );
}
