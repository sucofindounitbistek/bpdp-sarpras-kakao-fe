import api from './api';

export const lahanService = {
  async getByKelembagaanId(kelembagaanId: string | number) {
    try {
      const response = await api.get(`/lahan/kelembagaan/${kelembagaanId}?includeDraft=false`);
      return response.data;
    } catch {
      return null;
    }
  },

  async getByPekebunId(pekebunId: string | number) {
    try {
      const response = await api.get('/lahan', { params: { pekebun_id: pekebunId } });
      return response.data;
    } catch {
      return null;
    }
  },

  async getById(id: string | number) {
    try {
      const response = await api.get(`/lahan/${id}`);
      return response.data;
    } catch {
      return null;
    }
  },

  async create(formData: FormData) {
    const response: any = await api.post('/lahan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response?.data ?? response;
  },

  async update(id: string | number, formData: FormData) {
    const response: any = await api.put(`/lahan/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response?.data ?? response;
  },

  async delete(id: string | number) {
    const response: any = await api.delete(`/lahan/${id}`);
    return response?.data ?? response;
  },

  async uploadDocument(lahanId: string | number, file: File, documentType: string = 'FOTO_UDARA') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);
    const response: any = await api.post(`/lahan/${lahanId}/documents`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response?.data ?? response;
  },

  async getDocuments(lahanId: string | number) {
    try {
      const response = await api.get(`/lahan/${lahanId}/documents`);
      return response.data;
    } catch {
      return null;
    }
  },

  async deleteDocument(lahanId: string | number, docIdOrType?: string | number) {
    let url = `/lahan/${lahanId}/documents`;
    if (typeof docIdOrType === 'number' || (typeof docIdOrType === 'string' && /^\d+$/.test(docIdOrType))) {
      url = `/lahan/${lahanId}/documents/${docIdOrType}`;
    } else if (docIdOrType) {
      url = `/lahan/${lahanId}/documents?document_type=${encodeURIComponent(String(docIdOrType))}`;
    }
    const response: any = await api.delete(url);
    return response?.data ?? response;
  },
};
