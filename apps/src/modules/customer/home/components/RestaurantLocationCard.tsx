"use client";

import { useState } from "react";
import { Clock3, Heart, MapPin, Store, Utensils } from "lucide-react";
import { BrandLogo, PrimaryButton, StarRating } from "@/shared/components";
import { RemoteImage } from "@/shared/components/media/RemoteImage";
import { LocationImageCarousel } from "./LocationImageCarousel";

export type RestaurantCardData = {
  id: string;
  locationId: string;
  brandName: string;
  brandLogo: string;
  locationName: string;
  address: string;
  rating: number;
  ratingCount: number;
  price: string;
  images: string[];
  description: string;
  todaySchedule: { startsAt: string; endsAt: string } | null;
};

type RestaurantLocationCardProps = {
  card: RestaurantCardData;
  onDetails: (locationId: string) => void;
};

export function RestaurantLocationCard({ card, onDetails }: RestaurantLocationCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const shortDescription = card.description.length > 30
    ? `${card.description.slice(0, 30).trimEnd()}...`
    : card.description;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <LocationImageCarousel images={card.images} alt={card.locationName} />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-orange-50">
            {card.brandLogo ? (
              <RemoteImage src={card.brandLogo} alt={`Logo de ${card.brandName}`} className="h-full w-full" />
            ) : (
              <BrandLogo className="h-8 w-8 rounded-lg" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-extrabold leading-tight text-gray-900">{card.brandName}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-gray-600">
              <Store className="h-4 w-4 text-primary" />
              {card.locationName}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsFavorite((current) => !current)}
            aria-label={isFavorite ? "Quitar de favoritos" : "Añadir a favoritos"}
            aria-pressed={isFavorite}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-gray-500 transition-colors hover:text-primary"
          >
            <Heart className={`h-5 w-5 ${isFavorite ? "fill-primary text-primary" : ""}`} />
          </button>
        </div>

        <p className="mt-3 flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          {card.address}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <StarRating rating={card.rating} count={card.ratingCount} />
          <span className="text-sm font-semibold text-gray-700">{card.price}</span>
        </div>
        <div className="mt-3 flex min-h-5 items-center gap-1.5 text-sm text-gray-600">
          <Clock3 className="h-4 w-4 shrink-0 text-primary" />
          <span>{card.todaySchedule ? `Hoy: ${card.todaySchedule.startsAt} - ${card.todaySchedule.endsAt}` : "Cerrado hoy"}</span>
        </div>
        <p className="mt-3 min-h-10 text-sm leading-relaxed text-gray-600">
          {shortDescription || "Sin descripción disponible."}
        </p>
        <PrimaryButton onClick={() => onDetails(card.locationId)} size="md" className="mt-auto w-full">
          <Utensils className="h-4 w-4" />
          Menú
        </PrimaryButton>
      </div>
    </article>
  );
}
