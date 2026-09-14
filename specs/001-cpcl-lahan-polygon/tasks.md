# Tasks: CPCL Lahan Polygon Capture

**Input**: Design documents from `/specs/001-cpcl-lahan-polygon/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ui-contract.md, quickstart.md

**Tests**: No explicit TDD/test-first request in the specification. Validation tasks use existing `npm run build` and `npm test` commands in the final phase.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Add shared dependencies and styling needed for map preview.

- [X] T001 Install Leaflet and Vue Leaflet map dependencies in package.json
- [X] T002 Install Leaflet TypeScript definitions or verify bundled types in package.json
- [X] T003 Import Leaflet map CSS in src/main.ts or the selected app stylesheet

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared coordinate data structures, parsing, serialization, and validation used by every story.

**CRITICAL**: No user story work can begin until this phase is complete.

- [X] T004 Add CoordinatePoint and LandBoundaryPolygon types in src/types/pengusulan.ts
- [X] T005 Update DataCPCL typing for coordinate point handling while preserving koordinatPoligon in src/types/pengusulan.ts
- [X] T006 [P] Create coordinate parse/serialize helpers for koordinatPoligon in src/lib/coordinatePolygon.ts
- [X] T007 [P] Create coordinate range, duplicate, minimum-point, and polygon-shape validation helpers in src/lib/coordinatePolygon.ts
- [X] T008 Update cpclSchema validation for structured polygon coordinate requirements in src/schemas/pengusulan.schema.ts

**Checkpoint**: Coordinate data model and validation helpers ready for UI integration.

---

## Phase 3: User Story 1 - Create Land Polygon From Coordinates (Priority: P1) MVP

**Goal**: User enters at least three valid coordinate points in Data CPCL & Lahan and sees a closed polygon preview that is saved with CPCL data.

**Independent Test**: Open Data CPCL & Lahan, fill required CPCL fields, enter three valid coordinate rows, confirm map shows a closed polygon, add the CPCL row, and submit/save proposal data with polygon coordinates retained.

### Implementation for User Story 1

- [X] T009 [US1] Replace the single koordinatPoligon text input with coordinate row state in src/views/pengusulan/StepDataCPCL.vue
- [X] T010 [US1] Add add-row UI controls for latitude and longitude coordinate input in src/views/pengusulan/StepDataCPCL.vue
- [X] T011 [US1] Serialize valid coordinate rows into newForm.koordinatPoligon before adding CPCL data in src/views/pengusulan/StepDataCPCL.vue
- [X] T012 [US1] Render Leaflet map container and base map preview area in src/views/pengusulan/StepDataCPCL.vue
- [X] T013 [US1] Render a closed polygon preview from ordered valid coordinate rows in src/views/pengusulan/StepDataCPCL.vue
- [X] T014 [US1] Add empty and fewer-than-three-points preview messaging in src/views/pengusulan/StepDataCPCL.vue
- [X] T015 [US1] Ensure submitted daftarCPCL entries retain serialized koordinatPoligon payload in src/views/pengusulan/FormPengusulanView.vue

**Checkpoint**: User Story 1 is fully functional and independently testable as MVP.

---

## Phase 4: User Story 2 - Validate Coordinate Input (Priority: P2)

**Goal**: User receives clear validation feedback for invalid, incomplete, duplicate, insufficient, or malformed coordinate input, and invalid polygons cannot be submitted.

**Independent Test**: Enter invalid latitude/longitude values, incomplete rows, duplicate points, and too few points; confirm errors appear near the relevant inputs or map area, submission is blocked, and valid entries remain intact.

### Implementation for User Story 2

- [X] T016 [US2] Show per-row latitude and longitude validation messages in src/views/pengusulan/StepDataCPCL.vue
- [X] T017 [US2] Block add-CPCL action when coordinate validation errors exist in src/views/pengusulan/StepDataCPCL.vue
- [X] T018 [US2] Preserve valid coordinate row values after validation failure in src/views/pengusulan/StepDataCPCL.vue
- [X] T019 [US2] Display duplicate coordinate and invalid polygon shape messages in src/views/pengusulan/StepDataCPCL.vue
- [X] T020 [US2] Display map-unavailable fallback message without clearing coordinate input in src/views/pengusulan/StepDataCPCL.vue
- [X] T021 [US2] Align validation copy with contracts/ui-contract.md messages in src/views/pengusulan/StepDataCPCL.vue

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Edit Polygon Coordinates Before Submission (Priority: P3)

**Goal**: User can edit, remove, and reorder coordinate points after previewing the polygon without restarting the form or losing other CPCL data.

**Independent Test**: Create a valid polygon, edit one coordinate, remove one coordinate while at least three remain, reorder points, and confirm the polygon preview updates while unrelated CPCL fields stay unchanged.

### Implementation for User Story 3

- [X] T022 [US3] Add edit-in-place behavior for coordinate rows in src/views/pengusulan/StepDataCPCL.vue
- [X] T023 [US3] Add remove coordinate row behavior with invalid-preview state when fewer than three points remain in src/views/pengusulan/StepDataCPCL.vue
- [X] T024 [US3] Add move-up and move-down controls for coordinate ordering in src/views/pengusulan/StepDataCPCL.vue
- [X] T025 [US3] Recompute polygon preview after edit, remove, or reorder actions in src/views/pengusulan/StepDataCPCL.vue
- [X] T026 [US3] Parse existing saved koordinatPoligon values into coordinate rows when initializing or editing CPCL data in src/views/pengusulan/StepDataCPCL.vue

**Checkpoint**: All user stories are independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, responsiveness, accessibility, and cleanup across all stories.

- [X] T027 [P] Verify coordinate input labels, error text, and map fallback accessibility in src/views/pengusulan/StepDataCPCL.vue
- [X] T028 [P] Verify desktop and mobile layout for coordinate rows and map preview in src/views/pengusulan/StepDataCPCL.vue
- [X] T029 Remove obsolete free-text polygon handling or dead code from src/views/pengusulan/StepDataCPCL.vue
- [X] T030 Run type/build validation with npm run build
- [X] T031 Run test suite with npm test
- [X] T032 Validate quickstart scenarios from specs/001-cpcl-lahan-polygon/quickstart.md

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies; start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion; blocks all user stories.
- **User Story 1 (Phase 3)**: Depends on Foundational; MVP scope.
- **User Story 2 (Phase 4)**: Depends on Foundational and can integrate with US1 UI state.
- **User Story 3 (Phase 5)**: Depends on Foundational and can integrate with US1 UI state.
- **Polish (Phase 6)**: Depends on desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Start after Phase 2; no dependency on US2 or US3.
- **US2 (P2)**: Start after Phase 2; may reuse US1 coordinate row UI if implemented first.
- **US3 (P3)**: Start after Phase 2; may reuse US1 coordinate row UI if implemented first.

### Suggested Story Order

- MVP first: US1 only.
- Full feature: US1 -> US2 -> US3 -> Polish.

---

## Parallel Opportunities

- T006 and T007 can run in parallel after T004/T005 if edited carefully in the same helper file.
- T027 and T028 can run in parallel after all desired story work is complete.
- US2 and US3 can be developed in parallel after US1 establishes the coordinate row UI, but both touch src/views/pengusulan/StepDataCPCL.vue and require merge coordination.

## Parallel Example: User Story 1

```text
Task: "Render Leaflet map container and base map preview area in src/views/pengusulan/StepDataCPCL.vue"
Task: "Add empty and fewer-than-three-points preview messaging in src/views/pengusulan/StepDataCPCL.vue"
```

## Parallel Example: User Story 2

```text
Task: "Show per-row latitude and longitude validation messages in src/views/pengusulan/StepDataCPCL.vue"
Task: "Display map-unavailable fallback message without clearing coordinate input in src/views/pengusulan/StepDataCPCL.vue"
```

## Parallel Example: User Story 3

```text
Task: "Add remove coordinate row behavior with invalid-preview state when fewer than three points remain in src/views/pengusulan/StepDataCPCL.vue"
Task: "Add move-up and move-down controls for coordinate ordering in src/views/pengusulan/StepDataCPCL.vue"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 setup.
2. Complete Phase 2 coordinate data and validation foundation.
3. Complete Phase 3 US1.
4. Stop and validate: enter three valid points, confirm polygon preview, submit/save payload.

### Incremental Delivery

1. Setup + Foundational -> shared coordinate model ready.
2. US1 -> user can create and save a polygon.
3. US2 -> invalid input is blocked with clear feedback.
4. US3 -> user can edit, remove, reorder, and restore coordinates.
5. Polish -> responsive/accessibility/build/test/quickstart validation.

### Notes

- [P] tasks use different files or can be done without dependency on incomplete tasks.
- Tasks touching src/views/pengusulan/StepDataCPCL.vue should usually be sequenced by one implementer to avoid conflicts.
- Keep payload compatibility with existing `koordinatPoligon` unless backend contract changes are explicitly provided.
