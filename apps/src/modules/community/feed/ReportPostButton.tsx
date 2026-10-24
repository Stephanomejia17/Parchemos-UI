"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Flag } from "lucide-react";
import { postService } from "@/shared/services/posts/post.service";

type ReportReason = "spam" | "contenido_falso" | "contenido_ofensivo" | "otro";

type ReportPostButtonProps = {
  postId: string;
  variant?: "inline" | "overlay";
};

export function ReportPostButton({ postId, variant = "inline" }: ReportPostButtonProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason>("spam");
  const [details, setDetails] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, submitting]);

  useEffect(() => {
    if (!success) return;
    const timeout = window.setTimeout(() => setSuccess(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [success]);

  const openDialog = () => {
    setError(null);
    setOpen(true);
  };

  const submitReport = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await postService.report(postId, reason, details.trim() || undefined);
      setOpen(false);
      setDetails("");
      setSuccess("Denuncia enviada correctamente.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No se pudo enviar la denuncia.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const trigger = variant === "overlay" ? (
    <button
      type="button"
      aria-label="Denunciar publicación"
      onClick={openDialog}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-white"
    >
      <Flag className="h-4 w-4" />
    </button>
  ) : (
    <button
      type="button"
      onClick={openDialog}
      className="flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300 sm:ml-auto sm:w-auto"
    >
      <Flag className="h-4 w-4" />
      Denunciar publicación
    </button>
  );

  const modal = open ? (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) setOpen(false);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`report-title-${postId}`}
        className="w-full rounded-t-2xl bg-white p-5 pb-8 shadow-xl sm:max-w-md sm:rounded-2xl sm:pb-5"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={`report-title-${postId}`} className="text-base font-semibold text-gray-900">
              Denunciar publicación
            </h2>
            <p className="mt-1 text-xs text-gray-500">Selecciona el motivo de tu denuncia.</p>
          </div>
          <button
            type="button"
            aria-label="Cerrar diálogo"
            onClick={() => setOpen(false)}
            disabled={submitting}
            className="rounded-lg px-2 py-1 text-xl leading-none text-gray-400 hover:bg-gray-100 disabled:opacity-50"
          >
            ×
          </button>
        </div>
        <label className="mt-4 block text-sm font-medium text-gray-700">
          Motivo
          <select
            value={reason}
            onChange={(event) => setReason(event.target.value as ReportReason)}
            className="mt-1.5 w-full rounded-xl border border-gray-200 bg-white p-3 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
          >
            <option value="spam">Spam</option>
            <option value="contenido_falso">Contenido falso</option>
            <option value="contenido_ofensivo">Contenido ofensivo</option>
            <option value="otro">Otro</option>
          </select>
        </label>
        <label className="mt-3 block text-sm font-medium text-gray-700">
          Detalles <span className="font-normal text-gray-400">(opcional)</span>
          <textarea
            value={details}
            onChange={(event) => setDetails(event.target.value)}
            maxLength={1000}
            placeholder="Cuéntanos qué ocurre"
            className="mt-1.5 min-h-24 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
          />
        </label>
        {error && <p role="alert" className="mt-3 text-xs text-red-600">{error}</p>}
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => setOpen(false)}
            disabled={submitting}
            className="min-h-11 rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void submitReport()}
            className="min-h-11 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Enviando..." : "Enviar denuncia"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  const toast = success ? (
    <div role="status" className="fixed bottom-24 left-1/2 z-[100] -translate-x-1/2 rounded-xl bg-emerald-600 px-4 py-3 text-center text-sm font-medium text-white shadow-lg sm:bottom-6">
      {success}
    </div>
  ) : null;

  return (
    <>
      {trigger}
      {typeof document !== "undefined" && modal && createPortal(modal, document.body)}
      {typeof document !== "undefined" && toast && createPortal(toast, document.body)}
    </>
  );
}
