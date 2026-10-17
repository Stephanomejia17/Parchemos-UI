import { apiFetch, apiUploadWithProgress } from "../http/api-client";

export type PostMediaType = "imagen" | "video";

export interface PostMedia {
  id: string;
  mediaType: PostMediaType;
  url: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
}

export interface Post {
  id: string;
  caption: string | null;
  createdAt: string;
  author: { id: string; fullName: string; photoUrl: string | null; role: string };
  /** `null` cuando se publicó sin restaurante asociado (DO-04 CA3). */
  location: { id: string; name: string } | null;
  media: PostMedia[];
}

export interface FeedPage {
  items: Post[];
  /** `null` cuando ya no quedan más publicaciones. */
  nextCursor: string | null;
}

export interface CreatePostInput {
  files: File[];
  caption?: string;
  locationId?: string | null;
}

export const postService = {
  listFeed: (params?: { cursor?: string | null; limit?: number; signal?: AbortSignal }) => {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.set("cursor", params.cursor);
    if (params?.limit) searchParams.set("limit", String(params.limit));
    const query = searchParams.toString();
    return apiFetch<FeedPage>(`/feed${query ? `?${query}` : ""}`, {
      signal: params?.signal,
    });
  },

  create: (
    input: CreatePostInput,
    options?: { onProgress?: (percent: number) => void; signal?: AbortSignal },
  ) => {
    const formData = new FormData();
    input.files.forEach((file) => formData.append("files", file));
    if (input.caption?.trim()) formData.append("caption", input.caption.trim());
    if (input.locationId) formData.append("locationId", input.locationId);
    return apiUploadWithProgress<Post>(
      "/publicaciones",
      formData,
      options?.onProgress,
      options?.signal,
    );
  },
};
