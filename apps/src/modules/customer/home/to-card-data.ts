import type { Location } from "@/shared/types/restaurant";
import type { RestaurantCardData } from "./components/RestaurantLocationCard";

export function toCardData(location: Location): RestaurantCardData {
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
    todaySchedule:
      location.schedules.find((schedule) => schedule.dayOfWeek === new Date().getDay()) ?? null,
  };
}
