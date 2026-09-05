import { apiFetch } from "../http/api-client";

export interface LocationReview {
  id: string;
  name: string;
  address: string;
  status: "pendiente_aprobacion" | "activa" | "rechazada";
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
}

export const adminService = {
  listLocationReviews: () => apiFetch<LocationReview[]>("/restaurantes/administracion"),
  approveLocation: (locationId: string) =>
    apiFetch<void>(`/restaurantes/administracion/sedes/${locationId}/aprobar`, {
      method: "POST",
    }),
  rejectLocation: (locationId: string, reason: string) =>
    apiFetch<void>(`/restaurantes/administracion/sedes/${locationId}/rechazar`, {
      method: "POST",
      body: { reason },
    }),
};
