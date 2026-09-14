# Tasks: Create FINAL Flag RAB on Edit RAB at Dinas Kabupaten

**Input**: Design documents from `bpdp-sarpras-kelapa-fe/specs/061-kabupaten-edit-rab-final/`

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Review RAB creation/saving logic in `bpdp-sarpras-kelapa-fe/src/stores/verifikasiKabDraft.ts` and `bpdp-sarpras-kelapa-fe/src/services/rab.service.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T002 Ensure `rabService.createRab` payload supports `flag: 'FINAL'`

---

## Phase 3: User Story 1 - Create FINAL RAB Revision at Dinas Kabupaten (Priority: P1) 🎯 MVP

- [X] T003 [P] [US1] Update RAB save handler in `bpdp-sarpras-kelapa-fe/src/stores/verifikasiKabDraft.ts` to construct RAB payload with `flag: 'FINAL'`
- [X] T004 [P] [US1] Ensure `StepVerifikasiPekebunDanDokumenProposal.vue` passes `flag: 'FINAL'` RAB data when saving/proceeding verification

---

## Phase 4: Polish & Quality Gates

- [X] T005 Run type check (`npx vue-tsc -b`) in `bpdp-sarpras-kelapa-fe/`

---

## Dependencies & Execution Order

```text
T001 -> T002 -> T003 (Parallel with T004) -> T005
```
