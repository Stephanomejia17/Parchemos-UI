"use client";

import { useEffect, useRef, type ReactNode } from "react";

type ConfirmDialogProps = {
  readonly title: string;
  readonly description: ReactNode;
  readonly confirmLabel: string;
  readonly cancelLabel?: string | null;
  readonly busy?: boolean;
  readonly onConfirm: () => void;
  readonly onCancel: () => void;
};

export function ConfirmDialog({
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancelar",
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [busy, onCancel]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label={cancelLabel ?? "Cerrar"}
        onClick={() => {
          if (!busy) onCancel();
        }}
        disabled={busy}
        className="absolute inset-0 bg-black/40 disabled:cursor-default"
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="relative z-10 w-full max-w-md rounded-3xl bg-white p-6 shadow-xl outline-none"
      >
        <h2 id="confirm-dialog-title" className="text-lg font-bold text-gray-900">
          {title}
        </h2>
        <div id="confirm-dialog-description" className="mt-2 text-sm text-gray-600">
          {description}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          {cancelLabel !== null && (
            <button
              type="button"
              onClick={onCancel}
              disabled={busy}
              className="min-h-11 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 disabled:opacity-50"
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="min-h-11 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Procesando…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
