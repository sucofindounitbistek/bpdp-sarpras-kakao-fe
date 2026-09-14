# Tasks: sarpras-package-rules

**Input**: Design documents from `specs/027-sarpras-package-rules/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are NOT requested for this feature. Correctness will be verified via manual validation guide in quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Contains exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Localization configuration and project verification.

- [x] T001 Externalize all new package labels, descriptions, and validation messages in `src/config/localization.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core model extensions and configuration mapping updates that block all user stories.

**⚠️ CRITICAL**: Phase 2 must be complete before starting user story implementation.

- [x] T002 Update `JenisSarpras` enum in `src/types/pengusulan.ts` to include `UPH_1_JENIS`, `UPH_MULTI_JENIS`, and `PIKAP`
- [x] T003 [P] Add new document type IDs (e.g., `KEMITRAAN`, `KELAYAKAN_UPH`, `SHM_HGU_HGB`, etc.) to the `tipeDokumen` type union in `src/types/pengusulan.ts`
- [x] T004 Define and register the static document configurations in `src/lib/pengusulan-persyaratan.config.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Pemohon Package Selection & Document Checklist Revamp (Priority: P1) 🎯 MVP

**Goal**: Enable Pemohon to select from the 12 packages and view correct required document checklists and templates.

**Independent Test**: Start the proposal wizard, select different packages, and verify that the Step 1 checklist dynamically updates requirements and download templates.

### Implementation for User Story 1

- [x] T005 [P] [US1] Map the 12 packages (`PAKET_OPTIONS`) and bind their document arrays in `src/lib/pengusulan-persyaratan.config.ts`
- [x] T006 [P] [US1] Update `StepPaketSarpras.vue` script and template to render the 12 package options and bind the selection model
- [x] T007 [US1] Update `isPupukPaket` computed getter in `src/stores/pengusulanDraft.ts` to cover `JenisSarpras.EKSTENSIFIKASI` and `JenisSarpras.INTENSIFIKASI`

**Checkpoint**: User Story 1 is fully functional and testable.

---

## Phase 4: User Story 2 - Automated Minimum Rules Validation (Priority: P1)

**Goal**: Perform real-time validation of selected farmers count and total land area at Step 3 using updated rules (OR condition).

**Independent Test**: Go to Step 3 of the wizard, select combinations of farmers/acreage, and verify that the validation banner accurately flags deficiency or compliance.

### Implementation for User Story 2

- [x] T008 [P] [US2] Configure the `minimalPekebun` and `minimalLuasHa` validation limits under `PAKET_MINIMUM_REQUIREMENTS` in `src/lib/pengusulan-persyaratan.config.ts`
- [x] T009 [US2] Update `step3ValidationResult` inside `src/stores/pengusulanDraft.ts` to check `pekebunCukup || luasCukup` (OR condition) and calculate the deficits
- [x] T010 [US2] Ensure `StepPilihPekebunLahan.vue` correctly consumes the reactive validation message from the draft store and displays it in the banner

**Checkpoint**: User Stories 1 and 2 are fully functional and work together.

---

## Phase 5: User Story 3 - Review and Verification at Dinas & BPDP (Priority: P1)

**Goal**: Render the correct document checklist when reviewing submitted proposals in verifier dashboards (Dinas Kabupaten, Dinas Provinsi, Ditjenbun, and BPDP).

**Independent Test**: Submit a proposal, log in as Dinas Kabupaten or BPDP, open the proposal detail, and verify that the document review list contains the correct files.

### Implementation for User Story 3

- [x] T011 [P] [US3] Update `isPupukPaket` computed checks in verifier summary views `src/views/dinas/kabupaten/StepSummaryDanSubmit.vue` and `src/views/dinas/provinsi/StepSummaryDanSubmit.vue`
- [x] T012 [P] [US3] Ensure `StepVerifikasiPekebunDanDokumenProposal.vue` (Dinas Kabupaten) and `PratinjauPekebunDanDokumenProposal.vue` (Dinas Provinsi) fetch documents dynamically matching `pengajuan.value.jenisSarpras`
- [x] T013 [US3] Verify that the BPDP queue views filter correctly and display the dynamic document checklists in `src/views/bpdp/FinalisasiSkDirutView.vue`

**Checkpoint**: All user stories are independently functional and integrated.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Overall verification, cleanup, and validation.

- [x] T014 Run and pass all manual validation scenarios listed in `specs/027-sarpras-package-rules/quickstart.md`
- [x] T015 Run production build validation command (`npm run build`) and type check (`vue-tsc --noEmit`) to verify correctness

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion - blocks all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational completion.
- **Polish (Final Phase)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2).
- **User Story 2 (P2)**: Can start after Foundational (Phase 2).
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) and depends on User Story 1 (since it verifies proposals created using US1).

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup.
2. Complete Phase 2: Foundational.
3. Complete Phase 3: User Story 1.
4. **STOP and VALIDATE**: Verify that package selection and dynamic checklists work in Step 1.

### Incremental Delivery

1. Complete Setup + Foundational.
2. Implement User Story 1 (MVP) -> Validate.
3. Implement User Story 2 (Step 3 validation) -> Validate combined flows.
4. Implement User Story 3 (Verifier reviews) -> Validate end-to-end flow from Pemohon to BPDP.
5. Perform Polish & cross-cutting build checks.
