"use client";

import { ImagePlus, X } from "lucide-react";

export interface GalleryFile {
  id: string;
  file: File;
}

export function SquareFileInput({
  label,
  file,
  existingUrl,
  onChange,
}: {
  label: string;
  file: File | null;
  existingUrl?: string;
  onChange: (file: File | null) => void;
}) {
  const previewUrl = file ? URL.createObjectURL(file) : existingUrl;
  const inputId = `file-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div>
      <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <label
        htmlFor={inputId}
        className="group relative flex aspect-square w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed bg-gray-50 transition-colors hover:border-orange-300 hover:bg-orange-50/40"
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt={label} className="h-full w-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
              <span className="rounded-lg bg-white px-2.5 py-1.5 text-xs font-semibold">
                Cambiar
              </span>
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault();
                  onChange(null);
                }}
                className="rounded-lg bg-white p-1.5"
                aria-label={`Quitar ${label.toLowerCase()}`}
              >
                <X className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-gray-400">
            <ImagePlus className="h-7 w-7" />
            <span className="text-xs font-medium">Subir imagen</span>
          </div>
        )}
      </label>
      <input
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        className="sr-only"
      />
    </div>
  );
}

export function GalleryAddTile({
  remaining,
  onAdd,
}: {
  remaining: number;
  onAdd: (files: GalleryFile[]) => void;
}) {
  if (remaining <= 0) return null;
  return (
    <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed bg-gray-50 text-gray-400 transition-colors hover:border-orange-300 hover:bg-orange-50/40">
      <ImagePlus className="h-6 w-6" />
      <span className="text-[11px] font-medium">Añadir</span>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          const wrapped = files.slice(0, remaining).map((file) => ({
            id: crypto.randomUUID(),
            file,
          }));
          onAdd(wrapped);
          event.target.value = "";
        }}
        className="sr-only"
      />
    </label>
  );
}

export function GalleryThumb({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border">
      <img src={src} alt="Galería" className="h-full w-full object-cover" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded-lg bg-white p-1 shadow-sm"
        aria-label="Quitar imagen"
      >
        <X className="h-3.5 w-3.5 text-red-600" />
      </button>
    </div>
  );
}
