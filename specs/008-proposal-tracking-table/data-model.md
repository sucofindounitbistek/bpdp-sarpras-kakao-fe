# Data Models: Proposal Tracking Table

We leverage the existing TypeScript interfaces and types defined in `src/types/pengusulan.ts` without modifying the core data model schemas.

## Core Entities Used

### 1. `PengajuanSarpras`
Represents the main Proposal usulan structure loaded from the Pinia store.

```typescript
export interface PengajuanSarpras {
  id: string;
  nomorResi: string;
  lembagaId: string;
  lembaga: LembagaPengusul;
  jenisSarpras: JenisSarpras;
  detailUsulan: string;
  totalAnggaranPengajuan: number;
  currentStatus: PengajuanStatus;
  catatanDinas?: string;
  daftarCPCL: DataCPCL[];
  dokumen: DokumenPersyaratan[];
  createdAt: string;
  updatedAt: string;
}
```

### 2. `PengajuanStatus` (Enum)
Determines the current step in the workflow timeline:

```typescript
export enum PengajuanStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  REVISION_ADMIN = 'REVISION_ADMIN',
  VERIFIED_ADMIN = 'VERIFIED_ADMIN',
  VERIFIED_FIELD = 'VERIFIED_FIELD',
  REKOMTEK_KAB_ISSUED = 'REKOMTEK_KAB_ISSUED',
  VALIDATED_PROV = 'VALIDATED_PROV',
  SK_DITJENBUN_ISSUED = 'SK_DITJENBUN_ISSUED',
  PKS_BPDP_SIGNED = 'PKS_BPDP_SIGNED',
  DISBURSED = 'DISBURSED',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}
```

## Validation Rules & Display Mappings

- **Nomor Resi**: Monospaced text format.
- **Total Anggaran**: Formatted as IDR currency format using `toLocaleString('id-ID')` with fallback values if undefined.
- **Status Badge Styling**:
  - `SUBMITTED` -> `info` (blue)
  - `REKOMTEK_KAB_ISSUED`, `VALIDATED_PROV` -> `warning` (amber)
  - `SK_DITJENBUN_ISSUED`, `PKS_BPDP_SIGNED`, `DISBURSED`, `COMPLETED` -> `success` (green)
  - `REVISION_ADMIN`, `REJECTED` -> `danger` (red)
  - Others -> `secondary` (gray)
