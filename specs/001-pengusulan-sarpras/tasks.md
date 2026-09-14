# Tasks: Modul Pengusulan Sarpras BPDP

**Input**: Design documents from `/specs/001-pengusulan-sarpras/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and TypeScript definitions

- [x] T001 Create TypeScript types for Pengusulan in src/types/pengusulan.ts
- [x] T002 [P] Create validation schema using Zod in src/schemas/pengusulan.schema.ts
- [x] T003 [P] Create Pinia store for Pengusulan in src/stores/pengusulan.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before user story UI implementation

- [x] T004 Create API service client for Pengusulan in src/services/pengusulan.service.ts
- [x] T005 [P] Setup router endpoints for Pengusulan in src/router/index.ts

---

## Phase 3: User Story 1 - Pengajuan Usulan Sarpras oleh Lembaga Pekebun (Priority: P1) 🎯 MVP

**Goal**: Pengurus Lembaga Pekebun mengisi form wizard 4-step dan melakukan submit pengajuan usulan sarpras.

**Independent Test**: Pengurus login, mengisi wizard (Profil, CPCL, Paket, Upload Dokumen), menekan submit, dan menerima nomor resi dengan status `SUBMITTED`.

### Implementation for User Story 1

- [x] T006 [P] [US1] Create Step 1 Profil Lembaga form in src/views/pengusulan/StepProfilLembaga.vue
- [x] T007 [P] [US1] Create Step 2 Data CPCL Lahan table & geotagging in src/views/pengusulan/StepDataCPCL.vue
- [x] T008 [P] [US1] Create Step 3 Paket Sarpras selection in src/views/pengusulan/StepPaketSarpras.vue
- [x] T009 [P] [US1] Create Step 4 Upload Dokumen Legalitas in src/views/pengusulan/StepUploadDokumen.vue
- [x] T010 [US1] Assemble Form Multi-Step Wizard Container in src/views/pengusulan/FormPengusulanView.vue (depends on T006, T007, T008, T009)
- [x] T011 [P] [US1] Create Tracking Status & Timeline view in src/views/pengusulan/TrackingPengusulanView.vue

**Checkpoint**: User Story 1 (Pengusulan kuota oleh Pemohon) selesai dan dapat diuji secara independen.

---

## Phase 4: User Story 2 - Verifikasi Administrasi & Lapangan oleh Dinas Kab/Kota (Priority: P2)

**Goal**: Dinas Kabupaten/Kota memeriksa berkas, menginput hasil verifikasi lapangan (BAHV & Rekomtek), serta meneruskan/mengembalikan berkas.

**Independent Test**: Dinas Kab/Kota membuka antrean usulan, mengisi checklist verifikasi admin, mengunggah BAHV & Rekomtek, dan memperbarui status.

### Implementation for User Story 2

- [x] T012 [P] [US2] Create Table Queue Verifikasi Dinas Kab/Kota in src/views/dinas/QueueVerifikasiView.vue
- [x] T013 [US2] Create Form Checklist Administrasi & Input BAHV/Rekomtek in src/views/dinas/DetailVerifikasiDinasView.vue (depends on T012)
- [x] T014 [P] [US2] Create Modal Dialog Catatan Revisi Berkas in src/views/dinas/ModalRevisiBerkas.vue

**Checkpoint**: User Story 2 (Verifikasi Dinas Kab/Kota) selesai dan dapat diuji secara independen.

---

## Phase 5: User Story 3 - Validasi Provinsi, Evaluasi Ditjenbun, & Penetapan SK (Priority: P3)

**Goal**: Ditjenbun mereview Rekomtek daerah, melakukan rapat pleno penetapan, dan menerbitkan SK Penetapan Penerima Sarpras.

**Independent Test**: Ditjenbun membuka rekapitulasi Rekomtek nasional, menyetujui pleno, dan mengunggah dokumen SK Penetapan.

### Implementation for User Story 3

- [x] T015 [P] [US3] Create Dashboard Penetapan & Pleno Ditjenbun in src/views/ditjenbun/PenetapanPlenoView.vue
- [x] T016 [US3] Create Form Upload & Penerbitan SK Penetapan Ditjenbun in src/views/ditjenbun/PenerbitanSKView.vue (depends on T015)

**Checkpoint**: User Story 3 (Penetapan SK Ditjenbun) selesai dan dapat diuji secara independen.

---

## Phase 6: User Story 4 - Penyaluran Dana & Pelaporan PKS / BAST oleh BPDPKS (Priority: P4)

**Goal**: BPDPKS mengelola PKS dan pencairan dana; Pemohon mengunggah BAST & LPJ fisik penyaluran.

**Independent Test**: BPDPKS mengunggah PKS & bukti transfer; Pemohon mengunggah BAST & LPJ pertanggungjawaban.

### Implementation for User Story 4

- [x] T017 [P] [US4] Create Modul Manajemen PKS & Pencairan Dana BPDPKS in src/views/bpdpks/PenyaluranDanaView.vue
- [x] T018 [US4] Create Form Pelaporan BAST & LPJ Fisik Sarpras in src/views/bpdpks/PelaporanBASTView.vue (depends on T017)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Perbaikan visual, responsivitas, dan validasi quickstart

- [x] T019 [P] Update navigation menu for all roles in src/App.vue
- [x] T020 Run quickstart.md validation scenario end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 - BLOCKS all User Stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 - MVP Core
- **User Story 2 (Phase 4)**: Depends on Phase 2 (and integrates with US1 status)
- **User Story 3 (Phase 5)**: Depends on Phase 2 (and integrates with US2 Rekomtek)
- **User Story 4 (Phase 6)**: Depends on Phase 2 (and integrates with US3 SK Penetapan)
- **Polish (Phase 7)**: Depends on all User Stories completion

### Parallel Opportunities

- T002, T003 (Setup) can run in parallel
- T005 (Router Setup) can run in parallel with T004 (API Service)
- T006, T007, T008, T009 (Wizard steps) can run in parallel before T010
- T012, T015, T017 (Role Dashboards) can run in parallel by different developers
