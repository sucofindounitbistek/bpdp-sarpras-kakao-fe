import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { notificationService } from '@/services/notification.service';
import type { NotificationItem } from '@/types/notification';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/id';

dayjs.extend(relativeTime);
dayjs.locale('id');

export const useNotificationStore = defineStore('notification', () => {
  const items = ref<NotificationItem[]>([]);
  const unreadCount = ref<number>(0);
  const actionRequiredCount = ref<number>(0);
  const isLoading = ref<boolean>(false);
  const activeTab = ref<'ALL' | 'ACTION_REQUIRED'>('ALL');

  let pollingTimer: ReturnType<typeof setInterval> | null = null;
  let isListeningFocus = false;

  const filteredItems = computed(() => {
    if (activeTab.value === 'ACTION_REQUIRED') {
      return items.value.filter((n) => n.category === 'ACTION_REQUIRED' && !n.is_read);
    }
    return items.value;
  });

  const formatTimeAgo = (dateStr: string) => {
    if (!dateStr) return '';
    return dayjs(dateStr).fromNow();
  };

  const fetchUnreadCounts = async () => {
    try {
      const counts = await notificationService.getUnreadCounts();
      unreadCount.value = counts.total;
      actionRequiredCount.value = counts.action_required;
    } catch (e) {
      console.warn('Failed to fetch unread notification counts', e);
    }
  };

  const fetchNotifications = async () => {
    isLoading.value = true;
    try {
      const res = await notificationService.getNotifications({
        limit: 15,
        page: 1,
      });
      items.value = res.items;
      // Also sync unread counts
      await fetchUnreadCounts();
    } catch (e) {
      console.warn('Failed to fetch notifications list', e);
    } finally {
      isLoading.value = false;
    }
  };

  const markAsRead = async (id: number) => {
    const target = items.value.find((n) => n.id === id);
    if (target && !target.is_read) {
      target.is_read = true;
      if (unreadCount.value > 0) unreadCount.value -= 1;
      if (target.category === 'ACTION_REQUIRED' && actionRequiredCount.value > 0) {
        actionRequiredCount.value -= 1;
      }
      try {
        await notificationService.markAsRead(id);
      } catch (e) {
        console.warn(`Failed to mark notification ${id} as read`, e);
      }
    }
  };

  const markAllAsRead = async () => {
    items.value.forEach((n) => {
      n.is_read = true;
    });
    unreadCount.value = 0;
    actionRequiredCount.value = 0;
    try {
      await notificationService.markAllAsRead();
    } catch (e) {
      console.warn('Failed to mark all notifications as read', e);
    }
  };

  const handleVisibilityChange = () => {
    const authStore = useAuthStore();
    if (document.visibilityState === 'visible' && authStore.isAuthenticated && authStore.token) {
      fetchUnreadCounts();
    }
  };

  const startPolling = (intervalMs = 60000) => {
    const authStore = useAuthStore();
    if (!authStore.isAuthenticated || !authStore.token) {
      return;
    }

    fetchUnreadCounts();

    if (!pollingTimer) {
      pollingTimer = setInterval(() => {
        if (!authStore.isAuthenticated || !authStore.token) {
          stopPolling();
          return;
        }
        fetchUnreadCounts();
      }, intervalMs);
    }

    if (!isListeningFocus && typeof window !== 'undefined' && typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
      isListeningFocus = true;
    }
  };

  const stopPolling = () => {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
    if (isListeningFocus && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      isListeningFocus = false;
    }
  };

  return {
    items,
    unreadCount,
    actionRequiredCount,
    isLoading,
    activeTab,
    filteredItems,
    formatTimeAgo,
    fetchUnreadCounts,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    startPolling,
    stopPolling,
  };
});
