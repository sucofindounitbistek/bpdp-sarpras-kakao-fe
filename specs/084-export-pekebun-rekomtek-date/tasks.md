# Tasks: Penambahan Kolom Tanggal dan Tahun Terbit Rekomtek pada Ekspor Data Ditjenbun & Excel Pekebun

**Input**: Design documents from `specs/084-export-pekebun-rekomtek-date/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/export-rekomtek-contract.md`

---

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g. `[US1]`, `[US2]`, `[US3]`)
- Every task includes explicit target file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verifikasi kesiapan lingkungan dan struktur dokumen fitur

- [x] T001 Verify specification and design contracts alignment in `specs/084-export-pekebun-rekomtek-date/plan.md`
- [x] T002 [P] Inspect existing export logic and test fixtures in `src/utils/exportPekebunExcel.ts` and `src/utils/exportProposal.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Helper resolusi tanggal dan persistensi tanggal generate yang dibutuhkan oleh seluruh user story

**⚠️ CRITICAL**: Task fondasi ini wajib diselesaikan sebelum implementasi pengubahan susunan kolom laporan

- [x] T003 Implement `resolveRekomtekDateInfo` helper and interface extensions in `src/utils/exportPekebunExcel.ts`
- [x] T004 [P] Update Rekomtek draft generation handler to persist `tanggal_rekomtek` timestamp in `src/views/ditjenbun/CekiDitjenbunView.vue`

**Checkpoint**: Helper resolusi tanggal dan persistensi tanggal generate siap digunakan oleh seluruh fungsi ekspor.

---

## Phase 3: User Story 1 - Penambahan Kolom Rekomtek pada Laporan Titik Koordinat Excel (Priority: P1) 🎯 MVP

**Goal**: Menyisipkan kolom `Tanggal Terbit Rekomtek` (kolom 13) dan `Tahun Terbit Rekomtek` (kolom 14) pada berkas Excel Laporan Titik Koordinat (menjadi 16 kolom), mendampingi atribut proposal sebelum kolom koordinat `Latitude` & `Longitude`.

**Independent Test**: Unduh Laporan Titik Koordinat dari usulan Ditjenbun, periksa isi file spreadsheet memuat 16 kolom dengan data tanggal (`DD-MM-YYYY`) dan tahun (`YYYY`) terisi akurat (atau `-` jika belum terbit).

### Implementation for User Story 1

- [x] T005 [US1] Update header array to 16 columns in `exportLaporanTitikKoordinat` within `src/utils/exportPekebunExcel.ts`
- [x] T006 [US1] Map `Tanggal Terbit Rekomtek` and `Tahun Terbit Rekomtek` data cells into each coordinate polygon row in `src/utils/exportPekebunExcel.ts`
- [x] T007 [US1] Map fallback row cells for plots without polygon coordinates to 16 columns in `src/utils/exportPekebunExcel.ts`
- [x] T008 [US1] Update unit test assertions for 16 columns in `src/utils/exportPekebunExcel.test.ts`

**Checkpoint**: Laporan Titik Koordinat berhasil mengekspor 16 kolom dengan data Rekomtek yang valid dan lolos unit test.

---

## Phase 4: User Story 2 - Penambahan Kolom Rekomtek pada Laporan Profil Pekebun Excel (Priority: P1) 🎯 MVP

**Goal**: Menyisipkan kolom `Tanggal Terbit Rekomtek` (kolom 11) dan `Tahun Terbit Rekomtek` (kolom 12) di akhir tabel Laporan Profil Pekebun (menjadi 12 kolom).

**Independent Test**: Unduh Laporan Profil Pekebun dari usulan Ditjenbun, periksa isi file spreadsheet memuat 12 kolom dengan data tanggal (`DD-MM-YYYY`) dan tahun (`YYYY`) terisi di akhir baris setelah luas lahan.

### Implementation for User Story 2

- [x] T009 [US2] Update header array to 12 columns in `exportLaporanProfilPekebun` within `src/utils/exportPekebunExcel.ts`
- [x] T010 [US2] Map `Tanggal Terbit Rekomtek` and `Tahun Terbit Rekomtek` data cells into each farmer profile row in `src/utils/exportPekebunExcel.ts`
- [x] T011 [US2] Update unit test assertions for 12 columns in `src/utils/exportPekebunExcel.test.ts`

**Checkpoint**: Laporan Profil Pekebun berhasil mengekspor 12 kolom dengan data Rekomtek yang valid dan lolos unit test.

---

## Phase 5: User Story 3 - Penyertaan Tanggal & Tahun Terbit Rekomtek pada Penarikan Data Usulan Ditjenbun (Priority: P2)

**Goal**: Menyertakan kolom `Tanggal Terbit Rekomtek` dan `Tahun Terbit Rekomtek` berdampingan dengan `No. Rekomtek` pada penarikan rekapitulasi usulan proposal Ditjenbun (CSV dan cetak PDF).

**Independent Test**: Buka modal Ekspor Data di halaman Antrean Rekomtek Ditjenbun, unduh berkas CSV atau cetak PDF ringkasan, pastikan kolom tanggal dan tahun terbit Rekomtek tercantum.

### Implementation for User Story 3

- [x] T012 [US3] Add `Tanggal Terbit Rekomtek` and `Tahun Terbit Rekomtek` columns to `exportProposalsToCsv` in `src/utils/exportProposal.ts`
- [x] T013 [US3] Add `Tanggal Terbit Rekomtek` and `Tahun Terbit Rekomtek` columns to `exportProposalsToPdf` in `src/utils/exportProposal.ts`

**Checkpoint**: Ekspor daftar usulan Ditjenbun (CSV & PDF) konsisten memuat tanggal dan tahun terbit Rekomtek.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Sinkronisasi UI menu dropdown ekspor, validasi tipe data TypeScript, dan pengujian build

- [x] T014 [P] Update column count descriptions (16 kolom & 12 kolom) in `src/components/verification/DropdownEksporPekebun.vue`
- [x] T015 Run Vitest unit tests for export utilities via `npm run test:run` or `npx vitest run src/utils/exportPekebunExcel.test.ts`
- [x] T016 Run TypeScript type check validation (`npx vue-tsc -b`) to ensure zero type errors
- [x] T017 Validate manual test scenarios against `specs/084-export-pekebun-rekomtek-date/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Tanpa dependensi - dapat langsung dijalankan
- **Foundational (Phase 2)**: Bergantung pada Setup - **memblokir** User Story 1, 2, dan 3
- **User Story 1 (Phase 3)**: Bergantung pada Phase 2 selesai
- **User Story 2 (Phase 4)**: Bergantung pada Phase 2 selesai (dapat dikerjakan paralel dengan US1 jika di file terpisah, atau berurutan)
- **User Story 3 (Phase 5)**: Bergantung pada Phase 2 selesai (dapat dikerjakan paralel karena file berbeda di `src/utils/exportProposal.ts`)
- **Polish (Phase 6)**: Bergantung pada seluruh User Story selesai

---

## Parallel Opportunities

- **T003** & **T004** dapat diimplementasikan bersamaan karena memodifikasi file utilitas dan view yang berbeda.
- **Phase 3 (US1)** & **Phase 5 (US3)** dapat diimplementasikan paralel karena memodifikasi berkas berbeda (`exportPekebunExcel.ts` vs `exportProposal.ts`).
- **T014** (Update UI Dropdown) dapat dikerjakan paralel dengan implementasi ekspor.

---

## Implementation Strategy

### MVP Scope (User Story 1 & User Story 2)
1. Selesaikan Phase 1 & Phase 2 (Setup & Foundational helper).
2. Tuntaskan User Story 1 (16 kolom Titik Koordinat) & User Story 2 (12 kolom Profil Pekebun).
3. Jalankan pengujian unit `exportPekebunExcel.test.ts` untuk memastikan format spreadsheet valid.
4. Lanjutkan ke User Story 3 untuk penarikan rekapitulasi proposal CSV/PDF.
