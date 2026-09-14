# Data Model: Modul Penyaluran Barang (Ekstensifikasi & Intensifikasi)

**Feature**: `045-penyaluran-barang-ekstensifikasi-intensifikasi`
**Date**: 2026-08-27
**Status**: Ready

---

## 1. Type Definitions & Enums

```typescript
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
  jenisBarang: string; // e.g. 'Bibit / Benih Kelapa', 'Pupuk Organik', 'Alat Pascapanen'
  namaBarangVarietas: string; // e.g. 'Kelapa Kopyor Genjah', 'NPK 15-15-15'
  jumlah: number;
  satuan: string; // e.g. 'Batang', 'Kg', 'Liter', 'Unit'
  estimasiHargaSatuan?: number;
  estimasiTotal?: number;
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
  terminPembayaran: string; // e.g. 'Termin 1: 30%, Termin 2: 70%'
  terminPenyaluran: string; // e.g. 'Tahap 1: 50% di Gudang Pekebun, Tahap 2: 50%'
  jangkaWaktuHari: number; // e.g. 60 (hari kalender)
  tanggalMulai: string;
  tanggalSelesai: string;
  catatan?: string;
}

export interface SuratTugasSurveyor {
  nomorSurat: string;
  namaLembagaSurveyor: string;
  lingkupTugas: string; // e.g. 'Sampling & Monitoring Mutu Spesifikasi Barang'
  tanggalTerbit: string;
  dokumenSuratUrl: string;
  status: 'DITERBITKAN' | 'SELESAI_MONITORING';
}

export interface PermohonanPenyaluranBarang {
  id: string;
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
```

---

## 2. State Machine & Transitions

```
[DRAFT] (Pekebun mengisi form & RAB)
   │
   ▼
[MENUNGGU_VERIFIKASI_TEKNIS] (Pekebun download & upload surat)
   │
   ├── (Verifikator: Tolak/Revisi) ──────────────┐
   │                                             ▼
   │                                      [PERLU_REVISI] (Kembali ke Pekebun)
   │                                             │
   │   (Pekebun submit ulang) ◄──────────────────┘
   ▼
[DISPOSISI_PPK] (Verifikator kirim Nota Dinas)
   │
   ├── (Nilai < 200 Juta) ──> [PENGADAAN_LANGSUNG]
   │
   ▼ (Nilai >= 200 Juta)
[DISPOSISI_ULP] (PPK Disposisi ke ULP)
   │
   ▼
[PROSES_PEMILIHAN_PENYEDIA] (ULP mulai tender e-catalog)
   │
   ▼
[PENETAPAN_PEMENANG] (ULP klik selesai tender)
   │
   ▼
[PROSES_PELAKSANAAN_KONTRAK] (Verifikator input & upload Dokumen Kontrak "A")
   │
   ▼
[SURVEYOR_DITUGASKAN] (Verifikator buat surat tugas sampling & monitoring)
```
