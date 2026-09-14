# Tasks: Verification Queue Filters (Multi-Role)

**Input**: Design documents from `/specs/021-queue-filters/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Update localization keys for filter labels

- [x] T001 [P] Modify `src/config/localization.ts` to add localized helper text for filters (e.g., "Cari nomor proposal / lembaga...", "Semua Status", "Semua Jenis Sarpras", "Reset Filter")

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Create reusable filter component

- [x] T002 Create the reusable filter component in `src/components/ui/QueueFilter.vue` mapping search, status, and jenis sarpras controls

**Checkpoint**: Reusable filter component created - ready to integrate across views

---

## Phase 3: User Story 1 - Cari Proposal Berdasarkan Keyword (Priority: P1) 🎯 MVP

**Goal**: Implement keyword searching by proposal number and cooperative name in all 4 queues.

**Independent Test**: Type a keyword in the filter input and verify the queue list reactively filters the rows.

### Implementation for User Story 1

- [x] T003 [P] [US1] Integrate `<QueueFilter />` and apply keyword computed filter in `src/views/dinas/kabupaten/QueueVerifikasiKabView.vue`
- [x] T004 [P] [US1] Integrate `<QueueFilter />` and apply keyword computed filter in `src/views/dinas/provinsi/QueueVerifikasiProvinsiView.vue`
- [x] T005 [P] [US1] Integrate `<QueueFilter />` and apply keyword computed filter in `src/views/ditjenbun/AntreanRekomtekView.vue`
- [x] T006 [P] [US1] Integrate `<QueueFilter />` and apply keyword computed filter in `src/views/bpdp/AntreanBpdpView.vue`

**Checkpoint**: Baseline keyword filtering functional in all 4 views.

---

## Phase 4: User Story 2 - Saring Proposal Berdasarkan Status & Jenis Sarpras (Priority: P2)

**Goal**: Implement dropdown filters for Status and Jenis Sarpras in all 4 queues using logical AND mapping.

**Independent Test**: Select a specific status and jenis sarpras, verifying list rows are narrowed accordingly.

### Implementation for User Story 2

- [x] T007 [US2] Update `src/components/ui/QueueFilter.vue` to map global localized status and jenis sarpras options
- [x] T008 [P] [US2] Enhance computed logic in `src/views/dinas/kabupaten/QueueVerifikasiKabView.vue` to include status and jenis sarpras conditions
- [x] T009 [P] [US2] Enhance computed logic in `src/views/dinas/provinsi/QueueVerifikasiProvinsiView.vue` to include status and jenis sarpras conditions
- [x] T010 [P] [US2] Enhance computed logic in `src/views/ditjenbun/AntreanRekomtekView.vue` to include status and jenis sarpras conditions
- [x] T011 [P] [US2] Enhance computed logic in `src/views/bpdp/AntreanBpdpView.vue` to include status and jenis sarpras conditions

**Checkpoint**: Dual-category dropdown filtering fully functional.

---

## Phase 5: User Story 3 - Tombol Bersihkan Filter Instan (Priority: P3)

**Goal**: Implement the reset filter action to clear search string and dropdown parameters.

**Independent Test**: Set filters, click Reset, verify all inputs clear, and complete list displays.

### Implementation for User Story 3

- [x] T012 [US3] Add "Reset Filter" conditional rendering and emit handler inside `src/components/ui/QueueFilter.vue`
- [x] T013 [US3] Implement reset action handler in all 4 verification view files to clear reactive FilterState variables

**Checkpoint**: Reset triggers clear inputs instantly.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verify mobile responsiveness, accessibility parameters, and compile builds.

- [x] T014 [P] Verify touch targets (>= 40px/44px) and mobile styling layout collapse in `src/components/ui/QueueFilter.vue`
- [x] T015 Run compile check using `npm run build` or `vue-tsc` to ensure strict typescript errors
- [x] T016 Execute `quickstart.md` validation script scenarios to confirm compliance
