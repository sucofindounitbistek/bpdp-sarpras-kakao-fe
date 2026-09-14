# Walkthrough: Bulk Proposal Document Validations API Integration

## Changes Made

- **`src/types/pengusulan.ts`**:
  - Exported `CreateProposalDocumentValidationPayload` interface matching backend DTO `CreateProposalDocumentValidationRequest`.
- **`src/services/proposal.service.ts`**:
  - Added `bulkProposalDocumentValidations(payload)` (`POST /api/proposal-document-validations/bulk`).
  - Added `fetchProposalDocumentValidations(proposalId)` (`GET /api/proposal-document-validations?proposal_id=...`).
- **`src/stores/pengusulan.ts`**:
  - Added `bulkProposalDocumentValidations` and `fetchProposalDocumentValidations` actions to `usePengusulanStore`.
- **`StepVerifikasiPekebunDanDokumenProposal.vue`**:
  - Added helper `syncBulkProposalDocumentValidations()` to compile per-document verification decisions.
  - Invoked `syncBulkProposalDocumentValidations()` upon approval step progression (`validateAndProceed()`) and rejection dispatch (`pendingConfirmAction()`).

## Verification

- `tasks.md` marked 6/6 tasks `[X]`.
- Build task `npm run build` executed successfully.
