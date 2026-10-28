import { apiFetch } from "../http/api-client";

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  entityType: string | null;
  entityId: string | null;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationInbox {
  items: AppNotification[];
  noLeidas: number;
}

export const notificationService = {
  list: (limit = 20) => apiFetch<NotificationInbox>(`/notificaciones?limite=${limit}`),
  markRead: (id: string) => apiFetch<void>(`/notificaciones/${id}/leida`, { method: "PATCH" }),
  markAllRead: () => apiFetch<void>("/notificaciones/leidas", { method: "PATCH" }),
};
