# Tasks: Section Kategori Sumber & Kewenangan Dokumen BPDP

**Input**: Design documents from `specs/076-bpdp-document-authority-sections/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Unit tests are explicitly omitted per Constitution Development & Quality Workflow (Principle X & Governance). Correctness is verified via TypeScript strict-mode type safety (`npm run build`) and manual workflow verification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup & Shared Infrastructure

**Purpose**: Menyiapkan konfigurasi metadata instansi & pemetaan otoritas dokumen terpusat.

- [x] T001 Create authority tier metadata and document mapping in `src/lib/authoritySections.ts`
- [x] T002 [P] Create reusable authority section card presentation component in `src/components/verification/AuthorityDocumentSectionCard.vue`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verifikasi kesiapan fondasi metadata sebelum pengintegrasian ke views.

- [x] T003 Export and verify typed helpers (`getAuthorityConfig`, `groupDocumentsByAuthority`) in `src/lib/authoritySections.ts`

**Checkpoint**: Fondasi konfigurasi otoritas instansi siap digunakan oleh seluruh view BPDP.

---

## Phase 3: User Story 1 - Tampilan Section Dokumen Berdasarkan Kewenangan pada BPDP Approval Mode Inspeksi (Priority: P1) 🎯 MVP

**Goal**: Menata 7 dokumen inspeksi pada halaman BPDP Approval ke dalam 4 kartu section mandiri terpisah (Kabupaten, Provinsi, Ditjenbun, BPDP) lengkap dengan badge peran dan kontrol penolakan.

**Independent Test**: Buka `/bpdp/approval/:id` pada proposal berstatus `SK_DIRUT_PUBLISHED` / `SELESAI`, pindah ke Step 2. Verifikasi 4 kartu section instansi tampil rapi, tombol Tolak dan input catatan berfungsi, serta ringkasan audit ter-update.

### Implementation for User Story 1

- [x] T004 [US1] Import authority tier configuration and group inspect document list in `src/views/bpdp/ApprovalBpdpView.vue`
- [x] T005 [US1] Implement 4 card-based authority sections (Dinas Kabupaten/Kota, Dinas Provinsi, Ditjenbun, BPDP) in Mode Inspeksi template in `src/views/bpdp/ApprovalBpdpView.vue`
- [x] T006 [US1] Maintain rejection toggle, note textarea validation, and multi-tier pushback modal synchronization in `src/views/bpdp/ApprovalBpdpView.vue`

**Checkpoint**: User Story 1 selesai. Mode Inspeksi pada BPDP Approval terbagi rapi dalam 4 section instansi dan dapat diuji secara independen.

---

## Phase 4: User Story 2 - Sectioning Kewenangan pada Panel Hasil Penelitian Dokumen Usulan (Priority: P2)

**Goal**: Mengelompokkan daftar dokumen usulan pada panel kanan alur reguler BPDP Approval ke dalam 3 sub-section instansi (Kabupaten, Provinsi, Ditjenbun).

**Independent Test**: Buka `/bpdp/approval/:id` pada proposal berstatus `BPDP_VERIF_SUBMITTED`, masuk ke Step 2. Periksa panel kanan "Hasil Penelitian Dokumen Usulan": dokumen terbagi dalam 3 sub-section instansi dengan badge status telaah peneliti.

### Implementation for User Story 2

- [x] T007 [US2] Structure the 5 proposal documents in the right panel "Hasil Penelitian Dokumen Usulan" into 3 authority sub-sections (Kabupaten, Provinsi, Ditjenbun) in `src/views/bpdp/ApprovalBpdpView.vue`
- [x] T008 [US2] Preserve status badges, preview buttons, and reviewer notes under each authority sub-section in `src/views/bpdp/ApprovalBpdpView.vue`

**Checkpoint**: User Stories 1 AND 2 selesai dan berfungsi secara independen.

---

## Phase 5: User Story 3 - Keselarasan Section Kewenangan pada Verifikator BPDP (Priority: P3)

**Goal**: Menerapkan pengelompokan 3 kartu section instansi (Kabupaten, Provinsi, Ditjenbun) pada Step 2 Penelitian Dokumen Verifikator BPDP.

**Independent Test**: Buka `/bpdp/ceki/:id` sebagai `BPDP_VERIFIKATOR`, masuk ke Step 2. Pastikan 5 dokumen tertata dalam 3 kartu section instansi dan interaksi validasi tetap berfungsi normal.

### Implementation for User Story 3

- [x] T009 [US3] Import authority tier configuration and group verification documents in `src/views/bpdp/CekiBpdpView.vue`
- [x] T010 [US3] Reorganize Step 2 document checklist into 3 card-based authority sections in `src/views/bpdp/CekiBpdpView.vue`
- [x] T011 [US3] Ensure document validation state toggle, notes input, and document preview/download work seamlessly within each section in `src/views/bpdp/CekiBpdpView.vue`

**Checkpoint**: Seluruh alur penelitian dan persetujuan BPDP memiliki konsistensi visual pembagian kewenangan instansi.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verifikasi responsivitas, dark/light theme harmony, dan build validation.

- [x] T012 Verify responsive layout (mobile 375px to desktop) and dark mode styling across modified sections in `src/views/bpdp/ApprovalBpdpView.vue` and `src/views/bpdp/CekiBpdpView.vue`
- [x] T013 Run production build check (`npm run build`) in `c:\Users\raiha\Documents\Kerja\IDSurvey\SCI\bpdp-sarpras-kelapa-fe` to ensure 0 TypeScript / Vite errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories.
- **User Story 1 (Phase 3 - P1)**: Depends on Foundational (Phase 2).
- **User Story 2 (Phase 4 - P2)**: Depends on Foundational (Phase 2); extends `ApprovalBpdpView.vue`.
- **User Story 3 (Phase 5 - P3)**: Depends on Foundational (Phase 2); independent view (`CekiBpdpView.vue`).
- **Polish (Phase 6)**: Depends on US1, US2, and US3.

### Parallel Opportunities

- T001 and T002 can be developed concurrently.
- US2 (T007-T008) and US3 (T009-T011) touch different views (`ApprovalBpdpView.vue` right panel vs `CekiBpdpView.vue`) and can be executed in parallel after Phase 2.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 & 2 (Setup & Foundational in `src/lib/authoritySections.ts`).
2. Complete Phase 3 (User Story 1 in `ApprovalBpdpView.vue` Mode Inspeksi).
3. **Validate**: Test 4 section cards on BPDP Approval inspect mode.

### Incremental Delivery
1. Add User Story 2 (Right panel regular mode on BPDP Approval).
2. Add User Story 3 (BPDP Verifikator view on `CekiBpdpView.vue`).
3. Run Phase 6 Polish & `npm run build` validation.
