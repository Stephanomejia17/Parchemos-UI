"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { RemoteImage } from "@/shared/components/media/RemoteImage";

export function LocationImageCarousel({ images, alt }: { images: string[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const hasImages = images.length > 0;
  const activeImage = images[activeIndex] ?? images[0];

  if (!hasImages) {
    return (
      <div className="flex h-64 items-center justify-center bg-gray-100 text-gray-400 md:h-72">
        <ImageOff className="h-10 w-10" aria-label="Sin fotografías disponibles" />
      </div>
    );
  }

  const showControls = images.length > 1;
  const previous = () => setActiveIndex((index) => (index - 1 + images.length) % images.length);
  const next = () => setActiveIndex((index) => (index + 1) % images.length);

  return (
    <div className="relative h-64 bg-gray-100 md:h-72">
      <RemoteImage src={activeImage} alt={alt} className="h-full w-full" />
      {showControls && (
        <>
          <button type="button" onClick={previous} aria-label="Fotografía anterior" className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <ChevronLeft className="h-5 w-5 text-gray-800" />
          </button>
          <button type="button" onClick={next} aria-label="Fotografía siguiente" className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm">
            <ChevronRight className="h-5 w-5 text-gray-800" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/35 px-2 py-1">
            {images.map((image, index) => (
              <button key={`${image}-${index}`} type="button" onClick={() => setActiveIndex(index)} aria-label={`Ver fotografía ${index + 1}`} className={`h-1.5 w-1.5 rounded-full ${index === activeIndex ? "bg-white" : "bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
