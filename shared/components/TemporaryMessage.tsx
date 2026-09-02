"use client";

import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { useEffect } from "react";

export type TemporaryMessageType = "success" | "error" | "warning" | "info";

const styles = {
  success: { border: "border-green-500", icon: "bg-green-100 text-green-700", button: "bg-green-600", title: "Operación exitosa", Icon: CheckCircle2 },
  error: { border: "border-red-500", icon: "bg-red-100 text-red-700", button: "bg-red-600", title: "No se pudo completar", Icon: AlertCircle },
  warning: { border: "border-amber-500", icon: "bg-amber-100 text-amber-700", button: "bg-amber-600", title: "Ten en cuenta", Icon: TriangleAlert },
  info: { border: "border-blue-500", icon: "bg-blue-100 text-blue-700", button: "bg-blue-600", title: "Información", Icon: Info },
} as const;

export function TemporaryMessage({ type, message, onClose, duration = 4000 }: { type: TemporaryMessageType; message: string; onClose: () => void; duration?: number }) {
  const style = styles[type];
  useEffect(() => {
    const timer = window.setTimeout(onClose, duration);
    return () => window.clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4" role={type === "error" ? "alertdialog" : "status"} aria-modal="true">
      <div className={`relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl ${style.border} border-t-4`}>
        <button type="button" onClick={onClose} aria-label="Cerrar mensaje" className="absolute right-5 top-5 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"><X className="h-4 w-4" /></button>
        <div className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${style.icon}`}><style.Icon className="h-6 w-6" /></div>
        <h3 className="mt-3 text-lg font-bold text-gray-900">{style.title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
        <button type="button" onClick={onClose} className={`mt-5 rounded-xl px-5 py-2.5 text-sm font-semibold text-white ${style.button}`}>Entendido</button>
      </div>
    </div>
  );
}
