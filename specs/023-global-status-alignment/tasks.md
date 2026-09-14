# Tasks: Global Proposal Status Alignment

**Input**: Design documents from `/specs/023-global-status-alignment/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Update global localization mapping

- [x] T001 Modify `src/config/localization.ts` to update `proposalStatus` keys (SUBMITTED, VERIFIED_ADMIN, VERIFIED_FIELD, REKOMTEK_KAB_ISSUED, VALIDATED_PROV, SK_DITJENBUN_ISSUED, PKS_BPDP_SIGNED, DISBURSED, COMPLETED, REVISION_ADMIN) to match simplified stepper stage labels.

---

## Phase 2: User Story 1 - Pembersihan Workaround Tracking View (Priority: P1)

**Goal**: Revert local helper functions inside tracking page.

**Independent Test**: Load `/pengusulan/tracking` and verify proposal list and details badges load aligned status names directly using global getStatusLabel helper.

### Implementation for User Story 1

- [x] T002 Revert local `getAlignedStatusLabel` helper function and restore `getStatusLabel` and `PengajuanStatus` imports from `@/types/pengusulan` inside `src/views/pengusulan/TrackingPengusulanView.vue`.
- [x] T003 Restore template status bindings (the dropdown filters loop, table cell, and detail header badge) to use `getStatusLabel` in `src/views/pengusulan/TrackingPengusulanView.vue`.

---

## Phase 3: User Story 2 - Pembersihan Override Dinas Kabupaten (Priority: P2)

**Goal**: Revert local override function inside Kabupaten view.

**Independent Test**: Log in as Dinas Kabupaten, view the queue, and verify status column displays synchronized labels (e.g. "Verifikasi Dinas Kab/Kota" instead of "Menunggu Verifikasi").

### Implementation for User Story 2

- [x] T004 Remove the local custom override `getStatusLabel` function inside `src/views/dinas/kabupaten/QueueVerifikasiKabView.vue`.
- [x] T005 Restore template badge binding to use the imported global `getStatusLabel` inside `src/views/dinas/kabupaten/QueueVerifikasiKabView.vue`.

---

## Phase 4: Polish & Verification

**Purpose**: Verify compile check and run validations

- [x] T006 Run compilation build `npm run build` to confirm zero TS or bundler errors
- [x] T007 Validate the mapping behavior using `quickstart.md` scenario script
