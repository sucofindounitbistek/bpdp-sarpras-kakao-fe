# Tasks: Implement getProposalDocumentValidations in Dinas Kabupaten Verification View

**Input**: Design documents from `bpdp-sarpras-kelapa-fe/specs/062-get-proposal-doc-validations-kab/`

## Format: `[ID] [P?] [Story] Description`

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Review `getProposalDocumentValidations` method in `bpdp-sarpras-kelapa-fe/src/stores/pengusulan.ts` and `bpdp-sarpras-kelapa-fe/src/views/dinas/provinsi/DetailVerifikasiProvinsiView.vue`

---

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T002 Verify query parameters mapping for `getProposalDocumentValidations({ proposal_id: Number(id) })`

---

## Phase 3: User Story 1 - Fetch and Restore Document Validations in Dinas Kabupaten Verification (Priority: P1) 🎯 MVP

- [X] T003 [P] [US1] Call `pengusulanStore.getProposalDocumentValidations({ proposal_id: Number(id) })` on mount in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/DetailVerifikasiKabView.vue`
- [X] T004 [P] [US1] Populate returned document validation records (`is_valid`, `notes`) into `verifikasiKabDraftStore` matching document keys

---

## Phase 4: Polish & Quality Gates

- [X] T005 Run type check (`npx vue-tsc -b`) in `bpdp-sarpras-kelapa-fe/`

---

## Dependencies & Execution Order

```text
T001 -> T002 -> T003 (Parallel with T004) -> T005
```
