"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Post } from "@/shared/services";

interface PostsPage {
  items: Post[];
  nextCursor: string | null;
  total?: number | null;
}

/**
 * Lista de publicaciones con carga incremental por cursor. La comparten el
 * feed y el perfil: pide la siguiente página cuando el centinela entra en
 * pantalla, sin duplicados ni peticiones simultáneas.
 */
export function usePagedPosts(
  fetchPage: (cursor: string | null) => Promise<PostsPage>,
  options?: { rootMargin?: string },
) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);
  const fetchRef = useRef(fetchPage);
  fetchRef.current = fetchPage;

  const loadMore = useCallback(async () => {
    if (inFlight.current || !hasMore) return;
    inFlight.current = true;
    setLoading(true);
    setError(null);
    try {
      const page = await fetchRef.current(cursor);
      setPosts((current) => {
        const seen = new Set(current.map((post) => post.id));
        return [...current, ...page.items.filter((post) => !seen.has(post.id))];
      });
      if (page.total != null) setTotal(page.total);
      setCursor(page.nextCursor);
      setHasMore(page.nextCursor !== null);
    } catch {
      setError("No pudimos cargar las publicaciones.");
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, [cursor, hasMore]);

  const rootMargin = options?.rootMargin ?? "400px";
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || error) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) void loadMore();
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, error, rootMargin]);

  /** Quita una publicación de la lista (p. ej. tras borrarla). */
  const removeLocally = useCallback((postId: string) => {
    setPosts((current) => current.filter((post) => post.id !== postId));
    setTotal((current) => (current === null ? current : Math.max(0, current - 1)));
  }, []);

  return {
    posts,
    total,
    hasMore,
    loading,
    error,
    sentinelRef,
    loadMore,
    removeLocally,
    isEmpty: !loading && !error && posts.length === 0 && !hasMore,
  };
}
