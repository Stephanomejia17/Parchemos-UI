"use client";

import { LogOut, MapPin } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/shared/auth";
import { PrimaryButton, SurfaceCard } from "@/shared/components";
import { OrderStatusPanel } from "./OrderStatusPanel";
import { WorkroomKpis } from "./WorkroomKpis";

export function WorkroomDashboard() {
  const { user, logout } = useAuth();
  const location = user?.assignedLocation;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Parchemos · Sala
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Hola, {user?.fullName || "equipo"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Este es tu panel de trabajo para la atención en sala.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/staff_profile"
              className="inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700"
            >
              Mi perfil
            </Link>
            <PrimaryButton type="button" onClick={() => void logout()}>
              <LogOut className="h-4 w-4" />
              Cerrar sesión
            </PrimaryButton>
          </div>
        </header>

        <SurfaceCard className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-primary">
            <MapPin className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-gray-500">Sede asignada</p>
            <p className="font-semibold text-gray-900">
              {location?.name || "Sede pendiente de asignación"}
            </p>
            {location?.restaurantName && (
              <p className="text-xs text-gray-500">{location.restaurantName}</p>
            )}
          </div>
          <span className="ml-auto rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            Sesión activa
          </span>
        </SurfaceCard>

        {location && <WorkroomKpis locationId={location.id} />}

        <section className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {location ? (
            <OrderStatusPanel locationId={location.id} />
          ) : (
            <SurfaceCard className="p-5 text-sm text-gray-500">
              Cuando te asignen una sede verás aquí sus pedidos en curso.
            </SurfaceCard>
          )}

          <SurfaceCard className="p-5">
            <h2 className="font-semibold text-gray-900">Cómo usar el panel</h2>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-sm leading-6 text-gray-500">
              <li>Los pedidos nuevos de tu sede aparecen solos, marcados como “Nuevo”.</li>
              <li>Abre “Ver detalle” para ver productos, cantidades, modalidad y mesa.</li>
              <li>Avanza el estado con los botones; el comensal recibe el aviso al instante.</li>
            </ol>
            <div className="mt-4 rounded-xl bg-orange-50 p-3 text-xs text-orange-800">
              Cada mesa muestra lo que falta por pagar, incluidos los pedidos ya entregados.
            </div>
          </SurfaceCard>
        </section>
      </div>
    </main>
  );
}
