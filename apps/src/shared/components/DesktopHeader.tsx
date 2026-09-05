"use client";

import Link from "next/link";
import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

export interface DesktopBreadcrumb { label: string; href?: string; }
export interface DesktopHeaderProps {
  breadcrumbs: DesktopBreadcrumb[];
  avatar: ReactNode;
  avatarHref?: string;
  backHref?: string;
  onBack?: () => void;
}

export function DesktopHeader({ breadcrumbs, avatar, avatarHref = "/profile", backHref, onBack }: DesktopHeaderProps) {
  const backButton = <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"><ChevronLeft className="h-4 w-4" /></span>;
  return <header className="hidden h-16 flex-shrink-0 items-center gap-4 border-b border-border bg-white px-6 md:flex">
    {backHref ? <Link href={backHref} aria-label="Volver">{backButton}</Link> : onBack ? <button type="button" onClick={onBack} aria-label="Volver">{backButton}</button> : null}
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-sm">
      {breadcrumbs.map((crumb, index) => { const current = index === breadcrumbs.length - 1; return <span key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-1"><span className="truncate">{!current && crumb.href ? <Link href={crumb.href} className="text-gray-500 hover:text-primary">{crumb.label}</Link> : <span className={current ? "font-bold text-gray-900" : "text-gray-500"}>{crumb.label}</span>}</span>{!current && <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />}</span>; })}
    </nav>
    <div className="ml-auto flex items-center gap-2">
      <button type="button" aria-label="Notificaciones" className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"><Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-primary" /></button>
      <Link href={avatarHref} aria-label="Ir al perfil">{avatar}</Link>
    </div>
  </header>;
}
