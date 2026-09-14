# Tasks: Dynamic Verification Action Button for Rejection & Revision (035-revisi-button-verifikasi)

**Input**: Design documents from `/specs/035-revisi-button-verifikasi/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/revisi-button-api.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Includes exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Wording externalization & configuration initialization

- [x] T001 [P] Add verification action wording dictionary (`verification`) to `src/config/localization.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verification rejection detection logic

**⚠️ CRITICAL**: Dynamic UI button toggles depend on reactive rejection detection

- [x] T002 Verify and refine reactive rejection detection helper in `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`

**Checkpoint**: Foundation ready - rejection detection logic available for UI binding.

---

## Phase 3: User Story 1 - Dynamic Action Button Toggle on Verification Rejections (Priority: P1) 🎯 MVP

**Goal**: Transform the primary bottom action button from "Lanjut / Submit" to "Kembalikan Untuk Revisi" (`bg-rose-600`) whenever one or more items/documents are rejected ("Tolak"), preventing accidental step advancement.

**Independent Test**: Open a proposal verification page, mark 1 document as "Tolak", and verify the bottom right action button dynamically changes to "Kembalikan Untuk Revisi" in rose red styling.

### Implementation for User Story 1

- [x] T003 [US1] Update bottom action bar in `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue` to render a single dynamic primary button (`Kembalikan Untuk Revisi` when `hasRejection` is true, otherwise `Simpan & Lanjut ke SK CPCL`)
- [x] T004 [US1] Update bottom action bar in `src/views/dinas/kabupaten/StepDataCPCL.vue` to enforce dynamic button transformation when rejections exist

**Checkpoint**: At this point, User Story 1 is fully functional — rejections dynamically replace the next step button with "Kembalikan Untuk Revisi".

---

## Phase 4: User Story 2 - Prevent Multi-Step Navigation Advance on Rejection (Priority: P2)

**Goal**: Ensure summary and final submit steps in both Dinas Kabupaten and Dinas Provinsi enforce dynamic rejection button transformation and trigger the rejection confirmation modal (`actionType: 'reject'`).

**Independent Test**: On summary/submit verification steps with rejected items, click the primary button, complete the rejection modal, and verify the proposal status updates to "Perlu Revisi" instead of moving forward.

### Implementation for User Story 2

- [x] T005 [US2] Update bottom action bar in `src/views/dinas/kabupaten/StepSummaryDanSubmit.vue` to enforce dynamic button transformation when rejections exist
- [x] T006 [US2] Update bottom action bar in `src/views/dinas/provinsi/StepSummaryDanSubmit.vue` to enforce dynamic button transformation when rejections exist

**Checkpoint**: User Story 2 complete — all verification steps across Kabupaten and Provinsi prevent forward navigation when rejections exist.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation and code quality checks

- [x] T007 [P] Run TypeScript type-check with `npx vue-tsc -b`
- [x] T008 [P] Perform manual quickstart validation scenarios defined in `quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS UI integration.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion.
- **User Story 2 (Phase 4)**: Depends on US1 dynamic button implementation.
- **Polish (Phase 5)**: Depends on all user stories complete.

### Parallel Opportunities

- `T001` can be developed in parallel with logic setup.
- `T007` and `T008` can be run in parallel during polish phase.

---

## Implementation Strategy

### MVP First (User Story 1 Only)
1. Complete Phase 1 & Phase 2 (Localization & Rejection detection).
2. Complete Phase 3 (StepVerifikasiPekebunDanDokumenProposal.vue dynamic button).
3. Validate User Story 1.

### Full Delivery
1. Complete Phase 4 (StepDataCPCL & StepSummaryDanSubmit for Kab & Prov).
2. Complete Phase 5 (Type safety check with `npx vue-tsc -b`).
