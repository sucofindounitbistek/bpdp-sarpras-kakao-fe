# Research: Sync Pekebun Document Validation Status

## Research Questions & Findings

### Q1: Why are existing farmer validation records not reflected in the UI status badges?

**Findings**:
1. In `DetailVerifikasiKabView.vue`, `pekebuns` array passed to `verifikasiStore.syncFarmerDocumentValidations` was retrieved using `(proposalRes as any)?.pekebuns || (proposalRes as any)?.cpcl || []`. However, the proposal detail response stores CPCL list under `daftarCPCL` or `cpcl`. If `pekebuns` is empty or missing `daftarCPCL`, `syncFarmerDocumentValidations` cannot map `dokumen_pekebun_id` to `cpcl.id`.
2. In `verifikasiKabDraft.ts`, `syncFarmerDocumentValidations` looks up documents in `p.documents || p.dokumen || p.enriched?.dokumen`. If documents are stored in `pekebunStore.listPekebun` (matched by NIK) or in `p.dokumen_pekebun`, the search fails and `foundCpclId` remains `null`.
3. In `StepVerifikasiPekebunDanDokumenProposal.vue`, `getPekebunStatus(cpclId, docs)` checks keys for individual document types (e.g. `doc-${cpclId}-${docId}-namaLengkap`, `doc-${cpclId}-${docId}-nik` for KTP, and `doc-${cpclId}-${docId}-nomorKK` for KK). When `val.is_valid` is `true` but `val.details` only contains specific field items or empty details, `verifikasiStore` must also populate the parent document key `doc-${cpclId}-${docId}` AND all relevant field keys if `val.is_valid === true` to ensure `getPekebunStatus` evaluates to `APPROVED` / `'Sesuai'`.

### Q2: How to guarantee robust CPCL item & document ID matching?

**Decision**:
1. In `verifikasiKabDraft.ts`, enhance `syncFarmerDocumentValidations` to search across all CPCL/Pekebun data sources: `p.documents`, `p.dokumen`, `p.dokumen_pekebun`, `p.enriched?.dokumen`, and `pekebunStore.listPekebun` matching by `p.nik`.
2. Allow matching directly by `dokumen_pekebun_id` across all known CPCL entries.
3. When `val.is_valid === true`, mark main key `doc-${foundCpclId}-${docId}` as `APPROVED`. If `details` array has specific field validities (e.g. `namaLengkap`, `nik`, `nomorKK`), update those subKeys (`doc-${foundCpclId}-${docId}-${field_name}`). If `details` is empty but `is_valid` is `true`, auto-approve standard fields for KTP (`namaLengkap`, `nik`) and KK (`nomorKK`).

### Q3: How to trigger automatic synchronization upon detail view mount?

**Decision**:
In `VerifikasiPekebunDetailView.vue` and `StepVerifikasiPekebunDanDokumenProposal.vue`, ensure `syncFarmerDocumentValidations` is called whenever farmer validation data is fetched or present, so that navigating directly via deep links (e.g. `/dinas/verifikasi/kabupaten/22`) synchronizes store state immediately.
