import type { ComponentType, ReactNode } from "react";

export const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-100", inactive: "bg-gray-100 text-gray-500 border-gray-200", suspended: "bg-amber-50 text-amber-700 border-amber-100", blocked: "bg-red-50 text-red-700 border-red-100", verified: "bg-emerald-50 text-emerald-700 border-emerald-100", pending: "bg-amber-50 text-amber-700 border-amber-100", approved: "bg-emerald-50 text-emerald-700 border-emerald-100", reported: "bg-red-50 text-red-700 border-red-100", open: "bg-blue-50 text-blue-700 border-blue-100", in_progress: "bg-amber-50 text-amber-700 border-amber-100", escalated: "bg-red-50 text-red-700 border-red-100", closed: "bg-gray-100 text-gray-500 border-gray-200", completed: "bg-emerald-50 text-emerald-700 border-emerald-100", failed: "bg-red-50 text-red-700 border-red-100", refunded: "bg-purple-50 text-purple-700 border-purple-100", reviewing: "bg-blue-50 text-blue-700 border-blue-100", pending_docs: "bg-amber-50 text-amber-700 border-amber-100", ready: "bg-emerald-50 text-emerald-700 border-emerald-100", scheduled: "bg-blue-50 text-blue-700 border-blue-100", ended: "bg-gray-100 text-gray-500 border-gray-200", critical: "bg-red-50 text-red-700 border-red-100", warning: "bg-amber-50 text-amber-700 border-amber-100", info: "bg-blue-50 text-blue-700 border-blue-100", high: "bg-red-50 text-red-700 border-red-100", medium: "bg-amber-50 text-amber-700 border-amber-100", low: "bg-gray-100 text-gray-500 border-gray-200",
};
export const STATUS_LABELS: Record<string, string> = { active: "Activo", inactive: "Inactivo", suspended: "Suspendido", blocked: "Bloqueado", verified: "Verificado", pending: "Pendiente", approved: "Aprobado", reported: "Reportado", open: "Abierto", in_progress: "En progreso", escalated: "Escalado", closed: "Cerrado", completed: "Completado", failed: "Fallido", refunded: "Reembolsado", reviewing: "En revisión", pending_docs: "Docs. pendientes", ready: "Listo", scheduled: "Programada", ended: "Finalizada", critical: "Crítico", warning: "Advertencia", info: "Info", high: "Alta", medium: "Media", low: "Baja" };

export function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${STATUS_COLORS[status] || "bg-gray-100 text-gray-500 border-gray-200"}`}>{STATUS_LABELS[status] || status}</span>;
}
export function SurfaceCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-gray-100 shadow-[0_1px_4px_rgba(0,0,0,0.04)] ${className}`}>{children}</div>;
}
export function InitialsAvatar({ initials, size = "sm" }: { initials: string; size?: "sm" | "md" | "lg" }) {
  const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base" };
  return <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-semibold text-gray-600 flex-shrink-0`}>{initials}</div>;
}
export function IconButton({ icon: Icon, label, onClick, danger = false }: { icon: ComponentType<{ size?: number }>; label: string; onClick?: () => void; danger?: boolean }) {
  return <button onClick={onClick} title={label} className={`p-1.5 rounded-lg transition-colors ${danger ? "hover:bg-red-50 text-gray-400 hover:text-red-600" : "hover:bg-gray-100 text-gray-400 hover:text-gray-700"}`}><Icon size={14} /></button>;
}
