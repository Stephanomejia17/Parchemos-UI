"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { AlertCircle, Eye, Loader2, Pencil, Plus, Power, RotateCcw, UsersRound, X } from "lucide-react";
import { ApiError, apiFetch, RequireAuth } from "@parchemos/shared/auth";
import { PrimaryButton, SurfaceCard } from "@parchemos/shared/components";

type AccountStatus = "activa" | "deshabilitada";
type Location = { id: string; name: string; status: "activa" | "pendiente_aprobacion" | "rechazada" };
type Restaurant = { id: string; businessName: string; locations: Location[] };
type StaffMember = {
  id: string;
  user: { id: string; fullName: string; email: string; phone: string | null; status: AccountStatus; createdAt: string };
  location: { id: string; name: string; restaurantId: string };
  createdAt: string;
};

const errorMessage = (error: unknown, fallback: string) => error instanceof ApiError ? error.message : fallback;
const dateFormat = new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" });

export function Staff() {
  return <RequireAuth loginPath="/login" allowedRoles={["restaurante"]}><StaffManager /></RequireAuth>;
}

function StaffManager() {
  const [staff, setStaff] = useState<StaffMember[]>([]), [locations, setLocations] = useState<Location[]>([]);
  const [error, setError] = useState<string | null>(null), [busy, setBusy] = useState(false), [createOpen, setCreateOpen] = useState(false), [selected, setSelected] = useState<StaffMember | null>(null);
  const load = useCallback(async () => {
    try {
      const [people, restaurants] = await Promise.all([
        apiFetch<StaffMember[]>("/restaurantes/personal"), apiFetch<Restaurant[]>("/restaurantes/mios"),
      ]);
      setStaff(people);
      setLocations(restaurants.flatMap(item => item.locations).filter(item => item.status === "activa"));
    } catch (cause) { setError(errorMessage(cause, "No pudimos cargar el personal.")); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const run = async (action: () => Promise<unknown>, fallback: string) => {
    setBusy(true); setError(null);
    try { await action(); await load(); return true; }
    catch (cause) { setError(errorMessage(cause, fallback)); return false; }
    finally { setBusy(false); }
  };
  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const created = await run(() => apiFetch("/restaurantes/personal", { method: "POST", body: {
      fullName: String(form.get("fullName")).trim(), email: String(form.get("email")).trim(), phone: String(form.get("phone")).trim() || undefined,
      locationId: String(form.get("locationId")), initialPassword: String(form.get("initialPassword")),
    } }), "No pudimos crear la cuenta de personal.");
    if (created) setCreateOpen(false);
  };
  const setEnabled = (member: StaffMember, enabled: boolean) => run(
    () => apiFetch(`/restaurantes/personal/${member.id}/${enabled ? "habilitar" : "deshabilitar"}`, { method: "POST" }),
    "No pudimos actualizar el acceso.",
  );
  return <main className="min-h-full bg-gray-50 px-4 py-6"><div className="mx-auto max-w-5xl"><header className="mb-6 flex items-start justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-wider text-primary">Panel de negocio</p><h1 className="text-2xl font-bold text-gray-900">Gestión de personal</h1><p className="text-sm text-muted-foreground">Crea cuentas, asigna sedes y controla el acceso de tu equipo.</p></div><PrimaryButton onClick={() => setCreateOpen(true)} disabled={!locations.length}><Plus className="h-4 w-4" />Añadir personal</PrimaryButton></header>{error && <Alert text={error} close={() => setError(null)} />}{!locations.length && <p className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Necesitas al menos una sede aprobada para crear y asignar personal.</p>}<SurfaceCard className="overflow-hidden bg-white"><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500"><tr><th className="px-5 py-3">Personal</th><th className="px-5 py-3">Sede</th><th className="px-5 py-3">Estado</th><th className="px-5 py-3 text-right">Acciones</th></tr></thead><tbody>{staff.map(member => <tr key={member.id} className="border-t"><td className="px-5 py-4"><p className="font-medium text-gray-900">{member.user.fullName}</p><p className="text-xs text-gray-500">{member.user.email}</p></td><td className="px-5 py-4">{member.location.name}</td><td className="px-5 py-4"><Status status={member.user.status} /></td><td className="px-5 py-4"><div className="flex justify-end gap-2"><IconAction label="Ver detalle" onClick={() => setSelected(member)}><Eye className="h-4 w-4" /></IconAction><IconAction label={member.user.status === "activa" ? "Deshabilitar acceso" : "Habilitar acceso"} disabled={busy} onClick={() => void setEnabled(member, member.user.status !== "activa")}>{member.user.status === "activa" ? <Power className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}</IconAction></div></td></tr>)}</tbody></table></div>{!staff.length && <div className="p-10 text-center text-sm text-muted-foreground"><UsersRound className="mx-auto mb-2 h-7 w-7 text-primary" />Aún no has creado cuentas de personal.</div>}</SurfaceCard>{createOpen && <CreateModal locations={locations} busy={busy} close={() => setCreateOpen(false)} submit={create} />}{selected && <DetailModal member={selected} locations={locations} busy={busy} close={() => setSelected(null)} run={run} />}</div></main>;
}

function CreateModal({ locations, busy, close, submit }: { locations: Location[]; busy: boolean; close: () => void; submit: (event: FormEvent<HTMLFormElement>) => void }) {
  return <Modal title="Crear cuenta de personal" close={close}><form onSubmit={submit} className="space-y-3"><Input label="Nombre completo" name="fullName" minLength={2} required /><Input label="Correo electrónico" name="email" type="text" inputMode="email" required /><Input label="Teléfono (opcional)" name="phone" /><SelectLocation locations={locations} /><Input label="Contraseña inicial" name="initialPassword" type="password" minLength={8} required hint="Mínimo 8 caracteres, una mayúscula y un número." /><p className="rounded-lg bg-amber-50 p-2 text-xs text-amber-800">Comparte la contraseña inicial con el integrante por un canal seguro.</p><PrimaryButton type="submit" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Crear cuenta</PrimaryButton></form></Modal>;
}

function DetailModal({ member, locations, busy, close, run }: { member: StaffMember; locations: Location[]; busy: boolean; close: () => void; run: (action: () => Promise<unknown>, fallback: string) => Promise<boolean> }) {
  const [editing, setEditing] = useState(false);
  const update = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); const ok = await run(() => apiFetch(`/restaurantes/personal/${member.id}`, { method: "PATCH", body: { fullName: String(form.get("fullName")).trim(), phone: String(form.get("phone")).trim() } }), "No pudimos editar la cuenta."); if (ok) { setEditing(false); close(); } };
  const reassign = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); const locationId = String(new FormData(event.currentTarget).get("locationId")); const ok = await run(() => apiFetch(`/restaurantes/personal/${member.id}/sede`, { method: "PUT", body: { locationId } }), "No pudimos reasignar la sede."); if (ok) close(); };
  return <Modal title={editing ? "Editar cuenta" : "Detalle del personal"} close={close}>{editing ? <form onSubmit={update} className="space-y-3"><Input label="Nombre completo" name="fullName" minLength={2} required defaultValue={member.user.fullName} /><Input label="Teléfono" name="phone" defaultValue={member.user.phone ?? ""} /><PrimaryButton type="submit" disabled={busy}>Guardar cambios</PrimaryButton></form> : <><dl className="space-y-3 text-sm"><Row label="Nombre" value={member.user.fullName} /><Row label="Correo" value={member.user.email} /><Row label="Teléfono" value={member.user.phone ?? "No registrado"} /><Row label="Sede asignada" value={member.location.name} /><Row label="Estado" value={<Status status={member.user.status} />} /><Row label="Fecha de creación" value={dateFormat.format(new Date(member.createdAt))} /></dl><div className="mt-5 flex gap-2"><PrimaryButton onClick={() => setEditing(true)}><Pencil className="h-4 w-4" />Editar datos</PrimaryButton></div><form onSubmit={reassign} className="mt-5 border-t pt-4"><label className="block text-sm font-medium">Reasignar sede<SelectLocation locations={locations} defaultValue={member.location.id} /></label><PrimaryButton type="submit" disabled={busy} className="mt-3">Guardar sede</PrimaryButton></form></>}</Modal>;
}

