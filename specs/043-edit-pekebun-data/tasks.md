# Tasks: Edit Data Pekebun

**Input**: Design documents from `/specs/043-edit-pekebun-data/`

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

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core routing prerequisites for the feature

- [x] T002 Register '/master-data/pekebun/edit/:id' route in src/router/index.ts

---

## Phase 3: User Story 1 - Edit Registered Pekebun from List Actions (Priority: P1) 🎯 MVP

**Goal**: Support editing registered pekebun rows directly from the master data table actions.

**Independent Test**: Click Edit on a registered row, verify form is populated with details, make edits, and save.

### Implementation for User Story 1

- [x] T003 [US1] Expose Edit action button for registered (non-draft) rows in src/views/master-data/PekebunListView.vue
- [x] T004 [US1] Update FormPekebunView.vue onMounted to load data from route.params.id (or query.draftId) using resumeDraft
- [x] T005 [US1] Set isEditingRegistered flag and conditionally hide "Simpan Draft" button in src/views/master-data/FormPekebunView.vue

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Edit Registered Pekebun from Detail Modal (Priority: P2)

**Goal**: Expose an Edit Data button in the Pekebun detail modal footer.

**Independent Test**: Open a registered pekebun detail modal, click Edit Data, verify it closes modal and redirects to edit form.

### Implementation for User Story 2

- [x] T006 [US2] Add Edit button in footer of src/components/master-data/DetailPekebunModal.vue
- [x] T007 [US2] Emit 'edit' event from DetailPekebunModal.vue and handle it in src/views/master-data/PekebunListView.vue to navigate to edit page

**Checkpoint**: At this point, User Stories 1 and 2 should both work independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final check and production validation

- [x] T008 [P] Run dev build check with npm run build
- [x] T009 Run quickstart.md validation scenarios

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

### Parallel Opportunities

- Tasks marked with `[P]` (T008) can run in parallel.
- User Story 1 and User Story 2 can be developed in parallel after Foundational phase is complete.
