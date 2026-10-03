"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

interface LocationContextValue {
  locationId: string | null;
  setLocationId: (id: string) => void;
}

const LocationContext = createContext<LocationContextValue | null>(null);

// Respaldo para cuando /menu se abre sin ?locationId= en la URL (ej. el
// usuario refrescó la página). La URL sigue siendo la fuente de verdad
// cuando trae el parámetro.
const STORAGE_KEY = "parchemos:activeLocation";

export function LocationProvider({
  children,
  initialLocationId,
}: {
  children: ReactNode;
  initialLocationId?: string;
}) {
  const [locationId, setLocationIdState] = useState<string | null>(initialLocationId ?? null);

  useEffect(() => {
    if (initialLocationId) {
      setLocationIdState(initialLocationId);
      return;
    }
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setLocationIdState(stored);
    } catch {
      // arrancamos sin sede activa
    }
  }, [initialLocationId]);

  const setLocationId = (id: string) => {
    setLocationIdState(id);
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // sigue funcionando en memoria aunque no se persista
    }
  };

  return (
    <LocationContext.Provider value={{ locationId, setLocationId }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocationContext() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error("useLocationContext debe usarse dentro de un LocationProvider");
  return ctx;
}

// Alias de dominio utilizado por las pantallas de comensal: en esta app el
// identificador que recibe /menu es el ID de la sede/restaurante.
export const RestaurantProvider = LocationProvider;

export function useRestaurantContext() {
  const { locationId, setLocationId } = useLocationContext();
  return { restaurantId: locationId, setRestaurantId: setLocationId };
}
