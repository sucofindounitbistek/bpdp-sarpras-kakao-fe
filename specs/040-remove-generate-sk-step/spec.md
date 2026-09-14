# Feature Specification: Remove Generate SK Step

**Feature Branch**: `040-remove-generate-sk-step`

**Created**: 2026-08-25

**Status**: Draft

**Input**: User description: "i want the generate SK step to be removed from the finalisasiSkDirutView"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Direct SK Finalization (Priority: P1)

As a BPDP Verifikator, when I visit the Finalisasi SK Dirut view for an usulan, I want to immediately see the Nomor SK input, file upload field, and draft download link, so that I can finalize the SK without having to click a "Generate" button first.

**Why this priority**: Core request of the user to simplify the SK publication workflow.

**Independent Test**: Navigate to the Finalisasi SK Dirut view for any eligible usulan. Verify that the "Generate Rancangan SK Dirut" step is not rendered, and that all inputs (Nomor SK, upload file, and download draft) are visible immediately.

**Acceptance Scenarios**:

1. **Given** the usulan is ready for SK publication, **When** the page loads, **Then** the finalization fields are displayed directly with the draft download link populated.
2. **Given** the usulan is already finalized (status: `SELESAI`), **When** the page loads, **Then** the success view showing the terbit SK details is rendered as usual.

---

### Edge Cases

- **Missing Draf URL**: If the backend does not return a draft URL in the `skDirut` payload, the frontend must fall back to a default mock draft URL (e.g. `/files/draft-sk-{id}.pdf`) to ensure the download button is always functional.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST remove the "1. Generate Rancangan SK Dirut" section and the "Generate Draf SK Dirut" button from `FinalisasiSkDirutView.vue`.
- **FR-002**: The system MUST initialize a default `draftUrl` for the `skDirut` object of the active usulan on load if it is missing.
- **FR-003**: The system MUST show the "Unduh Draf", "Nomor Keputusan", and "Unggah SK Dirut Signed" form sections immediately on mount.
- **FR-004**: All user-facing strings must remain compliant with the localization system (Principle XV).

### Key Entities *(include if feature involves data)*

- **Usulan**:
  - `skDirut`: Object containing `draftUrl`, `nomorSk`, `signedUrl`, and `uploadedAt`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: BPDP Verifikator can complete the SK publication flow in 1 less click/step.
- **SC-002**: No "Generate SK" button remains anywhere in `FinalisasiSkDirutView.vue`.

## Assumptions

- **Mock Data Integration**: The mock draft PDF URL behaves like a static file download for demonstration purposes, matching the project's existing PDF download mocks.
