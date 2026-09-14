# Tasks: Skeleton Loading Coverage

**Input**: Design documents from `/specs/012-skeleton-loading-coverage/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize the task list and check the project environment

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

*Foundational Checkpoint: Reusable UI Skeleton loader component already exists in `@/components/ui/Skeleton.vue`.*

---

## Phase 3: User Story 1 - Dinas Kabupaten/Kota Views (Priority: P1) 🎯 MVP

**Goal**: Add skeleton loading placeholders to verification queue and detail forms for Dinas Kabupaten.

**Independent Test**: Open Dinas Kabupaten queue and detail page and verify pulse animations before data loads.

### Implementation for User Story 1

- [x] T002 [P] [US1] Add pageLoading state and table-row skeleton placeholders to `src/views/dinas/kabupaten/QueueVerifikasiKabView.vue`
- [x] T003 [P] [US1] Add pageLoading state and card/wizard skeleton placeholders to `src/views/dinas/kabupaten/DetailVerifikasiKabView.vue`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Dinas Provinsi Views (Priority: P1)

**Goal**: Add skeleton loading placeholders to verification queue and detail forms for Dinas Provinsi.

**Independent Test**: Open Dinas Provinsi queue and detail views and verify skeleton loader coverage.

### Implementation for User Story 2

- [x] T004 [P] [US2] Add pageLoading state and table-row skeleton placeholders to `src/views/dinas/provinsi/QueueVerifikasiProvinsiView.vue`
- [x] T005 [P] [US2] Add pageLoading state and card/wizard skeleton placeholders to `src/views/dinas/provinsi/DetailVerifikasiProvinsiView.vue`

**Checkpoint**: User Story 2 is fully functional and testable independently.

---

## Phase 5: User Story 3 - Ditjenbun Process Views (Priority: P1)

**Goal**: Add skeleton loaders to plenary session, SK publisher, and SK penetapan screens.

**Independent Test**: Open Ditjenbun pages and check animation states.

### Implementation for User Story 3

- [x] T006 [P] [US3] Add pageLoading state and split-grid skeleton layouts to `src/views/ditjenbun/PenetapanPlenoView.vue`
- [x] T007 [P] [US3] Add pageLoading state and document card skeleton placeholders to `src/views/ditjenbun/SKPenetapanView.vue`
- [x] T008 [P] [US3] Add pageLoading state and stepper form skeleton placeholders to `src/views/ditjenbun/PenerbitanSKView.vue`

**Checkpoint**: User Story 3 is fully functional and testable independently.

---

## Phase 6: User Story 4 - BPDPKS Admin & Partner Views (Priority: P2)

**Goal**: Add skeleton loading blocks to user list, partner agreement, and BAST reporting views.

**Independent Test**: Verify User Management, Penyaluran, and BAST pages show placeholders.

### Implementation for User Story 4

- [x] T009 [P] [US4] Add pageLoading state and table-row skeleton placeholders to `src/views/bpdpks/UserManagementView.vue`
- [x] T010 [P] [US4] Add pageLoading state and grid card skeleton placeholders to `src/views/bpdpks/PenyaluranDanaView.vue`
- [x] T011 [P] [US4] Add pageLoading state and dropzone skeleton placeholders to `src/views/bpdpks/PelaporanBASTView.vue`

**Checkpoint**: User Story 4 is fully functional and testable independently.

---

## Phase 7: User Story 5 - Pemohon/Pengusul Views (Priority: P2)

**Goal**: Add skeleton indicators to new proposal form, tracking list, and revision screens.

**Independent Test**: Check new proposal stepper, proposal tracking, and revisions loading states.

### Implementation for User Story 5

- [x] T012 [P] [US5] Add pageLoading state and table-row skeleton placeholders to `src/views/pengusulan/TrackingPengusulanView.vue`
- [x] T013 [P] [US5] Add pageLoading state and stepper skeleton placeholders to `src/views/pemohon/PengajuanProposalView.vue`
- [x] T014 [P] [US5] Add pageLoading state and card skeleton placeholders to `src/views/pemohon/RevisiProposalView.vue`

**Checkpoint**: All user stories are now independently functional.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Refactoring, compilation checks, and visual quality assurance.

- [x] T015 Run production build compilation check using `npm run build`
- [x] T016 Execute the `quickstart.md` validation scenarios manually in the browser

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Complete (blocking checkpoint resolved).
- **User Stories (Phase 3+)**: Can proceed in parallel or sequentially.
- **Polish (Phase 8)**: Depends on all user story completions.

### Parallel Opportunities

- All views across all user stories (T002 through T014) are independent files and can be worked on concurrently by multiple developers.
