# Research: Sync Farmer & Land Document Validations from Backend

## Technical Findings

1. **API Endpoints**:
   - `GET /farmer-document-validations?proposal_id=:id` returns array of farmer document validations (`dokumen_pekebun_id`, `is_valid`, `notes`, `details`).
   - `GET /land-document-validations?proposal_id=:id` returns array of land document validations (`dokumen_lahan_id`, `is_valid`, `notes`).

2. **Store Mapping Strategy**:
   - In `verifikasiKabDraftStore.ts`: Add `syncFarmerDocumentValidations(validations, pekebuns)` and `syncLandDocumentValidations(validations, pekebuns)`.
   - Keys map to `doc-${cpclId}-${docId}` and `doc-${cpclId}-${docId}-${fieldName}`.

3. **Detail View Invocation**:
   - In `DetailVerifikasiKabView.vue`: Fetch `getFarmerDocumentValidations` and `getLandDocumentValidations` in parallel with proposal detail.
