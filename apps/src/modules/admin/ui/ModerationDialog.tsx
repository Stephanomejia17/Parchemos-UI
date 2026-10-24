"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function ModerationDialog({ title, description, children, actions, onClose }: { title: string; description?: string; children: ReactNode; actions: ReactNode; onClose: () => void }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; document.addEventListener("keydown", onKeyDown); return () => document.removeEventListener("keydown", onKeyDown); }, [onClose]);
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="moderation-dialog-title" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl outline-none"><div className="flex items-start justify-between gap-4"><div><h2 id="moderation-dialog-title" className="text-lg font-bold text-gray-900">{title}</h2>{description && <p className="mt-1 text-sm text-gray-500">{description}</p>}</div><button type="button" aria-label="Cerrar diálogo" onClick={onClose} className="rounded-lg px-2 py-1 text-xl leading-none text-gray-400 hover:bg-gray-100">×</button></div>{children}<div className="mt-6 flex flex-nowrap justify-end gap-2">{actions}</div></div></div>;
}
