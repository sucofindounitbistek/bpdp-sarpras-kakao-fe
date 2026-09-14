# Feature Specification: provinsi-approval-modal

**Feature Branch**: `025-provinsi-approval-modal`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "/speckit-specify i need the ApprovalConfirmationModal to also show up in the dinas provinsi. Please check if the modal already shows up correctly in other parts as well"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dinas Provinsi Submission Confirmation (Priority: P1)

As a Dinas Provinsi Verifier, I want to see a confirmation modal when submitting a verified proposal to Ditjenbun, so that I can double-check the destination stage before completing my action.

**Why this priority**: High value for preventing accidental submissions and maintaining workflow clarity.

**Independent Test**: Can be tested by completing Dinas Provinsi verification steps, clicking "Ajukan ke Ditjenbun" on Step 4, and confirming that the confirmation modal displays "Ditjenbun (Penerbitan Rekomtek)".

**Acceptance Scenarios**:

1. **Given** a Dinas Provinsi verifier is on the Step 4 (Summary & Submit) page, **When** they click "Ajukan ke Ditjenbun", **Then** the `ApprovalConfirmationModal` MUST display with action-type "approve" and destination "Ditjenbun".
2. **Given** the confirmation modal is open, **When** they click "Batal", **Then** the modal closes and no submission is executed.
3. **Given** the confirmation modal is open, **When** they click "Ya, Setujui", **Then** the proposal is submitted to Ditjenbun and the user is redirected to the queue.

---

### User Story 2 - Dinas Provinsi Rejection Confirmation (Priority: P1)

As a Dinas Provinsi Verifier, I want to see a confirmation modal when returning/rejecting a proposal back to Dinas Kabupaten/Kota (specifically for SK CPCL correction), so that I can verify the rejection notes and destination.

**Why this priority**: Essential to ensure rejection reasons are correctly displayed and confirmed.

**Independent Test**: Can be tested by rejecting the SK CPCL document on Step 3, entering a note, clicking "Revisi Kembali Dokumen", and confirming the modal appears.

**Acceptance Scenarios**:

1. **Given** a Dinas Provinsi verifier is on Step 3 (SK CPCL), has marked it REJECTED, and entered a note, **When** they click "Revisi Kembali Dokumen", **Then** the `ApprovalConfirmationModal` MUST display with action-type "reject", destination "Dinas Kabupaten/Kota", and the entered note.
2. **Given** the confirmation modal is open, **When** they click "Ya, Kembalikan", **Then** the proposal status updates to revision and they are redirected.

---

### User Story 3 - Dinas Kabupaten Submission Confirmation (Priority: P2)

As a Dinas Kabupaten/Kota Verifier, I want to see a confirmation modal when submitting a verified proposal to Dinas Provinsi, so that I can confirm the destination stage.

**Why this priority**: Completes the verification lifecycle confirmation flow.

**Independent Test**: Can be tested by completing Dinas Kabupaten verification steps, clicking "Ajukan Ke Provinsi" on Step 4, and verifying the confirmation modal.

**Acceptance Scenarios**:

1. **Given** a Dinas Kabupaten verifier is on Step 4 (Summary & Submit), **When** they click "Ajukan Ke Provinsi", **Then** the `ApprovalConfirmationModal` MUST display with action-type "approve" and destination "Dinas Provinsi".

---

### Edge Cases

- **Action in Progress**: Clicking confirm multiple times should not trigger multiple submissions. The modal button must show a loader and be disabled during confirmation.
- **Empty Notes on Rejection**: Confirm modal must not bypass validation of empty notes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render the `ApprovalConfirmationModal` before executing the submission to Ditjenbun in the Dinas Provinsi verification view (`StepSummaryDanSubmit.vue`).
- **FR-002**: System MUST render the `ApprovalConfirmationModal` before executing the rejection to Dinas Kabupaten in the Dinas Provinsi verification view (`StepDataCPCL.vue`).
- **FR-003**: System MUST render the `ApprovalConfirmationModal` before executing the submission to Dinas Provinsi in the Dinas Kabupaten verification view (`StepSummaryDanSubmit.vue`).
- **FR-004**: All confirmation modals MUST retrieve localization strings from the central `LOCALIZATION` config.

### Key Entities *(include if feature involves data)*

- **Verification Proposal (Pengajuan)**: Represents the proposal status and transition stages between Kabupaten, Provinsi, and Ditjenbun.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the submission and rejection actions in Dinas Provinsi and Dinas Kabupaten show the `ApprovalConfirmationModal` modal first.
- **SC-002**: Confirmed actions execute successfully and transition states/routes according to the original logic.

## Assumptions

- The existing `ApprovalConfirmationModal` handles localization mapping correctly.
- Other roles (Ditjenbun, BPDP) already have this confirmation modal correctly integrated into their respective views.
