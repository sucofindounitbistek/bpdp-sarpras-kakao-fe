# Interface Contract: Export Rekomtek Date & Year Columns

**Feature Directory**: `specs/084-export-pekebun-rekomtek-date/`  
**Date**: 2026-09-14  
**Status**: Completed  

---

## 1. Frontend Function Signature Contracts

### `exportLaporanTitikKoordinat`
- **File**: `src/utils/exportPekebunExcel.ts`
- **Signature**:
  ```typescript
  export function exportLaporanTitikKoordinat(
    context: ExportPekebunContext,
    customFilename?: string
  ): string
  ```
- **Output**: File XML Spreadsheet (.xls) dengan **16 kolom**.
- **Headers Array**:
  ```typescript
  const headers = [
    'No',
    'Nomor Proposal',
    'Provinsi',
    'Kabupaten',
    'Nama Kelembagaan Pekebun',
    'Nama Pekebun',
    'NIK Pekebun',
    'Luas Lahan (Ha)',
    'Jenis Legalitas (SHM atau SKT/GIRIK/SPORADIK)',
    'Nama Tertera di SHM',
    'Nomor SHM',
    'Nomor SKT/GIRIK/SPORADIK',
    'Tanggal Terbit Rekomtek',
    'Tahun Terbit Rekomtek',
    'Latitude',
    'Longitude',
  ];
  ```

---

### `exportLaporanProfilPekebun`
- **File**: `src/utils/exportPekebunExcel.ts`
- **Signature**:
  ```typescript
  export function exportLaporanProfilPekebun(
    context: ExportPekebunContext,
    customFilename?: string
  ): string
  ```
- **Output**: File XML Spreadsheet (.xls) dengan **12 kolom**.
- **Headers Array**:
  ```typescript
  const headers = [
    'No',
    'Nama Pekebun',
    'NIK Pekebun',
    'KK Pekebun',
    'Alamat Pekebun',
    'Jenis Legalitas',
    'No / Nama Dokumen Legalitas Lahan',
    'Tanggal Terbit Legalitas Lahan',
    'Luas Lahan Sesuai Legalitas (Ha)',
    'Luas Lahan (Ha)',
    'Tanggal Terbit Rekomtek',
    'Tahun Terbit Rekomtek',
  ];
  ```

---

### `exportProposalsToCsv` & `exportProposalsToPdf`
- **File**: `src/utils/exportProposal.ts`
- **CSV Headers**:
  ```typescript
  const headers = [
    'No.',
    'Nomor Proposal',
    'Nama Lembaga / Pemohon',
    'Paket Sarpras',
    'Total Anggaran',
    'Status',
    'No. Rekomtek',
    'Tanggal Terbit Rekomtek',
    'Tahun Terbit Rekomtek',
    'Tanggal Pengajuan',
  ];
  ```

---

## 2. Dropdown UI Contract (`DropdownEksporPekebun.vue`)

- Tombol dropdown aksi ekspor data pekebun memiliki 2 item menu dengan label deskripsi yang diperbarui:
  1. **1. Laporan Titik Koordinat**: `16 kolom, koordinat per titik poligon lahan`
  2. **2. Laporan Profil Pekebun**: `12 kolom, NIK, KK, alamat & legalitas`
