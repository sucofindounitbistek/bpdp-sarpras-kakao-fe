# Phase 1 Data Model: Contextual Rejection Notes Display

## Interfaces & Types

```typescript
export interface ParsedRejectionNote {
  category: 'PEKEBUN' | 'PROPOSAL_DOC' | 'GUDANG' | 'RAB';
  targetKey: string;
  farmerName?: string;
  itemLabel: string;
  notes: string;
}

export interface RejectionSummaryMap {
  pekebun: Record<string, ParsedRejectionNote[]>;
  proposalDocs: Record<string, ParsedRejectionNote>;
}
```

## Category Mapping Matrix

| Rejection Key / Pattern | Category | Target View |
| :--- | :--- | :--- |
| `[Nama Pekebun] - Scan KTP` | `PEKEBUN` | `StepDataCPCL.vue`, `VerifikasiPekebunDetailView.vue` |
| `[Nama Pekebun] - Surat Lahan` | `PEKEBUN` | `StepDataCPCL.vue`, `StepPilihPekebunLahan.vue` |
| `Surat Permohonan` / `Proposal Teknis` | `PROPOSAL_DOC` | `StepUploadDokumen.vue`, `TrackingPengusulanDetailView.vue` |
| `Gudang (Alamat)` / `Gudang (Foto)` | `GUDANG` | Gudang Serah Terima section |
| `RAB Ditandatangani` | `RAB` | Step RAB / RAB section |
