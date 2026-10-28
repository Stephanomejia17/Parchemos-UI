"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, Loader2, Star } from "lucide-react";
import { PrimaryButton } from "@/shared/components";
import { favoriteService, type FeaturedList } from "@/shared/services";
import { CompactLocationCard } from "./components/CompactLocationCard";
import { toCardData } from "./to-card-data";

const FEATURED_LIMIT = 10;
/** CA3: el listado se vuelve a consultar solo, sin que el comensal recargue. */
const REFRESH_MS = 30_000;

/**
 * "Destacados" (DO-02): sedes de mayor a menor calificación; las de 4.5 o más
 * llevan la insignia. Si ninguna llega al umbral se muestran igual, sin marca.
 */
export function FeaturedLocations() {
  const router = useRouter();
  const [data, setData] = useState<FeaturedList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((signal?: AbortSignal) => {
    favoriteService
      .listFeatured({ limit: FEATURED_LIMIT, signal })
      .then((list) => {
        setData(list);
        setError(null);
      })
      .catch(() => {
        // Si ya hay datos, un fallo de refresco no los borra.
        if (!signal?.aborted) setError("No pudimos cargar los destacados.");
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);

    const refresh = () => {
      if (document.visibilityState === "visible") load(controller.signal);
    };
    const timer = window.setInterval(refresh, REFRESH_MS);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [load]);

  if (!loading && !error && (!data || data.items.length === 0)) return null;

  const title = data?.hayDestacados === false ? "Mejor calificados" : "Restaurantes destacados";

  return (
    <section
      aria-label={title}
      className="border-b border-border bg-white px-4 py-4 md:rounded-2xl md:border md:px-6"
    >
      <div className="mb-3 flex items-center gap-2">
        <Star className="h-5 w-5 text-amber-500" fill="currentColor" />
        <h3 className="font-heading text-lg font-bold text-gray-900">{title}</h3>
        <Link
          href="/profile/favorites"
          className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
        >
          <Heart className="h-3.5 w-3.5" />
          Mis favoritos
        </Link>
      </div>

      {data?.hayDestacados === false && (
        <p className="mb-3 text-xs text-muted-foreground">
          Aún ningún restaurante llega a {data.umbral} estrellas; estos son los mejor calificados.
        </p>
      )}

      {loading && (
        <div className="flex min-h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Cargando destacados" />
        </div>
      )}

      {error && !data && (
        <div role="alert" className="rounded-2xl bg-red-50 p-4 text-center text-sm text-red-700">
          <p>{error}</p>
          <PrimaryButton size="sm" className="mt-3" onClick={() => load()}>
            Reintentar
          </PrimaryButton>
        </div>
      )}

      {data && data.items.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {data.items.map((location) => (
            <div key={location.id} className="w-60 shrink-0">
              <CompactLocationCard
                card={{ ...toCardData(location), featured: location.destacado }}
                onDetails={(locationId) =>
                  router.push(`/restaurant?locationId=${encodeURIComponent(locationId)}`)
                }
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
