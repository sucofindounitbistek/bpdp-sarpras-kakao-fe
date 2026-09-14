import api from './api';
import type {
  CreateRabPayload,
  UpdateRabPayload,
  RabResponse,
} from '@/types/rab';

export const rabService = {
  /** Retrieves the complete RAB structure associated with a specific proposal */
  async getByProposalId(proposalId: string | number): Promise<RabResponse> {
    const response = await api.get(`/rabs/proposal/${proposalId}`);
    return response as unknown as RabResponse;
  },

  /** Creates a Budget Plan (RAB) with line items and dynamic attributes */
  async create(payload: CreateRabPayload): Promise<RabResponse> {
    const response = await api.post('/rabs', payload);
    return response as unknown as RabResponse;
  },

  /** Replaces line items in an existing RAB and updates parent proposal total_anggaran */
  async update(id: string | number, payload: UpdateRabPayload): Promise<RabResponse> {
    const response = await api.put(`/rabs/${id}`, payload);
    return response as unknown as RabResponse;
  },

  /** Deletes the RAB, cascades deletion to all items, and resets proposal total_anggaran */
  async delete(id: string | number): Promise<{ data: { id: number; deleted: boolean }; message: string }> {
    const response = await api.delete(`/rabs/${id}`);
    return response as unknown as { data: { id: number; deleted: boolean }; message: string };
  },
};
