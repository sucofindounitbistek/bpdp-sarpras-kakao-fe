# Tasks: Pekebun Proposal Confirmation Modal

**Input**: Design documents from `/specs/029-pekebun-proposal-modal/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are not explicitly requested in this feature specification, so no automated test generation tasks are included.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- Single project: `src/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Localization preparation and setup

- [x] T001 [P] Add localization strings for proposal submission under confirmationModal in src/config/localization.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Extend the confirmation modal component properties and visual layout to support submission context

**⚠️ CRITICAL**: No user story integration can begin until this phase is complete

- [x] T002 [P] Extend ApprovalConfirmationModal to support 'submit' action type, including its corresponding localization properties, green primary theme, and button label mapping in src/components/approval/ApprovalConfirmationModal.vue

**Checkpoint**: Foundation ready - component supports the proposal submission flow.

---

## Phase 3: User Story 1 - Tampilkan Modal Konfirmasi pada Pengajuan Proposal Pekebun (Priority: P1) 🎯 MVP

**Goal**: Show confirmation modal when Pekebun clicks Submit Proposal in the 3rd step of the wizard.

**Independent Test**: Login as a smallholder representative (Pemohon), navigate to the proposal page, proceed to Step 3, click "Submit Proposal" and check that the confirmation modal pops up with correct Indonesian wording.

### Implementation for User Story 1

- [x] T003 [P] [US1] Import component and define state refs (`showConfirmModal`, `confirmActionType`, `confirmDestination`, `confirmNotes`, `confirmModalRef`, `pendingConfirmAction`) inside src/views/pengusulan/StepPilihPekebunLahan.vue
- [x] T004 [US1] Intercept submit button click to set ref states and trigger the confirmation modal instead of executing directly in src/views/pengusulan/StepPilihPekebunLahan.vue
- [x] T005 [US1] Add the ApprovalConfirmationModal component to the template, binding props and registering close/confirm events in src/views/pengusulan/StepPilihPekebunLahan.vue
- [x] T006 [US1] Implement executePendingAction to perform the async store.submitProposal() action, handle loading states, close the modal, display toaster messages, and redirect the user in src/views/pengusulan/StepPilihPekebunLahan.vue

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Koeksistensi Modal Konfirmasi pada Alur Lainnya (Priority: P2)

**Goal**: Verify existing confirmation modals continue to display correctly in all other verifier flows.

**Independent Test**: Navigate to Dinas Kabupaten, Dinas Provinsi, Ditjenbun, and BPDPKS verification forms, perform check actions, and confirm that the confirmation modal still opens and works as before.

### Implementation for User Story 2

- [x] T007 [P] [US2] Verify that existing verifier action handlers and modal templates are unaffected and continue to function correctly in views including src/views/dinas/kabupaten/StepSummaryDanSubmit.vue, src/views/dinas/provinsi/StepSummaryDanSubmit.vue, and other verifier files.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, validation testing, and type checking

- [x] T008 [P] Run the quickstart.md validation steps locally on dev server to verify the end-to-end submission flow
- [x] T009 [P] Run type check and production build compiler validation (vue-tsc -b and npm run build) to ensure zero compilation regressions

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on T001 completion.
- **User Story 1 (Phase 3)**: Depends on Foundational (T002) completion.
- **User Story 2 (Phase 4)**: Can run in parallel with User Story 1.
- **Polish (Phase 5)**: Depends on all implementation tasks being complete.

### Parallel Opportunities

- Phase 1 (T001) and Phase 2 (T002) can be worked on sequentially, but once T002 is complete, the integration components inside StepPilihPekebunLahan can be written in parallel.
- Verification checks (T007) can be done in parallel at any time.
