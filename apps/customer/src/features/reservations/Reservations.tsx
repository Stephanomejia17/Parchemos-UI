"use client";

import { useState } from "react";
import { Calendar, Clock, Plus, Users } from "lucide-react";
import { CustomerBadge as Badge, PrimaryButton } from "@parchemos/shared/components";
import { RemoteImage } from "@/components/media/RemoteImage";
import { RESERVATIONS_DATA } from "./data";

export function Reservations() {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  return (
    <div className="flex flex-col h-full bg-background overflow-y-auto">
      <div className="bg-white px-4 pt-4 pb-3 border-b border-border sticky top-0 z-10 md:px-6 md:pt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-900 font-heading">Reservas</h2>
          <PrimaryButton size="sm" className="hidden md:flex">
            <Plus className="w-3.5 h-3.5" />
            Nueva reserva
          </PrimaryButton>
        </div>
        <div className="flex bg-gray-100 rounded-2xl p-1 md:max-w-xs">
          {(["upcoming", "past"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${tab === t ? "bg-white shadow-sm text-gray-900" : "text-muted-foreground"}`}
            >
              {t === "upcoming" ? "Próximas" : "Historial"}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {RESERVATIONS_DATA.map(res => (
            <div key={res.id} className="bg-white rounded-2xl p-4 shadow-sm border border-border">
              <div className="flex gap-3">
                <RemoteImage src={res.img} alt={res.restaurant} className="w-16 h-16 rounded-xl flex-shrink-0" sizes="64px" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-gray-900 text-sm truncate">{res.restaurant}</p>
                    <Badge color={res.status === "confirmed" ? "green" : "yellow"}>{res.status === "confirmed" ? "Confirmada" : "Pendiente"}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {res.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {res.time}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" />
                      {res.guests} personas
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <PrimaryButton size="sm" className="flex-1">
                  Ver detalles
                </PrimaryButton>
                <PrimaryButton size="sm" variant="outline" className="flex-1">
                  Modificar
                </PrimaryButton>
                {res.status === "confirmed" && (
                  <PrimaryButton size="sm" variant="ghost">
                    Cancelar
                  </PrimaryButton>
                )}
              </div>
            </div>
          ))}

          {/* CTA card */}
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-5 border border-orange-100">
            <h3 className="font-bold text-gray-900 text-base mb-1">¿A dónde parchar hoy?</h3>
            <p className="text-sm text-muted-foreground mb-3">Explora los restaurantes disponibles y reserva tu mesa.</p>
            <PrimaryButton size="sm">Explorar restaurantes</PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
}
