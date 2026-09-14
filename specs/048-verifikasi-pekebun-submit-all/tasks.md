# Tasks: Verifikasi Pekebun Submit All at End

**Input**: Design documents from `/specs/048-verifikasi-pekebun-submit-all/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify active feature configuration in [feature.json](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/.specify/feature.json)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 Verify backend endpoints in [api.md](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/specs/048-verifikasi-pekebun-submit-all/contracts/api.md)

---

## Phase 3: User Story 1 - Defer validation submissions during step transitions (Priority: P1) 🎯 MVP

**Goal**: Defer validation status POSTs until final submit, making step transitions instant.

**Independent Test**: Navigate to Step 1, select verifications, and transition to Step 3. Confirm no validation API calls are initiated.

### Implementation for User Story 1

- [x] T003 [US1] Remove bulk validation API calls from `validateAndProceed` and directly change step to 3 in [StepVerifikasiPekebunDanDokumenProposal.vue](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue)

---

## Phase 4: User Story 2 - Bulk submit all validations and updates at the end (Priority: P1)

**Goal**: Sequentially trigger bulk validations and status updates upon final submit.

**Independent Test**: Go to Step 4, click approve/rejection, verify that both farmer and land validations are submitted in bulk before status update.

### Implementation for User Story 2

- [x] T004 [US2] Convert `isSubmitting` to a reactive ref in [StepSummaryDanSubmit.vue](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepSummaryDanSubmit.vue)
- [x] T005 [US2] Add payload building logic for farmer and land validations in [StepSummaryDanSubmit.vue](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepSummaryDanSubmit.vue)
- [x] T006 [US2] Implement sequential validation API calls in `handleAjukanKeProvinsi` in [StepSummaryDanSubmit.vue](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepSummaryDanSubmit.vue)
- [x] T007 [US2] Implement sequential validation API calls in `handleKembalikanRevisi` in [StepSummaryDanSubmit.vue](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepSummaryDanSubmit.vue)

---

## Phase 5: User Story 3 - Draft persistence across transitions (Priority: P2)

**Goal**: Ensure draft validations are preserved across reload and step transitions.

**Independent Test**: Reload page, verify selected checks remain set.

### Implementation for User Story 3

- [x] T008 [US3] Verify draft state persistence in [verifikasiKabDraft.ts](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/src/stores/verifikasiKabDraft.ts)

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanups and verifying run scenarios.

- [x] T009 Run validation scenario in [quickstart.md](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/specs/048-verifikasi-pekebun-submit-all/quickstart.md)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup.
- **User Story 1 (Phase 3)**: Depends on Foundational.
- **User Story 2 (Phase 4)**: Depends on User Story 1.
- **User Story 3 (Phase 5)**: Depends on Foundational.
- **Polish (Phase 6)**: Depends on all stories completion.

### Parallel Opportunities

- T008 (US3) can run in parallel with US1 and US2 tasks.
