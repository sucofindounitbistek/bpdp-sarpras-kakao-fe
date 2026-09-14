# Tasks: Export Data Proposal Dinas Kabupaten Sesuai Wilayah Terkait

**Input**: Design documents from `specs/085-export-proposal-wilayah-kabupaten/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/export-proposal-wilayah.contract.md`

---

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Every task includes explicit target file paths

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verifikasi dokumen perancangan dan inspeksi modul ekspor proposal yang ada

- [x] T001 Verify specification, data model, and contracts alignment in `specs/085-export-proposal-wilayah-kabupaten/plan.md`
- [x] T002 [P] Inspect existing proposal export logic and region helpers in `src/utils/regionHelper.ts`, `src/utils/exportProposal.ts`, and `src/components/pengusulan/ExportProposalModal.vue`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fondasi helper pencocokan wilayah dan ekstensi query parameter yang dibutuhkan oleh seluruh user story

**⚠️ CRITICAL**: Task fondasi ini wajib diselesaikan sebelum implementasi pengubahan modal dan penyaringan ekspor

- [x] T003 Implement `matchesProposalRegion` and `normalizeRegionName` helper functions in `src/utils/regionHelper.ts`
- [x] T004 [P] Extend `ProposalExportQueryParams` interface to include optional `regency_id` and `kabupaten` parameters in `src/services/proposal.service.ts`

**Checkpoint**: Helper pencocokan wilayah berlapis (*hybrid matching rule*) dan definisi tipe data siap digunakan.

---

## Phase 3: User Story 1 - Pembatasan Data Ekspor Sesuai Wilayah Tugas Dinas Kabupaten (Priority: P1) 🎯 MVP

**Goal**: Memastikan data proposal yang diekspor (CSV dan PDF) pada antarmuka Dinas Kabupaten hanya mencakup usulan dari wilayah kewenangan dinas pengguna dan secara ketat mengecualikan data kabupaten lain.

**Independent Test**: Masuk sebagai akun Dinas Kabupaten, buka antrean verifikasi, picu unduh CSV atau PDF, dan pastikan seluruh baris usulan berasal dari kabupaten terkait (zero data leakage).

### Implementation for User Story 1

- [x] T005 [US1] Extend props definition in `src/components/pengusulan/ExportProposalModal.vue` to accept `scopeRegionName?: string` and `scopeRegencyId?: number | string`
- [x] T006 [US1] Wire `scope-region-name` and `scope-regency-id` props from `src/views/dinas/kabupaten/QueueVerifikasiKabView.vue` into `<ExportProposalModal>`
- [x] T007 [US1] Implement regional scoping sanitization using `matchesProposalRegion` on fetched proposals in `src/components/pengusulan/ExportProposalModal.vue`
- [x] T008 [US1] Update CSV export execution in `src/components/pengusulan/ExportProposalModal.vue` to pass sanitized dataset to client-side `exportProposalsToCsv`

**Checkpoint**: Ekspor CSV pada Dinas Kabupaten hanya menghasilkan proposal dari wilayah kabupaten terkait.

---

## Phase 4: User Story 2 - Penanganan Filter Per Wilayah yang Ditunda Karena Ketiadaan API Wilayah (Priority: P2)

**Goal**: Menyajikan indikator visual cakupan wilayah aktif yang terkunci otomatis pada modal ekspor, memperjelas bahwa filter manual per kecamatan/desa sedang ditunda menunggu kesiapan API Wilayah.

**Independent Test**: Buka modal ekspor pada antrean Dinas Kabupaten, pastikan banner *"Cakupan Wilayah: [Nama Kabupaten] (Terkunci Otomatis)"* tampil jelas dan tidak ada dropdown wilayah manual yang rusak/kosong.

### Implementation for User Story 2

- [x] T009 [US2] Add locked region info card/badge with shield/lock icon in `src/components/pengusulan/ExportProposalModal.vue` when `scopeRegionName` or `scopeRegencyId` is provided
- [x] T010 [US2] Add contextual disclaimer text inside the region badge in `src/components/pengusulan/ExportProposalModal.vue` explaining that manual sub-district filtering is deferred pending the Wilayah API

**Checkpoint**: Pengguna Dinas Kabupaten melihat kepastian visual cakupan wilayah mereka yang terkunci otomatis di dalam modal.

---

## Phase 5: User Story 3 - Konsistensi Hitungan Pratinjau dan Format Berkas Ekspor (Priority: P3)

**Goal**: Menjamin jumlah usulan pada banner pratinjau (*live match count*) sama persis dengan baris data dokumen CSV dan PDF yang diekspor.

**Independent Test**: Cocokkan angka pada banner pratinjau dengan jumlah baris dokumen CSV dan PDF setelah memilih kombinasi filter status/tanggal.

### Implementation for User Story 3

- [x] T011 [US3] Update `fetchMatchCount` in `src/components/pengusulan/ExportProposalModal.vue` to calculate `matchedCount` strictly from the region-sanitized proposal list
- [x] T012 [US3] Ensure `exportProposalsToPdf` call in `src/components/pengusulan/ExportProposalModal.vue` uses the region-sanitized list and includes the active region name in the filter summary
- [x] T013 [US3] Create unit tests for `matchesProposalRegion` and region filtering in `src/utils/regionHelper.test.ts`

**Checkpoint**: Jumlah proposal pada pratinjau, berkas CSV, dan berkas PDF 100% sinkron dan terbukti bebas dari proposal luar wilayah.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verifikasi penanganan kasus data kosong, build produksi, dan validasi tipe TypeScript

- [x] T014 [P] Verify graceful empty-state handling and toast warnings when no proposals match filters in `src/components/pengusulan/ExportProposalModal.vue`
- [x] T015 Run Vitest unit tests via `npx vitest run src/utils/`
- [x] T016 Run TypeScript typecheck validation (`npx vue-tsc -b`) to verify zero type errors
- [x] T017 Validate manual test scenarios against `specs/085-export-proposal-wilayah-kabupaten/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: Selesai ✅
- **Phase 2 (Foundational)**: Selesai ✅
- **Phase 3 (User Story 1 - Data Scoping)**: Selesai ✅
- **Phase 4 (User Story 2 - UI Indicator)**: Selesai ✅
- **Phase 5 (User Story 3 - Pratinjau & PDF)**: Selesai ✅
- **Phase 6 (Polish & Quality)**: Selesai ✅

### Parallel Opportunities

- **T001** & **T002**: Paralel ✅
- **T003** & **T004**: Paralel ✅
- **T009** & **T010**: Paralel ✅
- **T014** & **T015**: Paralel ✅

---

## Implementation Strategy (MVP First)

1. **MVP Scope (Phase 1 s/d Phase 3)**:
   - Selesai: Helper `matchesProposalRegion` dan integrasi props wilayah.
   - Selesai: Sanitasi data ekspor CSV di sisi klien untuk menjamin zero cross-regency leakage.
2. **Incremental Polish (Phase 4 & 5)**:
   - Selesai: Banner indikator cakupan wilayah terkunci otomatis di modal.
   - Selesai: Sinkronisasi match count dan ekspor PDF.
   - Selesai: Unit test `regionHelper.test.ts` (15/15 lulus).
3. **Verification (Phase 6)**:
   - Selesai: Vitest unit tests passed (32/32 tests across utilities).
   - Selesai: `npx vue-tsc -b` type check passed (0 errors).
   - Selesai: `npm run build` production build passed.
