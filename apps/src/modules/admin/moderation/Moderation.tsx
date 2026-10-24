"use client";
import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, Eye, History, Trash2 } from "lucide-react";
import { InitialsAvatar as Avatar, SurfaceCard as Card } from "@/shared/components";
import { SectionHeader } from "@/modules/admin/ui/SectionHeader";
import {
  adminService,
  type ModerationReport,
  type ModerationReportsResponse,
} from "@/shared/services";
import { ModerationDialog } from "@/modules/admin/ui/ModerationDialog";
import { ActionFeedbackDialog } from "@/modules/admin/ui/ActionFeedbackDialog";
import { DeletePostDialog } from "./DeletePostDialog";

const REASON_LABELS: Record<string, string> = {
  spam: "Spam",
  contenido_falso: "Contenido falso",
  contenido_ofensivo: "Contenido ofensivo",
  otro: "Otro",
};
type ReportStatusFilter = "pending" | "reviewed" | "all";

function hasPendingReports(item: ModerationReport) {
  return item.reports.some(
    (report) => report.status === "pendiente" || report.status === "en_revision",
  );
}

export function Moderation() {
  const [data, setData] = useState<ModerationReportsResponse>({
    items: [],
    statistics: [],
    total: 0,
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [status, setStatus] = useState<ReportStatusFilter>("pending");
  const [selected, setSelected] = useState<ModerationReport | null>(null);
  const [deleting, setDeleting] = useState<ModerationReport | null>(null);
  const [reviewing, setReviewing] = useState<{ id: string; reason: string } | null>(null);
  const [reviewResult, setReviewResult] = useState("");
  const [comments, setComments] = useState<ModerationReport | null>(null);
  const [history, setHistory] = useState<ModerationReport | null>(null);
  const load = async () => {
    setLoading(true);
    try {
      setData(
        await adminService.listReportedPosts({
          from: from || undefined,
          to: to || undefined,
          sort,
          status,
        }),
      );
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "No se pudo cargar el historial de denuncias.",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, [from, to, sort, status]);
  const remove = async (reason: string) => {
    if (!deleting) return;
    setBusy(deleting.id);
    setError(null);
    try {
      await adminService.removeReportedPost(deleting.id, reason);
      setDeleting(null);
      setMessage("Publicación eliminada y autor notificado.");
      await load();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo eliminar la publicación.");
    } finally {
      setBusy(null);
    }
  };
  const review = async () => {
    if (!reviewing || !reviewResult.trim()) return;
    setBusy(reviewing.id);
    setError(null);
    try {
      await adminService.reviewReport(reviewing.id, reviewResult.trim());
      setReviewing(null);
      setReviewResult("");
      setMessage("Denuncia marcada como revisada.");
      await load();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "No se pudo revisar la denuncia.");
    } finally {
      setBusy(null);
    }
  };
  return (
    <div className="space-y-5">
      <SectionHeader
        title="Moderación de contenido"
        sub="Denuncias pendientes e historial de denuncias revisadas"
      />
      {message && (
        <ActionFeedbackDialog
          type="success"
          title="Operación completada"
          message={message}
          onClose={() => setMessage(null)}
        />
      )}
      {error && !deleting && !reviewing && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}
      <Card className="p-4">
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-xs font-medium text-gray-600">
            Estado
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as ReportStatusFilter)}
              className="mt-1 block min-w-40 rounded-lg border border-gray-200 bg-white p-2 text-sm"
            >
              <option value="pending">Pendientes</option>
              <option value="reviewed">Revisadas</option>
              <option value="all">Todas</option>
            </select>
          </label>
          <label className="text-xs font-medium text-gray-600">
            Desde
            <input
              type="date"
              value={from}
              onChange={(event) => setFrom(event.target.value)}
              className="mt-1 block rounded-lg border border-gray-200 p-2 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-gray-600">
            Hasta
            <input
              type="date"
              value={to}
              onChange={(event) => setTo(event.target.value)}
              className="mt-1 block rounded-lg border border-gray-200 p-2 text-sm"
            />
          </label>
          <label className="text-xs font-medium text-gray-600">
            Orden
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as "asc" | "desc")}
              className="mt-1 block rounded-lg border border-gray-200 bg-white p-2 text-sm"
            >
              <option value="desc">Más recientes</option>
              <option value="asc">Más antiguas</option>
            </select>
          </label>
          <span className="ml-auto text-sm text-gray-500">{data.total} denuncias</span>
        </div>
      </Card>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

      </div>
      {loading ? (
        <Card className="p-6 text-sm text-gray-500">Cargando denuncias...</Card>
      ) : data.items.length === 0 ? (
        <Card className="p-6 text-sm text-gray-500">No hay denuncias con estos filtros.</Card>
      ) : (
        <div className="space-y-3">
          {data.items.map((item) => (
            <Card key={item.id} className="p-5">
              <div className="flex items-start gap-4">
                <Avatar
                  initials={(item.author.profile?.fullName ?? "US").slice(0, 2).toUpperCase()}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <strong className="text-[13px] text-gray-900">
                      {item.author.profile?.fullName ?? item.author.email}
                    </strong>
                    <span className="text-xs text-gray-400">
                      Recibida: {new Date(item.createdAt).toLocaleString("es-CO")}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-700">
                    {item.caption || "Publicación multimedia sin texto"}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs text-red-600">
                    <AlertCircle size={13} />
                    {item.reports.length} reporte(s):{" "}
                    {item.reports
                      .map((report) => REASON_LABELS[report.reason] ?? report.reason)
                      .join(", ")}
                    <button
                      type="button"
                      onClick={() => setComments(item)}
                      className="ml-auto shrink-0 whitespace-nowrap rounded-md bg-gray-100 px-2 py-1 font-medium text-gray-700 hover:bg-gray-200"
                    >
                      Ver comentarios
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className={item.status === "eliminada" ? "rounded-full bg-red-100 px-2 py-1 font-semibold text-red-700" : "rounded-full bg-emerald-100 px-2 py-1 font-semibold text-emerald-700"}>
                      {item.status === "eliminada" ? "Publicación eliminada" : "Publicación disponible"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setHistory(item)}
                      className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 font-medium text-gray-700 hover:bg-gray-200"
                    >
                      <History size={13} /> Ver historial
                    </button>
                  </div>
                  {false && item.reports.map((report) => (
                    <div
                      key={report.id}
                      className={`mt-2 rounded-lg p-2 text-xs ${report.reason === "spam" ? "bg-red-50 text-red-700" : report.reason === "contenido_falso" ? "bg-amber-50 text-amber-700" : report.reason === "contenido_ofensivo" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}
                    >
                      <div className="flex flex-nowrap items-center justify-between gap-2">

                        {report.status === "pendiente" || report.status === "en_revision" ? (
                          <button
                            onClick={() => {
                              setReviewing({ id: report.id, reason: report.reason });
                              setReviewResult("");
                            }}
                            className="hidden shrink-0 items-center gap-1 whitespace-nowrap rounded-md bg-white px-2 py-1 font-medium text-blue-700 shadow-sm"
                          >
                            <CheckCircle size={12} /> Marcar revisada
                          </button>
                        ) : (
                          <span className="text-emerald-700">
                            Revisada: {report.resolutionNote || "Sin resultado"}
                            {report.resolvedAt
                              ? ` · ${new Date(report.resolvedAt).toLocaleString("es-CO")}`
                              : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  <div className="mt-4 flex flex-nowrap justify-end gap-2">
                    {hasPendingReports(item) && (
                      <button
                        onClick={() => {
                          const pending = item.reports.find((report) => report.status === "pendiente" || report.status === "en_revision");
                          if (pending) { setReviewing({ id: pending.id, reason: pending.reason }); setReviewResult(""); }
                        }}
                        className="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-700"
                      >
                        <CheckCircle size={13} /> Marcar revisada
                      </button>
                    )}
                    <button
                      onClick={() => setSelected(item)}
                      className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-700"
                    >
                      <Eye size={13} /> Revisar publicación
                    </button>
                    {hasPendingReports(item) && item.status !== "eliminada" && (
                      <button
                        disabled={busy === item.id}
                        onClick={() => {
                          setError(null);
                          setDeleting(item);
                        }}
                        className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700 disabled:opacity-50"
                      >
                        <Trash2 size={13} /> Eliminar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {comments && (
        <ModerationDialog
          title="Comentarios de las denuncias"
          description={`Motivos recibidos para la publicación de ${comments.author.profile?.fullName ?? comments.author.email}`}
          onClose={() => setComments(null)}
          actions={<button type="button" onClick={() => setComments(null)} className="min-h-11 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700">Cerrar</button>}
        >
          <div className="mt-4 max-h-72 space-y-2 overflow-y-auto">
            {comments.reports.map((report) => (
              <div key={report.id} className={`rounded-xl p-3 text-sm ${report.reason === "spam" ? "bg-red-50 text-red-700" : report.reason === "contenido_falso" ? "bg-amber-50 text-amber-700" : report.reason === "contenido_ofensivo" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                <p className="font-semibold">{REASON_LABELS[report.reason] ?? report.reason}</p>
                <p className="mt-1">{report.details || "Sin comentarios adicionales."}</p>
                <p className="mt-1 text-xs opacity-75">Recibida: {new Date(report.createdAt).toLocaleString("es-CO")}</p>
              </div>
            ))}
          </div>
        </ModerationDialog>
      )}
      {history && (
        <ModerationDialog
          title="Historial de moderación"
          description={`Acciones sobre la publicación de ${history.author.profile?.fullName ?? history.author.email}`}
          onClose={() => setHistory(null)}
          actions={<button type="button" onClick={() => setHistory(null)} className="min-h-11 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700">Cerrar</button>}
        >
          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-gray-50 p-3 text-sm text-gray-700">
              <p className="font-semibold">Estado actual</p>
              <p className="mt-1">{history.status === "eliminada" ? "Publicación eliminada" : "Publicación disponible"}</p>
            </div>
            {history.history.length === 0 ? (
              <p className="rounded-xl bg-gray-50 p-3 text-sm text-gray-500">Aún no hay acciones registradas.</p>
            ) : (
              history.history.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-gray-100 bg-white p-3 text-sm shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-gray-900">
                      {entry.action === "post_removed" ? "Publicación eliminada" : entry.action === "report_reviewed" ? "Denuncia marcada como revisada" : entry.action}
                    </p>
                    <time className="text-xs text-gray-500">{new Date(entry.createdAt).toLocaleString("es-CO")}</time>
                  </div>
                  <p className="mt-1 text-gray-700">Comentario: {entry.reason || "Sin comentario registrado."}</p>
                  <p className="mt-1 text-xs text-gray-500">Administrador: {entry.actor?.profile?.fullName ?? entry.actor?.email ?? "Administrador no disponible"}</p>
                </div>
              ))
            )}
          </div>
        </ModerationDialog>
      )}
      {selected && (
        <ModerationDialog
          title="Revisión de denuncia"
          description={`Publicación de ${selected.author.profile?.fullName ?? selected.author.email}`}
          onClose={() => setSelected(null)}
          actions={
            hasPendingReports(selected) && selected.status !== "eliminada" ? (
              <button
              type="button"
              onClick={() => {
                setSelected(null);
                setDeleting(selected);
              }}
              className="min-h-11 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              Eliminar publicación
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="min-h-11 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700"
              >
                Cerrar
              </button>
            )
          }
        >
          <div className="mt-4 space-y-3">
            {selected.media.map((media) =>
              media.mediaType === "video" ? (
                <video
                  key={media.id}
                  controls
                  className="max-h-72 w-full rounded-xl bg-black"
                  src={media.url}
                />
              ) : (
                <img
                  key={media.id}
                  src={media.url}
                  alt="Contenido denunciado"
                  className="max-h-72 w-full rounded-xl object-contain"
                />
              ),
            )}
            <p className="text-sm text-gray-700">{selected.caption || "Sin descripción"}</p>
          </div>
        </ModerationDialog>
      )}
      {deleting && (
        <DeletePostDialog
          saving={busy === deleting.id}
          error={error}
          onClose={() => {
            setDeleting(null);
            setError(null);
          }}
          onConfirm={(reason) => void remove(reason)}
        />
      )}
      {reviewing && (
        <ModerationDialog
          title="Marcar denuncia como revisada"
          description={`Motivo original: ${REASON_LABELS[reviewing.reason] ?? reviewing.reason}`}
          onClose={() => {
            setReviewing(null);
            setError(null);
          }}
          actions={
            <>
              <button
                type="button"
                disabled={busy === reviewing.id}
                onClick={() => setReviewing(null)}
                className="min-h-11 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={busy === reviewing.id || !reviewResult.trim()}
                onClick={() => void review()}
                className="min-h-11 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
              >
                {busy === reviewing.id ? "Guardando..." : "Guardar revisión"}
              </button>
            </>
          }
        >
          <label className="mt-5 block text-sm font-medium text-gray-700">
            Resultado de la revisión
            <textarea
              autoFocus
              value={reviewResult}
              onChange={(event) => setReviewResult(event.target.value)}
              maxLength={1000}
              className="mt-1.5 min-h-28 w-full resize-none rounded-xl border border-gray-200 p-3 text-sm"
              placeholder="Ej.: No aplica; el contenido cumple las normas."
            />
          </label>
          {error && (
            <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              {error}
            </p>
          )}
        </ModerationDialog>
      )}
    </div>
  );
}
