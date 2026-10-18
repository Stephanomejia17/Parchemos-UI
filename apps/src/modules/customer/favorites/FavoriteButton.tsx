"use client";

import { Heart } from "lucide-react";
import { useFavorites } from "@/shared/context/favorites-context";

/** Corazón de favorito (toggle) que refleja el estado real guardado del comensal. */
export function FavoriteButton({
  locationId,
  overlay = false,
}: {
  locationId: string;
  /** Sobre una imagen (portada): fondo blanco translúcido en vez de borde. */
  overlay?: boolean;
}) {
  const { isFavorite, isPending, toggle } = useFavorites();
  const active = isFavorite(locationId);
  const pending = isPending(locationId);

  return (
    <button
      type="button"
      onClick={() => void toggle(locationId)}
      disabled={pending}
      aria-label={active ? "Quitar de favoritos" : "Añadir a favoritos"}
      aria-pressed={active}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors disabled:opacity-60 ${
        overlay
          ? "bg-surface/90 text-gray-700 shadow-sm hover:bg-surface"
          : "border border-border text-gray-500 hover:text-primary"
      }`}
    >
      <Heart className={`h-5 w-5 ${active ? "fill-primary text-primary" : ""}`} />
    </button>
  );
}
