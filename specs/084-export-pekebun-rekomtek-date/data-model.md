# Data Model: Penambahan Kolom Tanggal dan Tahun Terbit Rekomtek pada Ekspor Data Ditjenbun & Excel Pekebun

**Feature Directory**: `specs/084-export-pekebun-rekomtek-date/`  
**Date**: 2026-09-14  
**Status**: Completed  

---

## 1. Entity Extensions & Context Attributes

### Usulan / Proposal Context (`ExportPekebunContext`)

Menambahkan atribut tanggal terbit Rekomtek pada interface konteks ekspor data:

```typescript
export interface ExportPekebunContext {
  proposal?: {
    id?: string | number;
    nomor_proposal?: string;
    nomorProposal?: string;
    nomorUsulan?: string;
    no_rekomtek?: string;
    tanggal_rekomtek?: string;        // [NEW] ISO string atau YYYY-MM-DD saat generate
    tanggalRekomtek?: string;         // [NEW] Alias camelCase
    rekomtek?: {
      nomorRekomtek?: string;
      tanggalTerbit?: string;         // [NEW] Tanggal resmi penerbitan Rekomtek
      uploadedAt?: string;
      signedUrl?: string;
    };
    documents?: Array<{
      id: number;
      document_type: string;
      created_at?: string;
      file?: {
        url?: string;
        original_name?: string;
      };
    }>;
    lembaga?: { namaLembaga?: string };
    kelembagaan?: { nama_lembaga?: string; provinsi?: string; kabupaten?: string };
    namaKelompokTani?: string;
    nama_dinas_provinsi?: string;
    nama_dinas_kabupaten?: string;
    pekebuns?: any[];
    lahans?: any[];
  };
  pekebuns?: any[];
  lahans?: any[];
}
```

---

## 2. Helper Resolusi Tanggal & Tahun Terbit Rekomtek

```typescript
export interface RekomtekDateInfo {
  tanggalFormatted: string; // "DD-MM-YYYY" atau "-"
  tahun: string;            // "YYYY" atau "-"
}

/**
 * Ekstraksi Tanggal dan Tahun Terbit Rekomtek dari usulan/proposal
 */
export function resolveRekomtekDateInfo(proposal: any): RekomtekDateInfo {
  if (!proposal) {
    return { tanggalFormatted: '-', tahun: '-' };
  }

  // 1. Cek dari atribut tanggal_rekomtek tersimpan
  const rawDate =
    proposal.tanggal_rekomtek ||
    proposal.tanggalRekomtek ||
    proposal.rekomtek?.tanggalTerbit ||
    proposal.rekomtek?.uploadedAt;

  if (rawDate) {
    const d = new Date(rawDate);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear());
      return {
        tanggalFormatted: `${day}-${month}-${year}`,
        tahun: year,
      };
    }
  }

  // 2. Cek dari dokumen bertipe REKOMTEK
  const docs = proposal.documents || proposal.dokumen || [];
  const rekomtekDoc = docs.find((doc: any) =>
    String(doc.document_type || doc.documentType || '').toUpperCase().includes('REKOMTEK')
  );

  if (rekomtekDoc?.created_at || rekomtekDoc?.uploaded_at) {
    const docDateStr = rekomtekDoc.created_at || rekomtekDoc.uploaded_at;
    const d = new Date(docDateStr);
    if (!isNaN(d.getTime())) {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear());
      return {
        tanggalFormatted: `${day}-${month}-${year}`,
        tahun: year,
      };
    }
  }

  // 3. Fallback jika belum pernah di-generate / belum ada Rekomtek
  return { tanggalFormatted: '-', tahun: '-' };
}
```

---

## 3. Struktur Spreadsheet Output Data

### A. Laporan Titik Koordinat (16 Kolom)

