# Tasks: provinsi-approval-modal

**Input**: Design documents from `/specs/025-provinsi-approval-modal/`

**Prerequisites**: plan.md (required), spec.md (required)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project state check

- [x] T001 Verify project build status before starting changes using `npm run build`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core modal verification

- [x] T002 Verify `ApprovalConfirmationModal` exports and paths in `src/components/approval/ApprovalConfirmationModal.vue`

---

## Phase 3: User Story 1 - Dinas Provinsi Submission Confirmation (Priority: P1) 🎯 MVP

**Goal**: Show confirmation modal when Dinas Provinsi submits proposal verification to Ditjenbun.

**Independent Test**: Navigate to Step 4 of Dinas Provinsi verification, click "Ajukan ke Ditjenbun", and verify the modal appears with destination "Ditjenbun".

### Implementation for User Story 1

- [x] T003 [P] [US1] Import `ApprovalConfirmationModal` and define ref states in `src/views/dinas/provinsi/StepSummaryDanSubmit.vue`
- [x] T004 [US1] Integrate `<ApprovalConfirmationModal>` template component and bind properties in `src/views/dinas/provinsi/StepSummaryDanSubmit.vue`
- [x] T005 [US1] Update `handleAjukanKeDitjenbun` logic to set up the pending action and open the modal in `src/views/dinas/provinsi/StepSummaryDanSubmit.vue`

**Checkpoint**: At this point, User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Dinas Provinsi Rejection Confirmation (Priority: P1)

**Goal**: Show confirmation modal when Dinas Provinsi returns/rejects SK CPCL back to Dinas Kabupaten.

**Independent Test**: Navigate to Step 3 of Dinas Provinsi verification, reject SK CPCL, enter notes, click "Revisi Kembali Dokumen", and check the modal display.

### Implementation for User Story 2

- [x] T006 [P] [US2] Import `ApprovalConfirmationModal` and define ref states in `src/views/dinas/provinsi/StepDataCPCL.vue`
- [x] T007 [US2] Integrate `<ApprovalConfirmationModal>` template component and bind properties in `src/views/dinas/provinsi/StepDataCPCL.vue`
- [x] T008 [US2] Update `submitRejection` logic to open the modal with action-type "reject", destination, and notes in `src/views/dinas/provinsi/StepDataCPCL.vue`

**Checkpoint**: At this point, User Story 2 is fully functional and testable independently.

---

## Phase 5: User Story 3 - Dinas Kabupaten Submission Confirmation (Priority: P2)

**Goal**: Show confirmation modal when Dinas Kabupaten submits proposal verification to Dinas Provinsi.

**Independent Test**: Navigate to Step 4 of Dinas Kabupaten verification, click "Ajukan Ke Provinsi", and verify the modal appears with destination "Dinas Provinsi".

### Implementation for User Story 3

- [x] T009 [P] [US3] Import `ApprovalConfirmationModal` and define ref states in `src/views/dinas/kabupaten/StepSummaryDanSubmit.vue`
- [x] T010 [US3] Integrate `<ApprovalConfirmationModal>` template component and bind properties in `src/views/dinas/kabupaten/StepSummaryDanSubmit.vue`
- [x] T011 [US3] Update `handleAjukanKeProvinsi` logic to open the modal with action-type "approve" and destination in `src/views/dinas/kabupaten/StepSummaryDanSubmit.vue`

**Checkpoint**: All three user stories are now independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification and validation

- [x] T012 Run quickstart validation scenarios in `specs/025-provinsi-approval-modal/quickstart.md`
- [x] T013 Verify clean production build via `npm run build`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion.
- **User Stories (Phase 3-5)**: Depend on Foundational completion. Can be worked on in parallel.
- **Polish (Phase 6)**: Depends on all user stories being completed.
