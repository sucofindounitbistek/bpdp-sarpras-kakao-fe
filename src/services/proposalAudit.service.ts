import api from './api';

export interface AuditChange {
  field: string;
  label: string;
  before: any;
  after: any;
  entity_type?: string;
  entity_id?: number;
}

export interface AuditDocumentRef {
  id: number;
  file_id: number;
  name: string;
  content_type: string;
  etag?: string;
}

export interface ProposalAuditEvent {
  id: number;
  proposal_id: number;
  proposal_number: string;
  domain: 'PROPOSAL' | 'PENYALURAN_BARANG' | string;
  action: string;
  action_label?: string;
  stage: string;
  stage_label?: string;
  summary: string;
  created_at: string;
  actor_user_id: number;
  actor_iam_user_id: number;
  actor_name: string;
  actor_role_code: string;
  actor_role_name: string;
  status_before: string;
  status_after: string;
  reason?: string;
  changes: AuditChange[];
  documents: AuditDocumentRef[];
  distribution_id?: number;
  request_id?: string;
}

export interface ProposalAuditListResponse {
  data: ProposalAuditEvent[];
  meta: {
    page: number;
    limit: number;
    total: number;
    capture_started_at?: string;
  };
}

export interface ProposalAuditFilter {
  page?: number;
  limit?: number;
  domain?: string;
  stage?: string;
  action?: string;
  start_date?: string;
  end_date?: string;
}

export const proposalAuditService = {
  async getAuditLogs(proposalId: number | string, filter?: ProposalAuditFilter): Promise<ProposalAuditListResponse> {
    const response: any = await api.get(`/proposals/${proposalId}/audit-logs`, { params: filter });
    return {
      data: response?.data || [],
      meta: response?.meta || { page: 1, limit: 20, total: (response?.data || []).length },
    };
  },

  async getAuditDetail(proposalId: number | string, eventId: number | string): Promise<ProposalAuditEvent> {
    const response: any = await api.get(`/proposals/${proposalId}/audit-logs/${eventId}`);
    return response?.data ?? response;
  },

  async downloadDocument(proposalId: number | string, eventId: number | string, documentId: number | string, filename?: string): Promise<void> {
    const url = `/proposals/${proposalId}/audit-logs/${eventId}/documents/${documentId}`;
    const response = await api.get(url, { responseType: 'blob' });
    const blob = new Blob([response as any]);
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || `audit-document-${documentId}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  },
};
