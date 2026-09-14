# Tasks: Multi-Lahan Pekebun Registration

**Input**: Design documents from `/specs/009-multi-lahan-pekebun/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Tests are OPTIONAL - manual testing will be conducted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Update types and schema definitions for list structure

- [x] T001 [P] Update data model interface to support `daftarLahan?: LahanPekebun[]` in `src/types/pekebun.ts`
- [x] T002 [P] Implement `lahanPekebunListSchema` validator in `src/schemas/pekebun.schema.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update store actions and mock data for array structures

- [x] T003 Update `addPekebunMulti` store action in `src/stores/pekebun.ts` to save array of lands
- [x] T004 Update the list of initial mock farmers in `src/stores/pekebun.ts` to populate `daftarLahan` for backward compatibility

---

## Phase 3: User Story 1 & 2 - Land Summaries & In-Line Accordion (Priority: P1) 🎯 MVP

**Goal**: Render list of added lands and support expanding one land form panel for editing/adding text inputs.

**Independent Test**: Navigate to wizard Step 3. Confirm lands are listed as summary cards. Click edit or add to open the accordion panel.

### Implementation for User Story 1 & 2

- [x] T005 [US1] Implement local state `lahanList` and list UI (summary cards showing legal type, acreage, location, and validation errors) in `src/components/master-data/StepDataLahanPekebun.vue`
- [x] T006 [US1] Implement `+ Tambah Lahan Baru` and action button handlers (edit, save, cancel) in `src/components/master-data/StepDataLahanPekebun.vue`
- [x] T007 [US1] Implement segmented tabs routing (Legalitas, Alamat & Berkas, Poligon & Peta) in the expanded land form panel in `src/components/master-data/StepDataLahanPekebun.vue`
- [x] T008 [US2] Update `FormPekebunView.vue` to store `lahanDataList` array instead of single `lahanData`, and bind it to `StepDataLahanPekebun` component
- [x] T009 [US2] Update `handleSubmit` in `FormPekebunView.vue` to run validation on `lahanPekebunListSchema` and pass array data to store

---

## Phase 4: User Story 3 - Interactive Map inside Accordion Tab (Priority: P2)

**Goal**: Mount Leaflet map container dynamically only when map tab is active.

**Independent Test**: Open a land panel, click "Poligon & Peta" tab, verify map loads cleanly and polygon changes dynamically.

### Implementation for User Story 3

- [x] T010 [US3] Implement dynamic Leaflet map initialization, coordinate row table reordering, and map drawing inside tab 3 container in `src/components/master-data/StepDataLahanPekebun.vue`

---

## Phase 5: User Story 4 - Remove Land Record (Priority: P2)

**Goal**: Delete a land record from list with confirmation.

**Independent Test**: Click delete action on card, confirm, and verify card is removed from summary list.

### Implementation for User Story 4

- [x] T011 [US4] Implement `removeLahan` logic with confirmation in `src/components/master-data/StepDataLahanPekebun.vue`

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Verify production build and test scenarios

- [x] T012 Run type checking and production build check `npm run build` to verify compatibility
- [x] T013 Verify the implementation against verification scenarios in `specs/009-multi-lahan-pekebun/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion - blocks all UI work.
- **User Stories (Phase 3+)**: Depend on Foundational phase completion.
- **Polish (Final Phase)**: Depends on all user stories completion.

### User Story Dependencies

- **User Story 1 & 2 (P1)**: Can start after Foundational phase is complete.
- **User Story 3 (P2)**: Depends on User Story 1 & 2 layout structure.
- **User Story 4 (P2)**: Can start after User Story 1 & 2 list representation is built.

---

## Implementation Strategy

### MVP First (User Story 1 & 2 Only)

1. Complete Setup and Foundational stores.
2. Build list view and text forms inside expanding panels in `StepDataLahanPekebun.vue`.
3. Verify adding/saving text-only land records works end-to-end.

### Incremental Delivery

1. Add Tab 3 (Leaflet Map) to integrate boundary polygon mapping.
2. Add Delete record functionality.
3. Polish styles and run production build tests.
