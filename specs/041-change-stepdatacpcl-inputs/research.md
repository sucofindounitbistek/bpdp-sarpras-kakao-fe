# Research & Technical Decisions: Change StepDataCPCL Inputs

## Findings & Audit

We audited the Step 3 verification flow (`StepDataCPCL.vue` for Kabupaten) and related Pinia stores.

1. **State Management**:
   - `useVerifikasiKabDraftStore` currently stores `skCpcl` and `beritaAcara` as `DokumenUpload | null`.
   - `useVerifikasiKabStore` stores final submissions under the type `VerifikasiKabSubmission`. It currently does not store `beritaAcara` in the list of submissions. We should update the type and submission action to store the new documents (`beritaAcaraDokumen` and `beritaAcaraLapangan`).

2. **UI Updates**:
   - `src/views/dinas/kabupaten/StepDataCPCL.vue` will render 3 file upload components instead of 2.
   - `src/views/dinas/kabupaten/StepSummaryDanSubmit.vue` will display preview links for all 3 files.

3. **Localization**:
   - `src/config/localization.ts` contains `stepDataCpcl` namespace with `skCpcl` and `beritaAcara` configurations. We will replace `beritaAcara` with `beritaAcaraDokumen` and `beritaAcaraLapangan` to align with the new files.

## Decisions

### Decision 1: Store Properties Expansion
- **Choice**: Refactor draft and submission stores to hold `beritaAcaraDokumen` and `beritaAcaraLapangan` instead of `beritaAcara`.
- **Rationale**: Keeps data model clean and avoids conflicts between the two verification reports.

### Decision 2: Update Step & Summary Views
- **Choice**: Modify `StepDataCPCL.vue` and `StepSummaryDanSubmit.vue` to integrate the expanded model.
- **Rationale**: Ensures the user can upload, preview, remove, and verify all 3 required files in both steps.
