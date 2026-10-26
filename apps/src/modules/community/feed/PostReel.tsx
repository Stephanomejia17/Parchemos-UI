"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MapPin, Play, Volume2, VolumeX } from "lucide-react";
import { InitialsAvatar } from "@/shared/components";
import type { Post, PostMedia } from "@/shared/services";
import { postService } from "@/shared/services/posts/post.service";
import { postIdentity } from "../post-identity";
import { usePostEngagement } from "../use-post-engagement";
import { CommentsSheet } from "./CommentsSheet";
import { PostActions } from "./PostActions";
import { MediaError } from "./PostVideo";
import { ReportPostButton } from "./ReportPostButton";

/**
 * Una publicación a pantalla completa, al estilo de un feed vertical (móvil).
 * Los videos se reproducen solos (siempre sin sonido) mientras ocupan la
 * pantalla y se pausan al salir; tocar el video lo pausa o reanuda.
 */
export function PostReel({ post, trackView = false }: { post: Post; trackView?: boolean }) {
  const reelRef = useRef<HTMLElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const tracked = useRef(false);
  const identity = postIdentity(post);
  const engagement = usePostEngagement(post);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    const node = reelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => setOnScreen(entries.some((entry) => entry.isIntersecting)),
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!trackView || !onScreen || tracked.current) return;
    tracked.current = true;
    void postService.registerView(post.id).catch(() => undefined);
  }, [onScreen, post.id, trackView]);

  return (
    <article ref={reelRef} className="relative h-full w-full snap-start snap-always bg-black">
      <div className="flex h-full w-full snap-x snap-mandatory overflow-x-auto scrollbar-hide">
        {post.media.map((media) => (
          <div key={media.id} className="h-full w-full shrink-0 snap-center">
            <ReelMedia
              media={media}
              alt={post.caption ?? post.author.fullName}
              playing={onScreen}
            />
          </div>
        ))}
      </div>

      {post.media.length > 1 && (
        <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/55 px-2 py-0.5 text-[11px] font-semibold text-white">
          1/{post.media.length} · desliza →
        </span>
      )}

      <div className="absolute bottom-24 right-3 z-10 flex flex-col items-center gap-5">
        <PostActions
          engagement={engagement}
          onOpenComments={() => setShowComments(true)}
          variant="rail"
        />
        <ReportPostButton postId={post.id} variant="overlay" />
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-5 pt-16 text-white">
        <div className="flex items-center gap-2.5">
          {post.author.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.author.photoUrl}
              alt=""
              className="h-9 w-9 rounded-full border border-white/60 object-cover"
            />
          ) : (
            <InitialsAvatar initials={identity.initials} size="sm" />
          )}
          <p className="flex min-w-0 items-center gap-1.5 text-sm font-bold drop-shadow">
            <span className="truncate">{identity.title}</span>
            {identity.badge && (
              <span className="shrink-0 rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-bold backdrop-blur">
                {identity.badge}
              </span>
            )}
          </p>
        </div>
        {post.caption && (
          <p className="mt-2 line-clamp-3 text-sm leading-snug drop-shadow">{post.caption}</p>
        )}
        {identity.place && (
          <Link
            href={identity.place.href}
            className="pointer-events-auto mt-2 inline-flex max-w-full items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-xs font-semibold backdrop-blur"
          >
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">{identity.place.label}</span>
          </Link>
        )}
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

function ReelMedia({ media, alt, playing }: { media: PostMedia; alt: string; playing: boolean }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <MediaError message="No pudimos cargar este contenido." />;
  }
  if (media.mediaType === "video") {
    return <ReelVideo media={media} playing={playing} onError={() => setFailed(true)} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.url}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="h-full w-full object-cover"
    />
  );
}

function ReelVideo({
  media,
  playing,
  onError,
}: {
  media: PostMedia;
  playing: boolean;
  onError: () => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing && !paused) {
      // El navegador puede rechazar el play (ahorro de datos, etc.): se ignora.
      video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, [playing, paused]);

  return (
    <div className="relative h-full w-full" onClick={() => setPaused((current) => !current)}>
      {playing ? (
        <video
          ref={videoRef}
          src={media.url}
          loop
          muted={muted}
          playsInline
          preload="metadata"
          onError={onError}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="h-full w-full bg-black" />
      )}
      {paused && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <Play className="h-16 w-16 text-white/80" fill="currentColor" />
        </div>
      )}
      <button
        type="button"
        aria-label={muted ? "Activar sonido" : "Silenciar"}
        onClick={(event) => {
          event.stopPropagation();
          setMuted((current) => !current);
        }}
        className="absolute right-3 top-12 rounded-full bg-black/55 p-2 text-white"
      >
        {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>
    </div>
  );
}
