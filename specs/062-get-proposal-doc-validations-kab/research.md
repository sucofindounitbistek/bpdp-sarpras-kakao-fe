# Phase 0 Research: Fetch Proposal Document Validations in Kabupaten Verification

## Research Findings

### Decision: Call `getProposalDocumentValidations` in `StepVerifikasiPekebunDanDokumenProposal.vue` `onMounted`

- **Context**: `DetailVerifikasiProvinsiView.vue` and `ApprovalBpdpView.vue` already call `pengusulanStore.getProposalDocumentValidations({ proposal_id: proposalIdNum })`.
- **Finding**: The returned array of `ProposalDocumentValidation` items contains `dokumen_proposal_id`, `is_valid`, `notes`, and `validated_by_role`.
- **Rationale**: Mapping returned `dokumen_proposal_id` or document types to `verifikasiKabDraftStore.verifications` restores existing validation state on load.
