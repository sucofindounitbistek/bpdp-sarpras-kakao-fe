# Tasks: Standarisasi UI Setuju / Tolak Approval

**Input**: Design documents from `/specs/014-setuju-tolak-approval-ui/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-contract.md`, `quickstart.md`

## Format: `- [x] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)

---

## Phase 1: Setup

**Purpose**: Environment verification and feature boundary alignment.

- [x] T001 Verify feature branch `014-setuju-tolak-approval-ui` and dev server execution in repo root

---

## Phase 2: Foundational (Component Enhancement)

**Purpose**: Enhance `VerifikasiDokumenItem.vue` presentational component to support text-labeled `✓ Setuju` and `✕ Tolak` buttons.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 Update `src/components/rekomtek/VerifikasiDokumenItem.vue` to support `buttonVariant` prop (`'icon' | 'text'`) for rendering text-labeled `✓ Setuju` and `✕ Tolak` toggle buttons

**Checkpoint**: Component ready for view-level standardization.

---

## Phase 3: User Story 1 - Kadiv BPDP Approval UI Redesign (Priority: P1) 🎯 MVP

**Goal**: Redesign `ApprovalBpdpView.vue` to match `ApprovalDitjenbunView.vue` with `✓ Setuju` & `✕ Tolak` buttons, PDF modal preview, and conditional rejection notes.

**Independent Test**: Open `/bpdp/approval/:id` in browser as `BPDP_APPROVAL`. Verify that the main card displays `✓ Setuju` and `✕ Tolak` buttons, PDF preview opens in modal, selecting Tolak expands rejection notes textarea, and right panel decision buttons activate accordingly.

### Implementation for User Story 1

- [x] T003 [US1] Redesign `src/views/bpdp/ApprovalBpdpView.vue` left panel to render "Hasil Asistensi & Laporan Kelayakan BPDP" card with `✓ Setuju` & `✕ Tolak` buttons, replacing old `ChecklistDokumen`
- [x] T004 [US1] Integrate `DocumentPreviewModal.vue` into `src/views/bpdp/ApprovalBpdpView.vue` for viewing signed Laporan Kelayakan PDFs
- [x] T005 [US1] Add conditional "Catatan Penolakan" textarea in `src/views/bpdp/ApprovalBpdpView.vue` when `✕ Tolak` is selected
- [x] T006 [US1] Wire right panel decision buttons ("Setujui Kelayakan" and "Kembalikan ke Ditjenbun") reactively in `src/views/bpdp/ApprovalBpdpView.vue`

**Checkpoint**: User Story 1 complete and independently testable (MVP ready).

---

## Phase 4: User Story 2 - Verifikasi Dokumen Button Alignment (Priority: P2)

**Goal**: Align button text labels across document inspection views for BPDP and Ditjenbun verifikators.

**Independent Test**: Open `/bpdp/ceki/:id` and `/ditjenbun/rekomtek/ceki/:id`. Verify document items display text-labeled `✓ Setuju` / `✕ Tolak` buttons.

### Implementation for User Story 2

- [x] T007 [P] [US2] Update `src/views/bpdp/CekiBpdpView.vue` document items to pass `buttonVariant="text"`
- [x] T008 [P] [US2] Update `src/views/ditjenbun/CekiDitjenbunView.vue` document items to pass `buttonVariant="text"`

**Checkpoint**: User Story 2 complete.

---

## Phase 5: User Story 3 & Polish

**Purpose**: Confirm 100% visual parity across all approval screens and verify zero TypeScript compilation errors.

- [x] T009 [P] [US3] Verify `src/views/ditjenbun/ApprovalDitjenbunView.vue` layout and `DocumentPreviewModal` alignment
- [x] T010 Run `quickstart.md` validation scenarios and verify zero type check errors with `npx vue-tsc -b`

---

## Dependencies & Execution Order

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational: VerifikasiDokumenItem text variant)
    ↓
Phase 3 (US1: Redesign ApprovalBpdpView) 🎯 MVP
    ↓
Phase 4 (US2: Align CekiBpdpView & CekiDitjenbunView buttons)
    ↓
Phase 5 (US3 & Polish: Verification & Type Checks)
```

---

## Implementation Strategy

### MVP First (Phases 1-3)
1. Complete Phase 1 & Phase 2.
2. Redesign `ApprovalBpdpView.vue` to match `ApprovalDitjenbunView.vue` (MVP!).
3. **Validate MVP**: Test `Setuju` / `Tolak` toggle buttons, PDF modal preview, and rejection notes in `ApprovalBpdpView.vue`.

### Incremental Delivery
1. Add Phase 4 (Align text labels on verifikator views).
2. Complete Phase 5 (Validation & type safety check).
