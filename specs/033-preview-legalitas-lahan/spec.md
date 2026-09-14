# Feature Specification: Land Legal Document Preview in Proposal Submission (Preview Dokumen Legalitas Lahan)

**Feature Branch**: `033-preview-legalitas-lahan`

**Created**: 2026-08-14

**Status**: Draft

**Input**: User description: "Pengajuan Proposal (Step 3 Pilih Pekebun & Lahan) Pekebun Preview Dokumen Legalitas Lahan pada tiap lahan pekebun"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Preview Land Legal Document in Step 3 Proposal (Priority: P1)

As a proposal submitter (Pemohon/Kelompok Tani), when selecting Pekebun and their land items in Step 3 of Proposal Submission ("Pilih Pekebun & Lahan"), I want to preview the uploaded land legal document (Scan Sertifikat SHM/Non-SHM) for each land record directly within the view/expanded drawer, so that I can verify the legal document is correct before submitting the proposal.

**Why this priority**: Core usability requirement — users need to confirm that attached land legal documents are legible and accurate during Pekebun & Lahan selection.

**Independent Test**: Can be tested independently by navigating to `/pengusulan/baru` (or editing a proposal draft), reaching Step 3 ("Pilih Pekebun & Lahan"), expanding a Pekebun's land details, clicking the "Pratinjau Legalitas" button, and confirming the document preview modal displays the correct file.

**Acceptance Scenarios**:

1. **Given** a proposal submitter is on Step 3 ("Pilih Pekebun & Lahan") with one or more Pekebun selected, **When** they view or expand the land details card for a Pekebun, **Then** a "Pratinjau Legalitas" / "Preview Dokumen" action button is clearly visible alongside the land document metadata (Jenis & Nomor Legalitas).
2. **Given** a land record with an attached legal document (`scanLegalitasUrl`), **When** the submitter clicks the "Pratinjau Legalitas" button, **Then** a modal opens rendering the document preview (PDF/Image viewer via `DocumentPreviewModal`).
3. **Given** the preview modal is open, **When** the submitter clicks the close button or overlay, **Then** the modal closes smoothly and returns focus to the Step 3 land selection interface.

---

### User Story 2 - Handle Missing or Unuploaded Legal Documents (Priority: P2)

As a proposal submitter, if a land entry has no attached legal document, the preview button should be disabled or display clear fallback wording, so that I know the document is missing.

**Why this priority**: Edge case protection preventing broken preview modals when document URLs are missing or invalid (`#` or empty).

**Independent Test**: Test with a draft land entry having no uploaded document URL, and verify the preview button is disabled or shows "Belum Ada Dokumen".

**Acceptance Scenarios**:

1. **Given** a land record where `scanLegalitasUrl` is empty or invalid (`#`), **When** the submitter views the land item card in Step 3, **Then** the preview button is disabled or displays a "Dokumen Belum Diunggah" badge/text.

---

### Edge Cases

- **Invalid File Type / Load Error**: What happens if the legal document URL points to an unsupported or corrupted file format? The modal should display a fallback download link and an error message ("Dokumen tidak dapat ditampilkan secara langsung. Klik di sini untuk mengunduh.").
- **Multiple Land Records (Multi-Lahan)**: How does the preview behave when a Pekebun has multiple land parcels? Each parcel in the list has its own dedicated "Pratinjau Legalitas" button corresponding to that specific land's legal file.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a "Pratinjau Legalitas" (Preview Legalitas) button for each land parcel listed under Pekebun entries in Step 3 ("Pilih Pekebun & Lahan").
- **FR-002**: System MUST open a responsive document preview modal (`DocumentPreviewModal.vue`) when the user clicks "Pratinjau Legalitas".
- **FR-003**: System MUST support previewing PDF files, PNG/JPG images, and provide a direct download fallback for other document formats.
- **FR-004**: System MUST disable the preview button or display a clear indicator if the land record has no uploaded legal document.
- **FR-005**: All UI wording, modal titles, and button labels MUST be externalized into `src/config/localization.ts`.

### Key Entities *(include if feature involves data)*

- **LahanPekebun**: Land entity containing attributes `jenisLegalitas`, `nomorLegalitas`, `scanLegalitasUrl`.
- **DocumentPreviewModal State**: Transient UI modal state containing `dataUrl`, `mimeType`, and `title`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Proposal submitters can preview any land legal document in less than 2 clicks from Step 3 ("Pilih Pekebun & Lahan").
- **SC-002**: 100% of valid PDF and image land legal documents render correctly inside the preview modal.
- **SC-003**: Zero JS runtime crashes or unhandled exceptions when previewing missing/invalid document URLs.

## Assumptions

- Step 3 ("Pilih Pekebun & Lahan") uses existing `LahanPekebun` data structures from `usePekebunStore`.
- The application has an established `DocumentPreviewModal.vue` component in `src/components/ui/DocumentPreviewModal.vue` which supports `dataUrl`, `mimeType`, and `title` props.
