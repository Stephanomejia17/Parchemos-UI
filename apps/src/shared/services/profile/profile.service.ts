import { apiFetch } from "../http/api-client";

export interface UpdateProfilePayload {
  fullName: string;
  phone: string;
  city: string;
  profilePhotoUrl: string | null;
}

export interface DeletionRequestResult {
  message: string;
  deletionEffectiveAt: string;
}

export const profileService = {
  update: (payload: UpdateProfilePayload) =>
    apiFetch<void>("/auth/me", { method: "PATCH", body: payload }),
  requestDeletion: () => apiFetch<DeletionRequestResult>("/auth/me", { method: "DELETE" }),
};
