# Tasks: Penyambungan Alur Riwayat Status & Catatan Timeline

**Input**: Design documents from `/specs/015-riwayat-status-timeline-flow/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/ui-contract.md`, `quickstart.md`

## Format: `- [x] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`)

---

## Phase 1: Setup

**Purpose**: Environment verification and feature boundary alignment.

- [x] T001 Verify feature branch `015-riwayat-status-timeline-flow` and dev server execution in repo root

---

## Phase 2: Core Implementation (User Story 1 - Priority: P1) 🎯 MVP

**Goal**: Refactor `LogStatusUsulan.vue` layout to render a continuous connected vertical line between nodes with auto-omitted line below the last item and color-coded node dots.

**Independent Test**: Open any usulan detail view in browser. Verify that the timeline vertical line seamlessly links node 1 → node 2 → node N without hanging below the last card.

### Implementation for User Story 1

- [x] T002 [US1] Refactor item layout and vertical track line in `src/components/rekomtek/LogStatusUsulan.vue` to use relative item-level track lines (`v-if="index !== logs.length - 1"`), numbered node circles, and status-based ring colors (Green for progress, Amber for returns)

**Checkpoint**: User Story 1 complete and independently testable (MVP ready).

---

## Phase 3: Cross-View Verification & Polish (User Story 2 - Priority: P2)

**Purpose**: Confirm connected timeline rendering across all 5 detail pages and verify zero TypeScript compilation errors.

- [x] T003 [P] [US2] Verify `src/components/rekomtek/LogStatusUsulan.vue` rendering on Ditjenbun views (`CekiDitjenbunView.vue` & `ApprovalDitjenbunView.vue`)
- [x] T004 [P] [US2] Verify `src/components/rekomtek/LogStatusUsulan.vue` rendering on BPDP views (`CekiBpdpView.vue`, `ApprovalBpdpView.vue`, & `FinalisasiSkDirutView.vue`)
- [x] T005 Run `quickstart.md` validation scenarios and verify zero type check errors with `npx vue-tsc -b`

---

## Dependencies & Execution Order

```
Phase 1 (Setup)
    ↓
Phase 2 (Core Implementation: Refactor LogStatusUsulan.vue) 🎯 MVP
    ↓
Phase 3 (Cross-View Verification & Type Checks)
```

---

## Implementation Strategy

### MVP First (Phases 1-2)
1. Complete Phase 1.
2. Refactor `src/components/rekomtek/LogStatusUsulan.vue`.
3. **Validate MVP**: Inspect timeline track line in browser to confirm continuous connection.

### Incremental Delivery
1. Complete Phase 3 (Cross-view verification & type safety check).
