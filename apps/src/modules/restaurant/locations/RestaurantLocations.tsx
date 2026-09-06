"use client";

import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, MapPin, Plus, Send, Store, Trash2, X } from "lucide-react";
import { ApiError, RequireAuth } from "@/shared/auth";
import { restaurantService } from "@/shared/services";
import {
  FormStepper,
  PrimaryButton,
  SurfaceCard,
  TemporaryMessage,
  type FormStep,
} from "@/shared/components";
import type {
  Location,
  LocationStatus as Status,
  Restaurant,
  Schedule,
} from "@/shared/types/restaurant";

const DAYS = [
  { label: "Lunes", value: 1 },
  { label: "Martes", value: 2 },
  { label: "Miércoles", value: 3 },
  { label: "Jueves", value: 4 },
  { label: "Viernes", value: 5 },
  { label: "Sábado", value: 6 },
  { label: "Domingo", value: 0 },
];
const statusText: Record<Status, string> = {
  pendiente_aprobacion: "Pendiente de aprobación",
  activa: "Activa",
  rechazada: "Sin solicitud",
};
const statusStyle: Record<Status, string> = {
  pendiente_aprobacion: "bg-amber-50 text-amber-700",
  activa: "bg-emerald-50 text-emerald-700",
  rechazada: "bg-gray-100 text-gray-600",
};
const errorMessage = (error: unknown, fallback: string) =>
  error instanceof ApiError ? error.message : fallback;

const LOCATION_STEPS: FormStep[] = [
  { id: "info", label: "Información" },
  { id: "hours", label: "Horarios" },
  { id: "images", label: "Imágenes" },
  { id: "preview", label: "Vista previa" },
];

interface LocationWizardData {
  name: string;
  address: string;
  description: string;
  schedules: Schedule[];
  logo: File | null;
  cover: File | null;
  gallery: File[];
}

export function RestaurantLocations() {
  return (
    <RequireAuth loginPath="/login" allowedRoles={["restaurante"]}>
      <Manager />
    </RequireAuth>
  );
}

