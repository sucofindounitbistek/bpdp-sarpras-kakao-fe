# Tasks: Sync Existing RAB and Storage Area Validation Statuses

## Phase 1: Setup & Foundational

- [x] T001 Update `aliasMap` in `bpdp-sarpras-kelapa-fe/src/stores/verifikasiKabDraft.ts` to map `RAB_RK`, `RAB_PROPOSAL`, `RAB` $\leftrightarrow$ `rabDocument`
- [x] T002 Update `syncProposalValidations(validations, documents, proposal)` in `bpdp-sarpras-kelapa-fe/src/stores/verifikasiKabDraft.ts` to sync `storage_area` / `gudangSerahTerima` validation properties into `gudangAlamat`, `gudangKoordinat`, `fotoTampakDepan`, `fotoTampakDalam`

## Phase 2: User Story 1 & 2 - View & Component Integration

- [x] T003 [US1] Update `DetailVerifikasiKabView.vue` in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/DetailVerifikasiKabView.vue` to pass proposal object to `verifikasiStore.syncProposalValidations(validationList, docs, proposalRes)`
- [x] T004 [US2] Update `StepVerifikasiPekebunDanDokumenProposal.vue` in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue` to use optional chaining for `getDokumen('RAB_RK')?.namaFile` and `getDokumen('RAB_RK')?.ukuranBytes`

## Phase 3: Verification & Quality Checks

- [x] T005 [P] Run `vue-tsc -b` type checking in `bpdp-sarpras-kelapa-fe`
- [x] T006 [P] Run `npm run build` production compilation in `bpdp-sarpras-kelapa-fe`
