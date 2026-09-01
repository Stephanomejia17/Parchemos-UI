"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, Check, Loader2, MapPin, Search, X } from "lucide-react";
import { ApiError, apiFetch } from "@parchemos/shared/auth";
import { PrimaryButton, StatusBadge, SurfaceCard } from "@parchemos/shared/components";
import { SectionHeader } from "@/components/SectionHeader";

type LocationStatus = "pendiente_aprobacion" | "activa" | "rechazada";

type LocationReview = {
  id: string;
  name: string;
  address: string;
  status: LocationStatus;
  rejectionReason: string | null;
  approvedAt: string | null;
  restaurant: {
    id: string;
    businessName: string;
    owner: {
      id: string;
      fullName: string;
      email: string;
    };
  };
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error instanceof ApiError) return error.message;
  return fallback;
};

export function Restaurants() {
  const [locations, setLocations] = useState<LocationReview[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reasonDraft, setReasonDraft] = useState<Record<string, string>>({});
  const [rejectError, setRejectError] = useState<Record<string, string>>({});

  const loadLocations = async () => {
    try {
      setError(null);
      const data = await apiFetch<LocationReview[]>("/restaurantes/administracion");
      setLocations(data);
    } catch (err) {
      setError(getErrorMessage(err, "No pudimos cargar las sedes."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadLocations();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return locations;
    return locations.filter(location => {
      const haystack = [
        location.name,
        location.address,
        location.restaurant.businessName,
        location.restaurant.owner.fullName,
        location.restaurant.owner.email,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [locations, search]);

  const handleApprove = async (locationId: string) => {
    setPendingActionId(locationId);
    try {
      await apiFetch(`/restaurantes/administracion/sedes/${locationId}/aprobar`, {
        method: "POST",
      });
      await loadLocations();
    } catch (err) {
      setError(getErrorMessage(err, "No pudimos aprobar la sede."));
    } finally {
      setPendingActionId(null);
    }
  };

  const handleReject = async (locationId: string) => {
    const reason = (reasonDraft[locationId] ?? "").trim();
    if (!reason) {
      setRejectError(prev => ({ ...prev, [locationId]: "El motivo es obligatorio." }));
      return;
    }

    setPendingActionId(locationId);
    setRejectError(prev => ({ ...prev, [locationId]: "" }));

    try {
      await apiFetch(`/restaurantes/administracion/sedes/${locationId}/rechazar`, {
        method: "POST",
        body: { reason },
      });
      setRejectingId(null);
      setReasonDraft(prev => ({ ...prev, [locationId]: "" }));
      await loadLocations();
    } catch (err) {
      setRejectError(prev => ({
        ...prev,
        [locationId]: getErrorMessage(err, "No pudimos rechazar la sede."),
      }));
    } finally {
      setPendingActionId(null);
    }
  };

  const approvedCount = locations.filter(item => item.status === "activa").length;
  const pendingCount = locations.filter(item => item.status === "pendiente_aprobacion").length;
  const rejectedCount = locations.filter(item => item.status === "rechazada").length;

  return (
    <div className="space-y-5">
      <SectionHeader
        title="Gestión de restaurantes"
        sub={`${locations.length} sedes · ${approvedCount} activas · ${pendingCount} pendientes · ${rejectedCount} rechazadas`}
      />

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar sede o restaurante..."
          className="w-full pl-9 pr-4 py-2.5 text-[13px] bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-gray-200 bg-white">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Cargando sedes...
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <SurfaceCard className="p-6 text-sm text-gray-600">
          No hay sedes para mostrar con ese filtro.
        </SurfaceCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(location => {
            const isPending = location.status === "pendiente_aprobacion";
            const isRejecting = rejectingId === location.id;
            const isBusy = pendingActionId === location.id;
            const reason = reasonDraft[location.id] ?? "";
            const reasonValidation = rejectError[location.id] ?? "";

            return (
              <SurfaceCard key={location.id} className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-[15px] font-semibold text-gray-900">{location.name}</h3>
                    <p className="text-[12px] text-gray-500 mt-1">{location.restaurant.businessName}</p>
                  </div>
                  <StatusBadge status={location.status} />
                </div>

                <div className="space-y-2 text-[12px] text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <span>{location.address}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Propietario:</span> {location.restaurant.owner.fullName}
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Correo:</span> {location.restaurant.owner.email}
                  </div>
                  {location.approvedAt && (
                    <div>
                      <span className="font-medium text-gray-700">Aprobada:</span> {new Date(location.approvedAt).toLocaleDateString("es-CO")}
                    </div>
                  )}
                  {location.rejectionReason && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-2 py-1.5 text-red-700">
                      {location.rejectionReason}
                    </div>
                  )}
                </div>

                {isRejecting && (
                  <div className="mt-4 space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <label className="block text-[12px] font-medium text-gray-700">Motivo del rechazo</label>
                    <textarea
                      rows={3}
                      value={reason}
                      onChange={event => setReasonDraft(prev => ({ ...prev, [location.id]: event.target.value }))}
                      placeholder="Escribe el motivo..."
                      className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20"
                    />
                    {reasonValidation && <p className="text-[11px] text-red-600">{reasonValidation}</p>}
                    <div className="flex gap-2 pt-1">
                      <PrimaryButton
                        type="button"
                        size="sm"
                        disabled={isBusy}
                        onClick={() => void handleReject(location.id)}
                        className="flex-1"
                      >
                        {isBusy ? "Enviando..." : "Confirmar rechazo"}
                      </PrimaryButton>
                      <button
                        type="button"
                        onClick={() => {
                          setRejectingId(null);
                          setRejectError(prev => ({ ...prev, [location.id]: "" }));
                        }}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-[12px] font-medium text-gray-700"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3">
                  {isPending && (
                    <PrimaryButton
                      type="button"
                      size="sm"
                      disabled={isBusy}
                      onClick={() => void handleApprove(location.id)}
                      className="flex-1"
                    >
                      {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                      {isBusy ? "Aprobando..." : "Aprobar"}
                    </PrimaryButton>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setRejectingId(current => (current === location.id ? null : location.id));
                      setRejectError(prev => ({ ...prev, [location.id]: "" }));
                    }}
                    disabled={isBusy}
                    className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[12px] font-medium text-gray-700 disabled:opacity-50"
                  >
                    Rechazar
                  </button>
                </div>
              </SurfaceCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
