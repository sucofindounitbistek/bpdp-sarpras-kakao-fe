# Tasks: Contextual Rejection Notes Display across Pekebun and Proposal Pages

**Input**: Design documents from `bpdp-sarpras-kelapa-fe/specs/054-contextual-rejection-notes-display/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths included in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Review component structure and rejection parsing logic

- [X] T001 Review component targets in `bpdp-sarpras-kelapa-fe/src/views/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build rejection note parsing helper utility

- [X] T002 Create `parseRejectionNotes` helper utility in `bpdp-sarpras-kelapa-fe/src/lib/parseRejectionNotes.ts`

---

## Phase 3: User Story 1 - Display Pekebun & Lahan Rejection Feedback on Pekebun Views (Priority: P1) 🎯 MVP

**Goal**: Render contextual rejection alerts next to rejected farmer & land documents on Pekebun views.

**Independent Test**: View a proposal in `REVISION_ADMIN` status on Pekebun page, verify rejected farmer files display prominent rejection banners with notes.

### Implementation for User Story 1

- [X] T003 [US1] Render contextual rejection banners for farmer documents in `bpdp-sarpras-kelapa-fe/src/views/pengusulan/StepDataCPCL.vue` and `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue`
- [X] T004 [US1] Render contextual rejection banners for land documents in `bpdp-sarpras-kelapa-fe/src/views/pengusulan/StepPilihPekebunLahan.vue`

---

## Phase 4: User Story 2 - Display Proposal Document Rejection Feedback on Proposal Views (Priority: P2)

**Goal**: Render contextual rejection alerts next to rejected proposal documents, storage area, and RAB.

**Independent Test**: View a proposal in `REVISION_ADMIN` status on Proposal Upload page, verify rejected proposal files display rejection banners with notes.

### Implementation for User Story 2

- [X] T005 [US2] Render contextual rejection banners for proposal documents, storage area, and RAB in `bpdp-sarpras-kelapa-fe/src/views/pengusulan/StepUploadDokumen.vue` and `bpdp-sarpras-kelapa-fe/src/views/pengusulan/TrackingPengusulanDetailView.vue`

---

## Phase 5: Polish & Quality Gates

**Purpose**: Type checking and production build validation

- [X] T006 Run `npm run build` in `bpdp-sarpras-kelapa-fe/`

---

## Dependencies & Execution Order

```text
T001 -> T002 -> T003 -> T004 -> T005 -> T006
```
