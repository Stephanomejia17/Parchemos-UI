import { Suspense } from "react";
import { Restaurant } from "@/modules/customer/restaurant/Restaurant";
import { getMenu } from "@/lib/api/menu";

type RestaurantPageProps = {
  searchParams: Promise<{ locationId?: string | string[] }>;
};

export default async function RestaurantPage({ searchParams }: RestaurantPageProps) {
  const params = await searchParams;
  const locationId = Array.isArray(params.locationId) ? params.locationId[0] : params.locationId;

  if (!locationId) return <Suspense fallback={<RestaurantLoading />}><Restaurant /></Suspense>;

  try {
    return <Suspense fallback={<RestaurantLoading />}><Restaurant initialMenu={await getMenu(locationId)} /></Suspense>;
  } catch {
    return <Suspense fallback={<RestaurantLoading />}><Restaurant initialMenu={[]} menuLoadError /></Suspense>;
  }
}

function RestaurantLoading() {
  return <div className="min-h-64 animate-pulse bg-background" aria-label="Cargando restaurante" />;
}
