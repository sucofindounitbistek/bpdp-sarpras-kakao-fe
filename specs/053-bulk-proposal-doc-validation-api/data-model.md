# Phase 1 Data Model: Bulk Proposal Document Validation API

## TypeScript Interfaces

```typescript
export interface CreateProposalDocumentValidationPayload {
  dokumen_proposal_id: number;
  is_valid: boolean;
  notes?: string;
  validated_by_role?: string;
}

export interface ProposalDocumentValidationRecord {
  id: number;
  dokumen_proposal_id: number;
  is_valid: boolean;
  notes?: string;
  validated_by_role?: string;
  created_at: string;
  updated_at: string;
}
```

## API Endpoint Mapping

| Action | HTTP Method | Endpoint | Request Body |
| :--- | :--- | :--- | :--- |
| Bulk Validate | `POST` | `/proposal-document-validations/bulk` | `CreateProposalDocumentValidationPayload[]` |
| List Validations | `GET` | `/proposal-document-validations` | Query params: `proposal_id`, `dokumen_proposal_id` |
