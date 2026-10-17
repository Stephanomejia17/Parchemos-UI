"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Camera, Images, Loader2, Play, Trash2, X } from "lucide-react";
import { ApiError } from "@/shared/auth";
import { FormAlert, PrimaryButton } from "@/shared/components";
import { postService, type Post } from "@/shared/services";
import { PostCard } from "../feed/PostCard";
import { usePagedPosts } from "../use-paged-posts";

const PAGE_SIZE = 18;

/** Cuadrícula con las publicaciones del usuario, como el perfil de una red social. */
export function MyPosts({
  publishHref,
  onTotalChange,
}: {
  publishHref: string;
  onTotalChange?: (total: number) => void;
}) {
  const { posts, total, hasMore, loading, error, sentinelRef, loadMore, removeLocally, isEmpty } =
    usePagedPosts((cursor) => postService.listMine({ cursor, limit: PAGE_SIZE }), {
      rootMargin: "300px",
    });
  const [selected, setSelected] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (total !== null) onTotalChange?.(total);
  }, [total, onTotalChange]);

  const close = () => {
    setSelected(null);
    setDeleteError(null);
  };

  const remove = async (post: Post) => {
    if (!window.confirm("¿Eliminar esta publicación? No se puede deshacer.")) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await postService.remove(post.id);
      removeLocally(post.id);
      close();
    } catch (cause) {
      setDeleteError(
        cause instanceof ApiError ? cause.message : "No pudimos eliminar la publicación.",
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section aria-label="Mis publicaciones">
      {isEmpty && (
        <div className="rounded-2xl border border-border bg-white p-8 text-center">
          <Camera className="mx-auto h-8 w-8 text-primary" />
          <p className="mt-3 text-base font-semibold text-gray-900">Aún no has publicado</p>
          <p className="mt-1 text-sm text-muted-foreground">Tus fotos y videos aparecerán aquí.</p>
          <Link href={publishHref} className="mt-4 inline-block">
            <PrimaryButton>Crear mi primera publicación</PrimaryButton>
          </Link>
        </div>
      )}

      {posts.length > 0 && (
        <ul className="grid grid-cols-3 gap-1 md:gap-2">
          {posts.map((post) => (
            <li key={post.id}>
              <PostThumb post={post} onOpen={() => setSelected(post)} />
            </li>
          ))}
        </ul>
      )}

      {error && (
        <div
          role="alert"
          className="mt-3 rounded-2xl bg-red-50 p-4 text-center text-sm text-red-700"
        >
          <p>{error}</p>
          <PrimaryButton size="sm" className="mt-3" onClick={() => void loadMore()}>
            Reintentar
          </PrimaryButton>
        </div>
      )}

      {hasMore && !error && (
        <div ref={sentinelRef} className="flex justify-center py-6">
          {loading && (
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Cargando" />
          )}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Publicación"
          onClick={close}
        >
          <div className="mx-auto max-w-md" onClick={(event) => event.stopPropagation()}>
            <div className="mb-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => void remove(selected)}
                disabled={deleting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Eliminar
              </button>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar"
                className="rounded-full bg-white/90 p-2 text-gray-900"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <FormAlert type="error" className="mb-2">
              {deleteError}
            </FormAlert>
            <PostCard post={selected} />
          </div>
        </div>
      )}
    </section>
  );
}

function PostThumb({ post, onOpen }: { post: Post; onOpen: () => void }) {
  const cover = post.media[0];
  const [failed, setFailed] = useState(false);

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={post.caption ? `Abrir: ${post.caption}` : "Abrir publicación"}
      className="relative block aspect-[3/4] w-full overflow-hidden bg-gray-200"
    >
      {cover && !failed ? (
        cover.mediaType === "video" ? (
          // `#t=0.1` fuerza a mostrar un fotograma como portada.
          <video
            src={`${cover.url}#t=0.1`}
            muted
            playsInline
            preload="metadata"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover.url}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
          />
        )
      ) : (
        <span className="flex h-full items-center justify-center text-xs text-gray-500">
          Sin vista previa
        </span>
      )}
      <span className="pointer-events-none absolute right-1.5 top-1.5 flex gap-1 text-white drop-shadow">
        {post.media.length > 1 && <Images className="h-4 w-4" />}
        {cover?.mediaType === "video" && <Play className="h-4 w-4" fill="currentColor" />}
      </span>
    </button>
  );
}
