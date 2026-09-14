# Tasks: Modul Penyaluran Barang (Ekstensifikasi & Intensifikasi)

**Input**: Design documents from `/specs/045-penyaluran-barang-ekstensifikasi-intensifikasi/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/penyaluran-barang-api.md](./contracts/penyaluran-barang-api.md)

---

## Phase 1: Setup (Types & Store Initialization)

**Purpose**: Inisialisasi struktur tipe data, state management Pinia terisolasi, dan konfigurasi role.

- [x] T001 Define data models and status enums in `src/types/penyaluranBarang.ts`
- [x] T002 Extend User role definition with `BPDP_PPK` and `BPDP_ULP` in `src/stores/auth.ts`
- [x] T003 Create persistent Pinia store `usePenyaluranBarangStore` with initial demo seed in `src/stores/penyaluranBarang.ts`

---

## Phase 2: Foundational (PDF Generator, Timeline & Routing)

**Purpose**: Komponen dasar dan rute yang dibutuhkan oleh semua user story mockup.

- [x] T004 Create client-side PDF document generator for surat permohonan in `src/utils/permohonanPdfGenerator.ts`
- [x] T005 [P] Create visual workflow status tracker component in `src/components/penyaluran-barang/PenyaluranTimelineTracker.vue`
- [x] T006 Register dedicated routes for Penyaluran Barang in `src/router/index.ts`

---

## Phase 3: User Story 1 - Pengajuan Permohonan oleh Pekebun (Priority: P1) 🎯 MVP

**Goal**: Kelembagaan Pekebun dapat menginput preferensi RAB barang, mengunduh surat permohonan PDF, dan mengunggah berkas permohonan.

- [x] T007 [P] [US1] Create preferensi RAB item table with inline validation in `src/components/penyaluran-barang/ItemRabFormTable.vue`
- [x] T008 [US1] Create Pekebun permohonan view with download & upload PDF in `src/views/penyaluran-barang/PekebunPermohonanBarangView.vue`

---

## Phase 4: User Story 2 - Verifikasi Permohonan oleh BPDP Verifikator (Priority: P1)

**Goal**: BPDP Verifikator (Teknis) dapat memeriksa permohonan, menyetujui (kirim Nota Dinas ke PPK), atau mengembalikan ke Pekebun.

- [x] T009 [P] [US2] Create modal dialog for verifikasi teknis & catatan revisi in `src/components/penyaluran-barang/VerifikasiTeknisModal.vue`
- [x] T010 [US2] Create BPDP Verifikator queue & review view in `src/views/penyaluran-barang/BpdpVerifikatorBarangView.vue`

---

## Phase 5: User Story 3 - Disposisi Pengadaan oleh BPDP PPK (Priority: P1)

**Goal**: BPDP PPK menerima nota dinas dan mendisposisikan pengadaan ke BPDP ULP atau Pengadaan Langsung (< 200 juta).

- [x] T011 [P] [US3] Create disposisi PPK modal with routing rule (<200jt) in `src/components/penyaluran-barang/DisposisiPpkModal.vue`
- [x] T012 [US3] Create BPDP PPK disposition queue view in `src/views/penyaluran-barang/BpdpPpkBarangView.vue`

---

## Phase 6: User Story 4 - Pemilihan Vendor / Tender oleh BPDP ULP (Priority: P1)

**Goal**: BPDP ULP mencatat proses pemilihan vendor e-catalog, mengubah status, dan menetapkan pemenang tender.

- [x] T013 [P] [US4] Create tender e-catalog execution & winner modal in `src/components/penyaluran-barang/TenderUlpModal.vue`
- [x] T014 [US4] Create BPDP ULP tender management view in `src/views/penyaluran-barang/BpdpUlpBarangView.vue`

---

## Phase 7: User Story 5 - Kontrak Dokumen "A" & Penugasan Surveyor (Priority: P1)

**Goal**: BPDP Verifikator menginput dan mengunggah Dokumen Kontrak "A" serta menerbitkan surat tugas sampling surveyor.

- [x] T015 [P] [US5] Create Dokumen Kontrak "A" modal with 10 required fields in `src/components/penyaluran-barang/DokumenKontrakModal.vue`
- [x] T016 [P] [US5] Create Surat Tugas Surveyor modal in `src/components/penyaluran-barang/SuratTugasSurveyorModal.vue`
- [x] T017 [US5] Integrate Dokumen Kontrak "A" & Surveyor dispatch flow into `src/views/penyaluran-barang/BpdpVerifikatorBarangView.vue`

---

## Phase 8: User Story 6 - Navigasi Mockup & Multi-Role Switching (Priority: P2)

**Goal**: Memastikan navigasi sidebar dan dropdown switcher role menampilkan modul Penyaluran Barang dengan badge Mockup.

- [x] T018 [US6] Add Penyaluran Barang navigation sections in `src/composables/useNavigation.ts`
- [x] T019 [US6] Add `BPDP_PPK` and `BPDP_ULP` options in `src/components/ui/RoleSwitcher.vue`

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Verifikasi integritas sistem, validasi tipe TypeScript, dan pengujian responsif.

- [x] T020 Run TypeScript type-checking `npx vue-tsc -b` and verify zero errors/regressions across existing codebase
