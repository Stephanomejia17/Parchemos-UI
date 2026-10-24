"use client";

import { ModerationDialog } from "../ui/ModerationDialog";
import type { AdminUser } from "@/shared/services";

export function ActivateUserDialog({ user, saving, error, onClose, onConfirm }: { user: AdminUser; saving: boolean; error: string | null; onClose: () => void; onConfirm: () => void }) {
  return <ModerationDialog title="Activar cuenta" description={`La cuenta de ${user.fullName} podrá volver a iniciar sesión.`} onClose={onClose} actions={<><button type="button" disabled={saving} onClick={onClose} className="min-h-11 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700">Cancelar</button><button type="button" disabled={saving} onClick={onConfirm} className="min-h-11 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Activando..." : "Activar cuenta"}</button></>}>{error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}<p className="mt-5 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">La activación no restaura sesiones ni tokens revocados anteriormente.</p></ModerationDialog>;
}
