# Research: Skip SK CPCL & Verification Validation in Kabupaten & Provinsi Detail Views

## Dinas Kabupaten Validations
1. `StepVerifikasiPekebunDanDokumenProposal.vue` (Step 1):
   - The `canProceed` computed property blocks next-step progression unless all CPCL list checks and document approvals are done.
   - `validateAndProceed()` shows a confirmation modal. We will bypass this directly to proceed to Step 3.
2. `StepDataCPCL.vue` (Step 3):
   - The `canProceed` computed property blocks next-step progression unless SK CPCL and Berita Acara files are uploaded.
   - `goToNextStep()` blocks navigation and displays error toast notifications if documents are missing.

## Dinas Provinsi Validations
1. `StepDataCPCL.vue` (Step 3):
   - The `canProceed` computed property blocks next-step progression unless the Kabupaten SK CPCL document is verified and the Surat Pengantar SK CPCL document is uploaded.
   - `goToNextStep()` blocks navigation and displays error toast notifications. (Already bypassed in previous commit, we will maintain this).
