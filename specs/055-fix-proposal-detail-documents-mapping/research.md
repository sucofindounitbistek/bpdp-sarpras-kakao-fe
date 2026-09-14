# Phase 0 Research: Fix Proposal Detail Documents Mapping

## Research Task 1: Mapping Analysis in `getProposalDetail`

- **Root Cause**: `getProposalDetail()` in `src/stores/pengusulan.ts` created `mapped` object at line 704 without `dokumen` array property. `dokumen` array was only assigned to `activePengajuan.value` at line 793. When `DetailVerifikasiKabView.vue` retrieved proposal from `pengusulanStore.listPengajuan.find(...)`, `p.dokumen` was `undefined`.
- **Decision**: Update `getProposalDetail()` so that `dokumen` array is mapped directly onto `mapped`, assigned to `activePengajuan.value`, AND upserted into `listPengajuan.value`.

## Research Task 2: Robust `getDokumen` Matching Strategy

- **Decision**: Update `getDokumen(persyaratanId)` in `StepVerifikasiPekebunDanDokumenProposal.vue`:
  - Check both `pengajuan.value.dokumen` AND `pengajuan.value.documents`.
  - Add alias lookup map for canonical requirement IDs vs backend document types:
    ```typescript
    const ALIAS_MAP: Record<string, string[]> = {
      LEGALITAS_KP: ['DOKUMEN_LEGALITAS_KELEMBAGAAN', 'LEGALITAS_KP', 'KELEMBAGAAN'],
      SIMLUHTAN: ['SURAT_PERMOHONAN', 'SIMLUHTAN', 'PERMOHONAN'],
      RAB_RK: ['RAB_PROPOSAL', 'RAB_RK', 'RAB'],
      RAB_DETAIL: ['RAB_PROPOSAL', 'RAB_DETAIL', 'RAB_FINAL'],
      PROPOSAL_TEKNIS: ['PROPOSAL_TEKNIS', 'PROPOSAL'],
      PERNYATAAN_LUAS: ['SURAT_PERNYATAAN_KEABSAHAN', 'PERNYATAAN_LUAS', 'SPTJM'],
      PERNYATAAN_TANPA_BAKAR: ['SURAT_PERNYATAAN_KEABSAHAN', 'PERNYATAAN_TANPA_BAKAR', 'SPTJM'],
    };
    ```
- **Rationale**: Guarantees matching regardless of whether requirements use frontend legacy keys (`LEGALITAS_KP`) or backend canonical types (`DOKUMEN_LEGALITAS_KELEMBAGAAN`).
