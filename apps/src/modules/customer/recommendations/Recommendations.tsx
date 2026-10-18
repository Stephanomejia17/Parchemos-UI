"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { PrimaryButton } from "@/shared/components";
import { recommendationService, type RecommendationList } from "@/shared/services";
import { RestaurantLocationCard } from "../home/components/RestaurantLocationCard";
import { toCardData } from "../home/to-card-data";

/** Sección "Recomendado para ti" (PU-03): personalizada o, sin datos, las mejor calificadas. */
export function Recommendations() {
  const router = useRouter();
  const [data, setData] = useState<RecommendationList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback((signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    recommendationService
      .list(signal)
      .then(setData)
      .catch(() => {
        if (!signal?.aborted) setError("No pudimos cargar tus recomendaciones.");
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false);
      });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return (
    <section className="border-b border-border bg-white px-4 py-4 md:rounded-2xl md:border md:px-6">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-heading text-lg font-bold text-gray-900">
          {data && !data.personalizado ? "Populares y mejor calificados" : "Recomendado para ti"}
        </h3>
        <Link
          href="/profile/preferences"
          className="ml-auto text-xs font-semibold text-primary hover:underline"
        >
          Editar gustos
        </Link>
      </div>

      {loading && (
        <div className="flex min-h-32 items-center justify-center">
          <Loader2
            className="h-6 w-6 animate-spin text-primary"
            aria-label="Cargando recomendaciones"
          />
        </div>
      )}

      {error && (
        <div role="alert" className="rounded-2xl bg-red-50 p-4 text-center text-sm text-red-700">
          <p>{error}</p>
          <PrimaryButton size="sm" className="mt-3" onClick={() => load()}>
            Reintentar
          </PrimaryButton>
        </div>
      )}

      {data && !data.tienePreferencias && (
        <div className="mb-3 flex flex-col gap-2 rounded-2xl bg-orange-50 p-4 text-sm text-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <p>Completa tus preferencias para recibir recomendaciones hechas a tu medida.</p>
          <Link
            href="/profile/preferences"
            className="w-fit shrink-0 font-semibold text-primary hover:underline"
          >
            Completar preferencias
          </Link>
        </div>
      )}

      {data && data.items.length === 0 && !loading && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Aún no tenemos recomendaciones disponibles.
        </p>
      )}

      {data && data.items.length > 0 && (
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {data.items.map((location) => (
            <div key={location.id} className="w-72 shrink-0">
              {location.motivo && (
                <p className="mb-1.5 text-xs font-semibold text-primary">{location.motivo}</p>
              )}
              <RestaurantLocationCard
                card={toCardData(location)}
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
