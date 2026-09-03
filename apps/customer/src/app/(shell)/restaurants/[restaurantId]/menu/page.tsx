import { RestaurantMenuConfiguration } from "@/features/restaurants/RestaurantMenuConfiguration";

export default async function RestaurantMenuPage({ params }: { params: Promise<{ restaurantId: string }> }) {
  const { restaurantId } = await params;
  return <RestaurantMenuConfiguration restaurantId={restaurantId} />;
}
