# Feature Specification: Sync Existing RAB and Storage Area Validation Statuses

**Feature Branch**: `062-fix-rab-gudang-validation-sync`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "The RAB HAS A FILE THERE ... THE VALIDATION NEEDS TO SHOW IT IF IT'S ALREADY VALIDATED." (Proposal #22 payload contains pre-existing document validation records for `RAB_RK` / `RAB_PROPOSAL` and `storage_area` properties that were not reflecting as `APPROVED` / `REJECTED` in Regency Verification).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sync and Display Pre-existing RAB Document Validations (Priority: P1)

As a Regency Dinas Verifier, when opening a proposal detail page (such as `/dinas/verifikasi/kabupaten/22`) that has already been validated or reviewed, I want the RAB document validation status (Setuju / Tolak and rejection notes) to reflect the backend validation records for `RAB_RK` / `RAB_PROPOSAL` documents.

**Why this priority**: Without syncing `RAB_RK` / `RAB_PROPOSAL` validation records to `rabDocument` verification keys, previously approved or rejected RAB documents revert to default `PENDING` states, causing verifiers to lose existing validation progress upon page load.

**Independent Test**: Load proposal #22 detail page (`/dinas/verifikasi/kabupaten/22`), inspect the "Pemeriksaan RAB" section, and confirm that the RAB document card displays the correct file (`sample-local-pdf.pdf` / `BPDP _ Sarpras Kelapa.pdf`) with the `APPROVED` (Setuju) status highlighted.

**Acceptance Scenarios**:

1. **Given** a proposal payload with a document of type `RAB_RK` or `RAB_PROPOSAL` and an associated validation record with `is_valid: true`, **When** the proposal detail loads, **Then** `verifikasiStore.getVerification('rabDocument')` resolves to `status: 'APPROVED'`.
2. **Given** a proposal payload with document validation notes for an RAB file, **When** the verifier views the RAB inspection card, **Then** the validation status and notes display accurately.

---

### User Story 2 - Sync and Display Storage Area (Gudang) Field Validations (Priority: P1)

As a Regency Dinas Verifier, when opening a proposal containing pre-validated `storage_area` or `gudangSerahTerima` details (address, coordinate, exterior photo, interior photo), I want the validation statuses (`address_is_valid`, `coordinate_is_valid`, `exterior_photo_is_valid`, `interior_photo_is_valid`) and their respective notes to render on the Gudang validation card.

**Why this priority**: Storage area validations are delivered directly within the proposal's `storage_area` object properties; syncing them ensures existing warehouse approvals and rejection notes are retained.

**Independent Test**: Load a proposal with validated `storage_area` fields, inspect the "Pemeriksaan Gudang Serah Terima" card, and verify that address, coordinate, and photo validation states match the backend response.

**Acceptance Scenarios**:

1. **Given** a proposal payload with `storage_area.address_is_valid: true` and `storage_area.coordinate_is_valid: true`, **When** the proposal detail loads, **Then** `gudangAlamat` and `gudangKoordinat` verification keys resolve to `status: 'APPROVED'`.
2. **Given** a proposal with rejection notes on storage area fields, **When** the verifier views the Gudang card, **Then** the rejection status and text notes are populated in the textarea inputs.

---

### Edge Cases

- **Multiple RAB Document Aliases**: Proposals may include files with `document_type: "RAB_RK"` or `document_type: "RAB_PROPOSAL"`; `syncProposalValidations` MUST map both to `rabDocument`, `RAB_RK`, and `RAB_PROPOSAL`.
- **Null Check Safety on Template Rendering**: If `getDokumen('RAB_RK')` is undefined or optional, template rendering for file details MUST use optional chaining (`getDokumen('RAB_RK')?.namaFile`) to prevent Vue render crashes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `verifikasiKabDraftStore.syncProposalValidations()` MUST map document validation records for `RAB_RK`, `RAB_PROPOSAL`, and `RAB` to the `rabDocument` verification key.
- **FR-002**: `verifikasiKabDraftStore.syncProposalValidations()` MUST sync `storage_area` / `gudangSerahTerima` validation fields (`address_is_valid`, `coordinate_is_valid`, `exterior_photo_is_valid`, `interior_photo_is_valid`, and notes) to `gudangAlamat`, `gudangKoordinat`, `fotoTampakDepan`, and `fotoTampakDalam`.
- **FR-003**: `StepVerifikasiPekebunDanDokumenProposal.vue` MUST safely handle missing or optional RAB files using optional chaining when rendering file metadata.
- **FR-004**: `StepVerifikasiPekebunDanDokumenProposal.vue` MUST automatically trigger `syncProposalValidations()` whenever proposal detail and validation payloads are fetched.

### Key Entities *(include if feature involves data)*

- **DokumenValidation**: API entity representing document validation status (`dokumen_proposal_id`, `is_valid`, `notes`, `validated_by_role`).
- **StorageArea**: Proposal sub-entity containing `address_is_valid`, `coordinate_is_valid`, `exterior_photo_is_valid`, `interior_photo_is_valid` and their notes.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of proposal document validations for `RAB_RK` / `RAB_PROPOSAL` (including proposal #22) reflect their `APPROVED` or `REJECTED` status on the Regency Verification page immediately after load.
- **SC-002**: 100% of `storage_area` validation states and notes reflect accurately on the Gudang validation card.
- **SC-003**: 0% JavaScript runtime errors when opening proposal detail pages with or without uploaded RAB files.

## Assumptions

- Proposal detail API payloads contain `documents` array and optional `storage_area` object.
- Validation records from `getProposalDocumentValidations` link to proposal document IDs via `dokumen_proposal_id`.
