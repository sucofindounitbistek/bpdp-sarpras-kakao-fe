# Tasks: Show RAB Document using RAB_RK

**Input**: Design documents from `/specs/049-show-rab-document-rk/`

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

- [x] T002 Verify backend endpoints in [api.md](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/specs/049-show-rab-document-rk/contracts/api.md)

---

## Phase 3: User Story 1 - Display and verify RAB_RK document under Pemeriksaan RAB (Priority: P1) 🎯 MVP

**Goal**: Display `RAB_RK` document under the RAB verification section and summary pages.

**Independent Test**: Open Step 1 and Step 4, confirm `RAB_RK` file name/size are shown and previewable.

### Implementation for User Story 1

- [x] T003 [P] [US1] Update Pemeriksaan RAB checks to use `getDokumen('RAB_RK')` in [StepVerifikasiPekebunDanDokumenProposal.vue](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue)
- [x] T004 [P] [US1] Update summary checks to use `getPersyaratanDoc('RAB_RK')` in [StepSummaryDanSubmit.vue](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepSummaryDanSubmit.vue)

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanups and verifying run scenarios.

- [x] T005 Run validation scenario in [quickstart.md](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/specs/049-show-rab-document-rk/quickstart.md)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup.
- **User Story 1 (Phase 3)**: Depends on Foundational.
- **Polish (Phase 4)**: Depends on User Story 1 completion.

### Parallel Opportunities

- T003 and T004 can run in parallel since they modify different files.
