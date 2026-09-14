# Tasks: RAB PDF Generation

**Input**: Design documents from `/specs/030-generate-rab-pdf/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Tests are not explicitly requested, so no automated test tasks are generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- Single project: `src/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Localization configuration updates

- [x] T001 [P] Update downloadSuccess localization message in src/config/localization.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

*None. This feature is lightweight and directly integrates into existing components.*

---

## Phase 3: User Story 1 - Unduh RAB dalam Format PDF (Priority: P1) 🎯 MVP

**Goal**: Print styled PDF layouts containing RAB table entries.

**Independent Test**: Add entries to the RAB table, click "Unduh RAB", and check that the browser's native print modal displays a styled printable document.

### Implementation for User Story 1

- [x] T002 [US1] Formulate HTML template string builder containing print reset CSS styles, dynamic table columns/rows, and summary rows (including double lower roundings) in src/views/pengusulan/StepRAB.vue
- [x] T003 [US1] Implement iframe printing logic to inject the HTML template string and trigger contentWindow.print() in downloadRAB() inside src/views/pengusulan/StepRAB.vue

**Checkpoint**: User Story 1 is functional and allows printing the RAB table.

---

## Phase 4: User Story 2 - Menampilkan Informasi Lembaga Pekebun dan Alamat (Priority: P1)

**Goal**: Display active Kelompok Tani/Koperasi details and addresses on the printable document header.

**Independent Test**: Complete the profile step, trigger RAB printing, and check that the correct name and address are rendered. Check that default profiles fallback to Sleman Semabda.

### Implementation for User Story 2

- [x] T004 [US2] Extract active Lembaga name and address dynamically from Pinia draft store, falling back to 'Kelompok Tani Bukan Karyawan Baru' and 'Sleman Semabda' when they are blank or set to defaults in src/views/pengusulan/StepRAB.vue

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: QA testing and compilation checks

- [x] T005 [P] Run the manual quickstart.md validation scenario on local dev server to ensure layout matches reference image
- [x] T006 [P] Verify type safety and compiler compatibility using npm run build

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **User Story 1 (Phase 3)**: Depends on T001 completion.
- **User Story 2 (Phase 4)**: Can run in parallel with User Story 1.
- **Polish (Phase 5)**: Depends on Phase 3 and 4 completions.
