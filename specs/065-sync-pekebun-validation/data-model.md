# Data Model: Sync Pekebun Document Validation Status

## Entities & Interfaces

### FarmerDocumentValidation (API Payload & Store Mapping)

Represents backend validation record for farmer document.

```typescript
export interface ValidationDetail {
  id: number;
  validasi_dokumen_pekebun_id: number;
  field_name: string; // e.g. 'namaLengkap', 'nik', 'nomorKK'
  is_valid: boolean;
  notes?: string;
  validated_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FarmerDocumentValidationItem {
  id: number;
  dokumen_pekebun_id: number;
  pengajuan_id: number;
  is_valid: boolean;
  notes?: string;
  created_by?: string | null;
  validated_at?: string;
  created_at?: string;
  updated_at?: string;
  details?: ValidationDetail[];
}
```

### Store Verification Key Conventions

In `useVerifikasiKabDraftStore`:

- **Main Document Key**: `doc-${cpclId}-${dokumenPekebunId}`
  - Status: `'APPROVED' | 'REJECTED' | 'PENDING'`
  - Notes: string
- **Field Detail Key**: `doc-${cpclId}-${dokumenPekebunId}-${fieldName}`
  - Status: `'APPROVED' | 'REJECTED' | 'PENDING'`

### Status Mapping Rules

| `is_valid` (Parent) | `details` Array | Store Main Key | Store Detail Keys | UI Badge |
|---|---|---|---|---|
| `true` | Empty | `APPROVED` | All relevant fields `APPROVED` | `Sesuai` / Valid |
| `true` | Specified `is_valid: true` items | `APPROVED` | Matching fields `APPROVED` | `Sesuai` / Valid |
| `false` | Specified items | `REJECTED` | Field status per item | `Tidak Sesuai` |
| Record missing | N/A | `PENDING` | `PENDING` | `Belum Diverifikasi` |
