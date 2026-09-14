import api from './api';
import type { NotificationPagination, UnreadCountResponse } from '@/types/notification';

export interface GetNotificationParams {
  page?: number;
  limit?: number;
  is_read?: boolean;
  category?: string;
}

export const notificationService = {
  async getNotifications(params?: GetNotificationParams): Promise<NotificationPagination> {
    const res: any = await api.get('/notifications', { params });
    const payload = res?.data || res;
    return {
      items: payload?.items || [],
      total_items: payload?.total_items || 0,
      page: payload?.page || 1,
      limit: payload?.limit || 10,
      total_pages: payload?.total_pages || 1,
    };
  },

  async getUnreadCounts(): Promise<UnreadCountResponse> {
    const res: any = await api.get('/notifications/unread-count');
    const payload = res?.data || res;
    return {
      total: payload?.total || 0,
      action_required: payload?.action_required || 0,
    };
  },

  async markAsRead(id: number): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.post('/notifications/mark-all-read');
  },
};
