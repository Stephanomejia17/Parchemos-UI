"use client";

import { ChevronRight, Star, Utensils } from "lucide-react";
import { BrandLogo } from "@/shared/components";
import { RemoteImage } from "@/shared/components/media/RemoteImage";
import { FavoriteButton } from "@/modules/customer/favorites/FavoriteButton";
import type { RestaurantCardData } from "./RestaurantLocationCard";

type ScheduleStatus = { tone: "open" | "soon" | "closed"; label: string };

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + (minutes || 0);
};

/** Estado de hoy a partir del horario: abierto, abre más tarde o cerrado. */
export function scheduleStatus(
  schedule: RestaurantCardData["todaySchedule"],
  now = new Date(),
): ScheduleStatus {
  if (!schedule) return { tone: "closed", label: "Cerrado hoy" };
  const current = now.getHours() * 60 + now.getMinutes();
  const opens = toMinutes(schedule.startsAt);
  const closes = toMinutes(schedule.endsAt);
  // Horarios que pasan la medianoche (p. ej. 18:00 - 02:00).
  const isOpen = closes > opens ? current >= opens && current < closes : current >= opens || current < closes;
  if (isOpen) return { tone: "open", label: `Abierto · cierra ${schedule.endsAt}` };
  if (current < opens) return { tone: "soon", label: `Abre a las ${schedule.startsAt}` };
  return { tone: "closed", label: "Cerrado por hoy" };
}

const statusStyles: Record<ScheduleStatus["tone"], { dot: string; text: string }> = {
  open: { dot: "bg-emerald-500", text: "text-emerald-700" },
  soon: { dot: "bg-amber-500", text: "text-amber-700" },
  closed: { dot: "bg-gray-400", text: "text-gray-500" },
};

type CompactLocationCardProps = {
  card: RestaurantCardData;
  onDetails: (locationId: string) => void;
  /** Línea destacada opcional, p. ej. el motivo de una recomendación. */
  highlight?: string | null;
};

/**
 * Tarjeta compacta para los carruseles del inicio (destacados y recomendados):
 * la imagen protagoniza, la calificación y el precio van sobre ella y toda la
 * tarjeta abre el menú. Las listas completas siguen usando RestaurantLocationCard.
 */
export function CompactLocationCard({ card, onDetails, highlight }: CompactLocationCardProps) {
  const cover = card.images[0];
  const status = scheduleStatus(card.todaySchedule);
  const style = statusStyles[status.tone];

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-shadow hover:shadow-md">
      <div className="relative h-28 overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
        {cover ? (
          <RemoteImage
            src={cover}
            alt={card.locationName}
            sizes="240px"
            className="h-full w-full transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-orange-300">
            <Utensils className="h-8 w-8" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/20" />

        {card.featured && (
          <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-amber-950 shadow-sm">
            <Star className="h-3 w-3" fill="currentColor" />
            Destacado
          </span>
        )}

        <div className="pointer-events-none absolute inset-x-2 bottom-2 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-semibold text-gray-900 shadow-sm">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {Number(card.rating) > 0 ? Number(card.rating).toFixed(1) : "Nuevo"}
            {card.ratingCount > 0 && <span className="font-normal text-gray-500">({card.ratingCount})</span>}
          </span>
          {card.price.startsWith("$") && (
            <span className="rounded-full bg-black/45 px-2 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
              {card.price}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3">
        <div className="flex items-end gap-2.5">
          <div className="relative -mt-5 flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md ring-2 ring-white">
            {card.brandLogo ? (
              <RemoteImage src={card.brandLogo} alt={`Logo de ${card.brandName}`} sizes="44px" className="h-full w-full" />
            ) : (
              <BrandLogo className="h-7 w-7 rounded-lg" />
            )}
          </div>
          <div className="min-w-0 flex-1 pt-2">
            <h3 className="truncate text-sm font-bold leading-tight text-gray-900">{card.brandName}</h3>
            <p className="truncate text-xs text-gray-500" title={card.address}>
              {card.locationName}
            </p>
          </div>
        </div>

        {highlight && (
          <p className="mt-2 line-clamp-1 text-[11px] font-medium text-primary" title={highlight}>
            {highlight}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2.5">
          <span className={`inline-flex min-w-0 items-center gap-1.5 text-[11px] font-medium ${style.text}`}>
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${style.dot}`} />
            <span className="truncate">{status.label}</span>
          </span>
          <span className="inline-flex shrink-0 items-center text-xs font-semibold text-primary">
            Menú
            <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>

      {/* Toda la tarjeta abre el menú; el favorito queda por encima. */}
      <button
        type="button"
        onClick={() => onDetails(card.locationId)}
        aria-label={`Ver menú de ${card.brandName}, sede ${card.locationName}`}
        className="absolute inset-0 z-10 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      />
      <div className="absolute right-2 top-2 z-20 scale-90">
        <FavoriteButton locationId={card.locationId} overlay />
      </div>
    </article>
  );
}
