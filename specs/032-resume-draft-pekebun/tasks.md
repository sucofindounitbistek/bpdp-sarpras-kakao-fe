# Tasks: Resuming Saved Draft Pekebun Data (032-resume-draft-pekebun)

**Input**: Design documents from `/specs/032-resume-draft-pekebun/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/pekebun-draft-api.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Includes exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Wording externalization & configuration initialization

- [x] T001 [P] Add draft wording dictionary (`pekebunDraft`) to `src/config/localization.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core store infrastructure for draft operations in Pinia `usePekebunStore`

**⚠️ CRITICAL**: No user story UI work can function properly until this phase is complete

- [x] T002 [P] Implement `getDraftById` and `deleteDraftPekebun` store methods in `src/stores/pekebun.ts`
- [x] T003 [P] Implement `updateDraftPekebun` and `updatePekebun` store methods in `src/stores/pekebun.ts`

**Checkpoint**: Foundation ready - store API for draft restoration, update, and deletion complete.

---

## Phase 3: User Story 1 - View & Access Saved Pekebun Drafts (Priority: P1) 🎯 MVP

**Goal**: Enable users to view saved Pekebun drafts, filter draft entries, and access the "Lanjutkan Pengisian" action button from the table list.

**Independent Test**: Navigate to `/master-data/pekebun`, verify rows with `isDraft: true` display the "Draft" badge, status filter tabs work, and "Lanjutkan Pengisian" / "Hapus" buttons are rendered.

### Implementation for User Story 1

- [x] T004 [US1] Add status filter tabs (Semua, Terdaftar, Draft) in `src/views/master-data/PekebunListView.vue`
- [x] T005 [US1] Render "Lanjutkan Pengisian" and "Hapus" action buttons for draft rows in `src/views/master-data/PekebunListView.vue`
- [x] T006 [US1] Wire delete draft handler with Vue Toast confirmation in `src/views/master-data/PekebunListView.vue`

**Checkpoint**: At this point, User Story 1 is fully functional — users can discover drafts and trigger resume navigation.

---

## Phase 4: User Story 2 - Resume and Edit Draft Form Data (Priority: P1)

**Goal**: Clicking "Lanjutkan Pengisian" re-opens the multi-step Pekebun form pre-filled with all saved draft data, allowing users to make edits and re-save as draft.

**Independent Test**: Click "Lanjutkan Pengisian" on a draft row, confirm all inputs (identitas, dokumen URLs, lahan list) are restored into form state, make changes, and click "Simpan Draft" to update existing draft without creating duplicate records.

### Implementation for User Story 2

- [x] T007 [US2] Implement `draftId` route query detector and draft data loader in `src/views/master-data/FormPekebunView.vue`
- [x] T008 [US2] Wire "Simpan Draft" button to call `store.updateDraftPekebun` when `draftId` is active in `src/views/master-data/FormPekebunView.vue`

**Checkpoint**: At this point, User Stories 1 AND 2 are complete — users can view drafts, open them, and iteratively update draft entries.

---

## Phase 5: User Story 3 - Finalize and Submit Resumed Draft (Priority: P2)

**Goal**: Enable users to finalize a completed draft entry so that it transitions from "Draft" status to active registered Pekebun.

**Independent Test**: Complete all required fields on a resumed draft form, click "Simpan Pekebun", and verify validation passes and draft status converts to registered Pekebun (`isDraft: false`).

### Implementation for User Story 3

- [x] T009 [US3] Update `handleSubmit` to call `store.updatePekebun` for existing draft submissions in `src/views/master-data/FormPekebunView.vue`

**Checkpoint**: Complete draft lifecycle (create -> resume -> edit -> submit) is fully operational.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation and code quality checks

- [x] T010 [P] Run TypeScript type-check with `npx vue-tsc -b`
- [x] T011 [P] Perform end-to-end quickstart validation scenarios defined in `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS user story UI work.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion.
- **User Story 2 (Phase 4)**: Depends on Foundational phase & US1 navigation path.
- **User Story 3 (Phase 5)**: Depends on US2 form restoration state.
- **Polish (Phase 6)**: Depends on all user stories complete.

### Parallel Opportunities

- `T001`, `T002`, `T003` can be developed in parallel (separate files / independent methods).
- `T010` and `T011` can be run in parallel during polish phase.

---

## Implementation Strategy

### MVP First (User Story 1 + Story 2)
1. Complete Phase 1 & Phase 2 (Setup & Store methods).
2. Complete Phase 3 (Draft listing & "Lanjutkan Pengisian" button).
3. Complete Phase 4 (Restoring draft data in form).
4. Complete Phase 5 (Finalizing draft).
5. Run Phase 6 verification.
