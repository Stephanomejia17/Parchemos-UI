"use client";

import Image from "next/image";
import { useState } from "react";

const ERROR_IMG_SRC =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODgiIGhlaWdodD0iODgiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgc3Ryb2tlPSIjMDAwIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBvcGFjaXR5PSIuMyIgZmlsbD0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIzLjciPjxyZWN0IHg9IjE2IiB5PSIxNiIgd2lkdGg9IjU2IiBoZWlnaHQ9IjU2IiByeD0iNiIvPjxwYXRoIGQ9Im0xNiA1OCAxNi0xOCAzMiAzMiIvPjxjaXJjbGUgY3g9IjUzIiBjeT0iMzUiIHI9IjciLz48L3N2Zz4KCg==";

/** Contenedor con tamaño fijo (via `className`) + `next/image` en modo `fill`, con fallback a un ícono si la URL remota falla. */
export function RemoteImage({
  src,
  alt,
  className = "",
  sizes = "(min-width: 768px) 33vw, 100vw",
  onClick,
}: {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  onClick?: () => void;
}) {
  const [errored, setErrored] = useState(false);

  return (
    <span onClick={onClick} className={`relative block overflow-hidden bg-muted ${className}`}>
      <Image
        src={errored ? ERROR_IMG_SRC : src}
        alt={alt}
        fill
        sizes={sizes}
        className="object-cover"
        onError={() => setErrored(true)}
        unoptimized={errored}
      />
    </span>
  );
}