| Indeks Kolom | Nama Header | Tipe Data | Style Sel | Contoh Nilai |
|:---:|---|:---:|:---:|---|
| 1 | `No` | Number | CenterCell | `1` |
| 2 | `Nomor Proposal` | String | TextCell | `PROP-2026-081` |
| 3 | `Provinsi` | String | TextCell | `RIAU` |
| 4 | `Kabupaten` | String | TextCell | `SIAK` |
| 5 | `Nama Kelembagaan Pekebun` | String | TextCell | `KT Sawit Makmur` |
| 6 | `Nama Pekebun` | String | TextCell | `Ahmad Dahlan` |
| 7 | `NIK Pekebun` | String | CenterCell | `1408012304850001` |
| 8 | `Luas Lahan (Ha)` | Number | NumberCell | `2.50` |
| 9 | `Jenis Legalitas (SHM atau SKT/GIRIK/SPORADIK)` | String | CenterCell | `SHM` |
| 10 | `Nama Tertera di SHM` | String | TextCell | `Ahmad Dahlan` |
| 11 | `Nomor SHM` | String | CenterCell | `SHM-98214` |
| 12 | `Nomor SKT/GIRIK/SPORADIK` | String | CenterCell | `-` |
| 13 | **`Tanggal Terbit Rekomtek`** | String | CenterCell | `14-09-2026` |
| 14 | **`Tahun Terbit Rekomtek`** | String | CenterCell | `2026` |
| 15 | `Latitude` | Number | CoordCell | `0.85412900` |
| 16 | `Longitude` | Number | CoordCell | `101.98234100` |

---

### B. Laporan Profil Pekebun (12 Kolom)

| Indeks Kolom | Nama Header | Tipe Data | Style Sel | Contoh Nilai |
|:---:|---|:---:|:---:|---|
| 1 | `No` | Number | CenterCell | `1` |
| 2 | `Nama Pekebun` | String | TextCell | `Ahmad Dahlan` |
| 3 | `NIK Pekebun` | String | CenterCell | `1408012304850001` |
| 4 | `KK Pekebun` | String | CenterCell | `1408012304850002` |
| 5 | `Alamat Pekebun` | String | TextCell | `Jl. Sawit Indah No. 12` |
| 6 | `Jenis Legalitas` | String | CenterCell | `SHM` |
| 7 | `No / Nama Dokumen Legalitas Lahan` | String | CenterCell | `SHM-98214` |
| 8 | `Tanggal Terbit Legalitas Lahan` | String | CenterCell | `10-02-2021` |
| 9 | `Luas Lahan Sesuai Legalitas (Ha)` | Number | NumberCell | `2.50` |
| 10 | `Luas Lahan (Ha)` | Number | NumberCell | `2.50` |
| 11 | **`Tanggal Terbit Rekomtek`** | String | CenterCell | `14-09-2026` |
| 12 | **`Tahun Terbit Rekomtek`** | String | CenterCell | `2026` |

---

### C. Penarikan Data Daftar Usulan Proposal Ditjenbun (`exportProposal.ts`)

| Indeks Kolom | Nama Header | Format | Contoh Nilai |
|:---:|---|---|---|
| 1 | `No.` | Integer | `1` |
| 2 | `Nomor Proposal` | String | `PROP-2026-081` |
| 3 | `Nama Lembaga / Pemohon` | String | `KT Sawit Makmur` |
| 4 | `Paket Sarpras` | String | `Ekstensifikasi` |
| 5 | `Total Anggaran` | Currency Rupiah | `Rp 125.000.000` |
| 6 | `Status` | String | `Disetujui Ditjenbun (Kirim BPDP)` |
| 7 | `No. Rekomtek` | String | `124/PI.400/E/09/2026` |
| 8 | **`Tanggal Terbit Rekomtek`** | String (`DD-MM-YYYY`) | `14-09-2026` |
| 9 | **`Tahun Terbit Rekomtek`** | String (`YYYY`) | `2026` |
| 10 | `Tanggal Pengajuan` | String (`DD-MM-YYYY`) | `01-08-2026` |
