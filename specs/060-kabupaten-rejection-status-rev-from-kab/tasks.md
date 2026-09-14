# Tasks: Proposal Status Update to REV_FROM_KAB on Rejection at Dinas Kabupaten

**Input**: Design documents from `bpdp-sarpras-kelapa-fe/specs/060-kabupaten-rejection-status-rev-from-kab/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Exact file paths included in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Review status constants and rejection actions

- [X] T001 Review status constants and rejection handlers in `bpdp-sarpras-kelapa-fe/src/types/pengusulan.ts` and `bpdp-sarpras-kelapa-fe/src/stores/pengusulan.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Confirm `PengajuanStatus.REV_FROM_KAB` is exported and used consistently

- [X] T002 Verify `PengajuanStatus.REV_FROM_KAB` type definition in `bpdp-sarpras-kelapa-fe/src/types/pengusulan.ts`

---

## Phase 3: User Story 1 - Standardize Proposal Rejection Status to REV_FROM_KAB at Dinas Kabupaten (Priority: P1) 🎯 MVP

**Goal**: Ensure proposal rejection at Dinas Kabupaten level updates status to `REV_FROM_KAB`.

**Independent Test**: Perform rejection action in Kabupaten verification, verify status dispatched is `REV_FROM_KAB`.

### Implementation for User Story 1

- [X] T003 [P] [US1] Update rejection submission handler in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue` to set status to `REV_FROM_KAB`
- [X] T004 [P] [US1] Update modal revision handler `handleSaveRevisi()` in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/DetailVerifikasiKabView.vue` to set status to `REV_FROM_KAB`

---

## Phase 4: Polish & Quality Gates

**Purpose**: Type checking and production validation

- [X] T005 Run type check (`npx vue-tsc -b`) and tests (`npm test`) in `bpdp-sarpras-kelapa-fe/`

---

## Dependencies & Execution Order

```text
T001 -> T002 -> T003 (Parallel with T004) -> T005
```

## Parallel Opportunities

- T003 in `StepVerifikasiPekebunDanDokumenProposal.vue` and T004 in `DetailVerifikasiKabView.vue` edit independent files and can run in parallel.

## Implementation Strategy

1. **MVP Scope**: Complete T001 - T005 to standardize rejection status transition to `REV_FROM_KAB`.
2. **Incremental Verification**: Verify status updates in browser UI and network inspector payload.