function Manager() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]),
    [error, setError] = useState<string | null>(null),
    [busy, setBusy] = useState(false),
    [businessOpen, setBusinessOpen] = useState(false),
    [restaurantId, setRestaurantId] = useState<string | null>(null),
    [location, setLocation] = useState<Location | null>(null);
  const load = useCallback(async () => {
    try {
      setRestaurants(await restaurantService.listMyRestaurants());
    } catch (e) {
      setError(errorMessage(e, "No pudimos cargar tus restaurantes."));
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const run = async (action: () => Promise<void>, fallback: string): Promise<boolean> => {
    setBusy(true);
    setError(null);
    try {
      await action();
      await load();
      return true;
    } catch (e) {
      setError(errorMessage(e, fallback));
      return false;
    } finally {
      setBusy(false);
    }
  };
  const createBusiness = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const businessName = String(new FormData(event.currentTarget).get("businessName")).trim();
    await run(async () => {
      await restaurantService.createRestaurant(businessName);
      setBusinessOpen(false);
    }, "No pudimos crear el restaurante.");
  };
  const createLocation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!restaurantId) return;
    const form = new FormData(event.currentTarget);
    const description = String(form.get("description")).trim();
    const body = {
      name: String(form.get("name")).trim(),
      address: String(form.get("address")).trim(),
      ...(description ? { description } : {}),
    };
    await run(async () => {
      await restaurantService.createLocation(restaurantId, body);
      setRestaurantId(null);
    }, "No pudimos crear la sede.");
  };
  const finishLocation = async (data: LocationWizardData) => {
    if (!restaurantId) return;
    if (!data.schedules.length) {
      setError("Configura al menos un horario antes de finalizar la sede.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const created = await restaurantService.createLocation(restaurantId, {
        name: data.name,
        address: data.address,
        description: data.description || undefined,
      });
      const savedSchedules = await restaurantService.updateSchedules(created.id, data.schedules);
      if (!savedSchedules.length) {
        throw new Error("No se pudieron guardar los horarios de la sede.");
      }
      if (data.logo) await restaurantService.uploadLocationImage(created.id, "logo", data.logo);
      if (data.cover) await restaurantService.uploadLocationImage(created.id, "portada", data.cover);
      for (const image of data.gallery) {
        await restaurantService.uploadLocationImage(created.id, "galeria", image);
      }
      await restaurantService.requestLocationApproval(created.id);
      setRestaurantId(null);
      await load();
    } catch (e) {
      setError(errorMessage(e, "No pudimos completar la creación de la sede."));
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="min-h-full bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Panel de negocio
            </p>
            <h1 className="text-2xl font-bold text-gray-900">Mis restaurantes</h1>
            <p className="text-sm text-muted-foreground">
              Administra la información pública de cada sede.
            </p>
          </div>
          <PrimaryButton onClick={() => setBusinessOpen(true)}>
            <Plus className="h-4 w-4" />
            Añadir restaurante
          </PrimaryButton>
        </header>
        {error && <Alert text={error} close={() => setError(null)} />}
        <div className="grid gap-4 md:grid-cols-2">
          {restaurants.map((restaurant) => (
            <SurfaceCard key={restaurant.id} className="bg-white">
              <div className="p-5">
                <div className="flex gap-3">
                  <Building2 className="h-8 w-8 text-primary" />
                  <div>
                    <h2 className="font-semibold">{restaurant.businessName}</h2>
                    <p className="text-xs text-muted-foreground">
                      {restaurant.locations.length} sedes
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push(`/restaurants/${restaurant.id}/menu`)}
                  className="mt-4 flex w-full items-center justify-between rounded-xl bg-orange-50 px-4 py-3 text-left text-sm font-semibold text-primary hover:bg-orange-100"
                >
                  <span>Configuración del menú</span>
                  <span aria-hidden="true">→</span>
                </button>
                <div className="mt-4 space-y-2">
                  {restaurant.locations.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setLocation(item)}
                      className="w-full rounded-xl border bg-gray-50 p-3 text-left hover:border-orange-300"
                    >
                      <div className="flex justify-between gap-2">
                        <b className="truncate text-sm">{item.name}</b>
                        <StatusBadge status={item.status} />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        <MapPin className="mr-1 inline h-3 w-3" />
                        {item.address}
                      </p>
                      {item.rejectionReason && (
                        <p className="mt-1 text-xs text-red-600">{item.rejectionReason}</p>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setRestaurantId(restaurant.id)}
                className="w-full border-t py-3 text-sm font-semibold text-primary"
              >
                + Añadir sede
              </button>
            </SurfaceCard>
          ))}
        </div>
        {!restaurants.length && (
          <SurfaceCard className="mt-4 bg-white p-10 text-center">
            <Store className="mx-auto text-primary" />
            <p className="mt-2 text-sm">Crea tu empresa y registra una sede para comenzar.</p>
          </SurfaceCard>
        )}
        {businessOpen && (
          <Modal title="Añadir restaurante" close={() => setBusinessOpen(false)}>
            <form onSubmit={createBusiness}>
              <Field
                label="Nombre del Restaurante"
                name="businessName"
                min={2}
                max={160}
                required
              />
              <Save busy={busy} label="Crear restaurante" />
            </form>
          </Modal>
        )}
        {restaurantId && (
          <LocationWizard
            busy={busy}
            close={() => setRestaurantId(null)}
            submit={finishLocation}
          />
        )}
        {location && (
          <Profile location={location} busy={busy} close={() => setLocation(null)} run={run} />
        )}
      </div>
    </main>
  );
}

