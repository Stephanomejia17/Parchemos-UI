"use client";

import { Heart, MessageCircle } from "lucide-react";
import type { PostEngagement } from "../use-post-engagement";

/**
 * Botones de like y comentarios. `bar`: fila bajo la imagen (escritorio y
 * detalle). `rail`: columna vertical sobre el video a pantalla completa (móvil).
 */
export function PostActions({
  engagement,
  onOpenComments,
  variant = "bar",
}: {
  engagement: PostEngagement;
  onOpenComments: () => void;
  variant?: "bar" | "rail";
}) {
  const { liked, likeCount, commentCount, pending, toggleLike } = engagement;
  const rail = variant === "rail";

  const buttonClass = rail
    ? "flex flex-col items-center gap-1 text-white drop-shadow"
    : "flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm font-semibold text-gray-700 hover:bg-gray-100";

  return (
    <div className={rail ? "flex flex-col items-center gap-5" : "flex items-center gap-1"}>
      <button
        type="button"
        onClick={() => void toggleLike()}
        disabled={pending}
        aria-pressed={liked}
        aria-label={liked ? "Quitar me gusta" : "Me gusta"}
        className={`${buttonClass} disabled:opacity-70`}
      >
        <Heart
          className={rail ? "h-8 w-8" : "h-5 w-5"}
          fill={liked ? "currentColor" : "none"}
          color={liked ? "#ef4444" : undefined}
        />
        <span className={rail ? "text-xs font-bold" : ""}>{likeCount}</span>
      </button>
      <button
        type="button"
        onClick={onOpenComments}
        aria-label={`Ver comentarios (${commentCount})`}
        className={buttonClass}
      >
        <MessageCircle className={rail ? "h-8 w-8" : "h-5 w-5"} />
        <span className={rail ? "text-xs font-bold" : ""}>{commentCount}</span>
      </button>
    </div>
  );
}
