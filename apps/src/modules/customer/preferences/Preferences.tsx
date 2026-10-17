"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { ApiError } from "@/shared/auth";
import { FormAlert, PrimaryButton, Select } from "@/shared/components";
import { profileService, type TastePreferences } from "@/shared/services/profile/profile.service";

const PRICE_LEVELS = [
  { value: "1", label: "$ · Económico" },
  { value: "2", label: "$$ · Medio" },
  { value: "3", label: "$$$ · Alto" },
  { value: "4", label: "$$$$ · Muy alto" },
];

const ANY_PRICE = { value: "", label: "Cualquiera" };

/** Gustos del comensal (tipos de cocina y rango de precio) que alimentan las recomendaciones (PU-03). */
export function Preferences() {
  const router = useRouter();
  const [data, setData] = useState<TastePreferences | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    profileService
      .getPreferences()
      .then((preferences) => {
        if (cancelled) return;
        setData(preferences);
        setSelected(new Set(preferences.selectedCuisineIds));
        setPriceMin(preferences.priceRangeMin ? String(preferences.priceRangeMin) : "");
        setPriceMax(preferences.priceRangeMax ? String(preferences.priceRangeMax) : "");
      })
      .catch(() => {
        if (!cancelled) setError("No pudimos cargar tus preferencias.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const rangeError =
    (priceMin === "") !== (priceMax === "")
      ? "Elige el precio mínimo y el máximo, o deja ambos en “Cualquiera”."
      : priceMin && priceMax && Number(priceMin) > Number(priceMax)
        ? "El precio mínimo no puede ser mayor que el máximo."
        : null;

  const save = async (event: FormEvent) => {
    event.preventDefault();
    if (rangeError) return;
    setBusy(true);
    setError(null);
    try {
      await profileService.savePreferences({
        cuisineIds: [...selected],
        priceRangeMin: priceMin ? Number(priceMin) : null,
        priceRangeMax: priceMax ? Number(priceMax) : null,
      });
      router.push("/home");
    } catch (saveError) {
      setError(
        saveError instanceof ApiError ? saveError.message : "No pudimos guardar tus preferencias.",
      );
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Cargando preferencias" />
      </div>
    );
  }

  return (
    <form onSubmit={save} className="mx-auto flex w-full max-w-xl flex-col gap-5 px-4 py-4 md:py-6">
      <div>
        <h2 className="font-heading text-xl font-bold text-gray-900 md:text-2xl">Mis gustos</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Con esto te recomendamos restaurantes que van contigo.
        </p>
      </div>

      <fieldset>
        <legend className="mb-2 text-xs font-semibold text-gray-600">Tipos de cocina</legend>
        <div className="flex flex-wrap gap-2">
          {data?.cuisines.map((cuisine) => {
            const active = selected.has(cuisine.id);
            return (
              <button
                key={cuisine.id}
                type="button"
                aria-pressed={active}
                onClick={() => toggle(cuisine.id)}
                className={`rounded-2xl px-3.5 py-2 text-sm font-semibold transition-all ${
                  active ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cuisine.name}
              </button>
            );
          })}
          {data && data.cuisines.length === 0 && (
            <p className="text-sm text-muted-foreground">Aún no hay tipos de cocina disponibles.</p>
          )}
        </div>
      </fieldset>

      <fieldset className="grid grid-cols-2 gap-3">
        <legend className="col-span-2 mb-1 text-xs font-semibold text-gray-600">
          Rango de precio
        </legend>
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-600">
          Desde
          <Select
            value={priceMin}
            onChange={(event) => setPriceMin(event.target.value)}
            options={[ANY_PRICE, ...PRICE_LEVELS]}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-xs font-semibold text-gray-600">
          Hasta
          <Select
            value={priceMax}
            onChange={(event) => setPriceMax(event.target.value)}
            options={[ANY_PRICE, ...PRICE_LEVELS]}
          />
        </label>
      </fieldset>

      <FormAlert type="error">{rangeError ?? error}</FormAlert>

      <PrimaryButton type="submit" size="lg" disabled={busy || Boolean(rangeError)}>
        {busy ? "Guardando…" : "Guardar preferencias"}
      </PrimaryButton>
    </form>
  );
}
