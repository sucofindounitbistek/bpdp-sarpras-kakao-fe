# Tasks: Adjust Minimum Land Coordinates

**Input**: Design documents from `/specs/039-adjust-min-coordinates-lahan/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/ui-contract.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic verification

- [x] T001 Setup verification environment for coordinate validation testing

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Verify coordinate schema constraint in src/schemas/pekebun.schema.ts
- [x] T003 Verify coordinate utility validation in src/lib/coordinatePolygon.ts

---

## Phase 3: User Story 1 - Add Land with Triangular Boundary (Priority: P1) 🎯 MVP

**Goal**: Ensure that the validation logic and Zod schema require a minimum of 3 points and successfully allow saving.

**Independent Test**: Go to Step 3 of the Pekebun registration form. Add a land record, click the "Poligon & Peta" tab, input exactly 3 distinct valid coordinates, verify the map renders a green shaded triangle, and click "Simpan Lahan" to successfully save the land record.

### Implementation for User Story 1

- [x] T004 [P] [US1] Align coordinates validation schema in src/schemas/pekebun.schema.ts
- [x] T005 [P] [US1] Ensure coordinate utility supports 3-point minimum in src/lib/coordinatePolygon.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Real-Time Coordinate Count UI Hints (Priority: P2)

**Goal**: Externalize hardcoded labels in components to load from localization config.

**Independent Test**: Open the land edit panel under the "Poligon & Peta" tab. Verify that the placeholder text or help text states that a minimum of 3 coordinates is required, and that the text changes to "Poligon valid" when 3 valid coordinates are provided.

### Implementation for User Story 2

- [x] T006 [P] [US2] Externalize coordinate status warning in src/config/localization.ts
- [x] T007 [US2] Update component template to load externalized labels in src/components/master-data/StepDataLahanPekebun.vue

**Checkpoint**: At this point, User Stories 1 and 2 should both work independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final check and production validation

- [x] T008 [P] Run dev build check with npm run build
- [x] T009 Run quickstart.md validation scenario 1 and 2

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

- Tasks marked with `[P]` (T004, T005, T006, T008) can run in parallel.
- User Story 1 and User Story 2 can be developed in parallel after Foundational phase is complete.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently using Scenario 1 of `quickstart.md`.

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
