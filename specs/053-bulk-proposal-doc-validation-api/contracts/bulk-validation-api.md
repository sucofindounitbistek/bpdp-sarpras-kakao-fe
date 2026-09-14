# Interface Contract: Bulk Proposal Document Validation API

## Endpoint

`POST /api/proposal-document-validations/bulk`

## Headers

- `Authorization`: `Bearer <token>`
- `Content-Type`: `application/json`

## Request Payload Example

```json
[
  {
    "dokumen_proposal_id": 12,
    "is_valid": true,
    "notes": "",
    "validated_by_role": "DINAS_KABUPATEN"
  },
  {
    "dokumen_proposal_id": 13,
    "is_valid": false,
    "notes": "Dokumen tidak legam",
    "validated_by_role": "DINAS_KABUPATEN"
  }
]
```

## Response Envelope Example (201 Created)

```json
{
  "data": [
    {
      "id": 1,
      "dokumen_proposal_id": 12,
      "is_valid": true,
      "notes": "",
      "validated_by_role": "DINAS_KABUPATEN",
      "created_at": "2026-08-31T10:27:00Z",
      "updated_at": "2026-08-31T10:27:00Z"
    }
  ],
  "message": "success"
}
```
