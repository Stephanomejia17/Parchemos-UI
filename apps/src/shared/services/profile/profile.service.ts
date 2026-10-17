import { apiFetch, apiUpload } from "../http/api-client";

export interface UpdateProfilePayload {
  fullName: string;
  phone: string;
  city: string;
}

export interface DeletionRequestResult {
  message: string;
  deletionEffectiveAt: string;
}

export interface TastePreferences {
  cuisines: { id: string; slug: string; name: string }[];
  selectedCuisineIds: string[];
  priceRangeMin: number | null;
  priceRangeMax: number | null;
}

export interface SaveTastePreferencesPayload {
  cuisineIds: string[];
  priceRangeMin: number | null;
  priceRangeMax: number | null;
}

export const profileService = {
  getPreferences: () => apiFetch<TastePreferences>("/preferencias"),

  savePreferences: (payload: SaveTastePreferencesPayload) =>
    apiFetch<void>("/preferencias", { method: "PUT", body: payload }),

  update: (payload: UpdateProfilePayload) =>
    apiFetch<void>("/auth/me", {
      method: "PATCH",
      body: payload,
    }),

  uploadPhoto: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);

    return apiUpload<void>("/auth/me/photo", formData);
  },

  requestDeletion: () =>
    apiFetch<DeletionRequestResult>("/auth/me", { method: "DELETE" }),
};