# Specification: Skip SK CPCL & Verification Validation in Kabupaten & Provinsi Detail Views

## Background & Problem Statement
For mockup/demonstration purposes, users need to be able to navigate through both the Dinas Kabupaten and Dinas Provinsi verifier flows quickly.
Currently:
1. In the Dinas Kabupaten detail view:
   - Step 1 ("Verifikasi Pekebun & Dokumen") disables the next button until all documents are approved and all CPCL list options are checked.
   - Step 3 ("SK CPCL") disables the next button until the SK CPCL and Berita Acara files are uploaded.
2. In the Dinas Provinsi detail view:
   - Step 3 ("Surat Pengantar SK CPCL") disables the next button until the Kabupaten SK CPCL document is verified and the Surat Pengantar SK CPCL document is uploaded.

This blocks mockup presentations if they want to skip these checks.

## Proposed Solution
We will bypass validation blocks in both `StepVerifikasiPekebunDanDokumenProposal.vue` and `StepDataCPCL.vue` for Dinas Kabupaten, and `StepDataCPCL.vue` for Dinas Provinsi.

## Functional Requirements
- **FR-001**: Always enable the next navigation button on all steps for both Dinas Kabupaten and Dinas Provinsi detail views.
- **FR-002**: Modify step transition functions (`goToNextStep()`, `validateAndProceed()`) to navigate to the next step immediately without checking file upload status or verification checkmarks.
