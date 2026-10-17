"use client";

import Link from "next/link";
import { Camera, Loader2, Plus } from "lucide-react";
import { PrimaryButton } from "@/shared/components";
import { postService } from "@/shared/services";
import { DESKTOP_QUERY, useMediaQuery } from "@/shared/utils/use-media-query";
import { usePagedPosts } from "../use-paged-posts";
import { PostCard } from "./PostCard";
import { PostReel } from "./PostReel";

const PAGE_SIZE = 10;

/**
 * Feed de la comunidad. En móvil es un feed vertical a pantalla completa (una
 * publicación por pantalla); en escritorio, una columna de tarjetas.
 */
export function Feed({ publishHref }: { publishHref: string }) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const { posts, hasMore, loading, error, sentinelRef, loadMore, isEmpty } = usePagedPosts(
    (cursor) => postService.listFeed({ cursor, limit: PAGE_SIZE }),
    { rootMargin: isDesktop ? "400px" : "100% 0px" },
  );

  const emptyState = (
    <div className="rounded-2xl border border-border bg-white p-8 text-center">
      <Camera className="mx-auto h-8 w-8 text-primary" />
      <p className="mt-3 text-base font-semibold text-gray-900">Aún no hay publicaciones</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Comparte tu experiencia gastronómica con la comunidad.
      </p>
      <Link href={publishHref} className="mt-4 inline-block">
        <PrimaryButton>Sé el primero en publicar</PrimaryButton>
      </Link>
    </div>
  );

  const errorState = error && (
    <div role="alert" className="rounded-2xl bg-red-50 p-4 text-center text-sm text-red-700">
      <p>{error}</p>
      <PrimaryButton size="sm" className="mt-3" onClick={() => void loadMore()}>
        Reintentar
      </PrimaryButton>
    </div>
  );

  const sentinel = hasMore && !error && (
    <div ref={sentinelRef} className="flex justify-center py-4">
      {loading && <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Cargando" />}
    </div>
  );

  if (!isDesktop) {
    return (
      <div className="h-full snap-y snap-mandatory overflow-y-auto overscroll-y-contain bg-black">
        {posts.map((post) => (
          <div key={post.id} className="h-full w-full snap-start snap-always">
            <PostReel post={post} />
          </div>
        ))}
        {posts.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
            {isEmpty && emptyState}
            {errorState}
            {hasMore && !error && (
              <div ref={sentinelRef}>
                <Loader2 className="h-8 w-8 animate-spin text-white" aria-label="Cargando" />
              </div>
            )}
          </div>
        ) : (
          <div className="snap-start">
            {error ? (
              <div className="p-4">{errorState}</div>
            ) : hasMore ? (
              <div ref={sentinelRef} className="flex h-20 items-center justify-center">
                {loading && <Loader2 className="h-6 w-6 animate-spin text-white" />}
              </div>
            ) : (
              <p className="py-6 text-center text-sm text-white/70">Ya viste todo por ahora.</p>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-4 md:py-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-gray-900 md:text-2xl">Para ti</h2>
        <Link
          href={publishHref}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Publicar
        </Link>
      </div>

      {isEmpty && emptyState}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      {errorState}
      {sentinel}
      {!hasMore && posts.length > 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">No hay más publicaciones.</p>
      )}
    </div>
  );
}
