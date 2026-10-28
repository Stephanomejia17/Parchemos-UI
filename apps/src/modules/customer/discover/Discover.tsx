"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, MapPin, Navigation, Search } from "lucide-react";
import { CustomerBadge as Badge, PrimaryButton, StarRating } from "@/shared/components";
import { RemoteImage } from "@/shared/components/media/RemoteImage";
import { restaurantService } from "@/shared/services/restaurant/restaurant.service";
import type { Location } from "@/shared/types/restaurant";

const DiscoverMap = dynamic(() => import("./DiscoverMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-64 items-center justify-center bg-gray-100 text-sm text-muted-foreground">
      Cargando mapa…
    </div>
  ),
});

function getActualLocationImage(url: string | null) {
  return url && !url.includes("placehold.co") ? url : null;
}

/** Las tarjetas muestran la marca como título; la sede va debajo. */
function brandName(location: Location) {
  return location.restaurant?.businessName ?? location.name;
}

function hasValidCoordinates(
  location: Location,
): location is Location & { latitude: number; longitude: number } {
  return (
    typeof location.latitude === "number" &&
    Number.isFinite(location.latitude) &&
    location.latitude >= -90 &&
    location.latitude <= 90 &&
    typeof location.longitude === "number" &&
    Number.isFinite(location.longitude) &&
    location.longitude >= -180 &&
    location.longitude <= 180
  );
}

const FILTERS = [
  "Abierto ahora",
  "Terraza",
  "Pet Friendly",
  "Parejas",
  "Grupos",
  "Vegan",
  "Fine Dining",
];

