# Feature Specification: Verifikasi Pekebun Submit All at End

**Feature Branch**: `048-verifikasi-pekebun-submit-all`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "for the verifikasi pekebun detail view I want the submit to be all in the end, instead of submitting per step"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Defer validation submissions during step transitions (Priority: P1)

Dinas Kabupaten officer fills in verification checks for farmer details and documents in Step 1, then proceeds to the next steps without triggering API validation requests immediately.

**Why this priority**: Core requirement of deferring submission.

**Independent Test**: Fill in checks, proceed to Step 3, verify no validation calls are made.

**Acceptance Scenarios**:

1. **Given** user is on Step 1 of the verification, **When** they click "Simpan & Lanjut ke SK CPCL", **Then** the UI transitions to Step 3, and NO backend validation requests are fired.

---

### User Story 2 - Bulk submit all validations and updates at the end (Priority: P1)

Dinas Kabupaten officer reviews the summary on Step 4 and clicks "Ajukan Ke Provinsi" or "Kembalikan (Revisi)", triggering all accumulated validations and proposal status updates in a single execution sequence.

**Why this priority**: Ensures data integrity and consistency.

**Independent Test**: Trigger final submission, check network for sequenced validation and update calls.

**Acceptance Scenarios**:

1. **Given** user is on Step 4, **When** they click "Ajukan Ke Provinsi" with validations completed, **Then** the system sequentially calls bulk farmer validations, bulk land validations, bulk document uploads, and proposal status update to KAB_SUBMITTED.
2. **Given** user is on Step 4, **When** they click "Kembalikan (Revisi)" with validation issues, **Then** the system sequentially calls bulk validations and updates proposal status to REV_FROM_KAB.

---

### User Story 3 - Draft persistence across transitions (Priority: P2)

Dinas Kabupaten officer can move back and forth between steps (Step 1, Step 3, Step 4) and drill down to individual farmer details, with the pending validation statuses kept correctly in the local draft state.

**Why this priority**: Keeps user's progress.

**Independent Test**: Check validations, go to Step 3, click Back to Step 1, verify checks are preserved.

**Acceptance Scenarios**:

1. **Given** user has marked some fields as valid, **When** they navigate to other steps or view individual farmer detail views and return, **Then** the marked validation statuses remain selected.

---

### Edge Cases

- **Submission Failure**: If any API call in the sequence fails, the submit action MUST halt, show a clear error message, and allow the user to retry the submission without losing the draft state.
- **Missing Mandatory Files**: When clicking approve, the user must be blocked and notified if mandatory documents (SK CPCL, BA Dokumen, BA Lapangan) are not uploaded.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Verification status of farmers and land documents MUST be stored in the local application draft state during step transitions without hitting the server endpoints.
- **FR-002**: Upon clicking "Ajukan Ke Provinsi" (Approval) on Step 4, the system MUST sequentially call bulk farmer validations, bulk land validations, upload proposal documents, and update the proposal status to KAB_SUBMITTED.
- **FR-003**: Upon clicking "Kembalikan (Revisi)" (Rejection) on Step 4, the system MUST sequentially call bulk farmer validations, bulk land validations, and update the proposal status to REV_FROM_KAB.
- **FR-004**: If any API call in the sequence fails, the submit action MUST halt, show a clear error message, and allow the user to retry the submission.
- **FR-005**: All user-facing strings must use localization standard (Principle XV).

### Key Entities

- **Proposal**: Proposal details.
- **Farmer Document Validation**: Model for bulk farmer document validation.
- **Land Document Validation**: Model for bulk land document validation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Verification data is successfully persisted on final submission (measured by database/backend update).
- **SC-002**: Step transitions are immediate (under 100ms) since they do not require API calls.

## Assumptions

- Backend endpoints are robust to handle validations and proposal status updates consecutively.
