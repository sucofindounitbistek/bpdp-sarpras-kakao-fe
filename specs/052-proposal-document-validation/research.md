# Phase 0 Research: Proposal Document Validation

## Research Task 1: Validation Rules for Step Navigation (`validateAndProceed`)

- **Decision**: In `validateAndProceed()`, evaluate:
  1. **Missing Mandatory Uploads**: Check if any requirement with `p.wajib === true` has no uploaded file (`!getDokumen(p.id)`). If so, block and toast: `'Dokumen [p.nama] wajib diunggah.'`.
  2. **Unverified / Non-Approved Mandatory Documents**: Check if any requirement with `p.wajib === true` has `getVerification(p.id).status !== 'APPROVED'`. If so, block and toast: `'Dokumen [p.nama] wajib disetujui.'`.
  3. **Unverified Uploaded Optional Documents**: Check if any uploaded optional document has `getVerification(p.id).status === 'PENDING'`. If so, prompt verifier to complete verification before proceeding.
- **Rationale**: Prevents accidental progression to Step 3 when required legal/institutional documents are missing or unverified.
- **Alternatives Considered**: Silent progression — rejected because it violates regulatory compliance.
