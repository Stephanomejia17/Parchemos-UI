"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, MapPin } from "lucide-react";
import { RemoteImage } from "@/shared/components/media/RemoteImage";
import { restaurantService } from "@/shared/services/restaurant/restaurant.service";
import { useRestaurantContext } from "@/shared/context/location-context";
import type { Dish } from "@/shared/types/menu";
import { MenuScreen } from "@/modules/customer/menu/MenuScreen";
import { Reviews } from "@/modules/customer/reviews/Reviews";

const TABS = [
  { key: "menu", label: "Menú" },
  { key: "photos", label: "Fotos" },
  { key: "reviews", label: "Reseñas" },
  { key: "events", label: "Eventos" },
];

type RestaurantProps = Readonly<{
  initialMenu?: Dish[];
  menuLoadError?: boolean;
}>;

function RestaurantContent({ initialMenu, menuLoadError = false }: Readonly<RestaurantProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { restaurantId: contextLocationId, setRestaurantId: setLocationId } = useRestaurantContext();
  const [tab, setTab] = useState("menu");
  const [location, setLocation] = useState<Awaited<ReturnType<typeof restaurantService.getPublicLocation>> | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const urlLocationId = searchParams.get("locationId") ?? searchParams.get("restaurantId");
  const locationId = urlLocationId ?? contextLocationId;

  useEffect(() => {
    if (urlLocationId && urlLocationId !== contextLocationId) {
      setLocationId(urlLocationId);
    }
  }, [contextLocationId, setLocationId, urlLocationId]);

  useEffect(() => {
    if (!locationId) return;
    let active = true;
    setLocationError(null);
    restaurantService
      .getPublicLocation(locationId)
      .then((profile) => {
        if (active) setLocation(profile);
      })
      .catch((cause: unknown) => {
        console.error("No se pudo cargar la sede pública.", cause);
        if (active) {
          setLocation(null);
          setLocationError("No pudimos cargar la información de esta sede.");
        }
      });
    return () => {
      active = false;
    };
  }, [locationId]);


  const renderMenu = () => {
    if (initialMenu !== undefined) {
      return <MenuScreen dishes={initialMenu} loadError={menuLoadError} />;
    }
    return <p className="rounded-3xl bg-primary-soft p-8 text-center text-muted-foreground">Selecciona una sede para consultar su menú.</p>;
  };

  return (
    <div className="flex min-h-full flex-col bg-background pb-8">
      <div className="relative min-h-40 bg-muted md:min-h-64">
        {location?.coverUrl && <RemoteImage src={location.coverUrl} alt={`Portada de ${location.name}`} className="h-40 w-full md:h-64" sizes="100vw" />}
        <button type="button" onClick={() => router.back()} aria-label="Volver" className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-2xl bg-surface/90 shadow-sm transition duration-200 hover:bg-surface focus-visible:outline-2 focus-visible:outline-primary">
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>
      </div>

      <div className="border-b border-border bg-surface px-4 pb-4 pt-4 md:px-6 md:pb-6">
        <div className="md:flex md:items-start md:justify-between md:gap-8">
          <div className="flex-1">
            <h1 className="font-heading text-xl font-bold text-foreground md:text-2xl">
              {location?.name ?? (locationError ? "No pudimos cargar la sede" : "Cargando sede...")}
            </h1>
            {location?.description && <p className="mt-1 text-sm text-muted-foreground">{location.description}</p>}
            <div className="mt-3 flex flex-wrap gap-3">
              {location?.address && <div className="flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5 text-primary" />{location.address}</div>}
              {location && <div className={`flex items-center gap-1 text-xs font-semibold ${location.isOpen ? "text-accent" : "text-muted-foreground"}`}><span className={`h-2 w-2 rounded-full ${location.isOpen ? "bg-accent" : "bg-muted-foreground"}`} />{location.isOpen ? "Abierto" : "Cerrado"}</div>}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-10 border-b border-border bg-surface">
        <div role="tablist" aria-label="Información del restaurante" className="flex px-4 md:px-6">
          {TABS.map(({ key, label }) => <button key={key} type="button" role="tab" id={`restaurant-tab-${key}`} aria-selected={tab === key} aria-controls="restaurant-tabpanel" onClick={() => setTab(key)} className={`flex-1 border-b-2 py-3 text-sm font-semibold transition-colors ${tab === key ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}>{label}</button>)}
        </div>
      </div>

      <div id="restaurant-tabpanel" role="tabpanel" aria-labelledby={`restaurant-tab-${tab}`} className="min-h-64 p-4 md:p-6">
        {tab === "menu" && renderMenu()}
        {tab === "reviews" && locationId && <Reviews locationId={locationId} locationName={location?.name ?? "la sede seleccionada"} />}
        {tab === "photos" && <p className="rounded-3xl bg-primary-soft p-8 text-center text-muted-foreground">No hay fotografías adicionales disponibles.</p>}
        {tab === "events" && <p className="rounded-3xl bg-primary-soft p-8 text-center text-muted-foreground">No hay eventos disponibles.</p>}
      </div>
    </div>
  );
}

export function Restaurant(props: RestaurantProps) {
  return <RestaurantContent {...props} />;
}
