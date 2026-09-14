# Data Model: Frontend Master Data Paket Sarpras Types

**Feature**: `072-master-paket-sarpras-integration`
**Date**: 2026-09-03

## TypeScript Interfaces (`src/types/masterSarpras.ts`)

```typescript
export interface MasterKategoriSarpras {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  sort_order: number;
  is_active: boolean;
}

export interface SyaratMinimumRule {
  minimal_pekebun: number | null;
  minimal_luas_ha: number | null;
  jarak_antar_kebun_km: number | null;
  kondisi_validasi: 'OR' | 'AND' | string;
  keterangan?: string | null;
}

export interface MasterPaketSarpras {
  id: number;
  kategori_id: number;
  kategori_code: string;
  code: string;
  name: string;
  label: string;
  description?: string | null;
  icon?: string | null;
  is_pupuk: boolean;
  sort_order: number;
  is_active: boolean;
  syarat_minimum?: SyaratMinimumRule | null;
}

export interface DokumenPersyaratanItem {
  id: number;
  dokumen_code: string;
  nama: string;
  description?: string | null;
  format_download_url?: string | null;
  allowed_mime_types?: string | null;
  max_size_bytes: number;
  is_wajib: boolean;
  sort_order: number;
  keterangan?: string | null;
}

export interface MasterDokumenCatalog {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  format_download_url?: string | null;
  allowed_mime_types?: string | null;
  max_size_bytes: number;
  is_active: boolean;
}

export interface MasterSyaratLahan {
  id: number;
  jenis_hak_lahan: string;
  nama_hak: string;
  is_active: boolean;
  deskripsi?: string | null;
  dokumen_wajib?: string | null;
  butuh_surat_beda_nama: boolean;
}

export interface MasterPaketGroup {
  name: string;
  icon: string;
  description: string;
  options: MasterPaketSarpras[];
}
```
