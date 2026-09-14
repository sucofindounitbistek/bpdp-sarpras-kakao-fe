# Tasks: Land Legal Document Preview in Proposal Submission (033-preview-legalitas-lahan)

**Input**: Design documents from `/specs/033-preview-legalitas-lahan/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/lahan-legalitas-preview-api.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Includes exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Wording externalization & configuration initialization

- [x] T001 [P] Add land legal document preview wording dictionary (`lahanPreview`) to `src/config/localization.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Document preview handler logic in Step 3 component

**⚠️ CRITICAL**: User story UI elements depend on the document preview handler logic

- [x] T002 Implement `openLahanDocPreview` helper and mime-type detection in `src/views/pengusulan/StepPilihPekebunLahan.vue`

**Checkpoint**: Foundation ready - document preview handler state and modal trigger function complete.

---

## Phase 3: User Story 1 - Preview Land Legal Document in Step 3 Proposal (Priority: P1) 🎯 MVP

**Goal**: Enable proposal submitters to preview the land legal document (Scan Sertifikat SHM/Non-SHM) directly inside an in-app `DocumentPreviewModal` when selecting Pekebun & land parcels in Step 3.

**Independent Test**: Navigate to Proposal Submission (`/pengusulan/baru`), reach Step 3 ("Pilih Pekebun & Lahan"), expand a Pekebun's land details, click "Pratinjau Legalitas", and verify `DocumentPreviewModal` opens displaying the legal document.

### Implementation for User Story 1

- [x] T003 [US1] Replace direct link anchor with styled "Pratinjau Legalitas" button in `src/views/pengusulan/StepPilihPekebunLahan.vue`
- [x] T004 [US1] Wire button click event to call `openLahanDocPreview(lahan)` in `src/views/pengusulan/StepPilihPekebunLahan.vue`

**Checkpoint**: At this point, User Story 1 is fully functional — submitters can preview land legal documents seamlessly.

---

## Phase 4: User Story 2 - Handle Missing or Unuploaded Legal Documents (Priority: P2)

**Goal**: Disable preview button or display a fallback indicator ("Belum Ada Dokumen") when a land item has no valid legal document uploaded.

**Independent Test**: View a land item with missing or invalid (`#`) legal document URL, verify button shows disabled fallback state and prevents modal crashes.

### Implementation for User Story 2

- [x] T005 [US2] Render disabled "Belum Ada Dokumen" badge when `scanLegalitasUrl` is empty or `#` in `src/views/pengusulan/StepPilihPekebunLahan.vue`

**Checkpoint**: User Story 2 complete — edge cases for missing documents handled safely.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation and code quality checks

- [x] T006 [P] Run TypeScript type-check with `npx vue-tsc -b`
- [x] T007 [P] Perform end-to-end quickstart validation scenarios defined in `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS UI integration.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion.
- **User Story 2 (Phase 4)**: Depends on US1 preview button rendering.
- **Polish (Phase 5)**: Depends on all user stories complete.

### Parallel Opportunities

- `T001` can be developed in parallel with script setup logic.
- `T006` and `T007` can be run in parallel during polish phase.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 & Phase 2 (Setup & Helper handler).
2. Complete Phase 3 (UI button & DocumentPreviewModal wiring).
3. Validate User Story 1.

### Full Delivery
1. Complete Phase 4 (Missing document fallback state).
2. Complete Phase 5 (Type safety check with `npx vue-tsc -b`).
