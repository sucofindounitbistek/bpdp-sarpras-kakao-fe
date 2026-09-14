# Feature Specification: Integrate Storage Area Notes into StepVerifikasiPekebunDanDokumenProposal

**Feature Branch**: `051-storage-area-notes`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "integrate the storage area notes to the frontend StepVerifikasiPekebunDanDokumenProposal.vue"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Capture and Display Verifier Storage Area Notes (Priority: P1)

As a Dinas Kabupaten verifier, I want to enter and view specific verification notes for the storage area (Gudang Serah Terima / Tempat Penyerahan) in `StepVerifikasiPekebunDanDokumenProposal.vue`, so that I can document reasons for approval, rejection, or required revisions regarding the storage facility.

**Why this priority**: Essential for verification completeness, allowing verifiers to communicate issues regarding warehouse location, capacity, or documentation directly within the proposal verification flow.

**Independent Test**: Log in as Dinas Kabupaten, navigate to a submitted proposal's verification step in `StepVerifikasiPekebunDanDokumenProposal.vue`, scroll to the "Informasi Gudang / Tempat Penyerahan" section, enter a note in the storage area notes input field, save/update verification status, and verify that the note is correctly displayed and persisted.

**Acceptance Scenarios**:

1. **Given** a proposal verification view in `StepVerifikasiPekebunDanDokumenProposal.vue`, **When** the verifier navigates to the Storage Area section, **Then** a dedicated verification note input field is available alongside the approval/rejection status controls.
2. **Given** an existing proposal with previously saved storage area verification notes, **When** the verifier opens the verification page, **Then** the existing note text is populated in the storage area notes field.
3. **Given** a verifier entering feedback into the storage area notes field, **When** the verification status is updated or draft saved, **Then** the note value is updated in the verification draft state store.

---

### User Story 2 - Propagate Storage Area Notes to Proposal Verification Summary (Priority: P2)

As a verifier or reviewer, I want the storage area verification notes to be included in the proposal verification summary and confirmation modals, so that review teams have full visibility into storage area evaluation comments.

**Why this priority**: Ensures verifier notes are visible across approval confirmation popups and summary reviews before final submission.

**Independent Test**: Open the verification approval modal or summary view after adding a storage area note, and confirm that the storage area note is rendered alongside other document notes.

**Acceptance Scenarios**:

1. **Given** a storage area verification note entered by the verifier, **When** reviewing the verification summary or opening the submit confirmation modal, **Then** the storage area note is displayed clearly in the summary list.

---

### Edge Cases

- **Empty / Null Notes**: If no note is provided by the verifier, the system must default to an empty string or standard fallback without throwing runtime errors.
- **Whitespace-Only Notes**: Entering space-only input must be trimmed gracefully.
- **Long Multiline Text**: Long notes with line breaks must render cleanly without clipping or breaking card boundaries.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `StepVerifikasiPekebunDanDokumenProposal.vue` component MUST render an editable verification note (`catatan`) field in the Storage Area (Gudang Serah Terima) verification block.
- **FR-002**: The system MUST integrate the storage area note state into `useVerifikasiKabDraftStore` state management.
- **FR-003**: The system MUST populate the storage area note field automatically when loading proposal verification data containing existing storage notes.
- **FR-004**: The system MUST include storage area notes when validating proposal submission readiness and compiling verification payloads.

### Key Entities

- **StorageAreaVerification (Verifikasi Gudang / Storage Area)**: Represents the verification evaluation for the storage area.
  - `status`: Verification decision (`APPROVED` / `REJECTED` / `PENDING`).
  - `catatan` / `notes`: Verifier feedback string describing notes or reasons for revision/rejection.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of storage area verification notes entered by verifiers are preserved when switching tabs or saving draft verification states.
- **SC-002**: Zero errors or unhandled exceptions thrown when rendering proposals with empty, missing, or long storage area verification notes.

## Assumptions

- The backend supports or accepts storage area verification notes within the proposal verification payload schema.
- Verification draft store (`useVerifikasiKabDraftStore`) handles reactive persistence for all verification step inputs.