function SelectLocation({ locations, defaultValue }: { locations: Location[]; defaultValue?: string }) { return <select required name="locationId" defaultValue={defaultValue ?? ""} className="mt-1 w-full rounded-xl border p-2.5"><option value="" disabled>Selecciona una sede</option>{locations.map(location => <option key={location.id} value={location.id}>{location.name}</option>)}</select>; }
function Input({ label, hint, ...props }: { label: string; hint?: string } & React.InputHTMLAttributes<HTMLInputElement>) { return <label className="block text-sm font-medium">{label}<input {...props} className="mt-1 w-full rounded-xl border p-2.5 font-normal" />{hint && <small className="mt-1 block font-normal text-xs text-gray-500">{hint}</small>}</label>; }
function Row({ label, value }: { label: string; value: ReactNode }) { return <div className="flex justify-between gap-4"><dt className="text-gray-500">{label}</dt><dd className="text-right font-medium text-gray-900">{value}</dd></div>; }
function Status({ status }: { status: AccountStatus }) { return <span className={`rounded-full px-2 py-1 text-xs font-medium ${status === "activa" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>{status === "activa" ? "Activa" : "Deshabilitada"}</span>; }
function IconAction({ label, children, ...props }: { label: string; children: ReactNode } & React.ButtonHTMLAttributes<HTMLButtonElement>) { return <button type="button" aria-label={label} title={label} className="rounded-lg border p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50" {...props}>{children}</button>; }
function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) { return <div className="fixed inset-0 z-50 overflow-auto bg-black/30 p-4"><SurfaceCard className="mx-auto my-6 max-w-lg bg-white p-5"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">{title}</h2><button type="button" onClick={close} aria-label="Cerrar"><X className="h-5 w-5" /></button></div>{children}</SurfaceCard></div>; }
function Alert({ text, close }: { text: string; close: () => void }) { return <div role="alert" className="fixed left-1/2 top-5 z-[60] flex w-[min(92vw,42rem)] -translate-x-1/2 justify-between rounded-xl bg-red-50 p-3 text-sm text-red-700 shadow-lg"><span><AlertCircle className="mr-2 inline h-4 w-4" />{text}</span><button type="button" onClick={close} aria-label="Cerrar"><X className="h-4 w-4" /></button></div>; }
