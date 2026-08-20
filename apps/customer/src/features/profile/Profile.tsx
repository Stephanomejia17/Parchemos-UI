"use client";

import { useRouter } from "next/navigation";
import { BarChart3, Camera, LogOut, Settings, Star } from "lucide-react";
import { RemoteImage } from "@/components/media/RemoteImage";

const BADGES = ["🔥 Foodie", "⭐ Top Reviewer", "🗺️ Explorer", "🍕 Pizza Lover", "☕ Coffee Fan"];

const VISITS = [
  { name: "La Paloma Gastrobar", date: "Hace 2 días", rating: 5, img: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=60&h=60&fit=crop&auto=format" },
  { name: "Castillo de Sal", date: "Hace 1 semana", rating: 4, img: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=60&h=60&fit=crop&auto=format" },
  { name: "El Origen", date: "Hace 2 semanas", rating: 5, img: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=60&h=60&fit=crop&auto=format" },
];

const STATS = [
  { value: "248", label: "Visitas" },
  { value: "87", label: "Favoritos" },
  { value: "43", label: "Reseñas" },
  { value: "1.2K", label: "Seguidores" },
];

export function Profile() {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="bg-white px-4 pt-4 pb-0 border-b border-border md:px-6 md:pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 font-heading">Perfil</h2>
          <div className="flex gap-2">
            <button onClick={() => router.push("/profile/dashboard")} className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-gray-700" />
            </button>
            <button className="w-9 h-9 bg-gray-100 rounded-2xl flex items-center justify-center">
              <Settings className="w-4 h-4 text-gray-700" />
            </button>
          </div>
        </div>
        {/* Avatar + stats */}
        <div className="flex items-center gap-4 pb-4 md:gap-6">
          <div className="relative">
            <RemoteImage
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&auto=format"
              alt="user"
              className="w-20 h-20 md:w-24 md:h-24 rounded-2xl"
              sizes="96px"
            />
            <button className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-lg flex items-center justify-center">
              <Camera className="w-3 h-3 text-white" />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-900 text-lg">Juan Sebastián M.</h3>
            <p className="text-sm text-muted-foreground">@juanse.foodie</p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className="w-4 h-4 bg-secondary rounded-md flex items-center justify-center">
                <span className="text-xs">🏆</span>
              </div>
              <span className="text-xs font-semibold text-yellow-600">Nivel Gourmet · 1.240 pts</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-0 border-t border-border py-4">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center border-r last:border-r-0 border-border">
              <p className="font-bold text-gray-900 text-base">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 md:items-start flex flex-col gap-4">
        <div className="bg-white rounded-2xl p-4 border border-border shadow-sm">
          <p className="font-semibold text-gray-900 mb-3">Badges</p>
          <div className="flex flex-wrap gap-2">
            {BADGES.map(b => (
              <span key={b} className="px-3 py-1.5 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-100 rounded-2xl text-sm font-semibold text-gray-800">
                {b}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden md:col-span-1 lg:col-span-2">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <p className="font-semibold text-gray-900">Visitas recientes</p>
            <button className="text-xs text-primary font-semibold">Ver todo</button>
          </div>
          <div className="divide-y divide-border">
            {VISITS.map((v, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <RemoteImage src={v.img} alt={v.name} className="w-12 h-12 rounded-xl" sizes="48px" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{v.name}</p>
                  <p className="text-xs text-muted-foreground">{v.date}</p>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star key={si} className={`w-3 h-3 ${si < v.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-2xl py-3.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors md:col-span-full">
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
