# Implementation Plan: Skip SK CPCL & Verification Validation in Kabupaten & Provinsi Detail Views

Provide a brief description of the problem, any background context, and what the change accomplishes.

For mockup/demonstration purposes, users need to navigate through both the Dinas Kabupaten and Dinas Provinsi verification flows without completing mandatory checklists or document uploads.

## Proposed Changes

Group files by component and order logically.

### Dinas Kabupaten Component

#### [MODIFY] [StepVerifikasiPekebunDanDokumenProposal.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue)
- Update `canProceed` computed property to return `true` directly.
- Simplify `validateAndProceed()` function to transition directly to step 3 without showing a confirmation modal.

#### [MODIFY] [StepDataCPCL.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/dinas/kabupaten/StepDataCPCL.vue)
- Update `canProceed` computed property to return `true` directly.
- Modify `goToNextStep()` function to set `verifikasiStore.currentStep = 4;` directly.
- Clean up unused computed properties to avoid compilation warnings.

---

### Dinas Provinsi Component

#### [MODIFY] [StepDataCPCL.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/dinas/provinsi/StepDataCPCL.vue)
- (Already Completed) Set `canProceed` to `true` and bypass validation toast errors inside `goToNextStep()`.

## Verification Plan

Summary of how you will verify that your changes have the desired effects.

### Automated Tests
- `npm run build` to verify zero compile-time typescript or bundler errors.

### Manual Verification
- Walk through the Dinas Kabupaten flow from Step 1 -> Step 3 -> Step 4 without completing checklist approvals or uploading any documents.
- Walk through the Dinas Provinsi flow from Step 3 -> Step 4 without uploading documents.
