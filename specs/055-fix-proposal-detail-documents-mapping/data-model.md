# Phase 1 Data Model: Fix Proposal Detail Documents Mapping

## Document Interface Normalization

```typescript
export interface DokumenPersyaratan {
  id: string;
  persyaratanId: string;
  tipeDokumen: string;
  namaFile: string;
  urlFile: string;
  ukuranBytes: number;
  uploadedAt: string;
  isValid: boolean;
}
```

## Mapping Flow

```text
Backend response (response.data.documents)
          │
          ▼
Mapped to Proposal.dokumen array
          │
          ├──────────────────────────┐
          ▼                          ▼
activePengajuan.value        listPengajuan item (upsert)
          │                          │
          └──────────┬───────────────┘
                     ▼
  Consumed by getDokumen(persyaratanId) in StepVerifikasiPekebunDanDokumenProposal.vue
```
