import { Coords, JenisLegalitas } from './pekebun';

export enum TipeDokumenLahan {
  SCAN_LEGALITAS = 'SCAN_LEGALITAS',
  SURAT_KETERANGAN_BEDA_NAMA = 'SURAT_KETERANGAN_BEDA_NAMA',
}

export interface LahanDocument {
  id: string;
  tipeDokumen: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  createdAt: string;
}

export interface Lahan {
  id: string;
  pekebunId: string;
  jenisLegalitas: JenisLegalitas;
  nomorLegalitas: string;
  tanggalPenerbitanLegalitas: string;
  luasLahan: number;
  provinsiKode: string;
  kabupatenKode: string;
  kecamatanKode: string;
  desaKode: string;
  provinsiNama?: string;
  kabupatenNama?: string;
  kecamatanNama?: string;
  desaNama?: string;
  alamatKebun: string;
  tahunTanam: number;
  jenisBibit: string;
  nomorSuratBedaNama?: string;
  coordinates: Coords[];
  dokumen: LahanDocument[];
  scanLegalitasUrl?: string;
  isInProposal?: boolean;
  proposalStatus?: string | null;
  paketProposal?: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface DocumentResponse {
  id: number;
  file_id: number;
  document_type: string;
  file_name: string;
  file_url: string;
  file_size?: number;
  file_extension?: string;
  mime_type?: string;
  created_at?: string;
  updated_at?: string;
}

export interface LahanResponse {
  id: number;
  pekebun_id: number;
  jenis_legalitas: string;
  nomor_legalitas: string;
  tanggal_penerbitan_legalitas: string;
  luas_lahan: number;
  kode_provinsi: string;
  kode_kabupaten: string;
  kode_kecamatan: string;
  kode_desa: string;
  alamat_kebun: string;
  tahun_tanam: number;
  jenis_bibit: string;
  nomor_surat_beda_nama: string | null;
  coordinates: Coords[] | { lat: number; lng: number }[];
  documents: DocumentResponse[];
  is_in_proposal?: boolean;
  proposal_status?: string | null;
  paket_proposal?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PekebunSimplifiedResponse {
  id: number;
  kelembagaan_id: string;
  nik: string;
  name: string | null;
  nomor_kk: string | null;
  marriage_status?: string;
  place_of_birth?: string;
  date_of_birth?: string;
  address: string;
  postcode?: string;
  phone_number: string;
  is_draft?: boolean;
  lahans: LahanResponse[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}
