import api from './api';

export interface AuditChange {
  entity_type: string;
  entity_id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
}

interface AuditLogBase {
  id: number;
  request_id: string;
  actor_id: number | null;
  actor_name: string | null;
  actor_role: string | null;
  method: string;
  path: string;
  status_code: number;
  duration_ms: number;
  created_at: string;
}

export interface AuditLogSummary extends AuditLogBase {
  change_count: number;
}

export interface AuditLogDetail extends AuditLogBase {
  ip_address: string;
  user_agent: string;
  request_size_bytes: number;
  response_size_bytes: number;
  changes: AuditChange[];
}

export interface AuditLogListParams {
  page?: number;
  limit?: number;
  request_id?: string;
  actor_id?: number;
  method?: string;
  path?: string;
  status_code?: number;
  date_from?: string;
  date_to?: string;
}

interface AuditLogListResponse {
  success: boolean;
  data: AuditLogSummary[];
  meta: { page: number; limit: number; total: number };
}

interface AuditLogDetailResponse {
  success: boolean;
  data: AuditLogDetail;
}

export const auditService = {
  async getList(params: AuditLogListParams): Promise<AuditLogListResponse> {
    return await api.get('/audit-logs', { params }) as unknown as AuditLogListResponse;
  },

  async getById(id: number): Promise<AuditLogDetail> {
    const response = await api.get(`/audit-logs/${id}`) as unknown as AuditLogDetailResponse;
    return response.data;
  },
};
