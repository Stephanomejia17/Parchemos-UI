"use client";

import { useState } from "react";
import type { AdminUser } from "@/shared/services";
import { ModerationDialog } from "../ui/ModerationDialog";

export function SuspendUserDialog({ user, saving, error, onClose, onConfirm }: { user: AdminUser; saving: boolean; error: string | null; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState("");
  return <ModerationDialog title="Suspender cuenta" description={`La cuenta de ${user.fullName} dejará de acceder a la plataforma.`} onClose={onClose} actions={<><button type="button" disabled={saving} onClick={onClose} className="min-h-11 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700">Cancelar</button><button type="button" disabled={saving || !reason.trim()} onClick={() => onConfirm(reason.trim())} className="min-h-11 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Suspendiendo..." : "Suspender cuenta"}</button></>}><label className="mt-5 block text-sm font-medium text-gray-700">Motivo obligatorio<textarea autoFocus value={reason} onChange={(event) => setReason(event.target.value)} maxLength={1000} className="mt-1.5 min-h-28 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100" placeholder="Explica el motivo de la suspensión" /></label>{error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}</ModerationDialog>;
}
