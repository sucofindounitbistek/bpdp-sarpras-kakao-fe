# UI Contract: Sync Farmer & Land Document Validations from Backend

## API Specifications

1. `GET /farmer-document-validations?proposal_id=:id` $\rightarrow$ returns `{ data: FarmerDocumentValidation[] }`
2. `GET /land-document-validations?proposal_id=:id` $\rightarrow$ returns `{ data: LandDocumentValidation[] }`

## Verification Store Key Mapping Contract
- `dokumen_pekebun_id` $\rightarrow$ `doc-${cpclId}-${docId}`
- `details[].field_name` $\rightarrow$ `doc-${cpclId}-${docId}-${fieldName}`
- `dokumen_lahan_id` $\rightarrow$ `doc-${cpclId}-${landDocId}`
