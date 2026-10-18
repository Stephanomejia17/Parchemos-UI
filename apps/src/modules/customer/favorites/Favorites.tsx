"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Compass, Heart, Loader2 } from "lucide-react";
import { PrimaryButton } from "@/shared/components";
import { useFavorites } from "@/shared/context/favorites-context";
import { favoriteService, type FeaturedLocation } from "@/shared/services";
import { RestaurantLocationCard } from "../home/components/RestaurantLocationCard";
import { toCardData } from "../home/to-card-data";

/** "Mis favoritos" (DO-05): las sedes guardadas por el comensal, la más reciente primero. */
export function Favorites() {
  const router = useRouter();
  const { ready, isFavorite, isPending } = useFavorites();
  const [items, setItems] = useState<FeaturedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    favoriteService
      .list(controller.signal)
      .then(({ items: list }) => setItems(list))
      .catch(() => {
        if (!controller.signal.aborted) setError("No pudimos cargar tus favoritos.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, []);

  // Quitar el corazón aquí saca la sede de la lista al instante; si el
  // servidor falla, el contexto revierte el estado y la sede reaparece.
  const visible = ready ? items.filter((item) => isFavorite(item.id) || isPending(item.id)) : items;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-4 md:px-6 md:py-6">
      <h2 className="font-heading text-xl font-bold text-gray-900 md:text-2xl">Mis favoritos</h2>

      {loading && (
        <div className="flex min-h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Cargando favoritos" />
        </div>
      )}

      {error && (
        <p role="alert" className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && visible.length === 0 && (
        <div className="mt-4 rounded-2xl border border-border bg-white p-8 text-center">
          <Heart className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-base font-semibold text-gray-900">
            Aún no tienes restaurantes favoritos
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Toca el corazón de un restaurante para guardarlo y encontrarlo aquí.
          </p>
          <PrimaryButton className="mt-4" onClick={() => router.push("/home")}>
            <Compass className="h-4 w-4" />
            Explorar restaurantes
          </PrimaryButton>
        </div>
      )}

      {visible.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((location) => (
            <RestaurantLocationCard
              key={location.id}
              card={{ ...toCardData(location), featured: location.destacado }}
              onDetails={(locationId) =>
                router.push(`/restaurant?locationId=${encodeURIComponent(locationId)}`)
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
