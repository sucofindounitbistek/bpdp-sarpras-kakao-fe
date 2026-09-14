# Tasks: Detail Verifikasi Kabupaten Backend Integration

**Input**: Design documents from `/specs/047-detail-verifikasi-kab-backend/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: None requested or required.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Verify development setup in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 [P] Implement `getSpatialOverlap`, `bulkFarmerValidations`, and `bulkLandValidations` API endpoints in src/services/proposal.service.ts
- [x] T003 [P] Implement validation and spatial actions in src/stores/pengusulan.ts

---

## Phase 3: User Story 1 - Load Detail Proposal on Mount (Priority: P1) 🎯 MVP

**Goal**: Fetch and render proposal details dynamically on mount.

**Independent Test**: Route to detailed view, verify GET `/api/v1/proposals/:id` network request is triggered, and check rendering.

### Implementation for User Story 1

- [x] T004 [P] [US1] Externalize UI strings in src/views/dinas/kabupaten/DetailVerifikasiKabView.vue using `LOCALIZATION` keys
- [x] T005 [US1] Await `store.getProposalDetail(id)` inside `onMounted` lifecycle hook in src/views/dinas/kabupaten/DetailVerifikasiKabView.vue
- [x] T006 [US1] Connect skeleton loaders to reactive `pageLoading` state in src/views/dinas/kabupaten/DetailVerifikasiKabView.vue

---

## Phase 4: User Story 2 - Render Verification Overlap Map (Priority: P1)

**Goal**: Fetch spatial overlap boundaries.

**Independent Test**: Mount page and confirm GET `/api/v1/proposals/:id/spatial-overlap` API call.

### Implementation for User Story 2

- [x] T007 [US2] Trigger `store.getSpatialOverlap(id)` inside mount lifecycle of src/views/dinas/kabupaten/DetailVerifikasiKabView.vue

---

## Phase 5: User Story 3 - Validate Pekebun and Land Documents (Priority: P1)

**Goal**: Validate farmer profile details and land documents.

**Independent Test**: Verify checklist validation triggers POST `/api/v1/farmer-document-validations/bulk` and POST `/api/v1/land-document-validations/bulk`.

### Implementation for User Story 3

- [x] T008 [US3] Integrate bulk validation API calls within the check action of src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue
- [x] T009 [US3] Integrate bulk validation API calls within the check action of src/views/dinas/kabupaten/StepDataCPCL.vue

---

## Phase 6: User Story 4 - Return Proposal for Revision (Priority: P1)

**Goal**: Reject proposal to status `"REV_FROM_KAB"`.

**Independent Test**: Click revision button, verify PATCH `/api/v1/proposals/:id` is triggered with `status: "REV_FROM_KAB"`.

### Implementation for User Story 4

- [x] T010 [US4] Update `handleSaveRevisi` in src/views/dinas/kabupaten/DetailVerifikasiKabView.vue to PATCH status `"REV_FROM_KAB"`

---

## Phase 7: User Story 5 - Finalize and Approve Verification (Priority: P2)

**Goal**: Submit final SK CPCL document and change status to `"KAB_SUBMITTED"`.

**Independent Test**: Approve proposal, confirm SK CPCL bulk upload and status patch to `"KAB_SUBMITTED"`.

### Implementation for User Story 5

- [x] T011 [US5] Update final submit trigger in src/views/dinas/kabupaten/StepSummaryDanSubmit.vue to upload documents bulk and PATCH proposal status to `"KAB_SUBMITTED"`

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality verification and cleanup

- [x] T012 [P] Run type safety and build compilation checks with `npm run build`
- [x] T013 [P] Run verification checklist in specs/047-detail-verifikasi-kab-backend/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 completion.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
- **Polish (Phase 8)**: Depends on all desired user stories being complete.
