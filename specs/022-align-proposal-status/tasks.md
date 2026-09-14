# Tasks: Align Proposal Status List with Detail Steps

**Input**: Design documents from `/specs/022-align-proposal-status/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Implement the mapping logic

- [x] T001 Implement `getAlignedStatusLabel(status: string): string` inside the `<script setup>` section of `src/views/pengusulan/TrackingPengusulanView.vue`

---

## Phase 2: User Story 1 - Penyelarasan Kolom Status List View (Priority: P1)

**Goal**: Align status column in Pemohon proposal table.

**Independent Test**: Load `/pengusulan/tracking` and verify the proposal statuses match the step names (e.g. "Verifikasi Dinas Kab/Kota" instead of "Diajukan").

### Implementation for User Story 1

- [x] T002 Replace the table cell status Badge value `{{ getStatusLabel(item.currentStatus) }}` with `{{ getAlignedStatusLabel(item.currentStatus) }}` in `src/views/pengusulan/TrackingPengusulanView.vue`
- [x] T003 [P] Update the list page status filter dropdown options to display `getAlignedStatusLabel(status)` so the filter options match the values shown in the table

---

## Phase 3: User Story 2 - Penyelarasan Status Badge Detail Header (Priority: P2)

**Goal**: Align status badge in detail header.

**Independent Test**: Click "Lihat Detail" on any proposal in `/pengusulan/tracking` and verify detail header status badge matches.

### Implementation for User Story 2

- [x] T004 Replace detail header status Badge value `{{ getStatusLabel(selectedProposal.currentStatus) }}` with `{{ getAlignedStatusLabel(selectedProposal.currentStatus) }}` in `src/views/pengusulan/TrackingPengusulanView.vue`

---

## Phase 4: Polish & Verification

**Purpose**: Verify compile check and run validations

- [x] T005 Run compilation build `npm run build` to confirm zero TS or bundler errors
- [x] T006 Validate the mapping behavior using `quickstart.md` scenario script
