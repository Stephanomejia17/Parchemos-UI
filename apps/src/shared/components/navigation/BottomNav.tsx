"use client";

import Link from "next/link";
import type { NavigationItem } from "@/shared/navigation/types";

export function BottomNav({ items, activeId }: { items: NavigationItem[]; activeId: string }) {
  return <nav className="bg-white border-t border-border px-2 py-2 md:hidden"><div className="flex">{items.map(({ id, href, icon: Icon, label }) => <Link key={id} href={href} className={`flex-1 flex flex-col items-center gap-1 py-1.5 ${activeId === id ? "text-primary" : "text-muted-foreground"}`}><Icon className="h-5 w-5" /><span className="text-[10px] font-semibold">{label}</span></Link>)}</div></nav>;
}
