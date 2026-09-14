# Tasks: NIK Lookup Updates Alamat and Kodepos

**Input**: Design documents from `/specs/031-pekebun-nik-lookup-address/`

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

*None. This feature is lightweight and directly integrates into existing components.*

---

## Phase 2: Foundational (Blocking Prerequisites)

- [x] T001 [P] [US1] Extend DukcapilResult type interface to include optional alamat and kodepos fields in src/types/pekebun.ts

---

## Phase 3: User Story 1 - Cari NIK Otomatis Mengisi Alamat dan Kodepos (Priority: P1) 🎯 MVP

**Goal**: Automatically fill the Alamat and Kodepos fields upon a successful NIK verifier action.

**Independent Test**: Type a valid mock NIK in the form, click "Cari NIK", and verify the address and postal code are populated. Try with an invalid NIK and verify they are cleared.

### Implementation for User Story 1

- [x] T002 [US1] Add mock alamat and kodepos fields to all entries in MOCK_DUKCAPIL within src/stores/pekebun.ts
- [x] T003 [US1] Map res.alamat and res.kodepos properties inside handleLookupNik() to form refs, and reset them to empty strings on lookup failure in src/views/master-data/FormPekebunView.vue

**Checkpoint**: User Story 1 is functional and testable.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: QA testing and compilation checks

- [x] T004 [P] Run the manual quickstart.md validation scenario on local dev server to ensure auto-fill and resets work correctly
- [x] T005 [P] Verify type safety and compiler compatibility using npm run build

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 2)**: T001 is a prerequisites for the rest.
- **User Story 1 (Phase 3)**: Depends on Foundational (T001) completion.
- **Polish (Phase 5)**: Depends on Phase 3 completion.
