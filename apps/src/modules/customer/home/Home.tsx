"use client";

import { useEffect, useState } from "react";
import { Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/mocks/customer/home";
import { BrandLogo } from "@/shared/components";
import { restaurantService } from "@/shared/services/restaurant/restaurant.service";
import type { Location } from "@/shared/types/restaurant";
import {
  RestaurantLocationCard,
  type RestaurantCardData,
} from "./components/RestaurantLocationCard";

const CATEGORY_SLUGS: Record<string, string> = {
  Postres: "postres",
  Colombiana: "colombiana",
  Parrilla: "parrilla",
  Italiana: "italiana",
  Mexicana: "mexicana",
  Mariscos: "mariscos",
  Pizza: "pizza",
  Hamburguesas: "hamburguesas",
  Japonesa: "japonesa",
  Vegetariana: "vegetariana",
};

const PRICE_OPTIONS = [
  { label: "Econ\u00F3mico", value: 1 },
  { label: "Medio", value: 2 },
  { label: "Alto", value: 3 },
  { label: "Muy alto", value: 4 },
];

function toCardData(location: Location): RestaurantCardData {
  const images = [location.coverUrl, ...location.images.map((image) => image.url)].filter(
    (image, index, all): image is string => Boolean(image) && all.indexOf(image) === index,
  );

  return {
    id: location.id,
    locationId: location.id,
    brandName: location.restaurant?.businessName ?? location.name,
    brandLogo: location.logoUrl ?? "",
    locationName: location.name,
    address: location.address,
    rating: location.avgRating,
    ratingCount: location.ratingCount,
    price: location.priceRange ? "$".repeat(location.priceRange) : "Precio por consultar",
    images,
    description: location.description ?? "",
    todaySchedule: location.schedules.find((schedule) => schedule.dayOfWeek === new Date().getDay()) ?? null,
  };
}

function LoadingState() {
  return (
    <div className="flex min-h-64 items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Cargando sedes" />
    </div>
  );
}

function StateMessage({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-8 text-center">
      <p className="text-base font-semibold text-gray-900">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

export function Home() {
  const router = useRouter();
  const [cards, setCards] = useState<RestaurantCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<number[]>([]);
  const [appliedCategories, setAppliedCategories] = useState<string[]>([]);
  const [appliedPrices, setAppliedPrices] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadLocations = async () => {
      setLoading(true);
      setError(null);

      try {
        const locations = await restaurantService.listPublicLocations({
          nombre: searchTerm.trim() || undefined,
          categoria: appliedCategories.length ? appliedCategories.join(",") : undefined,
          precio: appliedPrices.length ? appliedPrices.join(",") : undefined,
          ordenar_por: sortBy || undefined,
        });

        if (!cancelled) {
          setCards(locations.map(toCardData));
        }
      } catch (loadError) {
        console.error("No se pudieron cargar las sedes públicas:", loadError);
        if (!cancelled) {
          setCards([]);
          setError("No pudimos cargar las sedes. Intenta nuevamente.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadLocations();
    return () => {
      cancelled = true;
    };
  }, [searchTerm, appliedCategories, appliedPrices, sortBy]);

  const toggleCategory = (label: string) => {
    const slug = CATEGORY_SLUGS[label];
    if (!slug) return;

    setSelectedCategories((current) =>
      current.includes(slug)
        ? current.filter((category) => category !== slug)
        : [...current, slug],
    );
  };

  const applyFilters = () => {
    setAppliedCategories(selectedCategories);
    setAppliedPrices(selectedPrices);
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedPrices([]);
    setAppliedCategories([]);
    setAppliedPrices([]);
    setSortBy("");
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-background">
      <div className="sticky top-0 z-30 border-b border-border bg-white/95 px-4 pb-3 pt-4 backdrop-blur-sm md:hidden">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandLogo className="h-8 w-8 rounded-xl" />
            <span className="font-heading text-xl font-extrabold text-gray-900">Parchemos</span>
          </div>
          <Search className="h-5 w-5 text-gray-700" aria-hidden="true" />
        </div>
        <SearchInput value={searchTerm} onChange={setSearchTerm} />
      </div>

      <div className="hidden items-center justify-between px-6 pb-4 pt-6 md:flex">
        <div>
          <h2 className="font-heading text-2xl font-bold text-gray-900">Inicio</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Bogot\u00E1, Colombia - Descubriendo cerca de ti</p>
        </div>
        <SearchInput value={searchTerm} onChange={setSearchTerm} />
      </div>

      <div className="border-b border-border bg-white md:border-b-0 md:bg-transparent">
        <div className="flex gap-3 overflow-x-auto px-4 py-3 scrollbar-hide md:px-6">
          {CATEGORIES.map((category) => (
            <button
              key={category.label}
              type="button"
              onClick={() => toggleCategory(category.label)}
              className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-3.5 py-2 text-sm font-semibold transition-all ${selectedCategories.includes(CATEGORY_SLUGS[category.label]) ? "bg-primary text-white shadow-sm shadow-orange-200" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-b border-border bg-white px-4 py-3 md:px-6">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <span className="shrink-0 text-sm font-semibold text-gray-700">Ordenar:</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="shrink-0 rounded-2xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none">
            <option value="">Más recientes</option>
            <option value="calificacion">Más calificados</option>
            <option value="precio">Menor precio</option>
          </select>
          <span className="shrink-0 text-sm font-semibold text-gray-700">Precio:</span>
          <select value={selectedPrices[0] ?? ""} onChange={(event) => setSelectedPrices(event.target.value ? [Number(event.target.value)] : [])} className="shrink-0 rounded-2xl border border-border bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 outline-none">
            <option value="">Todos</option>
            {PRICE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <button type="button" onClick={applyFilters} className="shrink-0 rounded-2xl bg-primary px-4 py-1.5 text-xs font-semibold text-white">Aplicar filtros</button>
          <button type="button" onClick={clearFilters} className="shrink-0 rounded-2xl border border-border px-4 py-1.5 text-xs font-semibold text-gray-700">Limpiar filtros</button>
        </div>
      </div>

      <main className="px-0 md:px-6 md:py-4">
        {loading ? <LoadingState /> : error ? <StateMessage title="No se pudieron cargar las sedes" description={error} /> : cards.length === 0 ? <StateMessage title="No encontramos sedes" description="No hay sedes que coincidan con los filtros o la búsqueda." /> : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {cards.map((card) => <RestaurantLocationCard key={card.id} card={card} onDetails={(locationId) => router.push(`/restaurant?locationId=${encodeURIComponent(locationId)}`)} />)}
          </div>
        )}
      </main>
    </div>
  );
}

function SearchInput({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex w-full items-center gap-2 rounded-2xl border border-border bg-white px-4 py-2.5 md:w-72">
      <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
      <input value={value} onChange={(event) => onChange(event.target.value)} className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" placeholder="Buscar sedes..." />
    </div>
  );
}
