import api from './api';
import type {
  MasterKategoriSarpras,
  MasterPaketSarpras,
  DokumenPersyaratanItem,
  MasterDokumenCatalog,
  MasterSyaratLahan,
} from '@/types/masterSarpras';

function extractData<T>(response: any): T {
  if (response && response.data !== undefined) {
    return response.data as T;
  }
  return response as T;
}

export const masterSarprasService = {
  async getKategoriList(isActive: boolean = true): Promise<MasterKategoriSarpras[]> {
    const response = await api.get('/master/kategori-sarpras', {
      params: { is_active: isActive },
    });
    return extractData<MasterKategoriSarpras[]>(response) || [];
  },

  async getPaketList(kategoriCode?: string, isActive: boolean = true): Promise<MasterPaketSarpras[]> {
    const response = await api.get('/master/paket-sarpras', {
      params: {
        kategori: kategoriCode || undefined,
        is_active: isActive,
      },
    });
    return extractData<MasterPaketSarpras[]>(response) || [];
  },

  async getPaketDetail(code: string): Promise<MasterPaketSarpras & { dokumen_persyaratan: DokumenPersyaratanItem[] }> {
    const response = await api.get(`/master/paket-sarpras/${encodeURIComponent(code)}`);
    return extractData<MasterPaketSarpras & { dokumen_persyaratan: DokumenPersyaratanItem[] }>(response);
  },

  async getPersyaratanByPaket(code: string): Promise<DokumenPersyaratanItem[]> {
    const response = await api.get(`/master/paket-sarpras/${encodeURIComponent(code)}/persyaratan`);
    return extractData<DokumenPersyaratanItem[]>(response) || [];
  },

  async getDokumenCatalog(isActive: boolean = true): Promise<MasterDokumenCatalog[]> {
    const response = await api.get('/master/dokumen-persyaratan', {
      params: { is_active: isActive },
    });
    return extractData<MasterDokumenCatalog[]>(response) || [];
  },

  async getSyaratLahanList(isActive: boolean = true): Promise<MasterSyaratLahan[]> {
    const response = await api.get('/master/syarat-lahan', {
      params: { is_active: isActive },
    });
    return extractData<MasterSyaratLahan[]>(response) || [];
  },

  async createPaket(payload: {
    kategori_code: string;
    code: string;
    name: string;
    label?: string;
    description?: string;
    icon?: string;
    is_pupuk: boolean;
    jumlah_tahap?: number;
    kode_penomoran?: string;
    minimal_pekebun?: number | null;
    minimal_luas_ha?: number | null;
    keterangan?: string;
    dokumen_codes?: string[];
  }): Promise<{ message: string }> {
    const response = await api.post('/master/paket-sarpras', payload);
    return extractData<{ message: string }>(response);
  },

  async updatePaket(
    code: string,
    payload: {
      kategori_code?: string;
      name?: string;
      label?: string;
      description?: string;
      icon?: string;
      is_pupuk?: boolean;
      jumlah_tahap?: number;
      kode_penomoran?: string;
      is_active?: boolean;
      minimal_pekebun?: number | null;
      minimal_luas_ha?: number | null;
      keterangan?: string;
      dokumen_codes?: string[];
    }
  ): Promise<{ message: string }> {
    const finalPayload = {
      ...payload,
      label: payload.label || payload.name,
    };
    const response = await api.put(`/master/paket-sarpras/${encodeURIComponent(code)}`, finalPayload);
    return extractData<{ message: string }>(response);
  },

  async deletePaket(code: string): Promise<{ message: string }> {
    const response = await api.delete(`/master/paket-sarpras/${encodeURIComponent(code)}`);
    return extractData<{ message: string }>(response);
  },

  async updatePaketStatus(code: string, isActive: boolean): Promise<{ message: string }> {
    const response = await api.put(`/master/paket-sarpras/${encodeURIComponent(code)}/status`, {
      is_active: isActive,
    });
    return extractData<{ message: string }>(response);
  },

  async getDokumenDetail(code: string): Promise<MasterDokumenCatalog | null> {
    const response = await api.get(`/master/dokumen-persyaratan/${encodeURIComponent(code)}`);
    return extractData<MasterDokumenCatalog>(response);
  },

  async createDokumen(payload: {
    code: string;
    name: string;
    description?: string;
    format_download_url?: string;
    allowed_mime_types?: string;
    max_size_bytes?: number;
    is_active?: boolean;
    is_wajib?: boolean;
  }): Promise<{ message: string }> {
    const response = await api.post('/master/dokumen-persyaratan', payload);
    return extractData<{ message: string }>(response);
  },

  async updateDokumen(
    code: string,
    payload: {
      name?: string;
      description?: string;
      format_download_url?: string;
      allowed_mime_types?: string;
      max_size_bytes?: number;
      is_active?: boolean;
      is_wajib?: boolean;
    }
  ): Promise<{ message: string }> {
    const response = await api.put(`/master/dokumen-persyaratan/${encodeURIComponent(code)}`, payload);
    return extractData<{ message: string }>(response);
  },

  async deleteDokumen(code: string): Promise<{ message: string }> {
    const response = await api.delete(`/master/dokumen-persyaratan/${encodeURIComponent(code)}`);
    return extractData<{ message: string }>(response);
  },

  async updateDokumenStatus(code: string, isActive: boolean): Promise<{ message: string }> {
    const response = await api.put(`/master/dokumen-persyaratan/${encodeURIComponent(code)}/status`, {
      is_active: isActive,
    });
    return extractData<{ message: string }>(response);
  },
};



