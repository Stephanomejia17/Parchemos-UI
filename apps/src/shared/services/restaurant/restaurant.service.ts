import { apiFetch, apiUpload } from "../http/api-client";
import type {
  GalleryImage,
  Location,
  Restaurant,
  Schedule,
  StaffMember,
} from "../../types/restaurant";

export interface CreateLocationInput {
  name: string;
  address: string;
  description?: string;
}

export interface UpdateLocationInfoInput {
  name: string;
  address: string;
  description?: string;
}

export interface CreateStaffMemberInput {
  fullName: string;
  email: string;
  phone?: string;
  locationId: string;
  initialPassword: string;
}

export interface UpdateStaffMemberInput {
  fullName: string;
  phone: string;
}

export const restaurantService = {
  listMyRestaurants: () => apiFetch<Restaurant[]>("/restaurantes/mios"),

  createRestaurant: (businessName: string) =>
    apiFetch<Restaurant>("/restaurantes", { method: "POST", body: { businessName } }),

  createLocation: (restaurantId: string, body: CreateLocationInput) =>
    apiFetch<Location>(`/restaurantes/${restaurantId}/sedes`, { method: "POST", body }),

  updateLocationInfo: (locationId: string, body: UpdateLocationInfoInput) =>
    apiFetch<Location>(`/restaurantes/sedes/${locationId}`, { method: "PATCH", body }),

  updateSchedules: (locationId: string, schedules: Schedule[]) =>
    apiFetch<Schedule[]>(`/restaurantes/sedes/${locationId}/horarios`, {
      method: "PUT",
      body: { schedules },
    }),

  updateLocationImage: (locationId: string, kind: "logo" | "portada", url: string) =>
    apiFetch<Location>(`/restaurantes/sedes/${locationId}/${kind}`, {
      method: "PUT",
      body: { url },
    }),

  addGalleryImage: (locationId: string, url: string) =>
    apiFetch<GalleryImage>(`/restaurantes/sedes/${locationId}/galeria`, {
      method: "POST",
      body: { url },
    }),

  uploadLocationImage: (locationId: string, kind: "logo" | "portada" | "galeria", file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiUpload<Location | GalleryImage>(
      `/restaurantes/sedes/${locationId}/${kind}/upload`,
      formData,
    );
  },

  removeGalleryImage: (locationId: string, imageId: string) =>
    apiFetch<void>(`/restaurantes/sedes/${locationId}/galeria/${imageId}`, { method: "DELETE" }),

  requestLocationApproval: (locationId: string) =>
    apiFetch<Location>(`/restaurantes/sedes/${locationId}/solicitud-autorizacion`, {
      method: "POST",
    }),

  listStaff: () => apiFetch<StaffMember[]>("/restaurantes/personal"),

  createStaffMember: (body: CreateStaffMemberInput) =>
    apiFetch<StaffMember>("/restaurantes/personal", { method: "POST", body }),

  setStaffEnabled: (memberId: string, enabled: boolean) =>
    apiFetch<StaffMember>(
      `/restaurantes/personal/${memberId}/${enabled ? "habilitar" : "deshabilitar"}`,
      {
        method: "POST",
      },
    ),

  updateStaffMember: (memberId: string, body: UpdateStaffMemberInput) =>
    apiFetch<StaffMember>(`/restaurantes/personal/${memberId}`, { method: "PATCH", body }),

  reassignStaffLocation: (memberId: string, locationId: string) =>
    apiFetch<StaffMember>(`/restaurantes/personal/${memberId}/sede`, {
      method: "PUT",
      body: { locationId },
    }),
};
