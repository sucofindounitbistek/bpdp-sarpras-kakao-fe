# Contract: Integrasi Penyaluran Barang dari Proposal

**Feature**: `050-penyaluran-from-proposal`
**Date**: 2026-08-28

## Store Interface Contract

### Pinia Store: `usePenyaluranBarangStore`

```typescript
interface PenyaluranBarangState {
  permohonanList: Ref<PermohonanPenyaluranBarang[]>;
  activePermohonanId: Ref<string | null>;
  isLoading: Ref<boolean>;
}

interface PenyaluranBarangActions {
  // Sinkronisasi proposal yang berstatus SELESAI menjadi item penyaluran DRAFT
  syncCompletedProposals(completedProposals: Proposal[]): void;

  // Aksi pekebun mengajukan penyaluran (DRAFT -> MENUNGGU_VERIFIKASI_TEKNIS)
  ajukanPenyaluran(id: string): void;

  // Verifikasi teknis BPDP
  verifikasiTeknis(id: string, isApproved: boolean, catatan: string): void;

  // Disposisi PPK
  disposisiPpk(id: string, jalur: 'ULP_TENDER' | 'PENGADAAN_LANGSUNG', catatan: string): void;

  // Tender ULP
  mulaiTenderUlp(id: string): void;
  selesaikanTenderUlp(id: string, vendor: string, nilaiTender: number, catatan: string): void;

  // Kontrak & Surveyor
  simpanDokumenKontrakA(id: string, kontrak: DokumenKontrakA): void;
  terbitkanSuratTugasSurveyor(id: string, surveyor: SuratTugasSurveyor): void;
  selesaikanSurveyorMonitoring(id: string): void;
}
```

## UI Component Event Contract

### `PekebunPermohonanBarangView.vue`

- **Tombol Aksi**:
  - `Ajukan Penyaluran` (hanya tampil jika `item.status === 'DRAFT'`):
    - Memicu konfirmasi modal / toast dialog.
    - Memanggil `store.ajukanPenyaluran(item.id)`.
    - Menampilkan notifikasi sukses pengajuan.
  - `Detail` (tampil untuk semua status):
    - Membuka modal detail item penyaluran.
