"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { InitialsAvatar } from "@/shared/components";
import { RemoteImage } from "@/shared/components/media/RemoteImage";
import type { Post } from "@/shared/services";
import { postService } from "@/shared/services/posts/post.service";
import { postIdentity } from "../post-identity";
import { relativeDate } from "../relative-date";
import { usePostEngagement } from "../use-post-engagement";
import { CommentsSheet } from "./CommentsSheet";
import { PostActions } from "./PostActions";
import { MediaError, PostVideo } from "./PostVideo";
import { ReportPostButton } from "./ReportPostButton";

export function PostCard({ post, trackView = false }: { post: Post; trackView?: boolean }) {
  const cardRef = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Set<string>>(new Set());
  const media = post.media[index];
  const identity = postIdentity(post);
  const engagement = usePostEngagement(post);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (!trackView || !cardRef.current || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || entry.intersectionRatio < 0.6) return;
        observer.disconnect();
        void postService.registerView(post.id).catch(() => undefined);
      },
      { threshold: 0.6 },
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [post.id, trackView]);

  return (
    <article
      ref={cardRef}
      className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm"
    >
      <header className="flex items-center gap-3 p-4">
        {post.author.photoUrl ? (
          <RemoteImage
            src={post.author.photoUrl}
            alt={identity.title}
            className="h-10 w-10 shrink-0 rounded-full"
            sizes="40px"
          />
        ) : (
          <InitialsAvatar initials={identity.initials} size="md" />
        )}
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
            <span className="truncate">{identity.title}</span>
            {identity.badge && (
              <span className="shrink-0 rounded-full bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                {identity.badge}
              </span>
            )}
          </p>
          {identity.place && (
            <Link
              href={identity.place.href}
              className="flex items-center gap-1 truncate text-xs font-medium text-primary hover:underline"
            >
              <MapPin className="h-3 w-3 shrink-0" />
              {identity.place.label}
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
          <div className="absolute bottom-3 right-3 z-10 sm:hidden">
            <ReportPostButton postId={post.id} variant="overlay" />
          </div>
        </div>
      )}

      <div className="px-3 pt-2">
        <PostActions engagement={engagement} onOpenComments={() => setShowComments(true)} />
      </div>
      {post.caption && <p className="px-4 pb-3 pt-1 text-sm text-gray-800">{post.caption}</p>}
      <div className="border-t border-gray-100 px-3 py-3">
        <ReportPostButton postId={post.id} />
      </div>
      {showComments && (
        <CommentsSheet
          post={post}
          onClose={() => setShowComments(false)}
          onCountChange={engagement.changeCommentCount}
        />
      )}
    </article>
  );
}
