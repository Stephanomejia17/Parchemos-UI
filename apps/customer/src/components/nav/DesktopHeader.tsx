"use client";

import { usePathname } from "next/navigation";
import { RemoteImage } from "@/components/media/RemoteImage";
import { DesktopHeader as SharedDesktopHeader, type DesktopBreadcrumb } from "@parchemos/shared/components";
import { navItemsFor } from "./nav-items";
import { useActiveTab } from "./active-tab-context";
import { useAuth } from "@parchemos/shared/auth";

const DETAIL_LABELS: Record<string, string> = { menu: "Menú", dashboard: "Dashboard", "order-summary": "Resumen del pedido", restaurant: "Restaurante" };

export function DesktopHeader() {
  const pathname = usePathname();
  const activeTab = useActiveTab();
  const { user } = useAuth();
  const activeItem = navItemsFor(user?.role).find(item => item.id === activeTab);
  const breadcrumbs = getBreadcrumbs(pathname, activeItem?.label ?? "Parchemos", activeItem?.href);
  return <SharedDesktopHeader backHref={getBackHref(pathname, activeItem?.href)} breadcrumbs={breadcrumbs} avatar={<RemoteImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&auto=format" alt="user" className="h-9 w-9 cursor-pointer rounded-xl" />} />;
}

function getBackHref(pathname: string, sectionHref?: string) {
  if (pathname === "/home" || pathname === "/") return undefined;
  if (pathname === sectionHref) return "/home";
  return sectionHref ?? "/home";
}

function getBreadcrumbs(pathname: string, section: string, sectionHref?: string): DesktopBreadcrumb[] {
  const parts = pathname.split("/").filter(Boolean);
  const detailIndex = parts.findIndex(part => DETAIL_LABELS[part]);
  return detailIndex >= 0 ? [{ label: section, href: sectionHref }, { label: DETAIL_LABELS[parts[detailIndex]] }] : [{ label: section, href: sectionHref }];
}
