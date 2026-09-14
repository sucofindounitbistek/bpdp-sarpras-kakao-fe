# Feature Specification: Implement getProposalDocumentValidations in Dinas Kabupaten Verification View

**Feature Branch**: `062-get-proposal-doc-validations-kab`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "implement the getProposalDocumentValidations in the http://localhost:5173/dinas/verifikasi/kabupaten/24"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Fetch and Restore Document Validations in Dinas Kabupaten Verification (Priority: P1)

As a Dinas Kabupaten verifier, when I open a proposal detail view (`/dinas/verifikasi/kabupaten/:id`), I want existing document validation states (`is_valid`, `notes`, `validated_by_role`) to be fetched via `getProposalDocumentValidations` API and populated into the verification store, so that previously recorded validation decisions and notes are accurately displayed.

**Why this priority**: Without fetching existing validations on page mount, previously saved document approvals or rejection notes appear empty when refreshing or navigating directly to the verification page.

**Independent Test**: Open `/dinas/verifikasi/kabupaten/24`, verify API request `GET /api/proposals/document-validations?proposal_id=24` is issued on mount, and confirm existing validation statuses (`APPROVED`/`REJECTED`) and notes populate correctly in `verifikasiKabDraft` store.

**Acceptance Scenarios**:

1. **Given** a proposal page at `/dinas/verifikasi/kabupaten/:id` mounting, **When** `onMounted` runs, **Then** `pengusulanStore.getProposalDocumentValidations({ proposal_id: Number(id) })` is called.
2. **Given** returned validation records for the proposal documents, **When** parsed, **Then** `verifikasiKabDraftStore.setVerificationStatus` and notes are updated for matching document keys.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `DetailVerifikasiKabView.vue` or `StepVerifikasiPekebunDanDokumenProposal.vue` MUST call `pengusulanStore.getProposalDocumentValidations({ proposal_id: Number(id) })` during initialization/onMounted.
- **FR-002**: Validation records returned from API MUST populate `verifikasiKabDraftStore` verification states (`APPROVED` / `REJECTED`) and `notes` matching document requirements.
- **FR-003**: Fetch failure MUST handle errors gracefully without blocking proposal detail rendering.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of existing document validation records from backend populate in Kabupaten verification view on load.
- **SC-002**: Zero loss of previously saved document verification notes when re-opening a proposal page.
