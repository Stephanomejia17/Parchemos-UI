"use client";
import { CheckCircle2, XCircle } from "lucide-react";
import { ModerationDialog } from "./ModerationDialog";

export function ActionFeedbackDialog({ type, title, message, onClose }: { type: "success" | "error"; title: string; message: string; onClose: () => void }) {
  const success = type === "success";
  return <ModerationDialog title={title} onClose={onClose} actions={<button type="button" onClick={onClose} className={`min-h-11 rounded-xl px-5 py-2.5 text-sm font-semibold text-white ${success ? "bg-emerald-600" : "bg-red-600"}`}>Cerrar</button>}><div className="mt-5 flex items-start gap-3 rounded-2xl bg-gray-50 p-4"><div className={success ? "text-emerald-600" : "text-red-600"}>{success ? <CheckCircle2 size={24} /> : <XCircle size={24} />}</div><p className="text-sm text-gray-700">{message}</p></div></ModerationDialog>;
}
