# Data Model: Verifikasi Pekebun Submit All at End

## Local State (Pinia Store)

The draft verifications are kept in `useVerifikasiKabDraftStore` state:

```typescript
type VerificationStatus = 'APPROVED' | 'REJECTED' | 'PENDING';

interface VerificationItem {
  status: VerificationStatus;
  notes: string;
}

// Store state attributes:
// - verifications: Record<string, VerificationItem>
//   Keys are formatted as:
//   - For document fields: `doc-${cpclId}-${doc.id}-${fieldName}` (e.g., KTP namaLengkap/nik, KK nomorKK)
//   - For document level checks: `doc-${cpclId}-${doc.id}`
//   - For proposal-wide checklist items: `{persyaratanId}` (e.g. `gudangAlamat`, `rabDocument`)
```

## Backend Payloads

### 1. Farmer Document Validation (`/api/v1/farmer-document-validations/bulk`)

```json
[
  {
    "dokumen_pekebun_id": 123,
    "pengajuan_id": 456,
    "is_valid": true,
    "notes": "Clear scan",
    "details": [
      { "field_name": "namaLengkap", "is_valid": true },
      { "field_name": "nik", "is_valid": true }
    ]
  }
]
```

### 2. Land Document Validation (`/api/v1/land-document-validations/bulk`)

```json
[
  {
    "dokumen_lahan_id": 789,
    "pengajuan_id": 456,
    "is_valid": true,
    "notes": "Verified boundary"
  }
]
```
