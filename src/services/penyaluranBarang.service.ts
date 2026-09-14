import api from './api';
import type { PermohonanPenyaluranBarang } from '@/types/penyaluranBarang';

export interface GoodsDistributionListParams {
  page?: number;
  limit?: number;
  proposal_id?: number | string;
  status?: string;
  search?: string;
}

export interface GoodsDistributionListResponse {
  data: PermohonanPenyaluranBarang[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export const penyaluranBarangService = {
  async getList(params?: GoodsDistributionListParams): Promise<GoodsDistributionListResponse> {
    const response: any = await api.get('/goods-distributions', { params });
    return {
      data: response?.data || [],
      meta: response?.meta || { page: 1, limit: 20, total: (response?.data || []).length },
    };
  },

  async getById(id: string | number): Promise<PermohonanPenyaluranBarang> {
    const response: any = await api.get(`/goods-distributions/${id}`);
    return response?.data ?? response;
  },

  async create(payload: {
    proposal_id: number;
    kategori_paket?: string;
    items: Array<{
      rab_item_id?: number;
      jenis_barang: string;
      nama_barang: string;
      varietas?: string;
      nama_barang_varietas?: string;
      jumlah_tahap_1?: number | null;
      jumlah_tahap_2?: number | null;
      jumlah: number;
      satuan: string;
      estimasi_harga_satuan: number;
      estimasi_total: number;
    }>;
  }): Promise<PermohonanPenyaluranBarang> {
    const response: any = await api.post('/goods-distributions', payload);
    return response?.data ?? response;
  },

  async submit(id: string | number, suratPermohonanFileId?: number): Promise<PermohonanPenyaluranBarang> {
    const response: any = await api.post(`/goods-distributions/${id}/submit`, {
      surat_permohonan_file_id: suratPermohonanFileId,
    });
    return response?.data ?? response;
  },

  async verify(
    id: string | number,
    payload: {
      is_approved: boolean;
      catatan: string;
      nota_dinas_file_id?: number;
    }
  ): Promise<PermohonanPenyaluranBarang> {
    const response: any = await api.post(`/goods-distributions/${id}/verify`, payload);
    return response?.data ?? response;
  },

  async dispositionPpk(
    id: string | number,
    payload: {
      jalur_pengadaan: 'ULP_TENDER' | 'PENGADAAN_LANGSUNG';
      catatan?: string;
    }
  ): Promise<PermohonanPenyaluranBarang> {
    const response: any = await api.post(`/goods-distributions/${id}/disposition-ppk`, payload);
    return response?.data ?? response;
  },

  async startTender(id: string | number): Promise<PermohonanPenyaluranBarang> {
    const response: any = await api.post(`/goods-distributions/${id}/start-tender`);
    return response?.data ?? response;
  },

  async finishTender(
    id: string | number,
    payload: {
      pemenang_vendor: string;
      nilai_pemenang_tender: number;
      tanggal_penetapan?: string;
      catatan?: string;
    }
  ): Promise<PermohonanPenyaluranBarang> {
    const response: any = await api.post(`/goods-distributions/${id}/finish-tender`, payload);
    return response?.data ?? response;
  },

  async saveContract(
    id: string | number,
    payload: {
      nomor_kontrak: string;
      nama_penyedia: string;
      total_nilai_kontrak: number;
      termin_pembayaran?: string;
      termin_penyaluran?: string;
      jangka_waktu_hari?: number;
      tanggal_mulai?: string;
      tanggal_selesai?: string;
      catatan?: string;
      dokumen_kontrak_file_id?: number;
    }
  ): Promise<PermohonanPenyaluranBarang> {
    const response: any = await api.post(`/goods-distributions/${id}/contract`, payload);
    return response?.data ?? response;
  },

  async assignSurveyor(
    id: string | number,
    payload: {
      nomor_surat: string;
      nama_lembaga_surveyor: string;
      lingkup_tugas?: string;
      tanggal_terbit?: string;
      dokumen_surat_file_id?: number;
      surveyor_id?: number;
    }
  ): Promise<PermohonanPenyaluranBarang> {
    const response: any = await api.post(`/goods-distributions/${id}/assign-surveyor`, payload);
    return response?.data ?? response;
  },

  async completeMonitoring(
    id: string | number,
    payload: {
      bast_document_file_id?: number;
      bast_date?: string;
      catatan?: string;
    }
  ): Promise<PermohonanPenyaluranBarang> {
    const response: any = await api.post(`/goods-distributions/${id}/complete-monitoring`, payload);
    return response?.data ?? response;
  },

  async syncProposals(): Promise<{ message: string; count: number }> {
    const response: any = await api.post('/goods-distributions/sync-proposals');
    return response?.data ?? response;
  },
};
