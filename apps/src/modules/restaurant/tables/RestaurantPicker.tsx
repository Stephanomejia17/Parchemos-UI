import { Store } from "lucide-react";
import type { Restaurant } from "@/shared/types/restaurant";

export function RestaurantPicker({
  restaurants,
  onSelect,
  error,
}: {
  restaurants: Restaurant[];
  onSelect: (restaurant: Restaurant) => void;
  error?: string | null;
}) {
  return (
    <main className="min-h-full bg-background p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-bold text-foreground">Escoge un restaurante</h1>
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        {restaurants.length === 0 && !error ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-muted-foreground">
            No tienes restaurantes disponibles.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restaurants.map((restaurant) => (
              <button
                key={restaurant.id}
                type="button"
                onClick={() => onSelect(restaurant)}
                className="rounded-2xl border border-border bg-surface p-5 text-left shadow-sm transition duration-200 hover:border-primary"
              >
                <Store className="mb-4 h-8 w-8 text-primary" />
                <h2 className="font-bold text-foreground">{restaurant.businessName}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {restaurant.locations.length}{" "}
                  {restaurant.locations.length === 1 ? "sede" : "sedes"}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
