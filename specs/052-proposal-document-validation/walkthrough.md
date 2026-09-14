# Walkthrough: Proposal Document Validation

## Changes Made

- **`StepVerifikasiPekebunDanDokumenProposal.vue`**:
  - Enhanced `validateAndProceed()` to check all mandatory proposal documents (`p.wajib === true`).
  - Added checks for missing uploads (`!doc`) and non-approved verification statuses (`status !== 'APPROVED'`).
  - Added check for pending verification on uploaded optional documents.
  - Emits contextual error/warning toasts (`toast.error`, `toast.warning`) listing specific document names and blocks step progression when unfulfilled.

## Verification

- Build task `npm run build` executed successfully.
- `tasks.md` marked 6/6 tasks `[X]`.
