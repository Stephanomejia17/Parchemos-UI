"use client";

import { useEffect } from "react";
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

function FitLocations({ locations }: { locations: MappableLocation[] }) {
  const map = useMap();

  useEffect(() => {
    if (locations.length === 1) {
      map.setView([locations[0].latitude, locations[0].longitude], 14);
      return;
    }

    if (locations.length > 1) {
      const bounds = L.latLngBounds(
        locations.map(({ latitude, longitude }) => [latitude, longitude]),
      );

      if (bounds.getNorthEast().equals(bounds.getSouthWest())) {
        map.setView([locations[0].latitude, locations[0].longitude], 14);
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
  if (locations.length === 0) {
    return (
      <div className="flex h-full min-h-64 items-center justify-center bg-gray-100 px-6 text-center text-sm text-muted-foreground">
        No hay sedes con coordenadas válidas para mostrar en el mapa.
      </div>
    );
  }

  const firstLocation = locations[0];

  return (
    <MapContainer
      center={[firstLocation.latitude, firstLocation.longitude]}
      zoom={12}
      scrollWheelZoom
      className="h-full min-h-64 w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <FitLocations locations={locations} />
      {locations.map((location) => (
        <CircleMarker
          key={location.id}
          center={[location.latitude, location.longitude]}
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
              <p className="font-semibold">{location.name}</p>
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
