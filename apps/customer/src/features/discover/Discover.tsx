"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, MapPin, Navigation, Search } from "lucide-react";
import { CustomerBadge as Badge, PrimaryButton, StarRating } from "@parchemos/shared/components";
import { RemoteImage } from "@/components/media/RemoteImage";
import { RESTAURANTS_MAP } from "./data";

const FILTERS = ["Abierto ahora", "Terraza", "Pet Friendly", "Parejas", "Grupos", "Vegan", "Fine Dining"];

export function Discover() {
  const router = useRouter();
  const [activeFilters, setActiveFilters] = useState<string[]>(["Abierto ahora"]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<(typeof RESTAURANTS_MAP)[0] | null>(null);

  const goRestaurant = () => router.push("/restaurant");
  const toggleFilter = (f: string) => setActiveFilters(prev => (prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]));

  return (
    <div className="flex flex-col h-full bg-background md:flex-row">
      {/* Left panel — filters + cards list on md+ */}
      <div className="bg-white border-b border-border md:border-b-0 md:border-r md:w-80 md:flex-shrink-0 md:flex md:flex-col lg:w-96">
        <div className="px-4 pt-4 pb-3 md:px-5 md:pt-5">
          <h2 className="text-xl font-bold text-gray-900 mb-3 font-heading">Descubrir</h2>
          <div className="flex items-center gap-2 bg-gray-100 rounded-2xl px-4 py-3">
            <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <input className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder-muted-foreground" placeholder="Restaurantes, cocinas, lugares..." />
            <Filter className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-3">
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => toggleFilter(f)}
                className={`px-3 py-1.5 rounded-2xl text-xs font-semibold flex-shrink-0 transition-all ${
                  activeFilters.includes(f) ? "bg-primary text-white" : "bg-gray-100 text-gray-700"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        {/* Restaurant list — vertical on md+ */}
        <div className="md:flex-1 md:overflow-y-auto">
          <div className="flex gap-3 overflow-x-auto scrollbar-hide p-4 md:flex-col md:overflow-x-visible md:gap-2">
            {RESTAURANTS_MAP.map(r => (
              <button
                key={r.id}
                onClick={() => {
                  setSelectedRestaurant(r);
                  goRestaurant();
                }}
                className={`flex-shrink-0 w-56 md:w-full rounded-2xl overflow-hidden shadow-sm border transition-all text-left md:flex md:flex-row ${
                  selectedRestaurant?.id === r.id ? "border-primary shadow-orange-100 shadow-md" : "border-border"
                }`}
              >
                <div className="relative h-28 md:h-auto md:w-20 md:flex-shrink-0">
                  <RemoteImage src={r.img} alt={r.name} className="w-full h-full" sizes="(min-width: 768px) 80px, 224px" />
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold md:hidden ${r.open ? "bg-accent text-white" : "bg-gray-500 text-white"}`}>
                    {r.open ? "Abierto" : "Cerrado"}
                  </div>
                </div>
                <div className="p-3 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 text-sm truncate flex-1">{r.name}</p>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded-lg hidden md:block ${r.open ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {r.open ? "Abierto" : "Cerrado"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {r.category} · {r.price}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <StarRating rating={r.rating} />
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {r.distance}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.tags.map(tag => (
                      <Badge key={tag} color="gray">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Map — full height on desktop */}
      <div className="relative flex-1 min-h-64 bg-gray-100 overflow-hidden">
        <RemoteImage
          src="https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&h=800&fit=crop&auto=format"
          alt="map"
          className="w-full h-full opacity-40"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
        {RESTAURANTS_MAP.map(r => (
          <button
            key={r.id}
            onClick={() => setSelectedRestaurant(r)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all"
            style={{ top: `${r.lat}%`, left: `${r.lng}%` }}
          >
            <div className={`px-2.5 py-1.5 rounded-2xl shadow-lg text-xs font-bold flex items-center gap-1 ${selectedRestaurant?.id === r.id ? "bg-primary text-white scale-110" : "bg-white text-gray-900"}`}>
              <span>{r.price}</span>
            </div>
          </button>
        ))}
        <div className="absolute bottom-4 right-4">
          <button className="w-10 h-10 bg-white rounded-2xl shadow-lg flex items-center justify-center">
            <Navigation className="w-5 h-5 text-primary" />
          </button>
        </div>
        {selectedRestaurant && (
          <div className="absolute bottom-4 left-4 right-16 md:left-4 md:right-4 md:max-w-xs bg-white rounded-2xl shadow-lg border border-border p-3">
            <div className="flex gap-3">
              <RemoteImage src={selectedRestaurant.img} alt={selectedRestaurant.name} className="w-16 h-16 rounded-xl flex-shrink-0" sizes="64px" />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-gray-900 text-sm truncate">{selectedRestaurant.name}</p>
                <StarRating rating={selectedRestaurant.rating} count={undefined} />
                <div className="flex gap-2 mt-2">
                  <PrimaryButton onClick={goRestaurant} size="sm" className="flex-1">
                    Ver perfil
                  </PrimaryButton>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
