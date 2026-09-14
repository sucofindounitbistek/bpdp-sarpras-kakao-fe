# Feature Specification: Proposal Status Update to REV_FROM_KAB on Rejection at Dinas Kabupaten

**Feature Branch**: `060-kabupaten-rejection-status-rev-from-kab`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "i need when the proposal is rejecting in the kabupaten the proposal status is updated to 'REV_FROM_KAB'"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Standardize Proposal Rejection Status to REV_FROM_KAB at Dinas Kabupaten (Priority: P1)

As a Dinas Kabupaten verifier, when I reject a proposal or send it back for revision due to document/farmer validation issues, I want the proposal status to be updated to `REV_FROM_KAB` (Revisi dari Kabupaten), so that the applicant (Pemohon) and system workflows accurately reflect that the proposal is currently awaiting revision from the Kabupaten tier.

**Why this priority**: Correct status lifecycle management prevents status inconsistency between frontend UI, status badges, filtering queues, and backend proposal status tracking.

**Independent Test**: Perform a proposal rejection/return action from the Dinas Kabupaten verification view (`/dinas/verifikasi/kabupaten/:id`), confirm that the proposal status sent to backend/store is `REV_FROM_KAB`, and verify that status badges and queue filters accurately display `REV_FROM_KAB`.

**Acceptance Scenarios**:

1. **Given** a proposal under verification at Dinas Kabupaten level (`SUBMITTED` or `KAB_SUBMITTED`), **When** the verifier triggers a rejection / return action (`submitRejection` or modal return), **Then** the proposal status update payload MUST set status to `REV_FROM_KAB`.
2. **Given** a proposal transitioned to `REV_FROM_KAB`, **When** viewed in the proposal queue or status timeline, **Then** the status label displays "Revisi dari Kabupaten" with appropriate warning/revision styling.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Rejection or return-for-revision actions in Dinas Kabupaten verification (`StepVerifikasiPekebunDanDokumenProposal.vue` and `DetailVerifikasiKabView.vue`) MUST explicitly update the proposal status to `REV_FROM_KAB`.
- **FR-002**: The frontend proposal service and store methods MUST send `REV_FROM_KAB` in the API payload when executing a Kabupaten rejection action.
- **FR-003**: All status checks, queue filters, and status badge helpers across Dinas Kabupaten views MUST recognize `REV_FROM_KAB` as a valid revision state and handle UI routing/formatting accordingly.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of rejection actions initiated at Dinas Kabupaten level set proposal status to `REV_FROM_KAB`.
- **SC-002**: 0 instances of deprecated or mismatched status codes (such as `REVISION_ADMIN`) being dispatched during Kabupaten verification rejection.
