# Feature Specification: Show RAB Document using RAB_RK

**Feature Branch**: `049-show-rab-document-rk`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "untuk menampilkan rab dokumen nya di StepVerifikasiPekebunDanDokumenProposal menggunakan dokumen RAB_RK"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Display and verify RAB_RK document under Pemeriksaan RAB (Priority: P1)

Dinas Kabupaten officer views the "Pemeriksaan RAB" section in Step 1, which now displays the `RAB_RK` (Rencana Kerja) document retrieved from the proposal's document list instead of `pengajuan.rabDitandatangani`.

**Why this priority**: Correctly aligns the verification UI with the standard proposal documents.

**Independent Test**: Load the verification page for a proposal with `RAB_RK` uploaded, verify the document details correspond to `RAB_RK` and can be previewed/approved.

**Acceptance Scenarios**:

1. **Given** a proposal has a document of type `RAB_RK`, **When** the officer views the verification details, **Then** the "Pemeriksaan RAB" section is displayed showing the `RAB_RK` file details.
2. **Given** the `RAB_RK` document is displayed, **When** the officer clicks "Lihat", **Then** the document preview modal opens showing the file.

---

### Edge Cases

- **RAB_RK Document Missing**: If the proposal has no document with type `RAB_RK`, the "Pemeriksaan RAB" section is not displayed (or displays a message that the document is missing).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST retrieve the RAB document from the proposal's document list (`dokumen` array) where `tipeDokumen` is `RAB_RK`.
- **FR-002**: System MUST display the retrieved `RAB_RK` document under the "Pemeriksaan RAB" section in `StepVerifikasiPekebunDanDokumenProposal.vue`.
- **FR-003**: System MUST bind the approval/rejection validation status of the RAB document to the `rabDocument` (or `RAB_RK`) verification key.
- **FR-004**: All user-facing strings must use localization standard (Principle XV).

### Key Entities

- **Proposal Document**: Document of type `RAB_RK` attached to the proposal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: "Pemeriksaan RAB" section correctly shows `RAB_RK` file name and file size.
- **SC-002**: Clicking preview renders the correct `RAB_RK` file URL.

## Assumptions

- Cooperative users upload the Rencana Kerja document with `tipeDokumen: "RAB_RK"`.
