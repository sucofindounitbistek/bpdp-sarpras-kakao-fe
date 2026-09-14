# Data Model & Interfaces: Export Data Proposal Dinas Kabupaten Sesuai Wilayah Terkait

**Feature**: [`085-export-proposal-wilayah-kabupaten`](spec.md) | **Date**: 2026-09-14

---

## 1. Komponen Props: `ExportProposalModalProps`

Ekstensi interface props pada komponen [`src/components/pengusulan/ExportProposalModal.vue`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/components/pengusulan/ExportProposalModal.vue):

```typescript
export interface StatusOption {
  value: string;
  label: string;
}

export interface ExportProposalModalProps {
  isOpen: boolean;
  pageTitle?: string;
  sourceData?: any[];
  availableStatuses?: StatusOption[];
  defaultStatuses?: string[];
  searchQuery?: string;
  
  /**
   * (Baru) Nama wilayah kabupaten yang menjadi cakupan ekspor pengguna.
   * Contoh: "Kab. Luwu Utara" atau "Kota Bogor"
   */
  scopeRegionName?: string;

  /**
   * (Baru) ID numerik kabupaten pengguna dari IAM/SSO.
   * Contoh: 3201 atau 7322
   */
  scopeRegencyId?: number | string;
}
```

---

## 2. Parameter Query Ekspor: `ProposalExportQueryParams`

Ekstensi query parameters pada layanan [`src/services/proposal.service.ts`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/services/proposal.service.ts):

```typescript
export interface ProposalExportQueryParams {
  search?: string;
  status?: string | string[];
  start_date?: string;
  end_date?: string;
  paket_sarpras?: string;
  sort_by?: string;
  sort_order?: string;
  format?: 'csv' | 'json';
  
  /**
   * (Baru) ID kabupaten untuk filtering backend di masa mendatang
   */
  regency_id?: number | string;

  /**
   * (Baru) Nama kabupaten untuk filter pendukung
   */
  kabupaten?: string;
}
```

---

## 3. Spesifikasi Helper Pencocokan Wilayah: `matchesProposalRegion`

Fungsi helper baru di [`src/utils/regionHelper.ts`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/utils/regionHelper.ts):

```typescript
/**
 * Memvalidasi apakah usulan proposal cocok dengan wilayah kabupaten dinas terkait.
 * Mengimplementasikan Aturan Pencocokan Berlapis (Hybrid Matching Rule).
 */
export function matchesProposalRegion(
  item: any,
  targetRegencyId?: number | string | null,
  targetRegencyName?: string | null,
): boolean {
  // Jika tidak ada pembatasan wilayah (misal Ditjenbun/BPDP), seluruh usulan lolos
  if (!targetRegencyId && (!targetRegencyName || targetRegencyName.trim() === '')) {
    return true;
  }

  if (!item) return false;

  // 1. Verifikasi kecocokan ID / Kode Wilayah (jika tersedia)
  if (targetRegencyId) {
    const itemRegId = item.regency_id || item.regencyId || item.kode_kabupaten || item.kabupatenKode;
    if (itemRegId && String(itemRegId) === String(targetRegencyId)) {
      return true;
    }
  }

  // 2. Verifikasi kecocokan Nama Kabupaten via helper getKabupatenNama
  if (targetRegencyName && targetRegencyName.trim() !== '') {
    const itemKabNama = getKabupatenNama(item);
    const cleanTarget = normalizeRegionName(targetRegencyName);
    const cleanItem = normalizeRegionName(itemKabNama);

    if (cleanTarget && cleanItem && (cleanItem.includes(cleanTarget) || cleanTarget.includes(cleanItem))) {
      return true;
    }
  }

  return false;
}

/**
 * Normalisasi string nama wilayah untuk perbandingan tanpa sensitivitas kapital/prefix
 */
export function normalizeRegionName(name?: string | null): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .replace(/^kabupaten\s+/i, '')
    .replace(/^kab\.\s*/i, '')
    .replace(/^kota\s+/i, '')
    .trim();
}
```

---

## 4. State & Alur Transformasi Data Ekspor

```mermaid
graph TD
    A[Pengguna Buka ExportModal] --> B{Ada scopeRegionName / scopeRegencyId?}
    B -- Ya (Dinas Kab) --> C[Tampilkan Banner Cakupan Wilayah Terkunci]
    B -- Tidak (Ditjen/BPDP) --> D[Modal Standar Tanpa Banner Wilayah]
    
    C --> E[fetchMatchCount: proposalService.exportJson]
    E --> F[Penyaringan: list.filter(matchesProposalRegion)]
    F --> G[Update matchedCount = scopedList.length]
    
    G --> H[Pengguna Klik Ekspor: CSV atau PDF]
    H --> I[proposalService.exportJson]
    I --> J[Penyaringan: fullList.filter(matchesProposalRegion)]
    
    J --> K{Format Ekspor?}
    K -- CSV --> L[exportProposalsToCsv: Unduh CSV Bersih 100% Wilayah Terkait]
    K -- PDF --> M[exportProposalsToPdf: Cetak PDF Bersih 100% Wilayah Terkait]
```
