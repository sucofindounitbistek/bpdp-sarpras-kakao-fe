# Tasks: Submit Storage Area & Proposal Document Validations to Backend

## Phase 1: Setup & Foundational

- [x] T001 Update `buildValidationPayloads()` in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepSummaryDanSubmit.vue` to construct `storageAreaPayload` and `proposalDocPayload`

## Phase 2: Implementation

- [x] T002 Update `handleAjukanKeProvinsi()` in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepSummaryDanSubmit.vue` to call `bulkProposalDocumentValidations(proposalDocPayload)` and include `storage_area: storageAreaPayload` in `updateProposal` call
- [x] T003 Update `handleKembalikanRevisi()` in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepSummaryDanSubmit.vue` to call `bulkProposalDocumentValidations(proposalDocPayload)` and include `storage_area: storageAreaPayload` in `updateProposal` call

## Phase 3: Verification & Quality Checks

- [x] T004 [P] Run `vue-tsc -b` type checking in `bpdp-sarpras-kelapa-fe`
- [x] T005 [P] Run `npm run build` production compilation in `bpdp-sarpras-kelapa-fe`
