# Tasks: Fix Reupload and Removal of SK CPCL Documents in Regency Verification

**Input**: Design documents from `bpdp-sarpras-kelapa-fe/specs/060-fix-reupload-sk-cpcl/`

**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (required), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/ui-contract.md](./contracts/ui-contract.md), [quickstart.md](./quickstart.md)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`)
- Explicit file paths included in all descriptions.

---

## Phase 1: Setup & Foundational (State Store Enhancements)

**Purpose**: Core store infrastructure supporting document removal flags across Regency Verification steps.

- [x] T001 Inspect `useVerifikasiKabDraftStore` state definition in `bpdp-sarpras-kelapa-fe/src/stores/verifikasiKabDraft.ts`
- [x] T002 Add removal flags (`skCpclRemoved`, `beritaAcaraDokumenRemoved`, `beritaAcaraLapanganRemoved`) and helper actions (`removeSkCpcl`, `setSkCpcl`, `removeBeritaAcaraDokumen`, `setBeritaAcaraDokumen`, `removeBeritaAcaraLapangan`, `setBeritaAcaraLapangan`, `resetDraftState`) in `bpdp-sarpras-kelapa-fe/src/stores/verifikasiKabDraft.ts`

**Checkpoint**: Foundational store actions ready - user story implementation can begin.

---

## Phase 2: User Story 1 - Clear and Remove Uploaded SK CPCL Document (Priority: P1) 🎯 MVP

**Goal**: Enable Regency Dinas Verifiers to reliably remove an existing or uploaded SK CPCL document state so the upload dropzone becomes active again.

**Independent Test**: Click "Hapus" on an SK CPCL document in Step 3 (`/dinas/verifikasi/kabupaten/:id`), verify the document card disappears, state is cleared, and upload dropzone displays.

- [x] T003 [US1] Update `activeSkCpcl`, `activeBeritaAcaraDokumen`, and `activeBeritaAcaraLapangan` computed properties in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepDataCPCL.vue` to check removal flags before falling back to `getExistingDoc()`
- [x] T004 [US1] Update removal handlers (`handleRemoveSkCpcl`, `handleRemoveBeritaAcaraDokumen`, `handleRemoveBeritaAcaraLapangan`) in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepDataCPCL.vue` to invoke store removal actions
- [x] T005 [US1] Update `activeSkCpcl` resolution in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepSummaryDanSubmit.vue` to evaluate store removal flags

**Checkpoint**: User Story 1 complete - document removal is fully functional and testable independently.

---

## Phase 3: User Story 2 - Re-upload Replacement SK CPCL Document (Priority: P1)

**Goal**: Allow verifiers to select and upload a new SK CPCL replacement document after removal and persist it in the verification submission payload.

**Independent Test**: Remove an existing document, pick a new file via `FileUpload`, and verify that the file metadata attaches, previews, and serializes correctly on Step 4 submission.

- [x] T006 [US2] Update upload handlers (`handleSkCpclUpload`, `handleBeritaAcaraDokumenUpload`, `handleBeritaAcaraLapanganUpload`) in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepDataCPCL.vue` to set uploaded document and clear removal flags via store actions
- [x] T007 [US2] Ensure HTML file input element value resets on file removal in `bpdp-sarpras-kelapa-fe/src/components/ui/FileUpload.vue` so re-selecting the exact same file triggers `@change`
- [x] T008 [US2] Update payload serialization logic in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepSummaryDanSubmit.vue` to attach replacement document objects under `document_type: 'SK_CPCL'`

**Checkpoint**: User Story 2 complete - replacement files can be uploaded and submitted cleanly.

---

## Phase 4: User Story 3 - Document Operation Feedback & Validation (Priority: P2)

**Goal**: Provide clear toast feedback on document removal/re-upload and enforce mandatory document presence before verification step completion.

**Independent Test**: Trigger removal and verify toast notice; clear document and attempt to advance to Step 4, verifying validation blocks submission.

- [x] T009 [P] [US3] Verify and align localization messages in `bpdp-sarpras-kelapa-fe/src/config/localization.ts` for document removal and upload toast feedback
- [x] T010 [US3] Add validation constraint on Step 3 navigation in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepDataCPCL.vue` preventing step advancement if SK CPCL is missing

**Checkpoint**: User Story 3 complete - user feedback and validation gates enforced.

---

## Phase 5: Polish & Quality Verification

**Purpose**: Type safety verification and quickstart manual testing.

- [x] T011 [P] Run `vue-tsc -b` type checker in `bpdp-sarpras-kelapa-fe` to verify zero type errors
- [x] T012 [P] Run `npm run build` in `bpdp-sarpras-kelapa-fe` to verify clean Vite compilation
- [x] T013 Execute manual validation scenarios documented in `bpdp-sarpras-kelapa-fe/specs/060-fix-reupload-sk-cpcl/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup & Foundational (Phase 1)**: No dependencies - can start immediately.
- **User Story 1 (Phase 2)**: Depends on Phase 1 completion.
- **User Story 2 (Phase 3)**: Depends on Phase 2 (US1) removal state logic.
- **User Story 3 (Phase 4)**: Can proceed alongside US2 or after US1/US2.
- **Polish (Phase 5)**: Depends on completion of user stories.

### Parallel Opportunities

- T009 [P] [US3] (localization strings) can run in parallel with T003-T008.
- T011 [P] (`vue-tsc -b`) and T012 [P] (`npm run build`) can run in parallel after code edits.

---

## Implementation Strategy

### MVP Scope (User Story 1 & 2)

1. Complete Phase 1: Store enhancements in `verifikasiKabDraft.ts`
2. Complete Phase 2 & 3: Removal and re-upload handling in `StepDataCPCL.vue`, `FileUpload.vue`, and `StepSummaryDanSubmit.vue`
3. Validate via `quickstart.md` scenarios.
