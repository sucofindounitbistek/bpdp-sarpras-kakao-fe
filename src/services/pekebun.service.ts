import api from './api';

export interface PekebunListParams {
  page?: number;
  limit?: number;
  search?: string;
  kelembagaan_id?: string | number;
  is_draft?: boolean;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export const pekebunService = {
  async getList(params?: PekebunListParams) {
    try {
      const response: any = await api.get('/pekebun', { params });
      return response;
    } catch {
      return null;
    }
  },

  async getById(id: string | number) {
    try {
      const response = await api.get(`/pekebun/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },

  async create(formData: FormData) {
    const response: any = await api.post('/pekebun', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response?.data ?? response;
  },

  async update(id: string | number, formData: FormData) {
    const response: any = await api.put(`/pekebun/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response?.data ?? response;
  },

  async delete(id: string | number) {
    const response: any = await api.delete(`/pekebun/${id}`);
    return response?.data ?? response;
  },
};