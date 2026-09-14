export type PaketKategori = 'Ekstensifikasi' | 'Intensifikasi';

export type StatusPermohonanBarang =
  | 'DRAFT'
  | 'MENUNGGU_VERIFIKASI_TEKNIS'
  | 'PERLU_REVISI'
  | 'DISPOSISI_PPK'
  | 'DISPOSISI_ULP'
  | 'PROSES_PEMILIHAN_PENYEDIA'
  | 'PENETAPAN_PEMENANG'
  | 'PROSES_PELAKSANAAN_KONTRAK'
  | 'SURVEYOR_DITUGASKAN'
  | 'SELESAI';

export interface ItemPreferensiRAB {
  id: string;
  jenisBarang: string; // e.g. 'Benih', 'Pupuk', 'Pestisida', 'Peralatan'
  namaBarang: string; // e.g. 'Benih Kelapa', 'Pupuk Majemuk', 'Herbisida'
  varietas: string; // e.g. 'Kelapa Genjah Kuning', 'NPK 15-15-15', 'Glifosat 480 SL'
  namaBarangVarietas?: string; // fallback
  jumlahTahap1?: number | null;
  jumlahTahap2?: number | null;
  jumlah: number;
  satuan: string; // e.g. 'Btg', 'Kg', 'Liter', 'Unit', 'Paket'
  estimasiHargaSatuan: number;
  estimasiTotal: number;
}

export interface DokumenKontrakA {
  nomorKontrak: string;
  dokumenKontrakNamaFile: string;
  dokumenKontrakUrl: string;
  namaPenyedia: string;
  jenisBarang: string;
  jumlahBarang: number;
  satuanBarang: string;
  hargaSatuan: number;
  totalNilaiKontrak: number;
  terminPembayaran: string; // e.g. 'Termin 1: 30% Uang Muka, Termin 2: 70% BASTP'
  terminPenyaluran: string; // e.g. 'Tahap 1: 50% Pengiriman Gudang Pekebun, Tahap 2: 50% Distribusi'
  jangkaWaktuHari: number; // e.g. 60 (hari kalender)
  tanggalMulai: string;
  tanggalSelesai: string;
  catatan?: string;
}

export interface SuratTugasSurveyor {
  nomorSurat: string;
  namaLembagaSurveyor: string;
  lingkupTugas: string; // e.g. 'Sampling Mutu Fisik Barang & Pengawasan Titik Distribusi'
  tanggalTerbit: string;
  dokumenSuratUrl: string;
  status: 'DITERBITKAN' | 'SELESAI_MONITORING';
}

export interface PermohonanPenyaluranBarang {
  id: string;
  proposalId?: string;
  nomorPermohonan: string;
  namaLembagaPekebun: string;
  namaKetua: string;
  kontak: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kategoriPaket: PaketKategori;
  itemsRAB: ItemPreferensiRAB[];
  suratPermohonanUrl?: string;
  suratPermohonanNamaFile?: string;
  tanggalPengajuan?: string;

  // Nota Dinas BPDP Teknis
  notaDinasUrl?: string;
  notaDinasNamaFile?: string;
  
  // Workflow States
  status: StatusPermohonanBarang;
  catatanVerifikasiTeknis?: string;
  catatanPpk?: string;
  catatanUlp?: string;
  
  // PPK & ULP Disposisi
  jalurPengadaan?: 'ULP_TENDER' | 'PENGADAAN_LANGSUNG';
  pemenangVendor?: string;
  nilaiPemenangTender?: number;
  tanggalPenetapanPemenang?: string;
  
  // Kontrak & Penugasan
  dokumenKontrak?: DokumenKontrakA;
  suratTugasSurveyor?: SuratTugasSurveyor;
  
  createdAt: string;
  updatedAt: string;
}
