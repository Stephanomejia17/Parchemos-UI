"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, Camera, Loader2, LogOut, MapPin, Trash2 } from "lucide-react";
import { ApiError, apiFetch, useAuth } from "@parchemos/shared/auth";
import { ComboBoxField, PrimaryButton } from "@parchemos/shared/components";
import { COLOMBIA_CITY_OPTIONS } from "@parchemos/shared/constants";

const errorMessage = (error: unknown, fallback: string) => error instanceof ApiError ? error.message : fallback;

export function Profile() {
  const { user, refreshUser, logout } = useAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setFullName(user.fullName);
    setPhone(user.phone ?? "");
    setCity(user.city ?? "");
    setPhoto(user.profilePhotoUrl);
  }, [user]);

  const selectPhoto = (file: File | undefined) => {
    if (!file) return;
    if (!["image/jpeg", "image/png"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setError("La foto debe ser JPG o PNG y no superar 5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setPhoto(String(reader.result));
    reader.readAsDataURL(file);
  };

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      await apiFetch("/auth/me", { method: "PATCH", body: { fullName: fullName.trim(), phone: phone.trim(), city: city.trim(), profilePhotoUrl: photo } });
      await refreshUser();
      setMessage("Perfil actualizado correctamente.");
    } catch (err) {
      setError(errorMessage(err, "No pudimos actualizar tu perfil."));
    } finally {
      setBusy(false);
    }
  };

  const requestDeletion = async () => {
    if (!window.confirm("¿Solicitar la eliminación de tu cuenta?")) return;
    setBusy(true);
    setError(null);
    try {
      const result = await apiFetch<{ message: string; deletionEffectiveAt: string }>("/auth/me", { method: "DELETE" });
      await refreshUser();
      setMessage(`${result.message} Fecha efectiva: ${new Date(result.deletionEffectiveAt).toLocaleDateString("es-CO")}.`);
    } catch (err) {
      setError(errorMessage(err, "No pudimos solicitar la eliminación."));
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-full overflow-y-auto bg-background px-4 py-6 md:px-8">
      <div className="mx-auto max-w-2xl">
        <header className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1><p className="mt-1 text-sm text-muted-foreground">Administra tus datos personales.</p></header>
        {error && <div role="alert" className="mb-4 flex gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
        {message && <div role="status" className="mb-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">{message}</div>}
        <form onSubmit={save} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4"><div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-gray-100">{photo ? <img src={photo} alt="Foto de perfil" className="h-full w-full object-cover" /> : <Camera className="m-7 h-6 w-6 text-gray-400" />}<label className="absolute bottom-0 right-0 cursor-pointer rounded-tl-lg bg-primary p-1.5"><Camera className="h-3.5 w-3.5 text-white" /><input type="file" accept="image/jpeg,image/png" className="hidden" onChange={event => selectPhoto(event.target.files?.[0])} /></label></div><div><p className="font-semibold text-gray-900">{user.email}</p><p className="text-sm text-muted-foreground">{user.role}</p></div></div>
          <label className="block text-sm font-medium text-gray-700">Nombre completo<input required minLength={2} maxLength={120} value={fullName} onChange={event => setFullName(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5" /></label>
          <label className="block text-sm font-medium text-gray-700">Teléfono<input required value={phone} onChange={event => setPhone(event.target.value)} className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2.5" /></label>
          {/* Misma lista de ciudades que el registro, para que la columna city no se llene de variantes del mismo municipio. */}
          <ComboBoxField label="Ciudad" icon={MapPin} placeholder="Busca tu ciudad" options={COLOMBIA_CITY_OPTIONS} value={city} onValueChange={setCity} maxLength={120} hint="¿No está en la lista? Escríbela y la guardamos igual." />
          <PrimaryButton type="submit" disabled={busy}>{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}Guardar cambios</PrimaryButton>
        </form>
        {user.assignedLocation && <section className="mt-5 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><h2 className="font-semibold text-gray-900">Sede asignada</h2><p className="mt-2 text-sm text-gray-700">{user.assignedLocation.name} · {user.assignedLocation.restaurantName}</p><p className="text-sm text-muted-foreground">{user.assignedLocation.address}</p><p className="mt-1 text-xs text-muted-foreground">Solo lectura desde el perfil.</p></section>}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row"><button type="button" onClick={() => void logout()} disabled={busy} className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700"><LogOut className="h-4 w-4" />Cerrar sesión</button><button type="button" onClick={() => void requestDeletion()} disabled={busy || user.status === "pendiente_eliminacion"} className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700"><Trash2 className="h-4 w-4" />{user.status === "pendiente_eliminacion" ? "Eliminación solicitada" : "Solicitar eliminación"}</button></div>
      </div>
    </main>
  );
}