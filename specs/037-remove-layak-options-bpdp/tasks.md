# Tasks: Remove "Layak / Tidak Layak" Radio Options in BPDP Verifikator View (037-remove-layak-options-bpdp)

**Input**: Design documents from `/specs/037-remove-layak-options-bpdp/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/bpdp-api.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Includes exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: State preparation & script default check

- [x] T001 [P] Ensure script setup ref `statusKelayakan` defaults to `'LAYAK'` in `src/views/bpdp/CekiBpdpView.vue`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Template cleanup in BPDP Verifikator view

**⚠️ CRITICAL**: Template changes affect the action card layout in `CekiBpdpView.vue`

- [x] T002 Remove "1. Status Penilaian Kelayakan" radio button container lines from `src/views/bpdp/CekiBpdpView.vue`

**Checkpoint**: Foundation ready - radio options purged from template.

---

## Phase 3: User Story 1 - Streamlined BPDP Verification Interface (Priority: P1) 🎯 MVP

**Goal**: Enable BPDP Verifikator officers to directly proceed to report download and signed file upload without interacting with redundant "Layak" / "Tidak Layak" radio inputs.

**Independent Test**: Open `/bpdp/ceki/:id` as BPDP Verifikator, complete checking 4 items, and verify that the "Keputusan Kelayakan" card presents report download and file upload directly without radio options.

### Implementation for User Story 1

- [x] T003 [US1] Clean up template structure and styling in `src/views/bpdp/CekiBpdpView.vue`

**Checkpoint**: At this point, User Story 1 is fully functional — radio options are removed and the evaluation workflow functions seamlessly.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Validation and code quality checks

- [x] T004 [P] Run TypeScript type-check with `npx vue-tsc -b`
- [x] T005 [P] Perform manual quickstart validation scenarios defined in `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS UI verification.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion.
- **Polish (Phase 4)**: Depends on all user stories complete.

### Parallel Opportunities

- `T001` can be developed in parallel with logic setup.
- `T004` and `T005` can be run in parallel during polish phase.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 & Phase 2 (Template removal).
2. Complete Phase 3 (UI adjustment).
3. Validate User Story 1.

### Full Delivery
1. Complete Phase 4 (Type safety check with `npx vue-tsc -b`).
