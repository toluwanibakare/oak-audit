import apiClient from "./client";

export interface NotificationItem {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  read_at: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export const notificationsApi = {
  list: (unreadOnly = false) =>
    apiClient
      .get<PaginatedResponse<NotificationItem>>("/notifications", {
        params: { unread_only: unreadOnly },
      })
      .then((r) => r.data),

  show: (id: string) =>
    apiClient.get<NotificationItem>(`/notifications/${id}`).then((r) => r.data),

  markAsRead: (id: string) =>
    apiClient.post<{ message: string }>(`/notifications/${id}/read`).then((r) => r.data),

  markAllAsRead: () =>
    apiClient.post<{ message: string }>("/notifications/read-all").then((r) => r.data),

  delete: (id: string) =>
    apiClient.delete<{ message: string }>(`/notifications/${id}`).then((r) => r.data),

  unreadCount: () =>
    apiClient.get<{ count: number }>("/notifications/unread-count").then((r) => r.data),
};
