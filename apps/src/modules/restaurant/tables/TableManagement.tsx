"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { apiFetch } from "@/shared/services/http/api-client";
import type { Location, Restaurant } from "@/shared/types/restaurant";
import type { Table } from "@/shared/types/table";
import { tablesHref } from "@/shared/navigation";
import { downloadQr } from "@/lib/qr-download";
import { EmptyTables } from "./EmptyTables";
import { LocationPicker } from "./LocationPicker";
import { RestaurantPicker } from "./RestaurantPicker";
import { StatusModal } from "./StatusModal";
import { TableCard } from "./TableCard";
import { useTables } from "./useTables";

export function TableManagement() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [restaurantError, setRestaurantError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Table | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("restaurantId");
  const locationId = searchParams.get("locationId");
  const restaurant = useMemo(
    () => restaurants.find((item) => item.id === restaurantId) ?? null,
    [restaurants, restaurantId],
  );
  const location = useMemo(
    () => restaurant?.locations.find((item) => item.id === locationId) ?? null,
    [restaurant, locationId],
  );
  const initialSelectionHandled = useRef(false);
  const {
    tables,
    loadingTables,
    saving,
    error: tablesError,
    setError: setTablesError,
    createTable,
    changeStatus,
  } = useTables(locationId);

  const updateSelectionUrl = useCallback(
    (nextRestaurant: Restaurant, nextLocation?: Location) => {
      // La URL es la fuente de verdad de la selección; el layout la usa para
      // pintar los breadcrumbs y esta pantalla para restaurar su estado.
      router.push(tablesHref(nextRestaurant.id, nextLocation?.id), { scroll: false });
    },
    [router],
  );

  const selectRestaurant = useCallback(
    (item: Restaurant) => {
      const nextLocation = item.locations.length === 1 ? item.locations[0] : undefined;
      updateSelectionUrl(item, nextLocation);
    },
    [updateSelectionUrl],
  );

  useEffect(() => {
    let cancelled = false;
    const loadRestaurants = async () => {
      setLoadingRestaurants(true);
      setRestaurantError(null);
      try {
        const data = await apiFetch<Restaurant[]>("/restaurantes/mios");
        if (cancelled) return;
        setRestaurants(data);
      } catch (cause) {
        console.error("No se pudieron cargar los restaurantes.", cause);
        if (!cancelled) setRestaurantError("No pudimos cargar tus restaurantes.");
      } finally {
        if (!cancelled) setLoadingRestaurants(false);
      }
    };
    void loadRestaurants();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loadingRestaurants || initialSelectionHandled.current) return;
    initialSelectionHandled.current = true;
    if (restaurantId || restaurants.length !== 1) return;

    const item = restaurants[0];
    const nextLocation = item.locations.length === 1 ? item.locations[0] : undefined;
    router.replace(tablesHref(item.id, nextLocation?.id), { scroll: false });
  }, [loadingRestaurants, restaurantId, restaurants, router]);

  function selectLocation(item: Location) {
    if (!restaurant) return;
    updateSelectionUrl(restaurant, item);
  }

  async function submitTable(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const code = String(formData.get("tableCode") ?? "").trim();
    if (!code) return;
    setTablesError(null);
    try {
      await createTable(code);
      form.reset();
    } catch (cause) {
      console.error("No se pudo crear la mesa.", cause);
    }
  }

  async function confirmStatus(table: Table) {
    try {
      await changeStatus(table);
      setSelected(null);
    } catch (cause) {
      console.error("No se pudo cambiar el estado de la mesa.", cause);
    }
  }

  async function handleDownload(table: Table) {
    setTablesError(null);
    try {
      await downloadQr(table);
    } catch (cause) {
      console.error("No se pudo descargar el QR.", cause);
      setTablesError("No pudimos descargar el QR.");
    }
  }

  if (loadingRestaurants)
    return (
      <div
        className="flex min-h-64 items-center justify-center"
        role="status"
        aria-label="Cargando restaurantes"
      >
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  if (!restaurant)
    return (
      <RestaurantPicker
        restaurants={restaurants}
        onSelect={selectRestaurant}
        error={restaurantError}
      />
    );
  if (!location)
    return (
      <LocationPicker restaurant={restaurant} onSelect={selectLocation} error={restaurantError} />
    );

  return (
    <main className="min-h-full overflow-y-auto bg-background p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              {restaurant.businessName}
            </p>
            <h1 className="mt-1 text-2xl font-bold text-foreground">Mesas de {location.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">Crea mesas y administra su estado.</p>
          </div>
          <button
            type="button"
            onClick={() => {
              updateSelectionUrl(restaurant);
            }}
            className="min-h-11 rounded-xl bg-muted px-4 py-2.5 text-sm font-semibold text-foreground"
          >
            Cambiar sede
          </button>
        </div>
        {tablesError && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
          >
            {tablesError}
          </p>
        )}
        <form
          onSubmit={submitTable}
          className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border border-primary/20 bg-primary-soft p-4"
        >
          <label className="flex flex-col gap-1 text-xs font-semibold text-foreground">
            {"N\u00FAmero de mesa"}
            <input
              name="tableCode"
              required
              inputMode="numeric"
              pattern="[1-9][0-9]*"
              className="w-40 rounded-xl border border-border bg-surface px-3 py-2.5 text-sm"
              placeholder="Ej. 1"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60"
          >
            <Plus className="h-4 w-4" />
            Crear mesa
          </button>
        </form>
        {loadingTables ? (
          <div
            className="flex min-h-64 items-center justify-center"
            role="status"
            aria-label="Cargando mesas"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : tables.length === 0 ? (
          <EmptyTables />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tables.map((table) => (
              <TableCard
                key={table.id}
                table={table}
                onDownload={(item) => void handleDownload(item)}
                onStatus={setSelected}
              />
            ))}
          </div>
        )}
      </div>
      {selected && (
        <StatusModal
          table={selected}
          saving={saving}
          error={tablesError}
          onClose={() => {
            setSelected(null);
            setTablesError(null);
          }}
          onConfirm={() => void confirmStatus(selected)}
        />
      )}
    </main>
  );
}
