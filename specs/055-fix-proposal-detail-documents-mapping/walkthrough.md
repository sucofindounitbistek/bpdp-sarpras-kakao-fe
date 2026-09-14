# Walkthrough: Fix Proposal Detail Documents Mapping

## Cause of Conflict / Bug

In `getProposalDetail()` (`src/stores/pengusulan.ts`), line 821 previously executed `activePengajuan.value = mapped;`, where `mapped` was defined at line 704 as an incomplete object *without* `dokumen`, `documents`, `daftarCPCL`, or `rabItems`. This discarded the mapped document arrays and left `activePengajuan.value` without document data.

## Fix Applied

- **`src/stores/pengusulan.ts`**:
  - Consolidated the construction of `mapped` in `getProposalDetail()` so it contains all enriched document arrays (`dokumen`, `documents`, `daftarCPCL`, `rabItems`).
  - Updated `activePengajuan.value = mapped` and `listPengajuan` upsert so both state references preserve document metadata.
- **`StepVerifikasiPekebunDanDokumenProposal.vue`**:
  - Enhanced `getDokumen(persyaratanId)` to inspect both `dokumen` and `documents` arrays with fallback alias mapping (`DOC_ALIAS_MAP`) matching requirement keys to backend canonical document types.

## Verification

- `tasks.md` marked 5/5 tasks `[X]`.
- Build task `npm run build` executed successfully.
