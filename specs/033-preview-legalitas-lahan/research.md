# Research: Land Legal Document Preview in Proposal Submission (033-preview-legalitas-lahan)

## Problem Statement & Context
In Step 3 of Proposal Submission ("Pilih Pekebun & Lahan"), proposal submitters select Pekebun and their associated land records. Currently, viewing land legal documents (`scanLegalitasUrl`) uses a direct link anchor (`<a href="..." target="_blank">Lihat Dokumen</a>`). Users need an in-app document preview modal (`DocumentPreviewModal.vue`) to inspect land legal documents (SHM/Non-SHM scans) seamlessly without navigating away from the proposal form.

## Technical Decisions & Rationale

### 1. Document Preview Modal Integration
- **Decision**: Trigger `DocumentPreviewModal.vue` when clicking the "Pratinjau Legalitas" button on any land item in `StepPilihPekebunLahan.vue`.
- **Rationale**: `DocumentPreviewModal.vue` is already imported and available in `StepPilihPekebunLahan.vue` (used for document previews). Setting `previewDoc.value = { dataUrl: lahan.scanLegalitasUrl, mimeType: getMimeType(lahan.scanLegalitasUrl), title: `Dokumen Legalitas - ${lahan.jenisLegalitas} ${lahan.nomorLegalitas}` }` and `showDocPreview.value = true` provides a consistent preview UI with pan/zoom/download capabilities.

### 2. Helper for Document Type Detection
- **Decision**: Provide a light helper to determine mime type (`application/pdf` vs `image/png`/`image/jpeg`) based on file extension or URL string.
- **Rationale**: Ensures `DocumentPreviewModal` renders either the embedded PDF canvas/iframe or image viewer accurately.

### 3. Handling Unuploaded or Invalid Document Links
- **Decision**: If `scanLegalitasUrl` is empty, missing, or `#`, display a disabled button with badge "Belum Ada Dokumen" and prevent modal triggers.
- **Rationale**: Complies with User Story 2 & SC-003 (zero runtime crashes or broken preview modals).

### 4. Mandatory Wording Externalization
- **Decision**: Add `lahanPreview` keys into `LOCALIZATION` in `src/config/localization.ts`.
- **Rationale**: Complies with Constitution Principle XV.

## Alternatives Considered
- **Opening external browser tab (`window.open`)**: Rejected because it interrupts the user's flow in the multi-step proposal submission.
- **Embedded inline iframe in land card**: Rejected due to small viewport constraints on mobile and potential clutter.
