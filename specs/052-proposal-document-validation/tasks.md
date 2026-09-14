# Tasks: Proposal Document Validation in StepVerifikasiPekebunDanDokumenProposal

**Input**: Design documents from `bpdp-sarpras-kelapa-fe/specs/052-proposal-document-validation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Review component navigation gate

- [X] T001 Review `validateAndProceed()` in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Verify requirement metadata

- [X] T002 Inspect `currentPersyaratan` metadata (`wajib`, `id`, `nama`) in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`

---

## Phase 3: User Story 1 - Enforce Mandatory Proposal Document Upload & Verification Gate (Priority: P1) 🎯 MVP

**Goal**: Block step progression if mandatory documents (`wajib = true`) are missing or not approved.

**Independent Test**: Attempt to click "Simpan & Lanjut ke SK CPCL" with unapproved mandatory documents, verify toast error blocks navigation.

### Implementation for User Story 1

- [X] T003 [US1] Add validation loop for mandatory requirements (`p.wajib === true`) inside `validateAndProceed()` in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
- [X] T004 [US1] Emit error toast listing unfulfilled mandatory document names and return early in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`

---

## Phase 4: User Story 2 - Mandatory Rejection Notes Validation (Priority: P2)

**Goal**: Ensure non-empty rejection notes for all rejected documents.

**Independent Test**: Reject a document without notes, attempt submission, verify error toast.

### Implementation for User Story 2

- [X] T005 [US2] Verify non-empty rejection notes enforcement in `submitRejection()` in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`

---

## Phase 5: Polish & Quality Gates

**Purpose**: Type checking and production build validation

- [X] T006 Run `npm run build` in `bpdp-sarpras-kelapa-fe/`

---

## Dependencies & Execution Order

```text
T001 -> T002 -> T003 -> T004 -> T005 -> T006
```