function LocationWizard({
  busy,
  close,
  submit,
}: {
  busy: boolean;
  close: () => void;
  submit: (data: LocationWizardData) => Promise<void>;
}) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<LocationWizardData>({
    name: "",
    address: "",
    description: "",
    schedules: [],
    logo: null,
    cover: null,
    gallery: [],
  });
  const update = (patch: Partial<LocationWizardData>) => setData((current) => ({ ...current, ...patch }));
  const infoErrors = {
    name:
      data.name.trim().length === 0
        ? "Ingresa el nombre de la sede."
        : data.name.trim().length < 2
          ? "El nombre debe tener al menos 2 caracteres."
          : data.name.length > 120
            ? "El nombre no puede superar 120 caracteres."
            : null,
    address:
      data.address.trim().length === 0
        ? "Ingresa la dirección de la sede."
        : data.address.trim().length < 5
          ? "La dirección debe tener al menos 5 caracteres."
          : data.address.length > 250
            ? "La dirección no puede superar 250 caracteres."
            : null,
    description:
      data.description.length > 0 && data.description.trim().length < 20
        ? "Si agregas una descripción, debe tener al menos 20 caracteres."
        : data.description.length > 2000
          ? "La descripción no puede superar 2000 caracteres."
          : null,
  };
  const scheduleError =
    data.schedules.length === 0
      ? "Selecciona al menos un día y define su horario de atención."
      : data.schedules.some((item) => item.endsAt <= item.startsAt)
        ? "La hora de cierre debe ser posterior a la hora de apertura."
        : null;
  const valid = () => {
    if (step === 0) return !infoErrors.name && !infoErrors.address && !infoErrors.description;
    if (step === 1) return !scheduleError;
    if (step === 2) return data.gallery.length >= 2 && data.gallery.length <= 5;
    return (
      !infoErrors.name &&
      !infoErrors.address &&
      !infoErrors.description &&
      !scheduleError &&
      data.gallery.length >= 2 &&
      data.gallery.length <= 5
    );
  };
  const next = () => {
    if (valid()) setStep((current) => Math.min(current + 1, LOCATION_STEPS.length - 1));
  };
  return (
    <Modal title="Añadir sede" close={close} wide>
      <FormStepper steps={LOCATION_STEPS} current={step} className="mb-7" />
      {step === 0 && (
        <section>
          <Field
            label="Nombre de la sede"
            name="name"
            min={2}
            max={120}
            required
            value={data.name}
            error={infoErrors.name}
            onChange={(name) => update({ name })}
          />
          <Field
            label="Dirección"
            name="address"
            min={5}
            max={250}
            required
            value={data.address}
            error={infoErrors.address}
            onChange={(address) => update({ address })}
          />
          <Area
            label="Descripción (opcional)"
            name="description"
            max={2000}
            value={data.description}
            error={infoErrors.description}
            onChange={(description) => update({ description })}
          />
          <div className="flex justify-end">
            <PrimaryButton type="button" onClick={next} disabled={!valid()}>
              Siguiente
            </PrimaryButton>
          </div>
        </section>
      )}
      {step === 1 && (
        <section>
          <p className="mb-4 text-sm text-muted-foreground">Configura los horarios de atención.</p>
          {scheduleError && (
            <p role="alert" className="mb-3 text-xs text-red-600">
              {scheduleError}
            </p>
          )}
          <div className="space-y-2">
            {DAYS.map(({ label, value }) => {
              const schedule = data.schedules.find((item) => item.dayOfWeek === value);
              return (
                <div key={label} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border p-3">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={Boolean(schedule)}
                      onChange={(event) =>
                        update({
                          schedules: event.target.checked
                            ? [...data.schedules, { dayOfWeek: value, startsAt: "09:00", endsAt: "18:00" }]
                            : data.schedules.filter((item) => item.dayOfWeek !== value),
                        })
                      }
                    />
                    {label}
                  </label>
                  <input
                    type="time"
                    disabled={!schedule}
                    value={schedule?.startsAt ?? "09:00"}
                    onChange={(event) => update({ schedules: data.schedules.map((item) => item.dayOfWeek === value ? { ...item, startsAt: event.target.value } : item) })}
                    className="rounded-lg border px-2 py-1 disabled:bg-gray-100"
                  />
                  <input
                    type="time"
                    disabled={!schedule}
                    value={schedule?.endsAt ?? "18:00"}
                    onChange={(event) => update({ schedules: data.schedules.map((item) => item.dayOfWeek === value ? { ...item, endsAt: event.target.value } : item) })}
                    className="rounded-lg border px-2 py-1 disabled:bg-gray-100"
                  />
                </div>
              );
            })}
          </div>
          <WizardNavigation step={step} back={() => setStep(0)} next={next} busy={busy} />
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4">
          <FileInput
            label="Logo (opcional)"
            file={data.logo}
            onChange={(logo) => update({ logo })}
          />
          <FileInput
            label="Portada (opcional)"
            file={data.cover}
            onChange={(cover) => update({ cover })}
          />
          <div>
            <label className="block text-sm font-medium">Galería (mínimo 2, máximo 5)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={data.gallery.length >= 5}
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                const room = 5 - data.gallery.length;
                update({ gallery: [...data.gallery, ...files.slice(0, room)] });
                e.target.value = "";
              }}
              className="mt-1 block w-full rounded-xl border p-2 text-sm disabled:bg-gray-100"
            />
            <p className={`mt-1 text-xs ${data.gallery.length >= 2 ? "text-emerald-700" : "text-red-600"}`}>
              {data.gallery.length} de 5 imágenes seleccionadas.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {data.gallery.map((file, i) => (
                <div key={`${file.name}-${file.lastModified}`} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="aspect-square rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => update({ gallery: data.gallery.filter((_, idx) => idx !== i) })}
                    className="absolute right-1 top-1 rounded bg-white p-1"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <WizardNavigation step={step} back={() => setStep(1)} next={next} busy={busy} disabled={!valid()} />
        </section>
      )}


      {step === 3 && (
        <section>
          <div className="rounded-2xl border bg-gray-50 p-5">
            <h3 className="text-lg font-semibold">{data.name}</h3>
            <p className="mt-1 text-sm text-gray-600">{data.address}</p>
            {data.description && <p className="mt-3 text-sm">{data.description}</p>}
            <p className="mt-3 text-sm text-gray-600">{data.schedules.length} días configurados · {data.gallery.length} imágenes de galería</p>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {[...data.gallery, ...(data.logo ? [data.logo] : []), ...(data.cover ? [data.cover] : [])].map((file) => <img key={`${file.name}-${file.lastModified}`} src={URL.createObjectURL(file)} alt={file.name} className="aspect-square rounded-xl object-cover" />)}
            </div>
          </div>
          <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Al finalizar, la sede quedará pendiente de aprobación por el administrador.</p>
          <WizardNavigation
            step={step}
            back={() => setStep(2)}
            submit={() => void submit(data)}
            busy={busy}
            disabled={!valid()}
          />
        </section>
      )}
    </Modal>
  );
}

