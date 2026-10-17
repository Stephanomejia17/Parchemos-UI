"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle } from "lucide-react";

/**
 * Reproductor mp4 del feed: controles nativos (play/pausa, silencio, progreso),
 * sin autoplay y con descarga diferida: el `src` solo se asigna al acercarse
 * al viewport. Un fallo de reproducción solo afecta a este elemento (CA8).
 */
export function PostVideo({ src, mimeType }: { src: string; mimeType?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative aspect-square w-full bg-black">
      {failed ? (
        <MediaError message="No pudimos reproducir este video." />
      ) : (
        visible && (
          <video
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-contain"
            onError={() => setFailed(true)}
          >
            <source src={src} type={mimeType ?? "video/mp4"} onError={() => setFailed(true)} />
          </video>
        )
      )}
    </div>
  );
}

export function MediaError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gray-100 p-4 text-center text-sm text-gray-500"
    >
      <AlertCircle className="h-6 w-6" />
      {message}
    </div>
  );
}
