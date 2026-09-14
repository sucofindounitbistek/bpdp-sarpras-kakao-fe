# Phase 1 Data Model: Proposal Document Validation Item

```typescript
export interface ProposalDocumentValidation {
  id: number;
  dokumen_proposal_id: number;
  is_valid: boolean;
  notes?: string;
  validated_by_role?: string;
  created_at?: string;
}
```
