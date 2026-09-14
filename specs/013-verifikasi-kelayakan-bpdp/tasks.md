# Tasks: Verifikasi Kelayakan BPDP

**Input**: Design documents from `/specs/013-verifikasi-kelayakan-bpdp/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-contract.md`, `quickstart.md`

## Format: `- [x] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US1b]`, `[US2]`, `[US3]`)

---

## Phase 1: Setup

**Purpose**: Environment verification and feature boundary alignment.

- [x] T001 Verify feature branch `013-verifikasi-kelayakan-bpdp` and dev server execution in repo root

---

## Phase 2: Foundational (Types & Store Infrastructure)

**Purpose**: Update domain data types and store state/actions to support structured document validation (`BpdpDocValidation`).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Update type definitions in `src/types/rekomtek.ts` to add `BpdpDocValidation`, `BpdpChecklistState`, and update `UsulanRekomtek.bpdpChecklist`
- [x] T003 Update mock data hydration and `submitBpdpChecklist` action in `src/stores/rekomtek.ts` to support structured object validation state

**Checkpoint**: Data types and Pinia store ready for component integration.

---

## Phase 3: User Story 1 & 1b - Per-Document Validation & Return to Ditjenbun (Priority: P1) 🎯 MVP

**Goal**: Enable `BPDP_VERIFIKATOR` to inspect documents item-by-item using ✓/✗ buttons with notes, auto-save to store, and allow returning invalid usulan to `APPROVAL_DITJENBUN`.

**Independent Test**: Open `/bpdp/ceki/:id` in browser as `BPDP_VERIFIKATOR`. Verify ✓/✗ toggles work per item, note textarea appears on ✗, auto-saves to store, and "Kembalikan ke Ditjenbun" button appears when an item is marked ✗.

### Implementation for User Story 1 & 1b

- [x] T004 [P] [US1] Create reusable presentational SFC `src/components/rekomtek/VerifikasiDokumenItem.vue` supporting ✓/✗ buttons, note textarea, conditional file download button, and readonly badges
- [x] T005 [US1] Replace `ChecklistDokumen` component in `src/views/bpdp/CekiBpdpView.vue` with 4 instances of `VerifikasiDokumenItem.vue` (Rekomendasi Teknis, SK CPCL, Surat Pengantar, Berita Acara)
- [x] T006 [US1] Wire reactive state and auto-save handlers in `src/views/bpdp/CekiBpdpView.vue` to update store via `submitBpdpChecklist`
- [x] T007 [US1b] Add "Kembalikan ke Ditjenbun" return button, validation, and status transition to `APPROVAL_DITJENBUN` in `src/views/bpdp/CekiBpdpView.vue`

**Checkpoint**: User Story 1 & 1b fully functional and independently testable (MVP complete).

---

## Phase 4: User Story 2 - Decision & Kelayakan Generation (Priority: P2)

**Goal**: Enable generating and submitting the Kelayakan Rekomtek report when all 4 documents pass verification (`valid === true`).

**Independent Test**: Mark all 4 documents Sesuai (✓), select Layak, generate draft, upload signed PDF, and submit to Kadiv BPDP.

### Implementation for User Story 2

- [x] T008 [US2] Update decision panel display logic in `src/views/bpdp/CekiBpdpView.vue` to require `allDocumentsChecked` (`valid === true` on all items) before enabling "Status Penilaian Kelayakan" and "Generate Dokumen Kelayakan"
- [x] T009 [US2] Verify file upload and submission trigger `submitKelayakanToKadiv` in `src/views/bpdp/CekiBpdpView.vue` to transition usulan to `APPROVAL_BPDP`

**Checkpoint**: User Stories 1, 1b, and 2 working seamlessly together.

---

## Phase 5: User Story 3 - Referensi Data Rekomtek Ditjenbun (Priority: P3)

**Goal**: Display reference card with Nomor Rekomtek and signed Ditjenbun Rekomtek PDF download link.

**Independent Test**: Open `/bpdp/ceki/:id` and verify "Rujukan Rekomtek Ditjenbun" panel shows `nomorRekomtek` and download link.

### Implementation for User Story 3

- [x] T010 [P] [US3] Ensure "Rujukan Rekomtek Ditjenbun" card in `src/views/bpdp/CekiBpdpView.vue` gracefully renders `activeUsulan.rekomtek.nomorRekomtek` and signed PDF download button

---

## Phase 6: Polish & Refactoring

**Purpose**: Refactor `CekiDitjenbunView.vue` to consume the new `VerifikasiDokumenItem.vue` component and run end-to-end quickstart validation.

- [x] T011 [P] Refactor `src/views/ditjenbun/CekiDitjenbunView.vue` to replace redundant inline document check markup with `VerifikasiDokumenItem.vue`
- [x] T012 Run quickstart validation scenarios (`quickstart.md`) and verify zero type check errors

---

## Dependencies & Execution Order

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational: Types & Store)
    ↓
Phase 3 (US1 & US1b: VerifikasiDokumenItem + CekiBpdpView Redesign) 🎯 MVP
    ↓
Phase 4 (US2: Decision Panel & Kelayakan Upload)
    ↓
Phase 5 (US3: Rekomtek Reference Card)
    ↓
Phase 6 (Polish: Refactor CekiDitjenbunView + Quickstart Validation)
```

---

## Parallel Execution Opportunities

- `T004` (Component creation) can be developed independently once `T002` (Types) is complete.
- `T010` (Rekomtek Reference Card) can be implemented in parallel with `T008`/`T009`.
- `T011` (Refactor `CekiDitjenbunView.vue`) can be done in parallel once `T004` is complete.

---

## Implementation Strategy

### MVP First (Phases 1-3)
1. Complete Phase 1 & Phase 2 (Types & Store).
2. Implement Phase 3 (Component `VerifikasiDokumenItem.vue` + `CekiBpdpView.vue` redesign + Return to Ditjenbun).
3. **Validate MVP**: Test per-document ✓/✗ toggles and return to Ditjenbun.

### Incremental Delivery
1. Add Phase 4 (Decision panel & Kelayakan report generation).
2. Add Phase 5 (Ditjenbun reference card).
3. Complete Phase 6 (Refactor Ditjenbun view & quickstart validation).
