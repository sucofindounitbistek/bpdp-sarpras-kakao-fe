# Tasks: Revamp UX Halaman Verifikasi Usulan Kabupaten (Accordion System)

**Input**: Design documents from `/specs/071-revamp-ux-verifikasi-kabupaten/`
**Prerequisites**: `spec.md`, `plan.md`, `research.md`, `quickstart.md`

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel
- **[Story]**: Belongs to user story (US1, US2, US3)

---

## Phase 1: Setup & Foundational Tasks

**Purpose**: Menyiapkan state reaktif ekspansi accordion dan tally ringkasan status per modul di `StepVerifikasiPekebunDanDokumenProposal.vue`.

- [x] T001 [P] Inisialisasi state reaktif `activeSections` untuk mengontrol status buka-tutup kelima modul accordion (`map`, `pekebun`, `dokumen`, `gudang`, `rab`) di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
- [x] T002 [P] Definisikan computed tally status untuk pekebun (`pekebunSummary`), berkas proposal (`dokumenSummary`), dan gudang (`gudangSummary`) di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`

---

## Phase 2: User Story 1 - Pengelompokan Modul dengan Accordion Seragam (Priority: P1) 🎯 MVP

**Goal**: Membungkus kelima modul verifikasi utama ke dalam kartu accordion seragam beranimasi halus dengan header terstandarisasi.

- [x] T003 [US1] Buat wrapper modul accordion seragam untuk **Modul 1: Peta Spasial & Analisis Poligon Overlap** (`VerificationOverlapMap`) di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
- [x] T004 [US1] Buat wrapper modul accordion seragam untuk **Modul 2: Verifikasi Calon Pekebun & Lahan (CPCL)** (tabel pekebun, upload foto udara, tombol menuju workbench detail pekebun) di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
- [x] T005 [US1] Buat wrapper modul accordion seragam untuk **Modul 3: Verifikasi Berkas Proposal & Kelembagaan** (banner paket sarpras terpilih, tombol Setujui Semua, tabel checklist berkas) di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
- [x] T006 [US1] Buat wrapper modul accordion seragam untuk **Modul 4: Pemeriksaan Gudang Serah Terima** dengan kondisi `v-if="hasStorageArea"` di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
- [x] T007 [US1] Buat wrapper modul accordion seragam untuk **Modul 5: Verifikasi & Rekonsiliasi Rencana Anggaran Biaya (RAB)** (stepper 4-tahap, unduh CSV, upload bertandatangan, tabel RAB) di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`

---

## Phase 3: User Story 2 - Status Visual Reaktif pada Header Accordion (Priority: P2)

**Goal**: Menyajikan badge status dan rincian tally pada setiap header modul accordion yang bereaksi secara instan saat data diverifikasi.

- [x] T008 [US2] Pasang badge visual status reaktif (`Semua Sesuai`, `Perlu Catatan`, `Belum Diverifikasi`) pada header Modul 2 (CPCL) di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
- [x] T009 [US2] Pasang badge visual status reaktif (`Semua Sesuai`, `Perlu Catatan`, `Belum Lengkap`) dan indikator berkas wajib pada header Modul 3 (Berkas Proposal) di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
- [x] T010 [US2] Pasang badge visual status validasi 4 parameter gudang pada header Modul 4 (Gudang Serah Terima) di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
- [x] T011 [US2] Pasang badge visual status penyelarasan RAB dan dokumen bertandatangan pada header Modul 5 (RAB) di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`

---

## Phase 4: User Story 3 - Fitur Kontrol "Buka Semua / Tutup Semua" & Ringkasan Global (Priority: P3)

**Goal**: Menyediakan bilah kontrol ringkas di atas daftar modul untuk membuka/menutup seluruh accordion secara instan dan memantau status global.

- [x] T012 [US3] Implementasikan handler `toggleSection(key)`, `expandAll()`, dan `collapseAll()` dengan pengecekan kondisi `allOpen` di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
- [x] T013 [US3] Rancang bilah kontrol atas di atas accordion yang memuat tally global modul, status kelayakan umum, serta tombol pintasan "Buka Semua" / "Tutup Semua" di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
- [x] T014 [US3] Pastikan sticky bottom action bar (Simpan & Lanjut ke SK CPCL / Kembalikan Revisi) tetap berfungsi secara harmonis di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`

---

## Phase 5: Polish & Build Verification

**Goal**: Verifikasi kompilasi, kebersihan tipe data, dan pencatatan dokumentasi.

- [x] T015 Jalankan typecheck TypeScript dengan `npx vue-tsc -b` dan selesaikan seluruh error kompilasi di `bpdp-sarpras-kelapa-fe`
- [x] T016 Jalankan production build dengan `npm run build` dan pastikan bundling berhasil dengan exit code 0 di `bpdp-sarpras-kelapa-fe`
- [x] T017 Dokumentasikan pembaruan UX halaman verifikasi usulan kabupaten pada `walkthrough.md`
