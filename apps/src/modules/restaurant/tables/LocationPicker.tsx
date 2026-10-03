import { Store } from "lucide-react";
import type { Location, Restaurant } from "@/shared/types/restaurant";

export function LocationPicker({
  restaurant,
  onSelect,
  error,
}: {
  restaurant: Restaurant;
  onSelect: (location: Location) => void;
  error?: string | null;
}) {
  return (
    <main className="min-h-full bg-background p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          {restaurant.businessName}
        </p>
        <h1 className="mb-6 mt-1 text-2xl font-bold text-foreground">Escoge una sede</h1>
        {error && (
          <p
            role="alert"
            className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        )}
        {restaurant.locations.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-surface p-10 text-center text-muted-foreground">
            Este restaurante no tiene sedes disponibles.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {restaurant.locations.map((location) => (
              <button
                key={location.id}
                type="button"
                onClick={() => onSelect(location)}
                className="rounded-2xl border border-border bg-surface p-5 text-left shadow-sm transition duration-200 hover:border-primary"
              >
                <Store className="mb-4 h-8 w-8 text-primary" />
                <h2 className="font-bold text-foreground">{location.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{location.address}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
