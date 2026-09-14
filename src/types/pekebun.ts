// ─── Region Types ─────────────────────────────────────────────────────────────
export * from './region';

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum JenisLegalitas {
  SHM = 'SHM',
  NON_SHM = 'NON_SHM',
}

export enum JenisKelamin {
  LAKI_LAKI = 'LAKI_LAKI',
  PEREMPUAN = 'PEREMPUAN',
}

export enum StatusPernikahan {
  BELUM_MENIKAH = 'BELUM_MENIKAH',
  MENIKAH = 'MENIKAH',
  CERAI_HIDUP = 'CERAI_HIDUP',
  CERAI_MATI = 'CERAI_MATI',
}

export enum WilayahLevel {
  PROVINSI = 'PROVINSI',
  KABUPATEN = 'KABUPATEN',
  KECAMATAN = 'KECAMATAN',
  DESA = 'DESA',
}

export enum TipeDokumenPekebun {
  SCAN_KTP = 'SCAN_KTP',
  SCAN_KK = 'SCAN_KK',
  SWAFOTO = 'SWAFOTO',
  SURAT_KUASA = 'SURAT_KUASA',
}

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface WilayahItem {
  kode: string;
  nama: string;
  parentKode: string | null;
  level: WilayahLevel;
}

export interface DokumenPekebun {
  id: string;
  documentType: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileExtension: string;
}

export interface LahanDocument {
  id: string;
  tipeDokumen: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  createdAt: string;
}

export interface LahanPekebun {
  id: string;
  pekebunId: string;
  jenisLegalitas: JenisLegalitas;
  nomorLegalitas: string;
  tanggalPenerbitanLegalitas: string; // ISO date
  luasLahan: number; // hectares
  provinsiKode: string;
  provinsiNama: string;
  kabupatenKode: string;
  kabupatenNama: string;
  kecamatanKode: string;
  kecamatanNama: string;
  desaKode: string;
  desaNama: string;
  alamatKebun: string;
  tahunTanam: number;
  jenisBibit: string;
  scanLegalitasUrl: string;
  nomorSuratBedaNama?: string;
  coordinates: Coords[];
  dokumen?: LahanDocument[];
  isInProposal?: boolean;
  proposalStatus?: string | null;
  paketProposal?: string | null;
}

export interface Pekebun {
  id: string;
  kelembagaanId: string;
  nik: string;
  nama: string;
  nomorKK: string;
  statusPernikahan: StatusPernikahan;
  tempatLahir: string;
  tanggalLahir: string; // ISO date
  alamat: string;
  kodepos: string;
  nomorHP: string;
  dokumen: DokumenPekebun[];
  lahan: LahanPekebun;
  daftarLahan?: LahanPekebun[];
  isDraft?: boolean;
  isInProposal?: boolean;
  totalLuasLahan?: number;
  createdAt: string; // ISO datetime
  updatedAt?: string;
}

// ─── Form Data Interfaces ─────────────────────────────────────────────────────

export interface IdentitasFormData {
  nik: string;
  nama: string;
  nomorKK: string;
  jenisKelamin: JenisKelamin | '';
  statusPernikahan: StatusPernikahan | '';
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  kodepos: string;
  nomorHP: string;
  kelembagaanId?: string | number;
}

export interface DokumenFormData {
  scanKTP: File | DokumenPekebun | null;
  scanKK: File | DokumenPekebun | null;
  swafoto: File | DokumenPekebun | null;
  suratKuasa: File | DokumenPekebun | null;
}

export interface Coords {
  lat: number | null;
  lng: number | null;
}

export interface LahanFormData {
  jenisLegalitas: JenisLegalitas | '';
  nomorLegalitas: string;
  tanggalPenerbitanLegalitas: string;
  luasLahan: number | '';
  provinsiKode: string;
  kabupatenKode: string;
  kecamatanKode: string;
  desaKode: string;
  alamatKebun: string;
  tahunTanam: string;
  jenisBibit: string;
  scanLegalitas: File | DokumenPekebun | null;
  existingScanLegalitasUrl?: string;
  scanBedaNamaLahan?: File | DokumenPekebun | null;
  nomorSuratBedaNama?: string;
  coordinates: Coords[];
}
