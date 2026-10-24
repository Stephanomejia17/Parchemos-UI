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

export interface MyPostsPage extends FeedPage {
  /** Total de publicaciones del usuario; solo viene en la primera página. */
  total: number | null;
}

export interface CreatePostInput {
  files: File[];
  caption?: string;
  locationId?: string | null;
}

interface PageParams {
  cursor?: string | null;
  limit?: number;
  signal?: AbortSignal;
}

function pageQuery(params?: PageParams) {
  const searchParams = new URLSearchParams();
  if (params?.cursor) searchParams.set("cursor", params.cursor);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export const postService = {
  listFeed: (params?: PageParams) =>
    apiFetch<FeedPage>(`/feed${pageQuery(params)}`, { signal: params?.signal }),

  /** Perfil: las publicaciones del usuario autenticado. */
  listMine: (params?: PageParams) =>
    apiFetch<MyPostsPage>(`/publicaciones/mias${pageQuery(params)}`, { signal: params?.signal }),

  /** El autor retira una de sus publicaciones. */
  remove: (postId: string) => apiFetch<void>(`/publicaciones/${postId}`, { method: "DELETE" }),

  /** Registra una vista del feed; el backend limita a una por usuario/post/día. */
  registerView: (postId: string) =>
    apiFetch<void>(`/publicaciones/${postId}/vista`, { method: "POST" }),

  report: (postId: string, reason: "spam" | "contenido_falso" | "contenido_ofensivo" | "otro", details?: string) =>
    apiFetch<void>(`/publicaciones/${postId}/reportes`, { method: "POST", body: { reason, details } }),

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
