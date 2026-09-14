# Tasks: Fitur Ekspor Excel Data Pekebun & Lahan untuk Seluruh Validator

**Input**: Design documents from `specs/080-validator-export-pekebun-excel/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/export-contract.md`  
**Branch**: `080-validator-export-pekebun-excel`

---

## Format: `- [ ] [TaskID] [P?] [Story] Description with file path`

- **[P]**: Can run in parallel (independent files or components)
- **[Story]**: Belongs to user story:
  - **[US1]**: User Story 1 - Ekspor Laporan Titik Koordinat Excel per Proposal (P1)
  - **[US2]**: User Story 2 - Ekspor Laporan Profil Pekebun Excel per Proposal (P1)
  - **[US3]**: User Story 3 - Akses Terintegrasi Tombol Ekspor pada Seluruh Tingkat Validator (P2)

---

## Phase 1: Foundational (Excel Spreadsheet Generator Infrastructure)

**Purpose**: Fondasi pembangkit berkas spreadsheet XML/XLSX berstandar industri dengan styling header dan proteksi format string NIK/KK.

- [x] T001 [US1,US2] Implementasikan helper dasar XML Spreadsheet Excel (escape XML, pembentukan Workbook, Worksheet, Styles, header bold, text/number cell types) di `src/utils/exportPekebunExcel.ts`
- [x] T002 [P] [US1,US2] Buat unit test dasar generator spreadsheet di `src/utils/exportPekebunExcel.test.ts`

**Checkpoint**: Utility dasar generator spreadsheet siap digunakan oleh fungsi ekspor US1 dan US2.

---

## Phase 2: User Story 1 - Ekspor Laporan Titik Koordinat (Priority: P1) 🎯 MVP

**Goal**: Validator dapat mengunduh berkas Excel Laporan Titik Koordinat dengan 14 kolom terstruktur dan pemetaan 1 baris per titik koordinat sudut poligon.  
**Independent Test**: Panggil `exportLaporanTitikKoordinat` dengan mock data proposal berpoligon; pastikan berkas Excel yang dihasilkan memiliki 14 header kolom yang sesuai, N baris koordinat per titik sudut, dan NIK berformat teks.

- [x] T003 [US1] Implementasikan fungsi `exportLaporanTitikKoordinat` di `src/utils/exportPekebunExcel.ts` yang memetakan:
  - Header: `No`, `Nomor Proposal`, `Provinsi`, `Kabupaten`, `Nama Kelembagaan Pekebun`, `Nama Pekebun`, `NIK Pekebun`, `Luas Lahan (Ha)`, `Jenis Legalitas (SHM atau SKT/GIRIK/SPORADIK)`, `Nama Tertera di SHM`, `Nomor SHM`, `Nomor SKT/GIRIK/SPORADIK`, `Latitude`, `Longitude`
  - 1 baris per titik koordinat sudut poligon berurutan menggunakan `parseCoordinatePolygon`
  - Logika `Nama Tertera di SHM` (nama pekebun jika SHM sendiri, nama pemilik jika beda nama, strip `-` jika non-SHM)
  - Logika pemisahan `Nomor SHM` vs `Nomor SKT/GIRIK/SPORADIK`
- [x] T004 [US1] Tambahkan pengujian komprehensif untuk `exportLaporanTitikKoordinat` di `src/utils/exportPekebunExcel.test.ts`

**Checkpoint**: Laporan Titik Koordinat dapat digenerate dan diverifikasi secara independen.

---

## Phase 3: User Story 2 - Ekspor Laporan Profil Pekebun (Priority: P1) 🎯 MVP

**Goal**: Validator dapat mengunduh berkas Excel Laporan Profil Pekebun dengan 10 kolom terstruktur (1 baris per persil lahan milik pekebun).  
**Independent Test**: Panggil `exportLaporanProfilPekebun` dengan mock data proposal; pastikan berkas Excel yang dihasilkan memiliki 10 header kolom yang sesuai, format tanggal legalitas `DD-MM-YYYY`, nomor KK/NIK berformat teks, dan rincian per bidang lahan.

- [x] T005 [US2] Implementasikan fungsi `exportLaporanProfilPekebun` di `src/utils/exportPekebunExcel.ts` yang memetakan:
  - Header: `No`, `Nama Pekebun`, `NIK Pekebun`, `KK Pekebun`, `Alamat Pekebun`, `Jenis Legalitas`, `No / Nama Dokumen Legalitas Lahan`, `Tanggal Terbit Legalitas Lahan`, `Luas Lahan Sesuai Legalitas (Ha)`, `Luas Lahan (Ha)`
  - 1 baris per bidang lahan milik pekebun (atau baris tunggal jika belum ada lahan terhubung)
  - Format protektif teks NIK dan KK
  - Format desimal luas lahan
- [x] T006 [US2] Tambahkan pengujian komprehensif untuk `exportLaporanProfilPekebun` di `src/utils/exportPekebunExcel.test.ts`

**Checkpoint**: Laporan Profil Pekebun dapat digenerate dan diverifikasi secara independen.

---

## Phase 4: User Story 3 - UI Dropdown & Integrasi Seluruh Validator (Priority: P2)

**Goal**: Menyediakan tombol dropdown "Ekspor Data Pekebun ▾" yang seragam dan terpasang di toolbar Data Pekebun pada seluruh antarmuka validator.  
**Independent Test**: Buka halaman verifikasi Kabupaten dan verifikasi Provinsi/Ditjenbun/BPDP; pastikan tombol dropdown muncul, opsi dapat diklik, dan mengunduh berkas Excel yang sesuai.

- [x] T007 [US3] Buat komponen reusable dropdown `src/components/verification/DropdownEksporPekebun.vue` dengan popover/dropdown 2 opsi ekspor dan penanganan state disabled jika data kosong
- [x] T008 [P] [US3] Buat unit test komponen di `src/components/verification/DropdownEksporPekebun.test.ts`
- [x] T009 [US3] Integrasikan `DropdownEksporPekebun.vue` ke `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue` pada toolbar Sub-bagian B (Daftar Calon Pekebun & CPCL)
- [x] T010 [US3] Integrasikan `DropdownEksporPekebun.vue` ke `src/components/verification/PratinjauPekebunDanDokumenProposal.vue` pada header tabel data pekebun (untuk Provinsi, Ditjenbun, dan BPDP)

**Checkpoint**: Seluruh validator di semua tingkatan memiliki akses langsung ke kedua fitur ekspor Excel.

---

## Phase 5: Verification & Polish

**Purpose**: Pengujian menyeluruh, validasi tipe data, dan konfirmasi kelayakan output Excel.

- [x] T011 Jalankan test suite Vitest (`npm run test`) dan pastikan seluruh unit test lulus tanpa regresi
- [x] T012 Lakukan validasi end-to-end sesuai `quickstart.md` dan pastikan kedua berkas Excel dapat dibuka normal di spreadsheet viewer
