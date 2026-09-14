# Tasks: Fix Proposal Detail Documents Mapping in Stores & Verification Views

**Input**: Design documents from `bpdp-sarpras-kelapa-fe/specs/055-fix-proposal-detail-documents-mapping/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1)
- Exact file paths included in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Review document data flow from store to verification views

- [X] T001 Review `getProposalDetail()` mapping in `bpdp-sarpras-kelapa-fe/src/stores/pengusulan.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fix document mapping in Pinia store

- [X] T002 Map `dokumen` array onto `mapped` object in `getProposalDetail()` in `bpdp-sarpras-kelapa-fe/src/stores/pengusulan.ts`

---

## Phase 3: User Story 1 - Restore Proposal Document Data Rendering in DetailVerifikasiKabView (Priority: P1) 🎯 MVP

**Goal**: Render proposal document cards reliably in verification view.

**Independent Test**: Open proposal verification page, verify all uploaded documents display with filename and view button.

### Implementation for User Story 1

- [X] T003 [US1] Upsert `mapped` proposal into `listPengajuan` inside `getProposalDetail()` in `bpdp-sarpras-kelapa-fe/src/stores/pengusulan.ts`
- [X] T004 [US1] Update `getDokumen(persyaratanId)` in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue` to check `dokumen` & `documents` with alias fallback

---

## Phase 4: Polish & Quality Gates

**Purpose**: Type checking and production build validation

- [X] T005 Run `npm run build` in `bpdp-sarpras-kelapa-fe/`

---

## Dependencies & Execution Order

```text
T001 -> T002 -> T003 -> T004 -> T005
```
