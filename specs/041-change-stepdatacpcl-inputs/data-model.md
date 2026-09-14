# Data Model & Interfaces: Change StepDataCPCL Inputs

## Pinia Stores

### `useVerifikasiKabDraftStore` (in `src/stores/verifikasiKabDraft.ts`)
We modify/expand the state properties:

| Field | Type | Description |
|-------|------|-------------|
| `skCpcl` | `DokumenUpload \| null` | Dokumen SK CPCL Ditandatangani |
| `beritaAcaraDokumen` | `DokumenUpload \| null` | Berita Acara Verifikasi Dokumen |
| `beritaAcaraLapangan` | `DokumenUpload \| null` | Berita Acara Verifikasi Lapangan |

### `VerifikasiKabSubmission` (in `src/stores/verifikasiKab.ts`)
We update the submission payload structure:

```typescript
export interface VerifikasiKabSubmission {
  pengajuanId: string;
  verifications: Record<string, VerificationItem>;
  skCpcl: DokumenUpload | null;
  beritaAcaraDokumen: DokumenUpload | null;
  beritaAcaraLapangan: DokumenUpload | null;
  fotoUdaraPerPekebun: Record<string, DokumenUpload>;
  submittedAt: string;
}
```
