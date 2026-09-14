# Feature Specification: Change StepDataCPCL Inputs

**Feature Branch**: `041-change-stepdatacpcl-inputs`

**Created**: 2026-08-25

**Status**: Draft

**Input**: User description: "i want to change the input in the StepDataCPCL from the current 1. Dokumen SK CPCL Ditandatangani and 2. Dokumen berita acara ditandatangani. To 1. Berita Acara Verifikasi Dokumen 2. Berita Acara Verifikasi Lapangan 3. Dokumen SK CPCL Ditandatangani"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Upload Three Verification Documents (Priority: P1)

As a Dinas Kabupaten verifier, when I am in the SK CPCL stage (Step 3) of verifying a proposal, I want to upload three separate documents:
1. `Berita Acara Verifikasi Dokumen`
2. `Berita Acara Verifikasi Lapangan`
3. `Dokumen SK CPCL Ditandatangani`
so that I can comply with the updated verification requirements.

**Why this priority**: Core requirement.

**Independent Test**: Navigate to the Dinas Kabupaten verification details page, go to Step 3, and confirm that there are exactly three document upload slots matching the requested names, each with preview and delete actions.

---

### User Story 2 - Verify Uploaded Documents in Summary Page (Priority: P2)

As a Dinas Kabupaten verifier, when I proceed to the final Summary & Submit page (Step 4), I want to see the status and filenames of all three uploaded documents (Berita Acara Verifikasi Dokumen, Berita Acara Verifikasi Lapangan, and SK CPCL) with preview triggers, ensuring they are all correct before sending.

**Why this priority**: Ensures correct data transmission and verification completeness.

**Independent Test**: Complete the uploads in Step 3, proceed to Step 4, and confirm all three documents are summarized correctly.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST display three distinct document upload sections in `StepDataCPCL.vue`:
  - 1. Berita Acara Verifikasi Dokumen (FileUpload ID: `baDokumenUpload`)
  - 2. Berita Acara Verifikasi Lapangan (FileUpload ID: `baLapanganUpload`)
  - 3. Dokumen SK CPCL Ditandatangani (FileUpload ID: `skCpclUpload`)
- **FR-002**: The draft store `useVerifikasiKabDraftStore` MUST store the three documents as:
  - `beritaAcaraDokumen` (type: `DokumenUpload | null`)
  - `beritaAcaraLapangan` (type: `DokumenUpload | null`)
  - `skCpcl` (type: `DokumenUpload | null`)
- **FR-003**: The final submission payload `VerifikasiKabSubmission` MUST include all three documents.
- **FR-004**: The summary view `StepSummaryDanSubmit.vue` MUST render preview blocks for all three files.
- **FR-005**: All user-facing text, labels, and placeholders MUST be externalized under `LOCALIZATION.stepDataCpcl` in `src/config/localization.ts`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The Step 3 form displays exactly three file upload areas.
- **SC-002**: All three files are successfully included in the mock submit payload to the Province.
