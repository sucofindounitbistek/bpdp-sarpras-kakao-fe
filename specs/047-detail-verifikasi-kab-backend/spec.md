# Feature Specification: Detail Verifikasi Kabupaten Backend Integration

**Feature Branch**: `047-detail-verifikasi-kab-backend`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "Please re-check the API_CONTRACT.md and PROPOSAL_API_CONTRACT.md for things related to the DetailVerifikasiKabView I've updated those files. For data related to the proposal and its documents and rabs you can get it in Get Proposal Detail. For the verificationOverlapMap you can use the Get Proposal Spatial Overlap. For changing the status you can use the update proposal patch. If reject then update the status to REV_FROM_KAB if approve then KAB_SUBMITTED. For the dokumen and pekebun validation you can use the farmer document and filed validation. For document upload when approving you can use the bulk create proposal documents."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Load Detail Proposal on Mount (Priority: P1)

Dinas Kabupaten officer opens the proposal verification page and views the complete details of the proposal, including attached documents, farmer registry list, and RAB details fetched from GET `/api/v1/proposals/:id`.

**Why this priority**: Required to verify the correctness of the proposal contents.

**Independent Test**: Navigate to detailed view, confirm GET `/api/v1/proposals/:id` network request is triggered and maps to the local view properties.

**Acceptance Scenarios**:

1. **Given** page is loading, **When** request is pending, **Then** show Skeleton loaders matching the view.
2. **Given** request succeeds, **When** loaded, **Then** render Nomor Proposal, Lembaga info, documents, and RAB.

---

### User Story 2 - Render Verification Overlap Map (Priority: P1)

Dinas Kabupaten officer views the spatial boundary map that highlights land plots and checks if there are any overlaps within a 50 km radius.

**Why this priority**: Spatial validation is mandatory for land clearance check.

**Independent Test**: Mount details page, inspect network console to verify GET `/api/v1/proposals/:id/spatial-overlap` is called and returns coordinate boundary data.

---

### User Story 3 - Validate Pekebun and Land Documents (Priority: P1)

Dinas Kabupaten officer checks individual farmer documents/fields and land documents.

**Why this priority**: Standard validation requirement prior to approval.

**Independent Test**: Mark documents valid/invalid, submit, confirm:
- POST `/api/v1/farmer-document-validations/bulk`
- POST `/api/v1/land-document-validations/bulk`
are called with correct validation payloads.

---

### User Story 4 - Return Proposal for Revision (Priority: P1)

Dinas Kabupaten officer rejects/returns the proposal to the cooperative for corrections.

**Why this priority**: Required for handling incorrect submissions.

**Independent Test**: Click "Kembalikan (Revisi)" button, enter notes, confirm PATCH `/api/v1/proposals/:id` is triggered with `status: "REV_FROM_KAB"`.

---

### User Story 5 - Finalize and Approve Verification (Priority: P2)

Dinas Kabupaten officer uploads the signed SK CPCL, triggers bulk creation of documents, and approves the proposal.

**Why this priority**: Success path for the kabupaten level.

**Independent Test**: Upload SK CPCL, submit, verify:
- POST `/api/v1/proposals/:id/documents/bulk` is called with file IDs.
- PATCH `/api/v1/proposals/:id` is called with `status: "KAB_SUBMITTED"`.

---

### Edge Cases

- **API Request Failure**: Show standard toast alerts.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST call GET `/api/v1/proposals/:id` on mount to fetch proposal aggregate.
- **FR-002**: System MUST call GET `/api/v1/proposals/:id/spatial-overlap` to load spatial boundaries.
- **FR-003**: System MUST trigger POST `/api/v1/farmer-document-validations/bulk` to validate farmer details.
- **FR-004**: System MUST trigger POST `/api/v1/land-document-validations/bulk` to validate land documents.
- **FR-005**: Rejection MUST call PATCH `/api/v1/proposals/:id` with payload `{ status: "REV_FROM_KAB" }`.
- **FR-006**: Approval MUST call POST `/api/v1/proposals/:id/documents/bulk` with SK CPCL files, followed by PATCH `/api/v1/proposals/:id` with payload `{ status: "KAB_SUBMITTED" }`.
- **FR-007**: All user-facing strings must use `LOCALIZATION` (Principle XV).

### Key Entities

- **Proposal**: Standard proposal details aggregate structure.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Page loads detail data and spatial data within 1.5 seconds.
- **SC-002**: Validation state and proposal status updates persist in the database.

## Assumptions

- Backend service endpoints are configured as per `API_CONTRACT.md`.
