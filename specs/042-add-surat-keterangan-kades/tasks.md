# Tasks: Add Surat Keterangan Kepala Desa Document in Proposal

**Input**: Design documents from `/specs/042-add-surat-keterangan-kades/`

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

## Phase 2: Foundational (Reverts & Prerequisites)

**Purpose**: Clean up previous Pekebun-level implementation and prep proposal models

- [x] T002 Revert SURAT_KET_KADES and suratKeteranganKades from src/types/pekebun.ts
- [x] T003 Revert mapDocumentType and FormData appends in src/stores/pekebun.ts
- [x] T004 Revert upload slot from src/components/master-data/StepUploadDokumenPekebun.vue
- [x] T005 Revert initial states, mappings, and validations from src/views/master-data/FormPekebunView.vue
- [x] T006 Revert side-by-side template check block from src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue
- [x] T007 Revert label mappings from src/views/dinas/provinsi/PratinjauPekebunDetailView.vue

---

## Phase 3: User Story 1 - Cooperative Uploads Document (Priority: P1) 🎯 MVP

**Goal**: Render Surat Keterangan Kades upload slot in Proposal Step 2 for all packages.

**Independent Test**: Create an usulan, select a package, and verify "Surat Keterangan Kepala Desa" is listed as a required document.

### Implementation for User Story 1

- [x] T008 [US1] Add 'SURAT_KET_KADES' to DokumenPersyaratan['tipeDokumen'] union in src/types/pengusulan.ts
- [x] T009 [US1] Define SURAT_KET_KADES and add to COMMON list in src/lib/pengusulan-persyaratan.config.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Verifier Reviews Proposal Document (Priority: P1) 🎯 MVP

**Goal**: Support verifier previewing and toggling status for the document.

**Independent Test**: Open an usulan for verification, click Verifikasi on "Surat Keterangan Kepala Desa", check modal preview, approve/reject it.

### Implementation for User Story 2

- [x] T010 [US2] Add mock SURAT_KET_KADES documents to mock usulans in src/stores/rekomtek.ts and src/stores/pengusulan.ts
- [x] T011 [US2] Update document verification keys check in src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue

**Checkpoint**: At this point, User Stories 1 and 2 should both work independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final check and production validation

- [x] T012 [P] Run dev build check with npm run build
- [x] T013 Run quickstart.md validation scenarios

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

- Tasks marked with `[P]` (T012) can run in parallel.
- User Story 1 and User Story 2 can be developed in parallel after Foundational phase is complete.
