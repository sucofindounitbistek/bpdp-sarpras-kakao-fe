# Tasks: Change StepDataCPCL Inputs

**Input**: Design documents from `/specs/041-change-stepdatacpcl-inputs/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/ui-contract.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic verification

- [x] T001 Verify project build before making changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Update localization config with new stepDataCpcl labels in src/config/localization.ts
- [x] T003 Update useVerifikasiKabDraftStore store state in src/stores/verifikasiKabDraft.ts
- [x] T004 Update useVerifikasiKabStore store state and submission action in src/stores/verifikasiKab.ts

---

## Phase 3: User Story 1 - Upload Three Verification Documents (Priority: P1) 🎯 MVP

**Goal**: Render three distinct FileUpload inputs in Step 3.

**Independent Test**: Navigate to the Verifikator Kabupaten Detail view, go to Step 3, and confirm that there are exactly three document upload slots matching the requested names, each with preview and delete actions.

### Implementation for User Story 1

- [x] T005 [US1] Refactor document upload form inputs in src/views/dinas/kabupaten/StepDataCPCL.vue

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Verify Uploaded Documents in Summary Page (Priority: P2)

**Goal**: Display status and preview buttons for all three files in Step 4.

**Independent Test**: Complete the uploads in Step 3, proceed to Step 4, and confirm all three documents are summarized correctly.

### Implementation for User Story 2

- [x] T006 [US2] Display all three uploaded documents in summary view in src/views/dinas/kabupaten/StepSummaryDanSubmit.vue

**Checkpoint**: At this point, User Stories 1 and 2 should both work independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final check and production validation

- [x] T007 [P] Run dev build check with npm run build
- [x] T008 Run quickstart.md validation scenario 1

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable

### Within Each User Story

- Models/utilities before components/views
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- Tasks marked with `[P]` (T007) can run in parallel.
- User Story 1 and User Story 2 can be developed in parallel after Foundational phase is complete.
