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

export interface ModerationReport {
  id: string;
  caption: string | null;
  status: string;
  createdAt: string;
  author: { id: string; email: string; profile: { fullName: string; photoUrl: string | null } | null };
  location: { id: string; name: string } | null;
  media: Array<{ id: string; mediaType: string; url: string; mimeType: string; width: number | null; height: number | null; durationSeconds: number | null }>;
  reports: Array<{ id: string; reason: string; details: string | null; status: string; createdAt: string; resolvedAt: string | null; resolutionNote: string | null; reporter: { email: string; profile: { fullName: string } | null } }>;
  history: Array<{ id: string; action: string; reason: string | null; createdAt: string; actor: { id: string; email: string; profile: { fullName: string } | null } | null }>;
}

export interface ModerationStatistics {
  reason: string;
  count: number;
  otherDetails: Array<{ text: string; count: number }>;
}

export interface ModerationReportsResponse {
  items: ModerationReport[];
  statistics: ModerationStatistics[];
  total: number;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  city: string | null;
  photoUrl: string | null;
  role: string;
  status: "activa" | "suspendida" | string;
  suspensionReason: string | null;
  statusChangedAt: string;
  createdAt: string;
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
  listReportedPosts: (params?: { from?: string; to?: string; sort?: "asc" | "desc"; status?: "pending" | "reviewed" | "all" }) => {
    const query = new URLSearchParams();
    if (params?.from) query.set("from", params.from);
    if (params?.to) query.set("to", params.to);
    if (params?.sort) query.set("sort", params.sort);
    if (params?.status) query.set("status", params.status);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return apiFetch<ModerationReportsResponse>(`/administracion/moderacion/publicaciones${suffix}`);
  },
  moderationSummary: () => apiFetch<{ pendingReports: number }>('/administracion/moderacion/resumen'),
  removeReportedPost: (postId: string, reason: string) =>
    apiFetch<void>(`/administracion/moderacion/publicaciones/${postId}/eliminar`, { method: 'POST', body: { reason } }),
  reviewReport: (reportId: string, result: string) =>
    apiFetch<void>(`/administracion/moderacion/denuncias/${reportId}/revisar`, { method: 'POST', body: { result } }),
  listUsers: () => apiFetch<AdminUser[]>('/administracion/usuarios'),
  suspendUser: (userId: string, reason: string) =>
    apiFetch<void>(`/administracion/usuarios/${userId}/suspender`, { method: 'PATCH', body: { reason } }),
  activateUser: (userId: string) =>
    apiFetch<void>(`/administracion/usuarios/${userId}/activar`, { method: 'PATCH' }),
};
