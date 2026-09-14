import api from './api';

export interface ProfileSummaryMetrics {
  jumlah_anggota: number;
  total_lahan_ha: number;
}

export interface LegalitasDocumentItem {
  id?: number;
  document_type: string;
  title: string;
  file_name?: string;
  file_url?: string;
  status: string;
}

export interface ProfileKelembagaanData {
  id: number;
  nama_lembaga: string;
  jenis_lembaga: string;
  nomor_akta: string;
  nib?: string;
  npwp?: string;
  tanggal_berdiri?: string;
  ketua_nama: string;
  ketua_nik: string;
  telepon: string;
  email: string;
  alamat_lengkap: string;
  provinsi?: string;
  kabupaten?: string;
  kecamatan?: string;
  desa?: string;
  bank_nama?: string;
  bank_rekening?: string;
  bank_atas_nama?: string;
  status_akun: string;
  status?: string; // "SYNC_PENDING"
  message?: string;
  metrik: ProfileSummaryMetrics;
  dokumen_legalitas: LegalitasDocumentItem[];
}

export interface ProfileKelembagaanResponse {
  data: ProfileKelembagaanData;
  message: string;
}

export const kelembagaanService = {
  async getProfile(kelembagaanId?: number): Promise<ProfileKelembagaanResponse | null> {
    try {
      const url = kelembagaanId ? `/profile-kelembagaan?kelembagaan_id=${kelembagaanId}` : '/profile-kelembagaan';
      const response: any = await api.get(url);
      return response;
    } catch (error) {
      console.error('Failed to fetch profile kelembagaan:', error);
      throw error;
    }
  },
};