function WizardNavigation({ step, back, next, submit, busy, disabled = false }: { step: number; back: () => void; next?: () => void; submit?: () => void; busy: boolean; disabled?: boolean }) {
  return (
    <div className="mt-6 flex justify-between gap-3 border-t pt-4">
      <PrimaryButton type="button" variant="secondary" onClick={back}>Atrás</PrimaryButton>
      {step === LOCATION_STEPS.length - 1 ? (
        <PrimaryButton type="button" onClick={submit} disabled={busy}>{busy ? "Guardando..." : "Finalizar y solicitar aprobación"}</PrimaryButton>
      ) : (
        <PrimaryButton type="button" onClick={next} disabled={busy || disabled}>Siguiente</PrimaryButton>
      )}
    </div>
  );
}

function FileInput({ label, file, onChange }: { label: string; file: File | null; onChange: (file: File | null) => void }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => onChange(event.target.files?.[0] ?? null)} className="mt-1 block w-full rounded-xl border p-2 text-sm" />
      {file && <img src={URL.createObjectURL(file)} alt={file.name} className="mt-3 h-24 w-24 rounded-xl object-cover" />}
    </label>
  );
}

function Profile({
  location,
  busy,
  close,
  run,
}: {
  location: Location;
  busy: boolean;
  close: () => void;
  run: (action: () => Promise<void>, fallback: string) => Promise<boolean>;
}) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState({
    name: location.name,
    address: location.address,
    description: location.description ?? "",
    schedules: location.schedules,
    images: location.images,
    removedImageIds: [] as string[],
    logoFile: null as File | null,
    coverFile: null as File | null,
    newGalleryFiles: [] as File[],
  });
  const [requestSuccess, setRequestSuccess] = useState(false);

  const update = (patch: Partial<typeof draft>) =>
    setDraft((current) => ({ ...current, ...patch }));

  const infoErrors = {
    name:
      draft.name.trim().length < 2
        ? "El nombre debe tener al menos 2 caracteres."
        : draft.name.length > 120
          ? "El nombre no puede superar 120 caracteres."
          : null,
    address:
      draft.address.trim().length < 5
        ? "La dirección debe tener al menos 5 caracteres."
        : draft.address.length > 250
          ? "La dirección no puede superar 250 caracteres."
          : null,
    description:
      draft.description.length > 0 && draft.description.trim().length < 20
        ? "Si agregas una descripción, debe tener al menos 20 caracteres."
        : draft.description.length > 2000
          ? "La descripción no puede superar 2000 caracteres."
          : null,
  };
  const scheduleError =
    draft.schedules.length === 0
      ? "Selecciona al menos un día y define su horario de atención."
      : draft.schedules.some((item) => item.endsAt <= item.startsAt)
        ? "La hora de cierre debe ser posterior a la hora de apertura."
        : null;
  const visibleGalleryCount =
    draft.images.filter((img) => !draft.removedImageIds.includes(img.id)).length +
    draft.newGalleryFiles.length;

  const valid = () => {
    if (step === 0) return !infoErrors.name && !infoErrors.address && !infoErrors.description;
    if (step === 1) return !scheduleError;
    if (step === 2) return visibleGalleryCount >= 2 && visibleGalleryCount <= 5;
    return (
      !infoErrors.name &&
      !infoErrors.address &&
      !infoErrors.description &&
      !scheduleError &&
      visibleGalleryCount >= 2 &&
      visibleGalleryCount <= 5
    );
  };
  const next = () => {
    if (valid()) setStep((current) => Math.min(current + 1, LOCATION_STEPS.length - 1));
  };
  const back = () => setStep((current) => Math.max(current - 1, 0));

  const submit = async () => {
    const success = await run(async () => {
      await restaurantService.updateLocationInfo(location.id, {
        name: draft.name.trim(),
        address: draft.address.trim(),
        description: draft.description.trim() || undefined,
      });
      await restaurantService.updateSchedules(
        location.id,
        draft.schedules.map(({ dayOfWeek, startsAt, endsAt }) => ({ dayOfWeek, startsAt, endsAt })),
      );
      if (draft.logoFile) {
        await restaurantService.uploadLocationImage(location.id, "logo", draft.logoFile);
      }
      if (draft.coverFile) {
        await restaurantService.uploadLocationImage(location.id, "portada", draft.coverFile);
      }
      for (const id of draft.removedImageIds) {
        await restaurantService.removeGalleryImage(location.id, id);
      }
      for (const file of draft.newGalleryFiles) {
        await restaurantService.uploadLocationImage(location.id, "galeria", file);
      }
      if (location.status !== "activa") {
        await restaurantService.requestLocationApproval(location.id);
      }
    }, "No pudimos guardar los cambios; inténtalo de nuevo.");
    if (success) setRequestSuccess(true);
  };

  return (
    <Modal title={location.name} close={close} wide>
      <FormStepper steps={LOCATION_STEPS} current={step} className="mb-7" />
      {step === 0 && (
        <section>
          <Field
            label="Nombre" name="name" min={2} max={120} required
            value={draft.name} error={infoErrors.name}
            onChange={(name) => update({ name })}
          />
          <Field
            label="Dirección" name="address" min={5} max={250} required
            value={draft.address} error={infoErrors.address}
            onChange={(address) => update({ address })}
          />
          <Area
            label="Descripción (opcional)" name="description" max={2000}
            value={draft.description} error={infoErrors.description}
            onChange={(description) => update({ description })}
          />
          <div className="flex justify-end">
            <PrimaryButton type="button" onClick={next} disabled={!valid()}>Siguiente</PrimaryButton>
          </div>
        </section>
      )}
      {step === 1 && (
        <section>
          {scheduleError && (
            <p role="alert" className="mb-3 text-xs text-red-600">{scheduleError}</p>
          )}
          <div className="space-y-2">
            {DAYS.map(({ label, value }) => {
              const schedule = draft.schedules.find((item) => item.dayOfWeek === value);
              return (
                <div key={label} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border p-3">
                  <label className="flex items-center gap-2 text-sm font-medium">
                    <input
                      type="checkbox"
                      checked={Boolean(schedule)}
                      onChange={(e) =>
                        update({
                          schedules: e.target.checked
                            ? [...draft.schedules, { dayOfWeek: value, startsAt: "09:00", endsAt: "18:00" }]
                            : draft.schedules.filter((item) => item.dayOfWeek !== value),
                        })
                      }
                    />
                    {label}
                  </label>
                  <input
                    type="time" disabled={!schedule} value={schedule?.startsAt ?? "09:00"}
                    onChange={(e) => update({ schedules: draft.schedules.map((item) => item.dayOfWeek === value ? { ...item, startsAt: e.target.value } : item) })}
                    className="rounded-lg border px-2 py-1 disabled:bg-gray-100"
                  />
                  <input
                    type="time" disabled={!schedule} value={schedule?.endsAt ?? "18:00"}
                    onChange={(e) => update({ schedules: draft.schedules.map((item) => item.dayOfWeek === value ? { ...item, endsAt: e.target.value } : item) })}
                    className="rounded-lg border px-2 py-1 disabled:bg-gray-100"
                  />
                </div>
              );
            })}
          </div>
          <WizardNavigation step={step} back={back} next={next} busy={busy} />
        </section>
      )}


      {step === 2 && (
        <section className="space-y-4">
          <FileInput
            label="Logo (opcional)"
            file={draft.logoFile}
            onChange={(logoFile) => update({ logoFile })}
          />
          <FileInput
            label="Portada (opcional)"
            file={draft.coverFile}
            onChange={(coverFile) => update({ coverFile })}
          />
          <div>
            <label className="block text-sm font-medium">Galería (mínimo 2, máximo 5)</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={visibleGalleryCount >= 5}
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                const room = 5 - visibleGalleryCount;
                update({ newGalleryFiles: [...draft.newGalleryFiles, ...files.slice(0, room)] });
                e.target.value = "";
              }}
              className="mt-1 block w-full rounded-xl border p-2 text-sm disabled:bg-gray-100"
            />
            <p className={`mt-1 text-xs ${visibleGalleryCount >= 2 ? "text-emerald-700" : "text-red-600"}`}>
              {visibleGalleryCount} de 5 imágenes seleccionadas.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
              {draft.images
                .filter((img) => !draft.removedImageIds.includes(img.id))
                .map((img) => (
                  <div key={img.id} className="relative">
                    <img src={img.url} alt="Galería" className="aspect-square rounded-xl object-cover" />
                    <button
                      type="button"
                      onClick={() => update({ removedImageIds: [...draft.removedImageIds, img.id] })}
                      className="absolute right-1 top-1 rounded bg-white p-1"
                    >
                      <X className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                ))}
              {draft.newGalleryFiles.map((file, i) => (
                <div key={`${file.name}-${file.lastModified}`} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="aspect-square rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      update({ newGalleryFiles: draft.newGalleryFiles.filter((_, idx) => idx !== i) })
                    }
                    className="absolute right-1 top-1 rounded bg-white p-1"
                  >
                    <X className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <WizardNavigation step={step} back={back} next={next} busy={busy} disabled={!valid()} />
        </section>
      )}


      {requestSuccess && (
        <p role="status" className="mb-4 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Cambios guardados correctamente.
        </p>
      )}
      {step === 3 && (
        <section>
          <div className="rounded-2xl border bg-gray-50 p-5">
            <h3 className="text-lg font-semibold">{draft.name}</h3>
            <p className="mt-1 text-sm text-gray-600">{draft.address}</p>
            {draft.description && <p className="mt-3 text-sm">{draft.description}</p>}
            <p className="mt-3 text-sm text-gray-600">
              {draft.schedules.length} días configurados · {visibleGalleryCount} imágenes de galería
            </p>
          </div>
          {location.status !== "activa" && (
            <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              Al guardar, la sede quedará pendiente de aprobación por el administrador.
            </p>
          )}
          <WizardNavigation
            step={step}
            back={back}
            submit={requestSuccess ? close : () => void submit()}
            busy={busy}
            disabled={!valid()}
          />
        </section>
      )}
    </Modal>
  );
}

