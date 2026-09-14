# Research: Sync Existing RAB and Storage Area Validation Statuses

## Root Cause Analysis

1. **RAB Document Alias Mapping in Store**:
   In `verifikasiKabDraftStore.ts` (`syncProposalValidations`), the `aliasMap` contained entries for `SK_CPCL`, `BERITA_ACARA_DOKUMEN`, `BERITA_ACARA_LAPANGAN`, but was missing entries for `RAB_RK`, `RAB_PROPOSAL`, and `RAB`.
   When the backend returned a validation record for document type `RAB_RK` (e.g. `dokumen_proposal_id: 46`, `is_valid: true`), `setVerificationStatus("RAB_RK", "APPROVED")` stored the result under key `"RAB_RK"`. However, `StepVerifikasiPekebunDanDokumenProposal.vue` inspects `getVerification('rabDocument')`. Because `aliasMap` lacked `RAB_RK` $\rightarrow$ `rabDocument`, `getVerification('rabDocument')` remained `PENDING`.

2. **Storage Area Payload Sync**:
   `syncProposalValidations` only iterated over the `documents` array. Storage area validation properties (`address_is_valid`, `coordinate_is_valid`, `exterior_photo_is_valid`, `interior_photo_is_valid`, and notes) are delivered directly within `proposal.storage_area`. They were not being mapped into `gudangAlamat`, `gudangKoordinat`, `fotoTampakDepan`, and `fotoTampakDalam` in `verifications.value`.

3. **Template Optional Chaining & Alias Fallback**:
   In `StepVerifikasiPekebunDanDokumenProposal.vue`, file display logic checked `getDokumen('RAB_RK')`. If the document was uploaded as `RAB_PROPOSAL` or optional, expressions like `getDokumen('RAB_RK')!.namaFile` risked throwing runtime exceptions.

---

## Technical Decisions

- **Decision 1**: Expand `aliasMap` in `verifikasiKabDraftStore.ts` to include:
  ```typescript
  'RAB_RK': 'rabDocument',
  'RAB_PROPOSAL': 'rabDocument',
  'RAB': 'rabDocument',
  'rabDocument': 'RAB_RK',
  'LEGALITAS_KP': 'LEGALITAS_KP',
  'SIMLUHTAN': 'SIMLUHTAN',
  ```
- **Decision 2**: Extend `syncProposalValidations(validations, documents, proposal)` to accept optional `proposal` payload and map `storage_area` / `gudangSerahTerima` validation properties into `gudangAlamat`, `gudangKoordinat`, `fotoTampakDepan`, `fotoTampakDalam`.
- **Decision 3**: Update `StepVerifikasiPekebunDanDokumenProposal.vue` to use optional chaining (`getDokumen('RAB_RK')?.namaFile`) and check `getDokumen('RAB_RK') || getDokumen('RAB_PROPOSAL')`.
