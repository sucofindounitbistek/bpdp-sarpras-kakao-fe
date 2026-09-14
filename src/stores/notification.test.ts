import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useNotificationStore } from './notification';
import { useAuthStore } from '@/stores/auth';
import { notificationService } from '@/services/notification.service';
import type { NotificationItem } from '@/types/notification';

describe('useNotificationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.restoreAllMocks();
  });

  it('should initialize with empty notification state', () => {
    const store = useNotificationStore();
    expect(store.items).toEqual([]);
    expect(store.unreadCount).toBe(0);
    expect(store.actionRequiredCount).toBe(0);
    expect(store.activeTab).toBe('ALL');
  });

  it('should fetch and populate notifications and counts', async () => {
    const mockItems: NotificationItem[] = [
      {
        id: 1,
        category: 'ACTION_REQUIRED',
        priority: 'URGENT',
        entity_type: 'PROPOSAL',
        entity_id: '10',
        title: 'Revisi Diperlukan',
        message: 'Mohon perbaiki dokumen.',
        action_url: '/edit?id=10',
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        category: 'STATUS_MILESTONE',
        priority: 'NORMAL',
        entity_type: 'PROPOSAL',
        entity_id: '12',
        title: 'SK Terbit',
        message: 'SK telah disahkan.',
        action_url: '/view?id=12',
        is_read: true,
        created_at: new Date().toISOString(),
      },
    ];

    vi.spyOn(notificationService, 'getNotifications').mockResolvedValueOnce({
      items: mockItems,
      total_items: 2,
      page: 1,
      limit: 15,
      total_pages: 1,
    });

    vi.spyOn(notificationService, 'getUnreadCounts').mockResolvedValueOnce({
      total: 1,
      action_required: 1,
    });

    const store = useNotificationStore();
    await store.fetchNotifications();

    expect(store.items.length).toBe(2);
    expect(store.unreadCount).toBe(1);
    expect(store.actionRequiredCount).toBe(1);
  });

  it('should filter items by activeTab correctly', () => {
    const store = useNotificationStore();
    store.items = [
      {
        id: 1,
        category: 'ACTION_REQUIRED',
        priority: 'URGENT',
        entity_type: 'PROPOSAL',
        entity_id: '1',
        title: 'Action 1',
        message: 'Need action',
        action_url: '/1',
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        category: 'STATUS_MILESTONE',
        priority: 'NORMAL',
        entity_type: 'PROPOSAL',
        entity_id: '2',
        title: 'Status 2',
        message: 'Milestone',
        action_url: '/2',
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ];

    expect(store.filteredItems.length).toBe(2);

    store.activeTab = 'ACTION_REQUIRED';
    expect(store.filteredItems.length).toBe(1);
    expect(store.filteredItems[0].id).toBe(1);
  });

  it('should mark a single notification as read and decrement counts', async () => {
    const spy = vi.spyOn(notificationService, 'markAsRead').mockResolvedValueOnce();

    const store = useNotificationStore();
    store.items = [
      {
        id: 1,
        category: 'ACTION_REQUIRED',
        priority: 'URGENT',
        entity_type: 'PROPOSAL',
        entity_id: '1',
        title: 'Action 1',
        message: 'Need action',
        action_url: '/1',
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ];
    store.unreadCount = 1;
    store.actionRequiredCount = 1;

    await store.markAsRead(1);

    expect(store.items[0].is_read).toBe(true);
    expect(store.unreadCount).toBe(0);
    expect(store.actionRequiredCount).toBe(0);
    expect(spy).toHaveBeenCalledWith(1);
  });

  it('should mark all notifications as read', async () => {
    const spy = vi.spyOn(notificationService, 'markAllAsRead').mockResolvedValueOnce();

    const store = useNotificationStore();
    store.items = [
      {
        id: 1,
        category: 'ACTION_REQUIRED',
        priority: 'URGENT',
        entity_type: 'PROPOSAL',
        entity_id: '1',
        title: 'A1',
        message: 'M1',
        action_url: '/1',
        is_read: false,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        category: 'STATUS_MILESTONE',
        priority: 'NORMAL',
        entity_type: 'PROPOSAL',
        entity_id: '2',
        title: 'A2',
        message: 'M2',
        action_url: '/2',
        is_read: false,
        created_at: new Date().toISOString(),
      },
    ];
    store.unreadCount = 2;
    store.actionRequiredCount = 1;

    await store.markAllAsRead();

    expect(store.items.every((n) => n.is_read)).toBe(true);
    expect(store.unreadCount).toBe(0);
    expect(store.actionRequiredCount).toBe(0);
    expect(spy).toHaveBeenCalled();
  });

  it('should not start polling or fetch counts if user is unauthenticated', () => {
    const spy = vi.spyOn(notificationService, 'getUnreadCounts');
    const store = useNotificationStore();
    store.startPolling();
    expect(spy).not.toHaveBeenCalled();
  });

  it('should start polling and fetch counts when user is authenticated', () => {
    const spy = vi.spyOn(notificationService, 'getUnreadCounts').mockResolvedValueOnce({
      total: 3,
      action_required: 1,
    });
    const authStore = useAuthStore();
    authStore.setAuth('valid-token-xyz', {
      id: '1',
      name: 'Test User',
      email: 'user@test.com',
      role: 'PEMOHON',
    });

    const store = useNotificationStore();
    store.startPolling();
    expect(spy).toHaveBeenCalledTimes(1);
    store.stopPolling();
  });
});
