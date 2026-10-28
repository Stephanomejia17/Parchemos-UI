"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import {
  notificationService,
  type AppNotification,
} from "@/shared/services/notifications/notification.service";

/** Cada cuánto se revisan avisos nuevos mientras la pestaña está abierta. */
const REFRESH_MS = 60_000;

const timeAgo = (iso: string) => {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `Hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Hace ${hours} h`;
  return new Date(iso).toLocaleDateString("es-CO", { day: "numeric", month: "short" });
};

/**
 * Campana del encabezado: muestra los avisos in-app del usuario (p. ej. el
 * resultado de una denuncia o la eliminación de una publicación).
 */
export function NotificationBell() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [failed, setFailed] = useState(false);
  const container = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const inbox = await notificationService.list();
      setItems(inbox.items);
      setUnread(inbox.noLeidas);
      setFailed(false);
    } catch {
      // Sin sesión o sin conexión: la campana queda sin contador.
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(), REFRESH_MS);
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [load]);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const markRead = async (notification: AppNotification) => {
    if (notification.readAt) return;
    const readAt = new Date().toISOString();
    setItems((current) => current.map((item) => (item.id === notification.id ? { ...item, readAt } : item)));
    setUnread((count) => Math.max(0, count - 1));
    await notificationService.markRead(notification.id).catch(() => void load());
  };

  const markAllRead = async () => {
    const readAt = new Date().toISOString();
    setItems((current) => current.map((item) => ({ ...item, readAt: item.readAt ?? readAt })));
    setUnread(0);
    await notificationService.markAllRead().catch(() => void load());
  };

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        aria-label={unread > 0 ? `Notificaciones, ${unread} sin leer` : "Notificaciones"}
        aria-expanded={open}
        onClick={() => {
          setOpen((value) => !value);
          if (!open) void load();
        }}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-[1100] w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">Notificaciones</p>
            {unread > 0 && (
              <button type="button" onClick={() => void markAllRead()} className="flex items-center gap-1 text-xs font-medium text-primary">
                <CheckCheck className="h-3.5 w-3.5" /> Marcar todas como leídas
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {failed && items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">No pudimos cargar tus notificaciones.</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-gray-500">No tienes notificaciones.</p>
            ) : (
              items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => void markRead(item)}
                  className={`block w-full border-b border-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${item.readAt ? "" : "bg-orange-50/60"}`}
                >
                  <div className="flex items-start gap-2">
                    {!item.readAt && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" aria-label="Sin leer" />}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900">{item.title}</p>
                      {item.body && <p className="mt-0.5 text-sm text-gray-600">{item.body}</p>}
                      <p className="mt-1 text-xs text-gray-400">{timeAgo(item.createdAt)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
