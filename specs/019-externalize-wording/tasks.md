# Tasks: Centralize Localization Wording

**Input**: Design documents from `/specs/019-externalize-wording/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and validation

- [x] T001 Verify active feature tracking in `.specify/feature.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the central localization dictionary configuration

- [x] T002 Create the central localization file `src/config/localization.ts` containing static copy, status labels, and types

**Checkpoint**: Foundation ready - Component integration can begin

---

## Phase 3: User Story 1 - Pengelolaan Wording Terpusat (Priority: P1) 🎯 MVP

**Goal**: Update core types and components to read user-facing copy from the central localization config.

**Independent Test**: Modify any string in `src/config/localization.ts` and confirm the label changes in the browser.

### Implementation for User Story 1

- [x] T003 [P] [US1] Refactor `PengajuanStatusLabel` and `JenisSarprasLabel` in `src/types/pengusulan.ts` to reference `LOCALIZATION` properties
- [x] T004 [P] [US1] Refactor `computedSteps` reactive array labels and sub-labels in `src/views/pengusulan/TrackingPengusulanView.vue` to reference `LOCALIZATION` properties
- [x] T005 [P] [US1] Refactor `getStatusLabel` helper inside `src/views/dinas/kabupaten/QueueVerifikasiKabView.vue` to reference `LOCALIZATION` properties

**Checkpoint**: Core workflow is fully integrated with central localization config.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Build confirmation and validation checks

- [x] T006 Type check the project using `vue-tsc -b`
- [x] T007 Build the project to verify production readiness using `npm run build`
- [x] T008 Run all manual verification scenarios documented in `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on T001. Blocks all other tasks.
- **User Story 1 (Phase 3)**: Depends on T002.
- **Polish (Phase 4)**: Depends on Phase 3 completion.

### Parallel Opportunities

- All three tasks in Phase 3 (T003, T004, T005) can run in parallel.