function AddImageUrl({ disabled, onAdd }: { disabled: boolean; onAdd: (url: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="mt-1 flex gap-2">
      <input
        type="url" value={value} disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        placeholder="https://imagen..."
        className="min-w-0 flex-1 rounded-lg border px-2 py-1.5 text-sm disabled:bg-gray-100"
      />
      <PrimaryButton
        type="button"
        disabled={disabled || !value.trim()}
        onClick={() => { onAdd(value.trim()); setValue(""); }}
      >
        <Plus className="h-4 w-4" />
      </PrimaryButton>
    </div>
  );
}

function Hours({
  schedules,
  setSchedules,
  save,
  busy,
}: {
  schedules: Schedule[];
  setSchedules: (items: Schedule[]) => void;
  save: () => void;
  busy: boolean;
}) {
  const byDay = (day: number) => schedules.find((item) => item.dayOfWeek === day);
  const setDay = (day: number, patch: Partial<Schedule> | null) => {
    const existing = byDay(day);
    setSchedules(
      patch
        ? [
          ...schedules.filter((item) => item.dayOfWeek !== day),
          { dayOfWeek: day, startsAt: "09:00", endsAt: "18:00", ...existing, ...patch },
        ]
        : schedules.filter((item) => item.dayOfWeek !== day),
    );
  };
  return (
    <section>
      <p className="mb-4 text-sm text-muted-foreground">
        Configura un horario por día. Desactiva el día cuando no atiendas.
      </p>
      <div className="space-y-2">
        {DAYS.map(({ label, value }) => {
          const item = byDay(value),
            open = Boolean(item);
          return (
            <div
              key={label}
              className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border p-3"
            >
              <label className="flex items-center gap-2 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={open}
                  onChange={(e) => setDay(value, e.target.checked ? {} : null)}
                />
                {label}
              </label>
              <input
                type="time"
                disabled={!open}
                value={item?.startsAt ?? "09:00"}
                onChange={(e) => setDay(value, { startsAt: e.target.value })}
                className="rounded-lg border px-2 py-1 disabled:bg-gray-100"
              />
              <input
                type="time"
                disabled={!open}
                value={item?.endsAt ?? "18:00"}
                onChange={(e) => setDay(value, { endsAt: e.target.value })}
                className="rounded-lg border px-2 py-1 disabled:bg-gray-100"
              />
            </div>
          );
        })}
      </div>
      <PrimaryButton onClick={save} disabled={busy} className="mt-4">
        {busy && <Loader2 className="h-4 w-4 animate-spin" />}Guardar horarios
      </PrimaryButton>
    </section>
  );
}

function Images({
  location,
  busy,
  saveImage,
  addGallery,
  removeGallery,
}: {
  location: Location;
  busy: boolean;
  saveImage: (kind: "logo" | "portada", url: string) => Promise<boolean>;
  addGallery: (url: string) => Promise<boolean>;
  removeGallery: (id: string) => Promise<boolean>;
}) {
  const [success, setSuccess] = useState<string | null>(null);
  const submit = async (
    event: FormEvent<HTMLFormElement>,
    label: string,
    action: (url: string) => Promise<boolean>,
  ) => {
    event.preventDefault();
    const url = String(new FormData(event.currentTarget).get("url")).trim();
    if (await action(url)) setSuccess(`${label} guardada correctamente.`);
  };
  const input = (label: string, action: (url: string) => Promise<boolean>) => (
    <form onSubmit={(e) => void submit(e, label, action)} className="rounded-xl border p-3">
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <div className="flex gap-2">
        <input
          required
          name="url"
          type="url"
          pattern="https://.*"
          placeholder="https://imagen..."
          className="min-w-0 flex-1 rounded-lg border px-2 py-1.5 text-sm"
        />
        <PrimaryButton type="submit" disabled={busy}>
          Guardar
        </PrimaryButton>
      </div>
    </form>
  );
  return (
    <section className="space-y-4">
      {success && (
        <p role="status" className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          {success}
        </p>
      )}
      {input("URL del logo", (url) => saveImage("logo", url))}
      {input("URL de la portada", (url) => saveImage("portada", url))}
      {input("URL para añadir a la galería", addGallery)}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {location.images.map((image) => (
          <div key={image.id} className="relative">
            <img
              src={image.url}
              alt="Galería"
              className="aspect-video w-full rounded-xl object-cover"
            />
            <button
              onClick={() => void removeGallery(image.id)}
              className="absolute right-1 top-1 rounded bg-white p-1"
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
function Preview({ location }: { location: Location }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="h-40 bg-orange-100">
        {location.coverUrl && (
          <img src={location.coverUrl} alt="Portada" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="p-5">
        <div className="-mt-12 mb-3 h-16 w-16 overflow-hidden rounded-xl border-4 border-white bg-white">
          {location.logoUrl && (
            <img src={location.logoUrl} alt="Logo" className="h-full w-full object-cover" />
          )}
        </div>
        <h3 className="font-bold">{location.name}</h3>
        {location.description && <p className="mt-1 text-sm">{location.description}</p>}
        <p className="mt-2 text-sm text-gray-600">{location.address}</p>
        {location.images.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {location.images.map((image) => (
              <img
                key={image.id}
                src={image.url}
                alt="Galería"
                className="aspect-video w-full rounded object-cover"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
function Modal({
  title,
  close,
  children,
  wide = false,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/30 p-4">
      <SurfaceCard className={`mx-auto my-6 bg-white p-5 ${wide ? "max-w-3xl" : "max-w-md"}`}>
        <div className="mb-4 flex justify-between">
          <h2 className="font-semibold">{title}</h2>
          <button onClick={close}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </SurfaceCard>
    </div>
  );
}
function Field({
  label,
  name,
  min,
  max,
  required,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  min: number;
  max: number;
  required: boolean;
  value?: string;
  onChange?: (value: string) => void;
  error?: string | null;
}) {
  const message = `${label} es obligatorio y debe tener entre ${min} y ${max} caracteres.`;
  return (
    <label className="mb-3 block text-sm">
      {label}
      <input
        required={required}
        name={name}
        minLength={min}
        maxLength={max}
        defaultValue={value}
        onChange={(event) => onChange?.(event.target.value)}
        onInvalid={(event) => {
          event.currentTarget.setCustomValidity(message);
          event.currentTarget.parentElement?.querySelector("small")?.removeAttribute("hidden");
        }}
        onInput={(event) => {
          event.currentTarget.setCustomValidity("");
          event.currentTarget.parentElement?.querySelector("small")?.setAttribute("hidden", "true");
        }}
        aria-invalid={Boolean(error)}
        className={`mt-1 w-full rounded-xl border p-2.5 ${error ? "border-red-300" : ""}`}
      />
      <small hidden={!error} className="mt-1 block text-xs text-red-600">{error ?? message}</small>
    </label>
  );
}
function Area({
  label,
  name,
  max,
  value,
  onChange,
  error,
}: {
  label: string;
  name: string;
  max: number;
  value?: string;
  onChange?: (value: string) => void;
  error?: string | null;
}) {
  return (
    <label className="mb-3 block text-sm">
      {label}
      <textarea
        name={name}
        maxLength={max}
        defaultValue={value}
        onChange={(event) => onChange?.(event.target.value)}
        rows={4}
        aria-invalid={Boolean(error)}
        className={`mt-1 w-full rounded-xl border p-2.5 ${error ? "border-red-300" : ""}`}
      />
      {error && <small role="alert" className="mt-1 block text-xs text-red-600">{error}</small>}
    </label>
  );
}
function Save({ busy, label }: { busy: boolean; label: string }) {
  return (
    <PrimaryButton type="submit" disabled={busy}>
      {busy && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </PrimaryButton>
  );
}
function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`shrink-0 rounded px-2 py-1 text-xs ${statusStyle[status]}`}>
      {statusText[status]}
    </span>
  );
}
function Alert({ text, close }: { text: string; close: () => void }) {
  return <TemporaryMessage type="error" message={text} onClose={close} />;
}
