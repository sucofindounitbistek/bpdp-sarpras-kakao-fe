# Tasks: Disable Selected Lahan

**Input**: Design documents from `/specs/044-disable-selected-lahan/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/ui-contract.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project builds correctly

- [x] T001 Verify project build before making changes

---

## Phase 2: Foundational (Blocking Prerequisites)

*No foundational tasks needed.*

---

## Phase 3: User Story 1 - Disable Selected Lahan (Priority: P1) 🎯 MVP

**Goal**: Disable selection of lands already associated with active proposals.

**Independent Test**: Verify that pre-seeded proposal lands (Ahmad Supardi and Siti Rahma) are unselectable in Step 3.

### Implementation for User Story 1

- [x] T002 [US1] Import usePengusulanStore and implement getLahanActiveProposal helper method in src/views/pengusulan/StepPilihPekebunLahan.vue
- [x] T003 [US1] Implement isPekebunDisabled helper method in src/views/pengusulan/StepPilihPekebunLahan.vue
- [x] T004 [US1] Disable land checkbox inputs, update styles, and render warning labels with resi number in src/views/pengusulan/StepPilihPekebunLahan.vue
- [x] T005 [US1] Disable pekebun header buttons, update styles, and render warning labels in src/views/pengusulan/StepPilihPekebunLahan.vue

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final check and production validation

- [x] T006 [P] Run dev build check with npm run build
- [x] T007 Run quickstart.md validation scenarios

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Stories (Phase 3+)**: Depend on Setup completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### Parallel Opportunities

- T006 can run in parallel with polish checks.
