# Tasks: Adjust Gudang Storage Area API Response Alignment

**Input**: Design documents from `specs/050-adjust-gudang-storage-area/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: None requested/required (per Project Constitution)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Verification of current environment

- [x] T001 Verify active proposal details can be queried from the backend API

---

## Phase 2: User Story 1 - View and Verify Storage Area Documents (Priority: P1) 🎯 MVP

**Goal**: Align storage area properties so verifiers can see and verify warehouse photos in the verification step.

**Independent Test**: Log in as Dinas Kabupaten, open verification details for a proposal, navigate to verification tab, scroll to warehouse section and confirm photos and coordinates render correctly.

### Implementation for User Story 1

- [x] T002 [US1] Implement mapping helper function `mapStorageArea` in `src/stores/pengusulan.ts`
- [x] T003 [US1] Update `activePengajuan` in `src/stores/pengusulan.ts` to map `storage_area` and `gudangSerahTerima` using `mapStorageArea`
- [x] T004 [US1] Update `listPengajuan` mapping in `fetchProposals` inside `src/stores/pengusulan.ts` to map `storage_area` and `gudangSerahTerima` using `mapStorageArea`
- [x] T005 [US1] Update `createProposal` mapping in `src/stores/pengusulan.ts` to map `storage_area` and `gudangSerahTerima` using `mapStorageArea`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 3: User Story 2 - Verify Storage Area Details on Summary and Preview Modals (Priority: P2)

**Goal**: Ensure proposal tracking table, preview modals, and summaries display aligned warehouse info consistently.

**Independent Test**: Click preview modal from proposal list and confirm warehouse address, coordinates, and photo links display correctly.

### Implementation for User Story 2

- [x] T006 [US2] Verify that `src/components/pengusulan/ProposalPreviewModal.vue` correctly renders storage_area details
- [x] T007 [US2] Verify that `src/views/dinas/kabupaten/StepSummaryDanSubmit.vue` correctly renders storage_area details

**Checkpoint**: At this point, User Stories 1 and 2 should both work.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and type checking

- [x] T008 [P] Perform type checking using `vue-tsc -b` (Verified via successful `npm run build`)
- [x] T009 Run `quickstart.md` validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **User Story 1 (Phase 2)**: Depends on Setup completion.
- **User Story 2 (Phase 3)**: Depends on User Story 1 mapping implementation.
- **Polish (Phase 4)**: Depends on all user story tasks being complete.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: User Story 1
3. **STOP and VALIDATE**: Verify photos show in verification view
4. Proceed to User Story 2
