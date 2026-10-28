"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import { PrimaryButton } from "@/shared/components";
import type { Location } from "@/shared/types/restaurant";
import "leaflet/dist/leaflet.css";

type MappableLocation = Location & {
  latitude: number;
  longitude: number;
};

type DiscoverMapProps = {
  locations: MappableLocation[];
  selectedLocationId: string | null;
  onSelect: (location: Location) => void;
  onOpenLocation: (locationId: string) => void;
};

type PlacedLocation = MappableLocation & {
  markerLatitude: number;
  markerLongitude: number;
};

/** Separación (en metros) entre sedes que llegaron con las mismas coordenadas. */
const OVERLAP_RADIUS_M = 35;

/**
 * Varias sedes pueden compartir coordenadas (p. ej. locales del mismo centro
 * comercial). Se reparten en un círculo pequeño para que cada una se vea y se
 * pueda pulsar, en vez de apilarse en un punto.
 */
function spreadOverlapping(locations: MappableLocation[]): PlacedLocation[] {
  const groups = new Map<string, MappableLocation[]>();
  for (const location of locations) {
    const key = `${location.latitude.toFixed(6)},${location.longitude.toFixed(6)}`;
    groups.set(key, [...(groups.get(key) ?? []), location]);
  }

  return [...groups.values()].flatMap((group) =>
    group.map((location, index) => {
      if (group.length === 1) {
        return { ...location, markerLatitude: location.latitude, markerLongitude: location.longitude };
      }
      const angle = (2 * Math.PI * index) / group.length;
      const metersPerDegree = 111_320;
      return {
        ...location,
        markerLatitude: location.latitude + (OVERLAP_RADIUS_M * Math.cos(angle)) / metersPerDegree,
        markerLongitude:
          location.longitude +
          (OVERLAP_RADIUS_M * Math.sin(angle)) / (metersPerDegree * Math.cos((location.latitude * Math.PI) / 180)),
      };
    }),
  );
}

function FitLocations({ locations }: { locations: PlacedLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 1) {
      map.setView([locations[0].markerLatitude, locations[0].markerLongitude], 14);
      return;
    }

    if (locations.length > 1) {
      const bounds = L.latLngBounds(
        locations.map(({ markerLatitude, markerLongitude }) => [markerLatitude, markerLongitude]),
      );

      if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
        map.setView([locations[0].markerLatitude, locations[0].markerLongitude], 14);
      } else {
        map.fitBounds(bounds, { padding: [32, 32], maxZoom: 15 });
      }
    }
  }, [locations, map]);

  return null;
}

export default function DiscoverMap({
  locations,
  selectedLocationId,
  onSelect,
  onOpenLocation,
}: DiscoverMapProps) {
  const placed = useMemo(() => spreadOverlapping(locations), [locations]);

  if (placed.length === 0) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center bg-gray-100 px-6 text-center text-sm text-muted-foreground">
        No hay sedes con coordenadas válidas para mostrar en el mapa.
      </div>
    );
  }

  const firstLocation = placed[0];

  return (
    <MapContainer
      center={[firstLocation.markerLatitude, firstLocation.markerLongitude]}
      zoom={12}
      scrollWheelZoom
      className="h-full min-h-64 w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <FitLocations locations={placed} />
      {placed.map((location) => (
        <CircleMarker
          key={location.id}
          center={[location.markerLatitude, location.markerLongitude]}
          radius={selectedLocationId === location.id ? 10 : 8}
          pathOptions={{
            color: selectedLocationId === location.id ? "#c2410c" : "#ffffff",
            fillColor: "#f97316",
            fillOpacity: 1,
            weight: 3,
          }}
          eventHandlers={{ click: () => onSelect(location) }}
        >
          <Popup>
            <div className="space-y-2">
              <div>
                <p className="font-semibold">{location.restaurant?.businessName ?? location.name}</p>
                {location.restaurant && <p className="text-xs text-gray-600">{location.name}</p>}
              </div>
              <p>{location.address}</p>
              <PrimaryButton
                type="button"
                size="sm"
                onClick={() => onOpenLocation(location.id)}
              >
                Ver perfil
              </PrimaryButton>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
