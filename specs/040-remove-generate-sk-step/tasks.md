# Tasks: Remove Generate SK Step

**Input**: Design documents from `/specs/040-remove-generate-sk-step/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/ui-contract.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic verification

- [x] T001 Verify project build before making changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Verify current mount logic and status checks in src/views/bpdp/FinalisasiSkDirutView.vue

---

## Phase 3: User Story 1 - Direct SK Finalization (Priority: P1) 🎯 MVP

**Goal**: Remove "Generate SK" step, initialize `draftUrl` on mount, show rest of the form on mount.

**Independent Test**: Navigate to the Finalisasi SK Dirut view for any eligible usulan. Verify that the "Generate Rancangan SK Dirut" step is not rendered, and that all inputs (Nomor SK, upload file, and download draft) are visible immediately.

### Implementation for User Story 1

- [x] T003 [US1] Auto-initialize draftUrl on mount if missing in src/views/bpdp/FinalisasiSkDirutView.vue
- [x] T004 [US1] Remove step 1 generate SK HTML block and show finalization form on mount in src/views/bpdp/FinalisasiSkDirutView.vue

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final check and production validation

- [x] T005 [P] Run dev build check with npm run build
- [x] T006 Run quickstart.md validation scenario 1

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories

### Within Each User Story

- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- Tasks marked with `[P]` (T005) can run in parallel.
