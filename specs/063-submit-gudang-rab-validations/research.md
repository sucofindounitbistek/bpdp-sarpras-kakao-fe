# Research: Submit Storage Area & Proposal Document Validations to Backend

## Technical Findings

1. **`buildValidationPayloads()` Gap**:
   In `StepSummaryDanSubmit.vue` (and `StepSummaryDanSubmit.vue` for Dinas Provinsi if applicable), `buildValidationPayloads()` only populated `farmerPayload` and `landPayload`. It omitted `proposalDocPayload` (mapping proposal documents like `RAB_RK` / `RAB_PROPOSAL` to `dokumen_proposal_id`) and omitted `storageAreaPayload` (extracting `gudangAlamat`, `gudangKoordinat`, `fotoTampakDepan`, `fotoTampakDalam` verification statuses & notes).

2. **Backend Submission Calls**:
   - `proposalDocPayload` $\rightarrow$ `pengusulanStore.bulkProposalDocumentValidations(proposalDocPayload)`
   - `storageAreaPayload` $\rightarrow$ Passed in `pengusulanStore.updateProposal(pengajuan.value.id, { storage_area: storageAreaPayload, status: '...' })`

3. **Storage Area Payload Mapping**:
   ```typescript
   function mapVerificationStatusToBoolean(status: string): boolean | null {
     if (status === 'APPROVED') return true;
     if (status === 'REJECTED') return false;
     return null;
   }
   ```
