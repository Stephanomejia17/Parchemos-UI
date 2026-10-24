"use client";
import { useEffect, useState } from "react";
import { Ban, CheckCircle, Search } from "lucide-react";
import {
  InitialsAvatar as Avatar,
  SurfaceCard as Card,
  StatusBadge as Badge,
} from "@/shared/components";
import { SectionHeader } from "@/modules/admin/ui/SectionHeader";
import { adminService, type AdminUser } from "@/shared/services";
import { ActionFeedbackDialog } from "../ui/ActionFeedbackDialog";
import { SuspendUserDialog } from "./SuspendUserDialog";
import { ActivateUserDialog } from "./ActivateUserDialog";

type StatusFilter = "all" | "activa" | "suspendida";

export function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [suspending, setSuspending] = useState<AdminUser | null>(null);
  const [activating, setActivating] = useState<AdminUser | null>(null);
  const load = async () => {
    try {
      setUsers(await adminService.listUsers());
    } catch (failure) {
      setMessage(
        failure instanceof Error ? failure.message : "No se pudieron cargar los usuarios.",
      );
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const confirmSuspend = async (reason: string) => {
    if (!suspending) return;
    setBusy(suspending.id);
    setError(null);
    try {
      await adminService.suspendUser(suspending.id, reason);
      setSuspending(null);
      setMessage("Cuenta suspendida correctamente.");
      await load();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo suspender la cuenta.");
    } finally {
      setBusy(null);
    }
  };
  const confirmActivate = async () => {
    if (!activating) return;
    setBusy(activating.id);
    setError(null);
    try {
      await adminService.activateUser(activating.id);
      setActivating(null);
      setMessage("Cuenta activada correctamente.");
      await load();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo activar la cuenta.");
    } finally {
      setBusy(null);
    }
  };
  const filtered = users.filter(
    (user) =>
      (filter === "all" || user.status === filter) &&
      `${user.fullName} ${user.email}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Administración de cuentas"
        sub={`${users.length} usuarios registrados`}
      />
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o correo..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-4 text-[13px]"
          />
        </div>
        <div className="flex rounded-xl bg-gray-100 p-1">
          {(["all", "activa", "suspendida"] as StatusFilter[]).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-lg px-3 py-2 text-xs font-medium ${filter === value ? "bg-white text-[#FF6B35] shadow-sm" : "text-gray-500"}`}
            >
              {value === "all" ? "Todos" : value === "activa" ? "Activos" : "Suspendidos"}
            </button>
          ))}
        </div>
      </div>
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 text-left text-[11px] uppercase tracking-wide text-gray-400">
                <th className="px-5 py-3">Usuario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((user) => (
                <tr key={user.id}>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <Avatar initials={user.fullName.slice(0, 2).toUpperCase()} />
                      <div>
                        <div className="text-[13px] font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-[11px] text-gray-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-gray-600">{user.role}</td>
                  <td className="px-4 py-3.5">
                    <Badge status={user.status === "suspendida" ? "suspended" : "active"} />
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      disabled={busy === user.id}
                      onClick={() =>
                        user.status === "activa" ? setSuspending(user) : setActivating(user)
                      }
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium disabled:opacity-50 ${user.status === "activa" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}
                    >
                      {user.status === "activa" ? <Ban size={13} /> : <CheckCircle size={13} />}
                      {busy === user.id
                        ? "Procesando..."
                        : user.status === "activa"
                          ? "Suspender"
                          : "Activar"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="p-6 text-center text-sm text-gray-500">
              No hay usuarios con este filtro.
            </p>
          )}
        </div>
      </Card>
      {suspending && (
        <SuspendUserDialog
          user={suspending}
          saving={busy === suspending.id}
          error={error}
          onClose={() => {
            setSuspending(null);
            setError(null);
          }}
          onConfirm={(reason) => void confirmSuspend(reason)}
        />
      )}
      {activating && (
        <ActivateUserDialog
          user={activating}
          saving={busy === activating.id}
          error={error}
          onClose={() => {
            setActivating(null);
            setError(null);
          }}
          onConfirm={() => void confirmActivate()}
        />
      )}
      {message && (
        <ActionFeedbackDialog
          type="success"
          title="Operación completada"
          message={message}
          onClose={() => setMessage(null)}
        />
      )}
    </div>
  );
}
