# Feature Specification: Wire Bulk Proposal Document Validations API into usePengusulanStore

**Feature Branch**: `053-bulk-proposal-doc-validation-api`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "wire POST /api/proposal-document-validations/bulk into usePengusulanStore for granular per-document DB records"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Persist Granular Proposal Document Verification Records to Backend (Priority: P1)

As a Dinas Kabupaten verifier, I want my document verification decisions (approval/rejection status and feedback notes for each individual proposal document) to be sent to the backend endpoint `POST /api/proposal-document-validations/bulk`, so that granular document audit records are persisted in the database.

**Why this priority**: Crucial for database audit compliance and tracking per-document verification history across revision cycles.

**Independent Test**: Perform verification on proposal documents, submit approval or revision, verify that network request calls `POST /api/proposal-document-validations/bulk` with array payload containing `dokumen_proposal_id`, `is_valid`, `notes`, and `validated_by_role`.

**Acceptance Scenarios**:

1. **Given** a set of verified proposal documents in `StepVerifikasiPekebunDanDokumenProposal.vue`, **When** the verifier submits verification decisions, **Then** `usePengusulanStore` executes `bulkValidateProposalDocuments()` calling `POST /api/proposal-document-validations/bulk`.
2. **Given** document verification records sent to API, **When** payload is received by backend, **Then** each document item includes `dokumen_proposal_id` (uint), `is_valid` (boolean), `notes` (optional string), and `validated_by_role` ("DINAS_KABUPATEN").

---

### User Story 2 - Fetch Existing Document Verification Records on Proposal Load (Priority: P2)

As a verifier, I want existing document validation records to be loaded from `GET /api/proposal-document-validations?proposal_id=...` when opening a proposal, so that prior verification decisions and notes are restored in the UI.

**Why this priority**: Ensures verifiers see previously saved validation decisions when re-opening proposals.

**Independent Test**: Load a proposal with existing verification records, verify that document statuses (`Sesuai`/`Tidak Sesuai`) and notes are populated.

**Acceptance Scenarios**:

1. **Given** a proposal with previously saved document validations, **When** fetching proposal verification details, **Then** existing document validation records are loaded into store state.

---

### Edge Cases

- **Backend API Unavailability / Fallback**: If backend API returns an error or endpoint is temporarily unavailable, client must log warning and preserve local Pinia draft state without crashing.
- **Empty Validations Array**: If no documents have verification decisions, bulk API call must be skipped cleanly.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `usePengusulanStore` MUST expose `bulkValidateProposalDocuments(validations: CreateProposalDocumentValidationPayload[])` calling `POST /api/proposal-document-validations/bulk`.
- **FR-002**: The payload MUST match backend DTO schema: `dokumen_proposal_id` (number), `is_valid` (boolean), `notes` (string/null), and `validated_by_role` (string, e.g., "DINAS_KABUPATEN").
- **FR-003**: `StepVerifikasiPekebunDanDokumenProposal.vue` MUST compile verification decisions for proposal documents and invoke `bulkValidateProposalDocuments()` during submission.
- **FR-004**: `usePengusulanStore` MUST expose `fetchProposalDocumentValidations(proposalId: string|number)` to fetch existing validation records via `GET /api/proposal-document-validations`.

### Key Entities

- **ProposalDocumentValidationPayload**:
  - `dokumen_proposal_id`: Number (ID of the document record).
  - `is_valid`: Boolean (`true` for APPROVED, `false` for REJECTED).
  - `notes`: Optional string containing rejection feedback notes.
  - `validated_by_role`: String indicating role (`DINAS_KABUPATEN`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of submitted proposal document verification decisions are transmitted to `POST /api/proposal-document-validations/bulk`.
- **SC-002**: Zero application crashes when sending bulk document validation API requests.

## Assumptions

- Backend endpoint `POST /api/proposal-document-validations/bulk` is registered and functional in `bpdp-sarpras-kelapa-be`.
- Centralized Axios client (`api.ts`) handles Bearer Authorization header injection automatically.
