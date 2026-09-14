# Feature Specification: Adjust Gudang Storage Area API Response Alignment

**Feature Branch**: `050-adjust-gudang-storage-area`

**Created**: 2026-08-28

**Status**: Draft

**Input**: User description: "in the StepVerifikasiPekebunDanDokumenProposal the response for the gudangSerahTerima in the backend is storage_area, please adjust it"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and Verify Storage Area Documents (Priority: P1)

As a Dinas Kabupaten/Provinsi verifier, I want to see the uploaded warehouse/storage area photos (tampak depan/tampak dalam) and validation statuses in the verification step, so that I can approve or reject them based on actual files.

**Why this priority**: Highly critical as verifiers cannot proceed with validation if they cannot view the uploaded warehouse photos or if the system wrongly reports "Foto belum diunggah".

**Independent Test**: Log in as Dinas Kabupaten, open a submitted proposal verification page, navigate to the verification tab, scroll to the "Informasi Gudang / Tempat Penyerahan" section, verify that the Tampak Depan and Tampak Dalam documents are shown with the correct file name and preview button, and the verifier can approve/reject them.

**Acceptance Scenarios**:

1. **Given** a proposal with a warehouse object containing exterior and interior photo file URLs, **When** the verifier views the verification step, **Then** they should see the file metadata and a "Lihat" button to preview the photos.
2. **Given** a proposal with empty or null photo fields in the warehouse object, **When** the verifier views the verification step, **Then** they should see "Foto belum diunggah".

---

### User Story 2 - Verify Storage Area Details on Summary and Preview Modals (Priority: P2)

As a user or verifier, I want to view the storage area details correctly mapped on proposal summary views and preview modals.

**Why this priority**: Ensures consistency across different summary views/modals in the app.

**Independent Test**: Open a proposal preview modal, confirm that the address, coordinate, and photos display correctly.

**Acceptance Scenarios**:

1. **Given** a proposal with warehouse data in the API payload, **When** previewing the proposal, **Then** the warehouse address and coordinate are correctly shown.

---

### Edge Cases

- **Missing/null photo IDs/URLs**: If the photo file URL is null, the frontend must gracefully display "Foto belum diunggah" and not crash.
- **Malformed coordinates or address**: If coordinate is empty/null, it should fall back to a dash (`-`).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST map the backend warehouse data structure properties (address, coordinate, exterior photo URL, interior photo URL) to the frontend warehouse fields (alamat, koordinat, fotoTampakDepan, fotoTampakDalam).
- **FR-002**: For exterior and interior photo URLs, the system MUST construct valid document upload objects containing the filename and type so they can be previewed.
- **FR-003**: The verifier user interfaces MUST display the mapped warehouse data consistently.
- **FR-004**: The proposal preview modal and summary screen MUST successfully read properties from the aligned warehouse model.

### Key Entities

- **StorageArea (gudangSerahTerima)**: Represents the warehouse/storage area location and files.
  - `alamat`/`address`: String representing the street address of the warehouse.
  - `koordinat`/`coordinate`: String representing the geographic latitude and longitude.
  - `fotoTampakDepan`: File object representing the exterior photo of the warehouse.
  - `fotoTampakDalam`: File object representing the interior photo of the warehouse.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of proposals with uploaded storage area photos show correct filenames and preview options in the verification screens.
- **SC-002**: Zero errors are thrown when rendering proposals with empty/missing storage area records or photos.

## Assumptions

- The backend response will always return the storage area data inside the `storage_area` property of the proposal object.
- The files referenced in the photo URLs can be previewed directly via HTTP URL.
