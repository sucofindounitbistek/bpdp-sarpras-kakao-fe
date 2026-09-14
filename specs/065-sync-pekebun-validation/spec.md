# Feature Specification: Sync Pekebun Document Validation Status

**Feature Branch**: `065-sync-pekebun-validation`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "properly synchronize the pekebun validation in the http://localhost:5173/dinas/verifikasi/kabupaten/22. Because it still says belum diverifikasi even though we already have the data"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Accurately Display Existing Pekebun Validation Status (Priority: P1)

As a Kabupaten Verifier viewing the proposal verification page (`/dinas/verifikasi/kabupaten/:id`), I want the Pekebun verification section to correctly reflect existing validation records fetched from the backend so that documents already marked as verified do not incorrectly display "Belum Diverifikasi" (Unverified).

**Why this priority**: Displaying incorrect "Belum Diverifikasi" status when backend validation data exists confuses verifiers and blocks proposal verification workflows.

**Independent Test**: Load `/dinas/verifikasi/kabupaten/22` with existing farmer validation payload and verify that status badges show "Sudah Diverifikasi" / "Valid" with corresponding detail checks matching backend data.

**Acceptance Scenarios**:

1. **Given** farmer document validation records exist for a proposal (`pengajuan_id`), **When** the verifier navigates to the verification detail page, **Then** the UI populates the validation state from backend data and displays the accurate verification status instead of defaulting to "Belum Diverifikasi".
2. **Given** specific detail fields (e.g. `namaLengkap`, `nik`, `nomorKK`) have validation records, **When** viewing the Pekebun verification form, **Then** individual field validation checkboxes and overall document validity match `is_valid` values from backend data.

---

### User Story 2 - Real-time Synchronization on Updates (Priority: P2)

As a Kabupaten Verifier, I want any newly submitted or updated Pekebun validation state to synchronize seamlessly with the view so that UI state remains consistent across step transitions and reloads.

**Why this priority**: Ensures data consistency without requiring manual browser hard refreshes after saving verification results.

**Independent Test**: Submit a validation change for a farmer document and verify that the UI status updates immediately and stays synchronized upon re-fetching.

**Acceptance Scenarios**:

1. **Given** a verifier updates a farmer document's validity status, **When** submission succeeds, **Then** the UI reflects the saved status and keeps state in sync with backend records.

---

### Edge Cases

- What happens when backend returns an empty validation array for a newly created proposal? UI should correctly show default unverified state ("Belum Diverifikasi").
- How does system handle partial field validation details (some fields validated, others pending)? UI should reflect exact field-level state without forcing overall false positive or negative status.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST fetch existing farmer document validation records (`validasi_dokumen_pekebun`) for the current proposal ID (`pengajuan_id`).
- **FR-002**: System MUST map fetched validation records (`is_valid`, `notes`, `validated_at`, and field details) to the corresponding Pekebun UI components.
- **FR-003**: System MUST NOT display "Belum Diverifikasi" status badge when valid backend validation records exist for the targeted farmer document.
- **FR-004**: System MUST synchronize field-level validation indicators (such as NIK, Nama Lengkap, Nomor KK checks) with `details` array in backend response.
- **FR-005**: System MUST maintain state consistency when navigating between verification tabs or steps.

### Key Entities

- **Pekebun Document Validation**: Represents validation record for a farmer's document containing `id`, `dokumen_pekebun_id`, `pengajuan_id`, `is_valid`, `notes`, `validated_at`, and field-level validation `details`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of farmer document validation items with existing backend records correctly show verified status upon page load.
- **SC-002**: Zero false "Belum Diverifikasi" status badges displayed when backend returns non-empty validation data.
- **SC-003**: Verification page status rendering latency remains under 300ms after backend response is received.

## Assumptions

- Backend API provides valid validation payload with `pengajuan_id`, `dokumen_pekebun_id`, `is_valid`, and optional `details` array.
- Authentication and route authorization for Dinas Kabupaten verifier role are already established.
