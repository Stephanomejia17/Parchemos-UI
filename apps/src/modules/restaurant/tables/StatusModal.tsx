"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import type { Table } from "@/shared/types/table";

type StatusModalProps = {
  table: Table;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
};

export function StatusModal({ table, saving, error, onClose, onConfirm }: StatusModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const activate = table.status === "inactiva";

  useEffect(() => {
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="w-full max-w-md rounded-3xl bg-surface p-6 text-center shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="table-status-title"
      >
        <div
          className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full ${activate ? "bg-accent/10 text-accent" : "bg-primary-soft text-primary"}`}
        >
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 id="table-status-title" className="mt-4 text-lg font-bold text-foreground">
          ¿{activate ? "Activar" : "Desactivar"} mesa {table.code}?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {activate
            ? "La mesa volverá a aceptar pedidos."
            : "La mesa dejará de aceptar nuevos pedidos."}
        </p>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-destructive/10 p-3 text-left text-sm text-destructive"
          >
            {error}
          </p>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="min-h-11 rounded-xl bg-muted px-4 py-2.5 text-sm font-semibold text-foreground"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="min-h-11 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            {saving ? "Guardando..." : activate ? "Activar" : "Desactivar"}
          </button>
        </div>
      </div>
    </div>
  );
}
