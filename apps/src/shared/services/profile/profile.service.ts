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

export const profileService = {
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