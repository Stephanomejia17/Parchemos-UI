"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/shared/auth";
import { postService, type Post } from "@/shared/services";

/**
 * Estado de likes y comentarios de una publicación.
 *
 * El like se ve al instante (optimista) y se revierte si el servidor falla.
 * Mientras hay una petición en curso los clics se ignoran, así un doble clic
 * no envía llamadas cruzadas y lo mostrado coincide con lo guardado. El total
 * que devuelve el servidor reemplaza al calculado localmente.
 */
export function usePostEngagement(post: Post) {
  const router = useRouter();
  const [liked, setLiked] = useState(post.likedByMe);
  const [likeCount, setLikeCount] = useState(post.likeCount);
  const [commentCount, setCommentCount] = useState(post.commentCount);
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);

  const toggleLike = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);

    const wasLiked = liked;
    const wasCount = likeCount;
    setLiked(!wasLiked);
    setLikeCount(Math.max(0, wasCount + (wasLiked ? -1 : 1)));
    try {
      const result = wasLiked ? await postService.unlike(post.id) : await postService.like(post.id);
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch (cause) {
      setLiked(wasLiked);
      setLikeCount(wasCount);
      if (cause instanceof ApiError && cause.status === 401) router.push("/login");
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }, [liked, likeCount, post.id, router]);

  const changeCommentCount = useCallback((delta: number) => {
    setCommentCount((current) => Math.max(0, current + delta));
  }, []);

  return { liked, likeCount, commentCount, pending, toggleLike, changeCommentCount };
}

export type PostEngagement = ReturnType<typeof usePostEngagement>;
