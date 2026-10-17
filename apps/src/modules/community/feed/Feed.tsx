"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Camera, Loader2, Plus } from "lucide-react";
import { PrimaryButton } from "@/shared/components";
import { postService, type Post } from "@/shared/services";
import { PostCard } from "./PostCard";

const PAGE_SIZE = 10;

export function Feed({ publishHref }: { publishHref: string }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  // Evita dos peticiones simultáneas con el mismo cursor (duplicados, CA7).
  const inFlight = useRef(false);

  const loadMore = useCallback(async () => {
    if (inFlight.current || !hasMore) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const page = await postService.listFeed({ cursor, limit: PAGE_SIZE });
      setPosts((current) => {
        const seen = new Set(current.map((post) => post.id));
        return [...current, ...page.items.filter((post) => !seen.has(post.id))];
      });
      setCursor(page.nextCursor);
      setHasMore(page.nextCursor !== null);
    } catch {
      setError("No pudimos cargar las publicaciones.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [cursor, hasMore]);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || error) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, error]);

  const isEmpty = !loading && !error && posts.length === 0 && !hasMore;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4 py-4 md:py-6">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-gray-900 md:text-2xl">Comunidad</h2>
        <Link
          href={publishHref}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Publicar
        </Link>
      </div>

      {isEmpty && (
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
      )}

      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {error && (
        <div role="alert" className="rounded-2xl bg-red-50 p-4 text-center text-sm text-red-700">
          <p>{error}</p>
          <PrimaryButton size="sm" className="mt-3" onClick={() => void loadMore()}>
            Reintentar
          </PrimaryButton>
        </div>
      )}

      {hasMore && !error && (
        <div ref={sentinelRef} className="flex justify-center py-4">
          {loading && (
            <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Cargando" />
          )}
        </div>
      )}

      {!hasMore && posts.length > 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">No hay más publicaciones.</p>
      )}
    </div>
  );
}
