# UI Contract: Submit Storage Area & Proposal Document Validations to Backend

## Contract Specifications

### 1. Proposal Document Validation Submission Contract
`POST /proposal-document-validations/bulk` payload format:
```json
[
  {
    "dokumen_proposal_id": 46,
    "is_valid": true,
    "notes": "RAB sesuai"
  }
]
```

### 2. Proposal Update with Storage Area Validation Contract
`PATCH /proposals/:id` payload format:
```json
{
  "status": "KAB_SUBMITTED",
  "storage_area": {
    "address_is_valid": true,
    "address_notes": null,
    "coordinate_is_valid": true,
    "coordinate_notes": null,
    "exterior_photo_is_valid": true,
    "exterior_photo_notes": null,
    "interior_photo_is_valid": null,
    "interior_photo_notes": null
  }
}
```
