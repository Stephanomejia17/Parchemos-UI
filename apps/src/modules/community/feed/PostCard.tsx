"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { InitialsAvatar } from "@/shared/components";
import { RemoteImage } from "@/shared/components/media/RemoteImage";
import type { Post } from "@/shared/services";
import { postService } from "@/shared/services/posts/post.service";
import { MediaError, PostVideo } from "./PostVideo";

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function relativeDate(iso: string) {
  const seconds = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
  const steps: [Intl.RelativeTimeFormatUnit, number][] = [
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of steps) {
    if (Math.abs(seconds) >= size) return formatter.format(Math.round(seconds / size), unit);
  }
  return "justo ahora";
}

export function PostCard({ post, trackView = false }: { post: Post; trackView?: boolean }) {
  const cardRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const media = post.media[index];

  useEffect(() => {
    if (!trackView || !cardRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.6) return;
      observer.disconnect();
      void postService.registerView(post.id).catch(() => undefined);
    }, { threshold: 0.6 });
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [post.id, trackView]);

  return (
    <article ref={cardRef} className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
      <header className="flex items-center gap-3 p-4">
        {post.author.photoUrl ? (
          <RemoteImage
            src={post.author.photoUrl}
            alt={post.author.fullName}
            className="h-10 w-10 shrink-0 rounded-full"
            sizes="40px"
          />
        ) : (
          <InitialsAvatar initials={initialsOf(post.author.fullName)} size="md" />
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-gray-900">{post.author.fullName}</p>
          {post.location && (
            <Link
              href={`/restaurant?locationId=${encodeURIComponent(post.location.id)}`}
              className="flex items-center gap-1 truncate text-xs font-medium text-primary hover:underline"
            >
              <MapPin className="h-3 w-3 shrink-0" />
              {post.location.name}
            </Link>
          )}
        </div>
        <time dateTime={post.createdAt} className="shrink-0 text-xs text-muted-foreground">
          {relativeDate(post.createdAt)}
        </time>
      </header>

      {media && (
        <div className="relative">
          {media.mediaType === "video" ? (
            <PostVideo key={media.id} src={media.url} mimeType={media.mimeType} />
          ) : (
            <div className="aspect-square w-full bg-gray-100">
              {brokenImages.has(media.id) ? (
                <MediaError message="No pudimos cargar esta imagen." />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={media.id}
                  src={media.url}
                  alt={post.caption ?? `Publicación de ${post.author.fullName}`}
                  loading="lazy"
                  onError={() => setBrokenImages((current) => new Set(current).add(media.id))}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          )}
          {post.media.length > 1 && (
            <>
              <button
                type="button"
                aria-label="Medio anterior"
                disabled={index === 0}
                onClick={() => setIndex((current) => current - 1)}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow disabled:hidden"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Medio siguiente"
                disabled={index === post.media.length - 1}
                onClick={() => setIndex((current) => current + 1)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-1.5 shadow disabled:hidden"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <span className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
                {index + 1}/{post.media.length}
              </span>
            </>
          )}
        </div>
      )}

      {post.caption && <p className="p-4 text-sm text-gray-800">{post.caption}</p>}
    </article>
  );
}
