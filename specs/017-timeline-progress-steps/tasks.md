# Tasks: Pekebun Timeline Step View & Wording Refinement

**Input**: Design documents from `/specs/017-timeline-progress-steps/`

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

**Purpose**: Core model verification before implementing UI changes

**⚠️ CRITICAL**: Confirm status enum definition before proceeding to UI steps

- [x] T002 Verify enum values in `src/types/pengusulan.ts` to ensure compatibility with mapping logic

**Checkpoint**: Foundation ready - UI implementation can now begin

---

## Phase 3: User Story 1 - Stepper Terhubung yang Responsif (Priority: P1) 🎯 MVP

**Goal**: Redesign the progress grid into a connected stepper component (horizontal on desktop, vertical on mobile).

**Independent Test**: Resize viewport to mobile (375px) and verify vertical stacked stepper with connecting line on the left. Resize to desktop and verify horizontal stepper.

### Implementation for User Story 1

- [x] T003 [US1] Define stepper step data model and computed properties in `src/views/pengusulan/TrackingPengusulanView.vue`
- [x] T004 [US1] Implement horizontal layout and animated progress line for desktop screens in `src/views/pengusulan/TrackingPengusulanView.vue`
- [x] T005 [US1] Implement vertical stacked layout and connecting lines for mobile screens in `src/views/pengusulan/TrackingPengusulanView.vue`
- [x] T006 [US1] Configure active step indicator with pulse/active CSS animation and brand color `#066C2A` in `src/views/pengusulan/TrackingPengusulanView.vue`

**Checkpoint**: Stepper component structure is fully responsive and rendered with stub data.

---

## Phase 4: User Story 2 - Penyelarasan Wording & Pemetaan Status (Priority: P2)

**Goal**: Update step wording and map actual proposal status codes to step states (Completed, Active, Pending, Warning, Error).

**Independent Test**: Open different proposals with various statuses (e.g. `SUBMITTED`, `SK_DITJENBUN_ISSUED`, `COMPLETED`, `REVISION_ADMIN`) and verify correct wording and visual colors.

### Implementation for User Story 2

- [x] T007 [US2] Map step wording and currentStatus logic for Steps 1-5 in `src/views/pengusulan/TrackingPengusulanView.vue`
- [x] T008 [US2] Implement color coding and icon swaps for edge cases `REVISION_ADMIN` and `REJECTED` in `src/views/pengusulan/TrackingPengusulanView.vue`

**Checkpoint**: All user stories are functional and status-driven stepper states are correct.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Build confirmation and end-to-end verification

- [x] T009 Type check the project using `vue-tsc -b`
- [x] T010 Build the project to verify production readiness using `npm run build`
- [x] T011 Run all manual verification scenarios documented in `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on T001 completion.
- **User Stories (Phase 3+)**: Depend on Foundational completion.
  - Phase 3 (US1: Stepper UI) blocks Phase 4 (US2: State Mapping).
- **Polish (Final Phase)**: Depends on all user story completions.

### Parallel Opportunities

- Setup tasks and Foundational checks are single-file, so they are done sequentially.
- Within User Story 1, tasks T004 and T005 are responsive layouts and can be developed in parallel once the computed properties (T003) are defined.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational verification.
2. Implement stepper layout (T003-T006).
3. Validate stepper responsiveness on mobile and desktop viewports.

### Incremental Delivery

1. Deliver responsive stepper UI first (MVP).
2. Wire actual state mappings and refine step wording.
3. Validate all edge cases and build the production bundle.
