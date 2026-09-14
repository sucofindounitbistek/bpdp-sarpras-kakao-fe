# Research & Technical Decisions: Surat Keterangan Kades in Proposal

## Findings & Audit

1. **Reverting Pekebun-level changes**:
   - Revert modifications made to `src/types/pekebun.ts` (`DokumenFormData` and `TipeDokumenPekebun`).
   - Revert modifications made to `src/stores/pekebun.ts`.
   - Revert modifications made to `src/components/master-data/StepUploadDokumenPekebun.vue` and `src/views/master-data/FormPekebunView.vue`.
   - Revert the side-by-side template block in `src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue`.

2. **Proposal-level additions**:
   - `src/types/pengusulan.ts`: Add `'SURAT_KET_KADES'` to the `tipeDokumen` type union in `DokumenPersyaratan`.
   - `src/lib/pengusulan-persyaratan.config.ts`: Define `SURAT_KET_KADES` static requirement metadata and add it to `COMMON` array.
   - `src/stores/rekomtek.ts` and `src/stores/pengusulan.ts`: Append `SURAT_KET_KADES` mock files to mock proposal documents arrays.

## Decisions

### Decision 1: Reverting previous implementation
- **Choice**: Cleanly revert all files modified in the previous feature step.
- **Rationale**: Since Surat Keterangan Kades is now a proposal-level document, keeping it on the Pekebun-level would create clutter and validation conflicts.
