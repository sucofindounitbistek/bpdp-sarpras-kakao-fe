# Contracts: Penyaluran Barang (Ekstensifikasi & Intensifikasi) API

**Feature**: `045-penyaluran-barang-ekstensifikasi-intensifikasi`
**Date**: 2026-08-27
**Type**: Frontend Pinia Mock Service & Backend Contract Projection

---

## 1. Local Store Interface Contract

```typescript
export interface PenyaluranBarangStoreState {
  permohonanList: PermohonanPenyaluranBarang[];
  activePermohonanId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface PenyaluranBarangActions {
  // Pekebun
  createPermohonan(data: Partial<PermohonanPenyaluranBarang>): Promise<PermohonanPenyaluranBarang>;
  updatePermohonan(id: string, data: Partial<PermohonanPenyaluranBarang>): Promise<void>;
  submitPermohonan(id: string, suratUrl: string, fileName: string): Promise<void>;
  
  // Verifikator (Teknis)
  verifikasiPermohonan(id: string, isApproved: boolean, catatan: string): Promise<void>;
  simpanKontrakDokumenA(id: string, kontrakData: DokumenKontrakA): Promise<void>;
  terbitkanSuratTugasSurveyor(id: string, surveyorData: SuratTugasSurveyor): Promise<void>;
  
  // PPK
  disposisiPpk(id: string, jalur: 'ULP_TENDER' | 'PENGADAAN_LANGSUNG', catatan: string): Promise<void>;
  
  // ULP
  mulaiPemilihanPenyedia(id: string): Promise<void>;
  selesaikanTender(id: string, vendorName: string, nilaiTender: number, catatan: string): Promise<void>;
  
  // Helper
  resetToInitialDemo(): void;
}
```

---

## 2. Target Backend API Projections (Future Integration)

| Method | Endpoint | Deskripsi | Role |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/penyaluran-barang/permohonan` | Ambil daftar permohonan | ALL |
| `POST` | `/api/v1/penyaluran-barang/permohonan` | Buat permohonan baru | PEMOHON |
| `POST` | `/api/v1/penyaluran-barang/permohonan/:id/submit` | Upload surat & kirim ke BPDP | PEMOHON |
| `POST` | `/api/v1/penyaluran-barang/permohonan/:id/verifikasi-teknis` | Approval / Revisi nota dinas | BPDP_VERIFIKATOR |
| `POST` | `/api/v1/penyaluran-barang/permohonan/:id/disposisi-ppk` | Disposisi ke ULP / Pengadaan Langsung | BPDP_PPK |
| `POST` | `/api/v1/penyaluran-barang/permohonan/:id/tender-status` | Update tender & pemenang | BPDP_ULP |
| `POST` | `/api/v1/penyaluran-barang/permohonan/:id/kontrak-a` | Simpan Dokumen Kontrak "A" | BPDP_VERIFIKATOR |
| `POST` | `/api/v1/penyaluran-barang/permohonan/:id/surat-tugas` | Terbitkan surat tugas surveyor | BPDP_VERIFIKATOR |