export function Discover() {
  const router = useRouter();
  const [activeFilters, setActiveFilters] = useState<string[]>(["Abierto ahora"]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Location | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const mappableLocations = useMemo(
    () => locations.filter(hasValidCoordinates),
    [locations],
  );
  const unmappedLocations = useMemo(
    () => locations.filter((location) => !hasValidCoordinates(location)),
    [locations],
  );

  useEffect(() => {
    let cancelled = false;
    restaurantService
      .listPublicLocations()
      .then((items) => {
        if (!cancelled) setLocations(items);
      })
      .catch(() => {
        if (!cancelled) setLoadError("No pudimos cargar los restaurantes. Intenta de nuevo.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const goRestaurant = (locationId: string) =>
    router.push(`/restaurant?locationId=${encodeURIComponent(String(locationId))}`);
  const toggleFilter = (f: string) =>
    setActiveFilters((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]));

  return (
    <div className="flex flex-col h-full bg-background md:flex-row">
      {/* Left panel — filters + cards list on md+ */}
      <div className="bg-white border-b border-border md:border-b-0 md:border-r md:w-80 md:flex-shrink-0 md:flex md:flex-col lg:w-96">
        <div className="px-4 pt-4 pb-3 md:px-5 md:pt-5">
          <h2 className="text-xl font-bold text-gray-900 mb-3 font-heading">Descubrir</h2>
          <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input
              className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-muted-foreground"
              placeholder="Restaurantes, cocinas, lugares..."
            />
            <Filter className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-3">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => toggleFilter(f)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex-shrink-0 transition-all ${
                  activeFilters.includes(f) ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        {/* Restaurant list — vertical on md+ */}
        <div className="md:flex-1 md:overflow-y-auto">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide p-4 md:flex-col md:overflow-x-visible md:gap-2">
            {loadError ? (
              <p className="p-4 text-sm text-red-600">{loadError}</p>
            ) : locations.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground">Cargando restaurantes…</p>
            ) : (
              locations.map((r) => (
                <button
                  key={r.id}
                  onClick={() => {
                    setSelectedRestaurant(r);
                    goRestaurant(r.id);
                  }}
                  className={`flex-shrink-0 w-56 md:w-full rounded-2xl overflow-hidden shadow-sm border transition-all text-left md:flex md:flex-row ${
                    selectedRestaurant?.id === r.id
                      ? "border-primary shadow-orange-100 shadow-md"
                      : "border-border"
                  }`}
                >
                  <div className="relative h-28 bg-gray-100 md:h-auto md:w-20 md:flex-shrink-0">
                    {(getActualLocationImage(r.coverUrl) || getActualLocationImage(r.logoUrl)) && (
                      <RemoteImage
                        src={
                          getActualLocationImage(r.coverUrl) ?? getActualLocationImage(r.logoUrl)!
                        }
                        alt={`${brandName(r)} · ${r.name}`}
                        className="h-full w-full"
                        sizes="(min-width: 768px) 80px, 224px"
                      />
                    )}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold bg-accent text-white md:hidden">
                      Sede activa
                    </div>
                  </div>
                  <div className="p-3 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-gray-900 text-sm truncate">{brandName(r)}</p>
                        {r.restaurant && (
                          <p className="text-xs text-gray-600 truncate">{r.name}</p>
                        )}
                      </div>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded-lg hidden md:block bg-green-100 text-green-700">
                        Sede activa
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {r.address} ·{" "}
                      {r.priceRange ? "$".repeat(r.priceRange) : "Precio por consultar"}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <StarRating rating={r.avgRating} />
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {r.ratingCount} reseñas
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2">
                      <Badge color="gray">Restaurante</Badge>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Map — full height on desktop */}
      <div className="relative flex-1 min-h-64 bg-gray-100 overflow-hidden">
        <DiscoverMap
          locations={mappableLocations}
          selectedLocationId={selectedRestaurant?.id ?? null}
          onSelect={setSelectedRestaurant}
          onOpenLocation={goRestaurant}
        />
        {unmappedLocations.length > 0 && (
          <div
            className="absolute left-4 right-4 top-4 z-[1000] rounded-2xl border border-amber-200 bg-amber-50/95 px-3 py-2 text-xs text-amber-900 shadow-sm md:right-auto md:max-w-sm"
            title={unmappedLocations.map((location) => location.name).join(", ")}
          >
            {unmappedLocations.length === 1
              ? `${brandName(unmappedLocations[0])} (${unmappedLocations[0].name}) no aparece en el mapa porque su dirección aún no tiene ubicación verificada.`
              : `${unmappedLocations.length} sedes no aparecen en el mapa porque su dirección aún no tiene ubicación verificada.`}
          </div>
        )}
        <div className="absolute bottom-4 right-4">
          <button className="w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <Navigation className="w-5 h-5 text-primary" />
          </button>
        </div>
        {selectedRestaurant && (
          <div className="absolute bottom-4 left-4 right-16 md:left-4 md:right-4 md:max-w-xs bg-white rounded-2xl shadow-lg border border-border p-3">
            <div className="flex gap-3">
              {(getActualLocationImage(selectedRestaurant.coverUrl) ||
                getActualLocationImage(selectedRestaurant.logoUrl)) && (
                <RemoteImage
                  src={
                    getActualLocationImage(selectedRestaurant.coverUrl) ??
                    getActualLocationImage(selectedRestaurant.logoUrl)!
                  }
                  alt={`${brandName(selectedRestaurant)} · ${selectedRestaurant.name}`}
                  className="w-16 h-16 rounded-xl flex-shrink-0"
                  sizes="64px"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">
                  {brandName(selectedRestaurant)}
                </p>
                {selectedRestaurant.restaurant && (
                  <p className="text-xs text-gray-600 truncate">{selectedRestaurant.name}</p>
                )}
                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedRestaurant.address}
                </p>
                <StarRating
                  rating={selectedRestaurant.avgRating}
                  count={selectedRestaurant.ratingCount}
                />
                <div className="flex gap-2 mt-2">
                  <PrimaryButton
                    onClick={() => goRestaurant(selectedRestaurant.id)}
                    size="sm"
                    className="flex-1"
                  >
                    Ver perfil
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
