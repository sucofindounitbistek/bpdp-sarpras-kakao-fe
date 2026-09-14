# Tasks: Sync Farmer & Land Document Validations from Backend

## Phase 1: Setup & Foundational

- [x] T001 Add `getFarmerDocumentValidations` and `getLandDocumentValidations` API methods to `bpdp-sarpras-kelapa-fe/src/services/proposal.service.ts`
- [x] T002 Add `getFarmerDocumentValidations` and `getLandDocumentValidations` store methods to `bpdp-sarpras-kelapa-fe/src/stores/pengusulan.ts`
- [x] T003 Implement `syncFarmerDocumentValidations` and `syncLandDocumentValidations` in `bpdp-sarpras-kelapa-fe/src/stores/verifikasiKabDraft.ts`

## Phase 2: View Integration

- [x] T004 Fetch farmer & land document validations and invoke sync methods in `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/DetailVerifikasiKabView.vue`

## Phase 3: Verification & Quality Checks

- [x] T005 [P] Run `vue-tsc -b` type checking in `bpdp-sarpras-kelapa-fe`
- [x] T006 [P] Run `npm run build` production compilation in `bpdp-sarpras-kelapa-fe`
