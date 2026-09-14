# Tasks: fix-back-button-and-filters

**Input**: Design documents from `/specs/026-fix-back-button-and-filters/`

**Prerequisites**: plan.md (required), spec.md (required)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project state verification

- [x] T001 Verify local development environment is running successfully (`npm run dev`)
- [x] T002 Verify type checking compiles cleanly (`npx vue-tsc -b`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared components update

- [x] T003 [P] Modify `src/components/ui/QueueFilter.vue` to accept optional `statusOptions` and `jenisSarprasOptions` props, and compute deduplicated default status options from `LOCALIZATION.proposalStatus`

---

## Phase 3: User Story 1 - Dinas Kabupaten "Kembali" Button Fix (Priority: P1) 🎯 MVP

**Goal**: Return to Step 1 from Step 2 (Step ID 3, CPCL step) in Dinas Kabupaten wizard without blank view.

**Independent Test**: Navigate to Dinas Kab verification, proceed to Step 2, click Kembali, verify it goes to Step 1 and does not go blank.

### Implementation for User Story 1

- [x] T004 [US1] Update the click handler of the "Kembali" button in `src/views/dinas/kabupaten/StepDataCPCL.vue` to set `verifikasiStore.currentStep = 1` instead of `2`

---

## Phase 4: User Story 2 - Deduplicated and Functioning Status Filters (Priority: P1)

**Goal**: Deduplicate status options and update match checking logic to label-based comparison across Dinas Kab, Dinas Prov, and Pemohon tracking dashboards.

**Independent Test**: Check filters in Dinas Kab, Dinas Prov, and Tracking views. Verify no duplicate options exist and filtering works.

### Implementation for User Story 2

- [x] T005 [US2] Update `src/views/dinas/kabupaten/QueueVerifikasiKabView.vue` to import `getStatusLabel` and check status match using label comparison
- [x] T006 [US2] Update `src/views/dinas/provinsi/QueueVerifikasiProvinsiView.vue` to import `getStatusLabel` and check status match using label comparison
- [x] T007 [US2] Update `src/views/pengusulan/TrackingPengusulanView.vue` to compute `statusOptions` deduplicated by label, and update computed `filteredPengajuan` to compare status labels

---

## Phase 5: User Story 3 - Role-Specific Statuses for Ditjenbun and BPDP (Priority: P2)

**Goal**: Supply role-specific status options to the filter in Ditjenbun and BPDP queue dashboards.

**Independent Test**: Check filters in Ditjenbun and BPDP Rekomtek views, verifying they show only relevant options and filter correctly.

### Implementation for User Story 3

- [x] T008 [US3] Define custom `statusOptions` for Ditjenbun and pass them to the `QueueFilter` component in `src/views/ditjenbun/AntreanRekomtekView.vue`
- [x] T009 [US3] Define custom `statusOptions` for BPDP and pass them to the `QueueFilter` component in `src/views/bpdp/AntreanBpdpView.vue`

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation and final verification

- [x] T010 Run TypeScript build verification (`npm run build` or `npx vue-tsc -b`) to ensure no compile errors were introduced
- [x] T011 Run all manual quickstart validation scenarios outlined in `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion.
- **User Story 1 (Phase 3)**: Can start after Phase 2 is complete.
- **User Story 2 (Phase 4)**: Can start after Phase 2 is complete.
- **User Story 3 (Phase 5)**: Can start after Phase 2 is complete.
- **Polish (Phase 6)**: Depends on all implementation tasks (T004-T009) being complete.

### Parallel Opportunities

- T003 (Foundational) can run in parallel with T004 (User Story 1) since they modify different files, though we must update `QueueFilter.vue` (T003) before testing filters.
- User Story 1, User Story 2, and User Story 3 implementation tasks can be implemented in parallel.
