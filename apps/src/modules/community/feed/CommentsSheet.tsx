"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { Loader2, Send, Trash2, X } from "lucide-react";
import { ApiError, useAuth } from "@/shared/auth";
import { FormAlert, InitialsAvatar } from "@/shared/components";
import { postService, type Post, type PostComment } from "@/shared/services";
import { relativeDate } from "../relative-date";

const PAGE_SIZE = 20;
const MAX_LENGTH = 500;

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/**
 * Comentarios de una publicación: lista paginada (el más reciente primero),
 * formulario para comentar y borrado por quien lo escribió o por el autor de
 * la publicación. En móvil sube como una hoja desde abajo.
 */
export function CommentsSheet({
  post,
  onClose,
  onCountChange,
}: {
  post: Post;
  onClose: () => void;
  /** Avisa para mantener al día el contador de la tarjeta (+1 / -1). */
  onCountChange: (delta: number) => void;
}) {
  const { user } = useAuth();
  const [items, setItems] = useState<PostComment[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    postService
      .listComments(post.id, { limit: PAGE_SIZE, signal: controller.signal })
      .then((page) => {
        setItems(page.items);
        setNextCursor(page.nextCursor);
        setTotal(page.total);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError("No pudimos cargar los comentarios.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [post.id]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const page = await postService.listComments(post.id, {
        cursor: nextCursor,
        limit: PAGE_SIZE,
      });
      setItems((current) => {
        const seen = new Set(current.map((comment) => comment.id));
        return [...current, ...page.items.filter((comment) => !seen.has(comment.id))];
      });
      setNextCursor(page.nextCursor);
    } catch {
      setError("No pudimos cargar más comentarios.");
    } finally {
      setLoadingMore(false);
    }
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true);
    setSendError(null);
    try {
      const created = await postService.addComment(post.id, body);
      setItems((current) => [created, ...current]);
      setTotal((current) => (current === null ? current : current + 1));
      onCountChange(1);
      setText("");
    } catch (cause) {
      setSendError(
        cause instanceof ApiError ? cause.message : "No pudimos publicar tu comentario.",
      );
    } finally {
      setSending(false);
    }
  };

  const remove = async (comment: PostComment) => {
    setRemovingId(comment.id);
    setSendError(null);
    try {
      await postService.removeComment(comment.id);
      setItems((current) => current.filter((item) => item.id !== comment.id));
      setTotal((current) => (current === null ? current : Math.max(0, current - 1)));
      onCountChange(-1);
    } catch (cause) {
      setSendError(
        cause instanceof ApiError ? cause.message : "No pudimos eliminar el comentario.",
      );
    } finally {
      setRemovingId(null);
    }
  };

  const canDelete = (comment: PostComment) =>
    Boolean(user) && (comment.author.id === user?.id || post.author.id === user?.id);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 md:items-center md:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Comentarios"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-xl md:rounded-3xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="font-heading text-base font-bold text-gray-900">
            Comentarios{total !== null ? ` (${total})` : ""}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar comentarios"
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="min-h-32 flex-1 overflow-y-auto px-5 py-3">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" aria-label="Cargando" />
            </div>
          )}
          {error && (
            <p role="alert" className="py-4 text-center text-sm text-red-600">
              {error}
            </p>
          )}
          {!loading && !error && items.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Aún no hay comentarios. ¡Sé el primero!
            </p>
          )}

          <ul className="flex flex-col gap-4">
            {items.map((comment) => (
              <li key={comment.id} className="flex gap-3">
                {comment.author.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={comment.author.photoUrl}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <InitialsAvatar initials={initialsOf(comment.author.fullName)} size="sm" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground">
                    <span className="font-semibold text-gray-900">{comment.author.fullName}</span>
                    {comment.author.role === "restaurante" && (
                      <span className="ml-1.5 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                        Restaurante
                      </span>
                    )}
                    <span className="ml-1.5">{relativeDate(comment.createdAt)}</span>
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-gray-800">
                    {comment.body}
                  </p>
                </div>
                {canDelete(comment) && (
                  <button
                    type="button"
                    onClick={() => void remove(comment)}
                    disabled={removingId === comment.id}
                    aria-label="Eliminar comentario"
                    className="self-start rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>

          {nextCursor && (
            <button
              type="button"
              onClick={() => void loadMore()}
              disabled={loadingMore}
              className="mx-auto mt-4 block text-sm font-semibold text-primary hover:underline disabled:opacity-60"
            >
              {loadingMore ? "Cargando…" : "Ver más comentarios"}
            </button>
          )}
        </div>

        <form onSubmit={submit} className="border-t border-gray-100 px-5 py-3">
          <FormAlert type="error" className="mb-2">
            {sendError}
          </FormAlert>
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(event) => setText(event.target.value)}
              maxLength={MAX_LENGTH}
              rows={1}
              placeholder="Escribe un comentario…"
              aria-label="Escribe un comentario"
              className="max-h-28 min-h-10 flex-1 resize-none rounded-2xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!text.trim() || sending}
              aria-label="Enviar comentario"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-white disabled:opacity-50"
            >
              {sending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </div>
          {text.length > MAX_LENGTH - 60 && (
            <p className="mt-1 text-right text-[11px] text-muted-foreground">
              {text.length}/{MAX_LENGTH}
            </p>
          )}
        </form>
      </div>
    </div>,
    document.body,
  );
}
