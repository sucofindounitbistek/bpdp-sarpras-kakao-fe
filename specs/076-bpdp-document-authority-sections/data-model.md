# Data Model: Section Kategori Sumber & Kewenangan Dokumen BPDP

**Feature**: `076-bpdp-document-authority-sections`
**Date**: 2026-09-08

## 1. Type Definitions

```typescript
export type AuthorityTier = 'KABUPATEN' | 'PROVINSI' | 'DITJENBUN' | 'BPDP';

export interface AuthoritySectionMeta {
  id: AuthorityTier;
  title: string;
  roleLabel: string;
  description: string;
  badgeClass: string;
  iconName: string;
}

export interface DocumentValidationItem {
  key: string;
  title: string;
  subtitle: string;
  state: {
    docId?: number;
    valid: boolean | null;
    note: string;
    url: string;
    fileName?: string;
  };
  authorityTier: AuthorityTier;
}

export interface AuthorityGroupedSection {
  meta: AuthoritySectionMeta;
  documents: DocumentValidationItem[];
  totalDocs: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
}
```

## 2. Static Authority Configuration Mapping

```typescript
export const AUTHORITY_CONFIG: Record<AuthorityTier, AuthoritySectionMeta> = {
  KABUPATEN: {
    id: 'KABUPATEN',
    title: 'Dinas Kabupaten / Kota',
    roleLabel: 'Dinas Kabupaten/Kota',
    description: 'Kewenangan verifikasi dokumen usulan, penetapan SK CPCL, verifikasi lapangan, dan RAB Final',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
    iconName: 'Building2',
  },
  PROVINSI: {
    id: 'PROVINSI',
    title: 'Dinas Provinsi',
    roleLabel: 'Dinas Provinsi',
    description: 'Kewenangan penelaahan tingkat provinsi dan penerbitan Surat Pengantar ke Ditjenbun',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
    iconName: 'Compass',
  },
  DITJENBUN: {
    id: 'DITJENBUN',
    title: 'Ditjen Perkebunan (Ditjenbun)',
    roleLabel: 'Ditjenbun Kementan',
    description: 'Kewenangan verifikasi teknis nasional dan penerbitan Rekomendasi Teknis (REKOMTEK)',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800',
    iconName: 'Award',
  },
  BPDP: {
    id: 'BPDP',
    title: 'Badan Pengelola Dana Perkebunan (BPDP)',
    roleLabel: 'BPDP Verifikator / Approval',
    description: 'Kewenangan penelitian kepatuhan, penetapan kelayakan penyaluran dana, dan SK Dirut',
    badgeClass: 'bg-emerald-50 text-[#066C2A] border-emerald-250 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
    iconName: 'FileCheck2',
  },
};
```

## 3. Document to Authority Mapping

| Key Dokumen | Nama Dokumen | Instansi Penerbit (Authority Tier) |
|---|---|---|
| `rabFinal` | Rencana Anggaran Biaya (RAB) Final | `KABUPATEN` |
| `skCpcl` | Surat Keputusan Penetapan CPCL | `KABUPATEN` |
| `baVerifikasi` | Berita Acara Hasil Penelitian Dokumen | `KABUPATEN` |
| `baVerifikasiLapangan` | Berita Acara Verifikasi Lapangan | `KABUPATEN` |
| `suratPengantarProv` | Surat Pengantar SK CPCL | `PROVINSI` |
| `rekomtek` | Rekomendasi Teknis (REKOMTEK) | `DITJENBUN` |
| `kelayakan` | Laporan Keputusan Hasil Penelitian Rekomtek | `BPDP` |
