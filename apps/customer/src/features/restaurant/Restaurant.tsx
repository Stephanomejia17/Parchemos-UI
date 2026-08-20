"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkPlus, ChevronLeft, MapPin, Plus, Share2, Star } from "lucide-react";
import { CustomerBadge as Badge, PrimaryButton } from "@parchemos/shared/components";
import { RemoteImage } from "@/components/media/RemoteImage";
import { MENU_SECTIONS } from "@/features/menu/data";

const TABS = ["Menú", "Fotos", "Reseñas", "Eventos"];

const GALLERY = [
  "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=200&h=200&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=200&h=200&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=200&h=200&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=200&h=200&fit=crop&auto=format",
  "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=200&h=200&fit=crop&auto=format",
];

export function Restaurant() {
  const router = useRouter();
  const [tab, setTab] = useState("menu");

  const goMenu = () => router.push("/menu");

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-background">
      <div className="relative">
        <RemoteImage
          src="https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&h=500&fit=crop&auto=format"
          alt="restaurant"
          className="w-full h-56 md:h-72 lg:h-80"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        <button onClick={() => router.back()} className="absolute top-4 left-4 w-9 h-9 bg-white/90 rounded-2xl flex items-center justify-center shadow-sm">
          <ChevronLeft className="w-5 h-5 text-gray-900" />
        </button>
        <div className="absolute top-4 right-4 flex gap-2">
          <button className="w-9 h-9 bg-white/90 rounded-2xl flex items-center justify-center shadow-sm">
            <Share2 className="w-4 h-4 text-gray-900" />
          </button>
          <button className="w-9 h-9 bg-white/90 rounded-2xl flex items-center justify-center shadow-sm">
            <BookmarkPlus className="w-4 h-4 text-gray-900" />
          </button>
        </div>
      </div>

      {/* Info + CTAs */}
      <div className="bg-white px-4 pb-4 pt-4 border-b border-border md:px-6 md:pb-6">
        <div className="md:flex md:items-start md:justify-between md:gap-8">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-3 md:block">
              <div>
                <h2 className="text-xl font-bold text-gray-900 md:text-2xl font-heading">La Paloma Gastrobar</h2>
                <p className="text-sm text-muted-foreground mt-0.5">Americana · Burgers · $$</p>
              </div>
              <div className="flex flex-col items-end gap-1 md:hidden">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-gray-900">4.9</span>
                </div>
                <span className="text-xs text-muted-foreground">2.341 reseñas</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 mt-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                Zona Rosa, Bogotá
              </div>
              <div className="flex items-center gap-1 text-xs text-accent font-semibold">
                <div className="w-2 h-2 rounded-full bg-accent" />
                Abierto · Cierra a las 11 PM
              </div>
              <div className="hidden md:flex items-center gap-1 text-xs">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-900">4.9</span>
                <span className="text-muted-foreground">(2.341)</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {["Terraza", "Pet Friendly", "Wifi", "Reservas", "Parking"].map(tag => (
                <Badge key={tag} color="gray">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4 md:mt-0 md:flex-shrink-0 md:w-64">
            <PrimaryButton size="md" className="w-full">
              📅 Reservar
            </PrimaryButton>
            <PrimaryButton size="md" variant="outline" className="w-full" onClick={goMenu}>
              🍴 Ver menú
            </PrimaryButton>
            <PrimaryButton size="md" variant="secondary" className="w-full" onClick={goMenu}>
              🛍️ Pedir ahora
            </PrimaryButton>
            <PrimaryButton size="md" variant="ghost" className="w-full border border-gray-200">
              🪑 Ir a la mesa
            </PrimaryButton>
          </div>
        </div>
      </div>

      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="flex px-4 md:px-6">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t.toLowerCase())}
              className={`flex-1 py-3 text-sm font-semibold transition-colors border-b-2 ${tab === t.toLowerCase() ? "text-primary border-primary" : "text-muted-foreground border-transparent"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Gallery */}
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
          {GALLERY.map((src, i) => (
            <RemoteImage key={i} src={src} alt="food" className={`w-full rounded-xl ${i < 3 ? "h-24 md:h-28" : "hidden md:block h-28"}`} sizes="200px" />
          ))}
        </div>

        <h3 className="font-bold text-gray-900 mb-3">Más pedidos</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {MENU_SECTIONS[0].items.map(item => (
            <div key={item.id} className="flex gap-3 bg-white rounded-2xl p-3 border border-border shadow-sm">
              <RemoteImage src={item.img} alt={item.name} className="w-20 h-20 rounded-xl flex-shrink-0" sizes="80px" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900">{item.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.desc}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="font-bold text-primary text-sm">${item.price.toLocaleString()}</span>
                  <button onClick={goMenu} className="w-7 h-7 bg-primary rounded-xl flex items-center justify-center">
                    <Plus className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
