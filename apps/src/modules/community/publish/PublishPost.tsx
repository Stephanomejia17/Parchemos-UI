"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ComponentType,
  type DragEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Camera, ImagePlus, Images, Loader2, MapPin, Search, Video, X } from "lucide-react";
import { FormAlert, PrimaryButton } from "@/shared/components";
import { useAuth } from "@/shared/auth";
import { ApiError } from "@/shared/auth/types";
import { postService, restaurantService } from "@/shared/services";
import type { LocationSearchResult } from "@/shared/services/restaurant/restaurant.service";
import {
  ALLOWED_FORMATS_LABEL,
  MAX_POST_MEDIA_FILES,
  POST_MEDIA_ACCEPT,
  isVideoFile,
  validatePostMedia,
} from "@/shared/utils/post-media";

interface SelectedMedia {
  id: string;
  file: File;
  previewUrl: string;
}

const MIN_QUERY_LENGTH = 2;
const SEARCH_DEBOUNCE_MS = 300;

export function PublishPost({ feedHref }: { feedHref: string }) {
  const { user } = useAuth();
  // Un restaurante siempre publica a nombre de una de sus sedes; un comensal puede asociar una o ninguna.
  const isOwner = user?.role === "restaurante";
  const router = useRouter();
  const [media, setMedia] = useState<SelectedMedia[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [caption, setCaption] = useState("");
  const [location, setLocation] = useState<LocationSearchResult | null>(null);
  const [showAssociateModal, setShowAssociateModal] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<SelectedMedia[]>([]);
  const [ownLocations, setOwnLocations] = useState<LocationSearchResult[] | null>(null);
  const [ownLocationsError, setOwnLocationsError] = useState<string | null>(null);

  const uploading = progress !== null;

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  // Libera las vistas previas al salir de la pantalla.
  useEffect(
    () => () => {
      mediaRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      abortRef.current?.abort();
    },
    [],
  );

  const addFiles = (incoming: File[]) => {
    const errors: string[] = [];
    const accepted: SelectedMedia[] = [];
    for (const file of incoming) {
      const reason = validatePostMedia(file);
      if (reason) {
        errors.push(reason);
      } else if (media.length + accepted.length >= MAX_POST_MEDIA_FILES) {
        errors.push(`Puedes adjuntar hasta ${MAX_POST_MEDIA_FILES} archivos por publicación.`);
        break;
      } else {
        accepted.push({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) });
      }
    }
    setFileErrors(errors);
    if (accepted.length) setMedia((current) => [...current, ...accepted]);
  };

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(event.dataTransfer.files ?? []));
  };

  const removeMedia = (id: string) => {
    setMedia((current) => {
      const target = current.find((item) => item.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((item) => item.id !== id);
    });
  };

  const submit = async (associatedLocation: LocationSearchResult | null) => {
    setSubmitError(null);
    setProgress(0);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      await postService.create(
        { files: media.map((item) => item.file), caption, locationId: associatedLocation?.id },
        { onProgress: setProgress, signal: controller.signal },
      );
      router.push(feedHref);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        setProgress(null);
        return;
      }
      setSubmitError(
        error instanceof ApiError && error.status !== 0 && error.status < 500
          ? error.message
          : "No pudimos subir tu publicación. Revisa tu conexión e inténtalo de nuevo.",
      );
      setProgress(null);
    }
  };

  // El dueño elige entre sus sedes activas; con una sola queda elegida de entrada.
  useEffect(() => {
    if (!isOwner) return;
    let cancelled = false;
    restaurantService
      .listMyRestaurants()
      .then((restaurants) => {
        if (cancelled) return;
        const options = restaurants.flatMap((restaurant) =>
          restaurant.locations
            .filter((item) => item.status === "activa")
            .map((item) => ({
              id: item.id,
              name: item.name,
              address: item.address,
              brandName: restaurant.businessName,
            })),
        );
        setOwnLocations(options);
        if (options.length === 1) setLocation(options[0]);
      })
      .catch(() => {
        if (!cancelled) setOwnLocationsError("No pudimos cargar tus sedes. Inténtalo de nuevo.");
      });
    return () => {
      cancelled = true;
    };
  }, [isOwner]);

  const onPublish = () => {
    if (!media.length || uploading) return;
    if (isOwner && !location) return;
    if (!location) {
      setShowAssociateModal(true);
      return;
    }
    void submit(location);
  };

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-4 md:py-6">
      <h2 className="font-heading text-xl font-bold text-gray-900 md:text-2xl">
        Nueva publicación
      </h2>

      <section className="flex flex-col gap-3">
        {/* Móvil: abrir la cámara directamente o elegir de la galería. */}
        <div className="grid grid-cols-3 gap-2 md:hidden">
          <CaptureButton
            icon={Camera}
            label="Tomar foto"
            accept="image/*"
            capture="environment"
            disabled={uploading}
            onPick={onPick}
          />
          <CaptureButton
            icon={Video}
            label="Grabar video"
            accept="video/*"
            capture="environment"
            disabled={uploading}
            onPick={onPick}
          />
          <CaptureButton
            icon={Images}
            label="Galería"
            accept={POST_MEDIA_ACCEPT}
            multiple
            disabled={uploading}
            onPick={onPick}
          />
        </div>
        <p className="text-center text-xs text-muted-foreground md:hidden">
          {ALLOWED_FORMATS_LABEL} · máximo 50 MB por archivo
        </p>

        <label
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
          className={`hidden cursor-pointer md:flex flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed bg-gray-50 px-4 py-8 text-center text-gray-500 transition-colors hover:border-orange-300 hover:bg-orange-50/40 ${
            isDragging ? "border-orange-400 bg-orange-50" : "border-gray-200"
          }`}
        >
          <ImagePlus className="h-8 w-8" />
          <span className="text-sm font-semibold text-gray-700">Añade fotos o videos</span>
          <span className="text-xs">{ALLOWED_FORMATS_LABEL} · máximo 50 MB por archivo</span>
          <input
            type="file"
            multiple
            accept={POST_MEDIA_ACCEPT}
            onChange={onPick}
            disabled={uploading}
            className="sr-only"
          />
        </label>

        <FormAlert type="error" messages={fileErrors} />

        {media.length > 0 && (
          <ul className="grid grid-cols-3 gap-2">
            {media.map((item) => (
              <li
                key={item.id}
                className="relative aspect-square overflow-hidden rounded-xl border bg-black"
              >
                {isVideoFile(item.file) ? (
                  <video
                    src={item.previewUrl}
                    muted
                    preload="metadata"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.previewUrl}
                    alt={item.file.name}
                    className="h-full w-full object-cover"
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(item.id)}
                  disabled={uploading}
                  aria-label={`Quitar ${item.file.name}`}
                  className="absolute right-1 top-1 rounded-lg bg-white p-1 shadow-sm disabled:hidden"
                >
                  <X className="h-3.5 w-3.5 text-red-600" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="post-caption" className="text-xs font-semibold text-gray-600">
          Descripción (opcional)
        </label>
        <textarea
          id="post-caption"
          value={caption}
          onChange={(event) => setCaption(event.target.value)}
          maxLength={500}
          rows={3}
          disabled={uploading}
          placeholder="Cuéntanos cómo fue tu experiencia"
          className="w-full resize-none rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-primary"
        />
      </div>

      {isOwner ? (
        <OwnerLocationSelect
          options={ownLocations}
          error={ownLocationsError}
          selected={location}
          onSelect={setLocation}
          disabled={uploading}
        />
      ) : (
        <LocationPicker
          selected={location}
          onSelect={setLocation}
          disabled={uploading}
          inputRef={locationInputRef}
        />
      )}

      {uploading && (
        <div role="status" aria-label="Progreso de subida" className="flex flex-col gap-2">
          <div className="h-2 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span className="flex items-center gap-1.5">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Subiendo… {progress}%
            </span>
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              className="font-semibold text-red-600 hover:underline"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {submitError && (
        <FormAlert type="error">
          <p>{submitError}</p>
          <button
            type="button"
            onClick={() => void submit(location)}
            className="w-fit font-semibold underline"
          >
            Reintentar
          </button>
        </FormAlert>
      )}

      <PrimaryButton
        size="lg"
        disabled={!media.length || uploading || (isOwner && !location)}
        onClick={onPublish}
      >
        {uploading ? "Publicando…" : "Publicar"}
      </PrimaryButton>

      {showAssociateModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="associate-title"
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-orange-100 text-primary">
              <MapPin className="h-6 w-6" />
            </div>
            <h3 id="associate-title" className="mt-3 text-lg font-bold text-gray-900">
              ¿Dónde fue esta experiencia?
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              No seleccionaste un restaurante. Puedes asociarlo o publicar sin él.
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <PrimaryButton
                onClick={() => {
                  setShowAssociateModal(false);
                  locationInputRef.current?.focus();
                }}
              >
                Seleccionar restaurante
              </PrimaryButton>
              <PrimaryButton
                variant="outline"
                onClick={() => {
                  setShowAssociateModal(false);
                  void submit(null);
                }}
              >
                Continuar sin asociar
              </PrimaryButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Botón que abre el selector del sistema; con `capture` abre la cámara en el móvil. */
function CaptureButton({
  icon: Icon,
  label,
  accept,
  capture,
  multiple,
  disabled,
  onPick,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  accept: string;
  capture?: "user" | "environment";
  multiple?: boolean;
  disabled: boolean;
  onPick: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border border-gray-200 bg-gray-50 px-2 py-4 text-center text-xs font-semibold text-gray-700 active:scale-95 ${
        disabled ? "pointer-events-none opacity-60" : ""
      }`}
    >
      <Icon className="h-6 w-6 text-primary" />
      {label}
      <input
        type="file"
        accept={accept}
        capture={capture}
        multiple={multiple}
        disabled={disabled}
        onChange={onPick}
        className="sr-only"
      />
    </label>
  );
}

/**
 * Selector de sede para el dueño de un restaurante: la publicación queda ligada
 * a la sede elegida y, por ella, a su marca. Obligatorio.
 */
function OwnerLocationSelect({
  options,
  error,
  selected,
  onSelect,
  disabled,
}: {
  options: LocationSearchResult[] | null;
  error: string | null;
  selected: LocationSearchResult | null;
  onSelect: (location: LocationSearchResult) => void;
  disabled: boolean;
}) {
  if (error) return <FormAlert type="error">{error}</FormAlert>;
  if (!options) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Cargando tus sedes…
      </p>
    );
  }
  if (options.length === 0) {
    return (
      <FormAlert type="warning">
        Necesitas al menos una sede activa para publicar. Cuando una de tus sedes sea aprobada
        podrás compartir contenido a su nombre.
      </FormAlert>
    );
  }

  return (
    <fieldset className="flex flex-col gap-2" disabled={disabled}>
      <legend className="mb-1.5 text-xs font-semibold text-gray-600">
        ¿A qué sede pertenece esta publicación?
      </legend>
      {options.map((option) => {
        const active = selected?.id === option.id;
        return (
          <label
            key={option.id}
            className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition-colors ${
              active
                ? "border-primary bg-orange-50"
                : "border-gray-200 bg-white hover:border-orange-300"
            }`}
          >
            <input
              type="radio"
              name="post-location"
              checked={active}
              onChange={() => onSelect(option)}
              className="sr-only"
            />
            <MapPin className={`h-4 w-4 shrink-0 ${active ? "text-primary" : "text-gray-400"}`} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-gray-900">
                {option.brandName}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {option.name} · {option.address}
              </span>
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}

function LocationPicker({
  selected,
  onSelect,
  disabled,
  inputRef,
}: {
  selected: LocationSearchResult | null;
  onSelect: (location: LocationSearchResult | null) => void;
  disabled: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const text = query.trim();
    if (text.length < MIN_QUERY_LENGTH) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setSearching(true);
      restaurantService
        .searchLocations(text, controller.signal)
        .then((items) => setResults(items))
        .catch(() => {
          if (!controller.signal.aborted) setResults([]);
        })
        .finally(() => {
          if (!controller.signal.aborted) setSearching(false);
        });
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  if (selected) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-gray-600">Restaurante</span>
        <div className="flex items-center gap-3 rounded-2xl border border-primary bg-orange-50 px-4 py-3">
          <MapPin className="h-4 w-4 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gray-900">{selected.brandName}</p>
            <p className="truncate text-xs text-muted-foreground">
              {selected.name} · {selected.address}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onSelect(null)}
            disabled={disabled}
            aria-label="Quitar restaurante"
            className="rounded-lg p-1 text-gray-500 hover:text-red-600 disabled:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  const showList = open && query.trim().length >= MIN_QUERY_LENGTH;

  return (
    <div className="relative flex flex-col gap-1.5">
      <label htmlFor="post-location" className="text-xs font-semibold text-gray-600">
        Restaurante (opcional)
      </label>
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          id="post-location"
          ref={inputRef}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls="post-location-list"
          autoComplete="off"
          value={query}
          disabled={disabled}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          placeholder="Busca un restaurante por nombre"
          className="w-full rounded-2xl border border-gray-200 bg-white py-3 pl-11 pr-4 text-sm outline-none focus:border-primary"
        />
      </div>
      {showList && (
        <ul
          id="post-location-list"
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-60 overflow-y-auto rounded-2xl border border-gray-200 bg-white py-1 shadow-lg"
        >
          {searching && <li className="px-4 py-3 text-xs text-muted-foreground">Buscando…</li>}
          {!searching && results.length === 0 && (
            <li className="px-4 py-3 text-xs text-muted-foreground">
              No encontramos restaurantes con ese nombre.
            </li>
          )}
          {results.map((result) => (
            <li key={result.id} role="option" aria-selected={false}>
              <button
                type="button"
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSelect(result);
                  setQuery("");
                  setOpen(false);
                }}
                className="flex w-full flex-col px-4 py-2.5 text-left hover:bg-orange-50"
              >
                <span className="text-sm font-medium text-gray-900">{result.brandName}</span>
                <span className="text-xs text-muted-foreground">
                  {result.name} · {result.address}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
