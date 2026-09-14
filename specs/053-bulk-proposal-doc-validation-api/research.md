# Phase 0 Research: Bulk Proposal Document Validation API

## Research Task 1: DTO Payload Schema Alignment

- **Decision**: Define `CreateProposalDocumentValidationPayload` in `src/types/pengusulan.ts`:
  ```typescript
  export interface CreateProposalDocumentValidationPayload {
    dokumen_proposal_id: number;
    is_valid: boolean;
    notes?: string;
    validated_by_role?: string;
  }
  ```
- **Rationale**: Aligns exactly with backend DTO struct `CreateProposalDocumentValidationRequest` in `bpdp-sarpras-kelapa-be/internal/proposal_document_validation/dto.go`.
- **Alternatives Considered**: Using camelCase keys — rejected because backend expects snake_case (`dokumen_proposal_id`, `is_valid`, `validated_by_role`).

## Research Task 2: Store Action Integration

- **Decision**: Add `bulkValidateProposalDocuments` to `usePengusulanStore`:
  ```typescript
  async function bulkValidateProposalDocuments(payloads: CreateProposalDocumentValidationPayload[]) {
    const res = await api.post('/proposal-document-validations/bulk', payloads);
    return res;
  }
  ```
- **Rationale**: Uses centralized Axios instance `api` in `src/services/api.ts` which unwraps response envelope and injects Bearer header.
