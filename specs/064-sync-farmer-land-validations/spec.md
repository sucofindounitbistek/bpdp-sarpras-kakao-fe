# Feature Specification: Sync Farmer & Land Document Validations from Backend

**Feature Branch**: `064-sync-farmer-land-validations`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User request: "check the backend for the farmer_document_validation. I need it the view to be implemented as well in the kabupaten http://localhost:5173/dinas/verifikasi/kabupaten/22 similar to the proposal_document_validation. The api should be identical. But please check it to make sure"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fetch & Sync Farmer Document Validations (Priority: P1)

As a Regency Dinas Verifier, when I open a proposal detail page (such as `/dinas/verifikasi/kabupaten/22`), I want pre-existing farmer document validations (`GET /farmer-document-validations`) and sub-field decisions (e.g. KTP `namaLengkap`, `nik`, KK `nomorKK`) to automatically restore their `APPROVED` or `REJECTED` status and notes on the UI.

**Why this priority**: Without fetching and syncing `/farmer-document-validations`, farmer document verification decisions reset to default `PENDING` states whenever the page is loaded or refreshed.

**Independent Test**: Load `/dinas/verifikasi/kabupaten/22`, check the farmer documents list, and verify that KTP, KK, swafoto, and surat kuasa statuses and rejection notes match the backend validation records.

**Acceptance Scenarios**:

1. **Given** pre-existing farmer validation records returned by `GET /farmer-document-validations?proposal_id=22`, **When** the page loads, **Then** `verifikasiStore` restores verification status keys (`doc-${cpclId}-${docId}`) and field details (`doc-${cpclId}-${docId}-namaLengkap`, etc.).
2. **Given** farmer validation rejection notes, **When** viewing the document verification modal/card, **Then** notes populate in the notes textarea input.

---

### User Story 2 - Fetch & Sync Land Document Validations (Priority: P1)

As a Regency Dinas Verifier, when I open a proposal detail page, I want pre-existing land document validations (`GET /land-document-validations`) to restore their `APPROVED` or `REJECTED` status and notes.

**Why this priority**: Ensures land plot legalities and land documents retain their verification status across page reloads.

**Independent Test**: Load proposal detail, inspect land plot legalities verification, and verify statuses match backend records.

**Acceptance Scenarios**:

1. **Given** pre-existing land validation records returned by `GET /land-document-validations?proposal_id=22`, **When** the page loads, **Then** `verifikasiStore` restores land document verification status keys.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `proposalService` MUST expose `getFarmerDocumentValidations(params)` calling `GET /farmer-document-validations`.
- **FR-002**: `proposalService` MUST expose `getLandDocumentValidations(params)` calling `GET /land-document-validations`.
- **FR-003**: `pengusulanStore` MUST expose methods `getFarmerDocumentValidations(params)` and `getLandDocumentValidations(params)`.
- **FR-004**: `verifikasiKabDraftStore` MUST implement `syncFarmerDocumentValidations(validations, pekebuns)` and `syncLandDocumentValidations(validations, pekebuns)` to map backend validation IDs and field details into store verification keys (`doc-${cpclId}-${docId}`).
- **FR-005**: `DetailVerifikasiKabView.vue` MUST fetch `getFarmerDocumentValidations` and `getLandDocumentValidations` alongside proposal details and trigger store sync functions.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of pre-existing farmer document validations and sub-field decisions display their exact status and notes on `/dinas/verifikasi/kabupaten/:id`.
- **SC-002**: 100% of pre-existing land document validations display their exact status and notes.
