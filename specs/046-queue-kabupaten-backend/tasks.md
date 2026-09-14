# Tasks: Queue Kabupaten Backend Integration

**Input**: Design documents from `/specs/046-queue-kabupaten-backend/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: None requested or required.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 [P] Verify development setup and environment in package.json

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 [P] Verify or extend `proposalService.getList` mapping rules in src/stores/pengusulan.ts

---

## Phase 3: User Story 1 - View Submitted Proposals in Kabupaten Verification Queue (Priority: P1) 🎯 MVP

**Goal**: Fetch and render submitted proposals from the backend instead of mock data.

**Independent Test**: Mount view, inspect network calls to confirm GET `/api/v1/proposals?status=SUBMITTED` is triggered, and verify table renders submitted items.

### Implementation for User Story 1

- [x] T003 [P] [US1] Update UI labels and titles in src/views/dinas/kabupaten/QueueVerifikasiKabView.vue using `LOCALIZATION.dinasKabAntrean` keys
- [x] T004 [US1] Integrate backend API fetch action inside mount lifecycle of src/views/dinas/kabupaten/QueueVerifikasiKabView.vue
- [x] T005 [US1] Bind loading states and skeleton loader structure to actual API load status in src/views/dinas/kabupaten/QueueVerifikasiKabView.vue
- [x] T006 [US1] Implement API request error catching, rendering, and toast alerts in src/views/dinas/kabupaten/QueueVerifikasiKabView.vue

---

## Phase 4: User Story 2 - Local Search and Filter (Priority: P2)

**Goal**: Filter the loaded proposals using local search keyword and package type selectors.

**Independent Test**: Type keywords in search bar and select package filter to confirm table filters results properly.

### Implementation for User Story 2

- [x] T007 [P] [US2] Update computed local filtering function for search and jenisSarpras in src/views/dinas/kabupaten/QueueVerifikasiKabView.vue

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Quality verification and cleanup

- [x] T008 [P] Verify type safety and run production builds using `npm run build`
- [x] T009 [P] Run verification checklist in specs/046-queue-kabupaten-backend/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Phase 1 completion.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
- **Polish (Phase 5)**: Depends on all desired user stories being complete.

### Parallel Opportunities

- Tasks marked with `[P]` can run in parallel where resource staffing allows.
