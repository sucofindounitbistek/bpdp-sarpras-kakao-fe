# Tasks: Wire Bulk Proposal Document Validations API into usePengusulanStore

**Input**: Design documents from `bpdp-sarpras-kelapa-fe/specs/053-bulk-proposal-doc-validation-api/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Review DTO types and endpoints

- [X] T001 Review `CreateProposalDocumentValidationRequest` in `bpdp-sarpras-kelapa-be/internal/proposal_document_validation/dto.go` and `bpdp-sarpras-kelapa-fe/src/types/pengusulan.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define TypeScript interfaces

- [X] T002 Export `CreateProposalDocumentValidationPayload` interface in `bpdp-sarpras-kelapa-fe/src/types/pengusulan.ts`

---

## Phase 3: User Story 1 - Persist Granular Proposal Document Verification Records to Backend (Priority: P1) 🎯 MVP

**Goal**: Execute `POST /api/proposal-document-validations/bulk` on document verification submission.

**Independent Test**: Complete document verification in UI, click submit, verify network payload sends `POST /api/proposal-document-validations/bulk`.

### Implementation for User Story 1

- [X] T003 [US1] Implement `bulkValidateProposalDocuments(payloads)` action calling `POST /api/proposal-document-validations/bulk` in `bpdp-sarpras-kelapa-fe/src/stores/pengusulan.ts`
- [X] T004 [US1] Invoke `bulkValidateProposalDocuments` in `StepVerifikasiPekebunDanDokumenProposal.vue` during verification action dispatch

---

## Phase 4: User Story 2 - Fetch Existing Document Verification Records (Priority: P2)

**Goal**: Fetch existing validation records from `GET /api/proposal-document-validations`.

**Independent Test**: Fetch proposal validations on page load, confirm existing records map to UI state.

### Implementation for User Story 2

- [X] T005 [US2] Implement `fetchProposalDocumentValidations(proposalId)` in `bpdp-sarpras-kelapa-fe/src/stores/pengusulan.ts`

---

## Phase 5: Polish & Quality Gates

**Purpose**: Type checking and production build validation

- [X] T006 Run `npm run build` in `bpdp-sarpras-kelapa-fe/`

---

## Dependencies & Execution Order

```text
T001 -> T002 -> T003 -> T004 -> T005 -> T006
```
