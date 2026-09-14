# Tasks: Modal Konfirmasi Pengiriman Approval

**Input**: Design documents from `/specs/022-approval-confirmation-modal/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not requested. Manual verification via quickstart.md.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure for new component

- [x] T001 Create `src/components/approval/` directory if it does not exist

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core component and localization that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 [P] Create `ApprovalConfirmationModal.vue` component in `src/components/approval/ApprovalConfirmationModal.vue` using base `Modal.vue` wrapper. Implement props (`isOpen`, `actionType`, `destinationStage`, `notes`), emits (`close`, `confirm`), internal state (`isConfirming`, `errorMessage`), double-submission prevention (disable button after first click), loading spinner on confirm button, error message display (including status-conflict backend errors), and close via Batal/X/overlay click. Verify Escape key close works through base `Modal.vue`. Follow styling from contracts/ApprovalConfirmationModal.md (primary green for approve, rose-600 for reject, outline for cancel).
- [x] T003 [P] Add `confirmationModal` section to `src/config/localization.ts` with all keys: `approveTitle`, `approveDescription`, `rejectTitle`, `rejectDescription`, `notesLabel`, `confirmApprove`, `confirmReject`, `cancel`, `errorDefault`. Reference values from data-model.md.

**Checkpoint**: Foundation ready - `ApprovalConfirmationModal` component and localization exist. User story integration can begin.

---

## Phase 3: User Story 1 - Konfirmasi Sebelum Meneruskan Approval (Priority: P1) 🎯 MVP

**Goal**: Setiap approver yang menekan tombol "Setujui/Teruskan" akan melihat modal konfirmasi sebelum tindakan approval dieksekusi.

**Independent Test**: Login sebagai `DITJENBUN_APPROVAL` atau `BPDP_APPROVAL`, buka halaman approval, klik tombol setujui, verifikasi modal muncul → klik "Ya, Setujui" → tindakan dieksekusi.

### Implementation for User Story 1

- [x] T004 [US1] Integrate approve confirmation modal in `src/views/ditjenbun/ApprovalDitjenbunView.vue`. Import `ApprovalConfirmationModal`, add reactive refs (`showConfirmModal`, `confirmActionType`, `confirmDestination`), intercept `handleApprove()` to set refs and open modal instead of directly calling store action, create `executeApproval()` handler that calls `store.approveDitjenbun()` and handles success/error (close modal on success, show error in modal on failure).
- [x] T005 [P] [US1] Integrate approve confirmation modal in `src/views/bpdp/ApprovalBpdpView.vue`. Import `ApprovalConfirmationModal`, add reactive refs (`showConfirmModal`, `confirmActionType`, `confirmDestination`), intercept `handleApprove()` to set refs and open modal instead of directly calling store action, create `executeApproval()` handler that calls `store.approveBpdpKadiv()` and handles success/error.

**Checkpoint**: Approve confirmation modal works on both ApprovalDitjenbunView and ApprovalBpdpView. Approver sees modal before approve action executes.

---

## Phase 4: User Story 2 - Konfirmasi Sebelum Mengembalikan Proposal (Priority: P2)

**Goal**: Setiap approver yang menekan tombol "Kembalikan/Tolak" akan melihat modal konfirmasi (dengan catatan penolakan) sebelum proposal dikembalikan.

**Independent Test**: Login sebagai `BPDP_APPROVAL`, buka halaman approval, toggle "Tolak", isi catatan, klik tombol kembalikan, verifikasi modal muncul dengan catatan → klik "Ya, Kembalikan" → proposal dikembalikan.

### Implementation for User Story 2

- [x] T006 [US2] Integrate reject confirmation modal in `src/views/ditjenbun/ApprovalDitjenbunView.vue`. Intercept `handleReject()` to open modal with `actionType='reject'`, `destinationStage` set to target tahap, and `notes` from `rekomtekVerif.notes`. Create `executeReject()` handler that calls `store.rejectDitjenbun()` and handles success/error.
- [x] T007 [P] [US2] Integrate reject confirmation modal in `src/views/bpdp/ApprovalBpdpView.vue`. Intercept all reject/return handlers (`handleReject()`, `handleReturnToDitjenbun()`) to open modal with `actionType='reject'`, appropriate `destinationStage`, and `notes`. Create `executeReject()` handler that calls the corresponding store action and handles success/error.

**Checkpoint**: Reject confirmation modal works on both ApprovalDitjenbunView and ApprovalBpdpView. Approver sees modal with catatan penolakan before reject action executes.

---

## Phase 5: User Story 3 - Konsistensi di Seluruh Halaman Approval (Priority: P3)

**Goal**: Modal konfirmasi yang sama digunakan di halaman verifikasi (CekiBpdpView, CekiDitjenbunView) dengan desain dan perilaku yang identik.

**Independent Test**: Buka `/bpdp/ceki/:id` dan `/ditjenbun/rekomtek/ceki/:id`, lakukan aksi approve/reject pada dokumen, verifikasi modal muncul dengan tampilan dan perilaku yang sama seperti di halaman approval utama.

### Implementation for User Story 3

- [x] T008 [P] [US3] Integrate `ApprovalConfirmationModal` in `src/views/ditjenbun/CekiDitjenbunView.vue`. First inspect the view to identify all handler functions for verifikasi/approval actions. Then import component, add reactive refs (`showConfirmModal`, `confirmActionType`, `confirmDestination`), intercept each handler to open modal konfirmasi before executing the underlying store action.
- [x] T009 [P] [US3] Integrate `ApprovalConfirmationModal` in `src/views/bpdp/CekiBpdpView.vue`. First inspect the view to identify all handler functions for verifikasi/approval actions. Then import component, add reactive refs (`showConfirmModal`, `confirmActionType`, `confirmDestination`), intercept each handler to open modal konfirmasi before executing the underlying store action.

**Checkpoint**: All 4 approval pages use the same `ApprovalConfirmationModal` component with consistent behavior.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation and final quality checks

- [x] T010 Run quickstart.md validation scenarios across all 4 pages to verify end-to-end behavior
- [x] T011 Run `npm run typecheck` to verify TypeScript strict mode compliance and resolve any type errors

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2)
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2). Can run in parallel with US1 (different handler functions in same files, but rewiring different code paths)
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2). Fully independent from US1/US2 (different files)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational - Independent from US1 (different handler code paths)
- **User Story 3 (P3)**: Can start after Foundational - Independent from US1/US2 (different files entirely)

### Within Each User Story

- T004 before T005 in US1? No - they're in different files, can be parallel
- T006 before T007 in US2? No - different files, can be parallel
- T008 before T009 in US3? No - different files, can be parallel

### Parallel Opportunities

- T002 and T003 can run in parallel (different files)
- T004 and T005 can run in parallel (different files within US1)
- T006 and T007 can run in parallel (different files within US2)
- T008 and T009 can run in parallel (different files within US3)
- US1, US2, US3 can all run in parallel after Foundational (different handler code paths or different files)

---

## Parallel Example: User Story 1

```bash
# After Foundational phase complete, launch both integrations together:
Task: "Integrate approve confirmation modal in src/views/ditjenbun/ApprovalDitjenbunView.vue"
Task: "Integrate approve confirmation modal in src/views/bpdp/ApprovalBpdpView.vue"
```

## Parallel Example: All User Stories

```bash
# After Foundational phase complete, all stories can proceed in parallel:
# Developer A: Phase 3 - User Story 1 (approve in ApprovalDitjenbunView + ApprovalBpdpView)
# Developer B: Phase 4 - User Story 2 (reject in ApprovalDitjenbunView + ApprovalBpdpView)
# Developer C: Phase 5 - User Story 3 (CekiDitjenbunView + CekiBpdpView)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - component + localization)
3. Complete Phase 3: User Story 1 (approve confirmation on 2 main pages)
4. **STOP and VALIDATE**: Test User Story 1 independently per quickstart.md Scenario 1
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Component ready
2. Add User Story 1 → Approve modal works → Deploy/Demo (MVP!)
3. Add User Story 2 → Reject modal works → Deploy/Demo
4. Add User Story 3 → All 4 pages consistent → Deploy/Demo
5. Polish → Typecheck + validation → Final

### Parallel Team Strategy

With 2 developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 + US2 (same files, sequential within ApprovalDitjenbunView + ApprovalBpdpView)
   - Developer B: US3 (different files, CekiDitjenbunView + CekiBpdpView)
3. Both complete independently → Polish together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- `ApprovalConfirmationModal` component handles both approve and reject via `actionType` prop - no separate components needed
- US1 and US2 modify the same files (ApprovalDitjenbunView, ApprovalBpdpView) but different handler functions - careful coordination needed if parallelized
- US3 modifies different files (CekiBpdpView, CekiDitjenbunView) - fully independent