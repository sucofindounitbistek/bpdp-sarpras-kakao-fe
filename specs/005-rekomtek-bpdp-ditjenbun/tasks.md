# Tasks: Verifikasi Rekomtek dan SK Dirut (Ditjenbun & BPDP)

**Input**: Design documents from `/specs/005-rekomtek-bpdp-ditjenbun/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/ui-contract.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Route configuration and Pinia store adjustments

- [x] T001 Update routing configuration and metadata in `src/router/index.ts` to map split roles
- [x] T002 Update Pinia store actions and user payload logs in `src/stores/rekomtek.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Roles mapping, switcher, and sidebar links updates

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T003 Update TS User role type declarations in `src/stores/auth.ts` and `src/types/rekomtek.ts`
- [x] T004 [P] Update simulation switcher mock roles list in `src/components/ui/RoleSwitcher.vue` and `src/components/ui/DesktopHeader.vue`
- [x] T005 [P] Update navigation items and role filter checks in `src/components/ui/Sidebar.vue`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Alur Verifikator Ditjenbun (Asistensi & Rekomtek) (Priority: P1)

**Goal**: Split Ditjenbun verifikator tabs in antrean list and enforce asistensi page security.

**Independent Test**: Switch role to `DITJENBUN_VERIFIKATOR`. Open Antrean Rekomtek, verify that only the verification queue tab is shown. Click "Tinjau" on USL/2026/07/001, test document checklist and submit to approval. Try accessing the approval detail page and verify redirection to access denied.

- [x] T006 [US1] Update tab visibility logic in `src/views/ditjenbun/AntreanRekomtekView.vue` to show only the verification tab for `DITJENBUN_VERIFIKATOR`
- [x] T007 [US1] Update `src/views/ditjenbun/CekiDitjenbunView.vue` to restrict access strictly to `DITJENBUN_VERIFIKATOR`

**Checkpoint**: User Story 1 is fully functional and testable independently.

---

## Phase 4: User Story 2 - Alur Approval Ditjenbun (Ketua Tim) (Priority: P2)

**Goal**: Split Ditjenbun approval tab in antrean list and enforce approval page security.

**Independent Test**: Switch role to `DITJENBUN_APPROVAL`. Open Antrean Rekomtek, verify only the approval queue tab is shown. Click "Tinjau" on USL/2026/07/002, review signed Rekomtek, and approve/reject. Try accessing the asistensi detail page and verify redirection to access denied.

- [x] T008 [US2] Update tab visibility logic in `src/views/ditjenbun/AntreanRekomtekView.vue` to show only the approval tab for `DITJENBUN_APPROVAL`
- [x] T009 [US2] Update `src/views/ditjenbun/ApprovalDitjenbunView.vue` to restrict access strictly to `DITJENBUN_APPROVAL`

**Checkpoint**: User Story 2 is fully functional and testable independently alongside User Story 1.

---

## Phase 5: User Story 3 - Alur Verifikator BPDP (Kelayakan & SK Dirut) (Priority: P3)

**Goal**: Split BPDP verifikator tabs in antrean list and enforce kelayakan & finalisasi page security.

**Independent Test**: Switch role to `BPDP_VERIFIKATOR`. Open Verifikasi Kelayakan BPDP, verify tab visibility. Open USL/2026/07/003, check items, generate kelayakan report, and submit. Open USL/2026/07/005, generate and upload SK Dirut to complete the workflow.

- [x] T010 [US3] Update tab visibility logic in `src/views/bpdp/AntreanBpdpView.vue` to show only verification/SK tabs for `BPDP_VERIFIKATOR`
- [x] T011 [US3] Update `src/views/bpdp/CekiBpdpView.vue` to restrict access strictly to `BPDP_VERIFIKATOR`
- [x] T012 [US3] Update `src/views/bpdp/FinalisasiSkDirutView.vue` to restrict access strictly to `BPDP_VERIFIKATOR`

**Checkpoint**: User Story 3 is fully functional and testable.

---

## Phase 6: User Story 4 - Alur Approval BPDP (Kadiv BPDP) (Priority: P4)

**Goal**: Split BPDP approval tab in antrean list and enforce Kadiv approval page security.

**Independent Test**: Switch role to `BPDP_APPROVAL`. Open Verifikasi Kelayakan BPDP, verify tab visibility. Click "Tinjau" on USL/2026/07/004, review kelayakan report, and approve/reject/return.

- [x] T013 [US4] Update tab visibility logic in `src/views/bpdp/AntreanBpdpView.vue` to show only the approval tab for `BPDP_APPROVAL`
- [x] T014 [US4] Update `src/views/bpdp/ApprovalBpdpView.vue` to restrict access strictly to `BPDP_APPROVAL`

**Checkpoint**: All user stories are fully integrated and functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Navigation guard checks and runbook validation

- [x] T015 Enforce global navigation role guard routing checks in `src/router/index.ts`
- [x] T016 Conduct full manual validation following the scenario runbook in `specs/005-rekomtek-bpdp-ditjenbun/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
  - User Story 1 (P1) and User Story 2 (P2) must be complete to verify Ditjenbun flows.
  - User Story 3 (P3) and User Story 4 (P4) must be complete to verify BPDP flows.
- **Polish (Phase 7)**: Depends on all user stories being complete.

---

## Implementation Strategy

### Incremental Delivery

1. Complete Setup + Foundational -> roles available in switcher and sidebar
2. Implement User Story 1 and User Story 2 -> Ditjenbun Verifikator & Approval fully separated and secured
3. Implement User Story 3 and User Story 4 -> BPDP Verifikator & Approval fully separated and secured
4. Polish navigation guards and run end-to-end runbook verification
