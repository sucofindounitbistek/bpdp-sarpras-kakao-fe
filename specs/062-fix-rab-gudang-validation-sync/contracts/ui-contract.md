# UI Contract: Sync Existing RAB and Storage Area Validation Statuses

## Interface Contracts

### 1. Document Alias Resolution Contract
`syncProposalValidations(validations, documents, proposal)` MUST resolve document type aliases bidirectionally:
- `RAB_RK`, `RAB_PROPOSAL`, `RAB` $\leftrightarrow$ `rabDocument`
- `SK_CPCL` $\leftrightarrow$ `sk-cpcl`
- `BERITA_ACARA_DOKUMEN` $\leftrightarrow$ `berita-acara-dokumen`
- `BERITA_ACARA_LAPANGAN` $\leftrightarrow$ `berita-acara-lapangan`

### 2. Storage Area Property Sync Contract
When `proposal.storage_area` or `proposal.gudangSerahTerima` is provided:
- `address_is_valid` / `address_notes` $\rightarrow$ `verifications['gudangAlamat']`
- `coordinate_is_valid` / `coordinate_notes` $\rightarrow$ `verifications['gudangKoordinat']`
- `exterior_photo_is_valid` / `exterior_photo_notes` $\rightarrow$ `verifications['fotoTampakDepan']`
- `interior_photo_is_valid` / `interior_photo_notes` $\rightarrow$ `verifications['fotoTampakDalam']`

### 3. Safe Document Rendering Contract
In `StepVerifikasiPekebunDanDokumenProposal.vue`:
- `getDokumen('RAB_RK')` MUST check aliases `RAB_PROPOSAL`, `RAB_RK`, `RAB`.
- File metadata accesses MUST use optional chaining (`getDokumen('RAB_RK')?.namaFile`).
