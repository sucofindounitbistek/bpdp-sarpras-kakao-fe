# Tasks: Skip SK CPCL & Verification Validation in Kabupaten & Provinsi Detail Views

## Phase 1: Implementation

**Purpose**: Modify validation and navigation blocks in Dinas Kabupaten view files

- [x] T001 Modify `canProceed` computed property inside `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue` to always return `true`.
- [x] T002 Modify `validateAndProceed()` inside `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue` to set `verifikasiStore.currentStep = 3;` immediately without opening the confirmation modal.
- [x] T003 Modify `canProceed` computed property inside `src/views/dinas/kabupaten/StepDataCPCL.vue` to always return `true`.
- [x] T004 Modify `goToNextStep()` inside `src/views/dinas/kabupaten/StepDataCPCL.vue` to directly set `verifikasiStore.currentStep = 4;` without toast warnings.

---

## Phase 2: Polish & Verification

**Purpose**: Verify compile check and run validation scenarios

- [x] T005 Run compilation build `npm run build` to confirm zero TS or bundler errors.
- [x] T006 Validate the skip behavior for Kabupaten and Provinsi flows using `quickstart.md` scenario script.
