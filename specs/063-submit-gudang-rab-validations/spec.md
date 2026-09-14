# Feature Specification: Submit Storage Area (Gudang) & Proposal Document Validations to Backend

**Feature Branch**: `063-submit-gudang-rab-validations`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User question: "is the gudang notes and isValid properly sent to the backend when submitting http://localhost:5173/dinas/verifikasi/kabupaten/22? because i check the database those are still null"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Persist Storage Area (Gudang) Validations & Rejection Notes to Backend (Priority: P1)

As a Regency Dinas Verifier, when I submit or return a proposal (such as proposal #22) at `/dinas/verifikasi/kabupaten/:id`, I want all Gudang validation statuses (`address_is_valid`, `coordinate_is_valid`, `exterior_photo_is_valid`, `interior_photo_is_valid`) and rejection notes (`address_notes`, `coordinate_notes`, `exterior_photo_notes`, `interior_photo_notes`) to be transmitted to the backend database, so that the warehouse validation results are accurately stored.

**Why this priority**: Currently, warehouse validation statuses and notes remain `NULL` in the database upon submission because the payload builder in `StepSummaryDanSubmit.vue` omitted `storage_area` validation properties during proposal update API calls.

**Independent Test**: Complete Gudang verification in Step 1, navigate to Step 4, click "Ajukan ke Provinsi", and inspect the network request payload to `PATCH /proposals/:id` to confirm `storage_area` properties (`address_is_valid`, `address_notes`, etc.) are sent.

**Acceptance Scenarios**:

1. **Given** a verifier has set `gudangAlamat` or `gudangKoordinat` or photo validation statuses to `APPROVED` or `REJECTED` with notes, **When** the verifier submits the proposal, **Then** `storage_area` contains `address_is_valid`, `coordinate_is_valid`, `exterior_photo_is_valid`, `interior_photo_is_valid` (as booleans/null) and their notes string values in the payload sent to backend.
2. **Given** storage area validation properties are sent in the payload, **When** the proposal record reloads from backend, **Then** all Gudang validation states and notes are returned accurately.

---

### User Story 2 - Persist Proposal Document Validations (RAB, SIMLUHTAN, etc.) to Backend (Priority: P1)

As a Regency Dinas Verifier, when I submit or return a proposal, I want all proposal-level document verification decisions (`RAB_RK`, `RAB_PROPOSAL`, `SIMLUHTAN`, `LEGALITAS_KP`, `PERNYATAAN_LUAS`, `REFERENSI_HARGA`, etc.) to be transmitted to `POST /proposal-document-validations/bulk`.

**Why this priority**: Without bulk proposal document validation submission, document-level verification statuses and notes for proposal attachments revert to default states upon refresh.

**Independent Test**: Set verification decisions for RAB and proposal documents in Step 1, submit the proposal, and verify that `bulkProposalDocumentValidations` executes sending document ID mapping.

**Acceptance Scenarios**:

1. **Given** verifications recorded for proposal documents (`RAB_RK`, `SIMLUHTAN`, `LEGALITAS_KP`, etc.), **When** submitting the proposal, **Then** `pengusulanStore.bulkProposalDocumentValidations` is called with `{ dokumen_proposal_id, is_valid, notes }` array.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `buildValidationPayloads()` in `StepSummaryDanSubmit.vue` MUST build `storageAreaPayload` containing `address_is_valid`, `coordinate_is_valid`, `exterior_photo_is_valid`, `interior_photo_is_valid` booleans/null and notes strings.
- **FR-002**: `buildValidationPayloads()` in `StepSummaryDanSubmit.vue` MUST build `proposalDocPayload` containing `{ dokumen_proposal_id, is_valid, notes }` for all proposal-level document attachments.
- **FR-003**: The proposal submission handlers (`handleAjukanKeProvinsi` and `handleKembalikanRevisi`) MUST invoke `pengusulanStore.bulkProposalDocumentValidations(proposalDocPayload)` when `proposalDocPayload` is non-empty.
- **FR-004**: The proposal update payload sent to `pengusulanStore.updateProposal` MUST include `storage_area: storageAreaPayload`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Gudang validation statuses (`address_is_valid`, `coordinate_is_valid`, `exterior_photo_is_valid`, `interior_photo_is_valid`) and notes are persisted to the database upon submission.
- **SC-002**: 100% of proposal-level document validations (including `RAB_RK` / `RAB_PROPOSAL`) are sent to `POST /proposal-document-validations/bulk`.
