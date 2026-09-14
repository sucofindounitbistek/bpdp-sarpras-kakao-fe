export type NotificationCategory = 'ACTION_REQUIRED' | 'STATUS_MILESTONE' | 'SLA_WARNING' | 'SYSTEM_INFO';
export type NotificationPriority = 'URGENT' | 'NORMAL' | 'LOW';

export interface NotificationItem {
  id: number;
  recipient_user_id?: number;
  recipient_role?: string;
  recipient_regional_code?: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  entity_type: string;
  entity_id: string;
  title: string;
  message: string;
  action_url: string;
  metadata?: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface UnreadCountResponse {
  total: number;
  action_required: number;
}

export interface NotificationPagination {
  items: NotificationItem[];
  total_items: number;
  page: number;
  limit: number;
  total_pages: number;
}
