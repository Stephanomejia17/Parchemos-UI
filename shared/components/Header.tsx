import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

export interface HeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  backHref?: string;
  onBack?: () => void;
  actions?: ReactNode;
  className?: string;
}

export function Header({ title, subtitle, eyebrow, backHref, onBack, actions, className = "" }: HeaderProps) {
  const backButton = (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm transition-colors hover:bg-gray-50">
      <ChevronLeft className="h-5 w-5" />
    </span>
  );

  return (
    <header className={`flex items-center gap-3 ${className}`}>
      {backHref ? <Link href={backHref} aria-label="Volver">{backButton}</Link> : onBack ? <button type="button" onClick={onBack} aria-label="Volver">{backButton}</button> : null}
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</p>}
        <h1 className="text-2xl font-bold text-gray-900 font-heading">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="ml-auto shrink-0">{actions}</div>}
    </header>
  );
}
