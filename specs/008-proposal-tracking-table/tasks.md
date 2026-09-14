# Tasks: Proposal Tracking Table & Detail View

**Input**: Design documents from `/specs/008-proposal-tracking-table/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, quickstart.md

**Tests**: Tests are OPTIONAL - manual testing will be conducted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure verification

- [x] T001 Verify project running state via `npm run dev` and locate view file `src/views/pengusulan/TrackingPengusulanView.vue`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Setup reactive view state variables in component

- [x] T002 Declare reactive state `selectedProposalId` and computed `selectedProposal` in `src/views/pengusulan/TrackingPengusulanView.vue`

---

## Phase 3: User Story 1 - Proposal List Table (Priority: P1) 🎯 MVP

**Goal**: Display proposal records in a clean data table with search and filters active.

**Independent Test**: Navigate to `/pengusulan/pengajuan-proposal`, verify the proposal list table renders, and type in search query to verify row filtering.

### Implementation for User Story 1

- [x] T003 [US1] Create the Proposal Data Table template code in `src/views/pengusulan/TrackingPengusulanView.vue` with columns: Nomor Resi, Kelembagaan Pekebun, Paket Usulan, Total Anggaran, Status, and Aksi
- [x] T004 [US1] Bind the computed `filteredPengajuan` array to populate the table rows in `src/views/pengusulan/TrackingPengusulanView.vue`
- [x] T005 [US1] Connect the existing search query input and status/paket filters to filter the table rows in `src/views/pengusulan/TrackingPengusulanView.vue`
- [x] T006 [US1] Render an empty state ("Tidak ada proposal ditemukan") if the table contains zero items in `src/views/pengusulan/TrackingPengusulanView.vue`

---

## Phase 4: User Story 2 - Proposal Detail View Toggle (Priority: P1)

**Goal**: Allow clicking a proposal to view detailed info in the current card format with a back button.

**Independent Test**: Click "Lihat Detail" on a proposal, check that the table is replaced by the detailed card layout with timeline, and click "Kembali ke Daftar" to return to the list.

### Implementation for User Story 2

- [x] T007 [US2] Move the existing detailed card layout (timeline, CPCL boxes, documents checklist, budget summary) into a `v-if="selectedProposal"` block in `src/views/pengusulan/TrackingPengusulanView.vue`
- [x] T008 [US2] Bind the click action on the table "Lihat Detail" button to set `selectedProposalId` in `src/views/pengusulan/TrackingPengusulanView.vue`
- [x] T009 [US2] Implement a "Kembali ke Daftar" button in the detailed view header that sets `selectedProposalId` back to `null` in `src/views/pengusulan/TrackingPengusulanView.vue`

---

## Phase 5: User Story 3 - Compact Mobile View (Priority: P2)

**Goal**: Make the list table responsive and fit compact views.

**Independent Test**: View table in a mobile viewport (375px) and check that it wraps in a scrollable container.

### Implementation for User Story 3

- [x] T010 [US3] Wrap the table inside an `overflow-x-auto` div container in `src/views/pengusulan/TrackingPengusulanView.vue`
- [x] T011 [US3] Apply Tailwind responsive styles to table padding, widths, and fonts to match mobile-first constraints in `src/views/pengusulan/TrackingPengusulanView.vue`

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T012 Run production build check `npm run build` and resolve any type/build errors
- [x] T013 Verify the final implementation against the quickstart scenarios in `specs/008-proposal-tracking-table/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on T001 - blocks all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
- **Polish (Final Phase)**: Depends on all user stories completion.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational phase is complete.
- **User Story 2 (P2)**: Can start after Foundational phase is complete, depends on T003/T004 table structure.
- **User Story 3 (P3)**: Can start after table implementation.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Verify setup (T001).
2. Declare local reactive state in component (T002).
3. Implement proposal table layout with filters (T003-T006).
4. Verify table loads and filters.

### Incremental Delivery

1. Add Detail View Toggle (T007-T009) to allow displaying detail cards.
2. Add Mobile Responsiveness (T010-T011) to finalize styling.
3. Validate and build (T012-T013).
