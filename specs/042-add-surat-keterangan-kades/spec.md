# Feature Specification: Add Surat Keterangan Kepala Desa as Proposal Persyaratan

**Feature Branch**: `042-add-surat-keterangan-kades`

**Created**: 2026-08-25

**Status**: Draft

**Input**: User correction: "works well but i want the surat keterangan kades input to be inside the proposal, alongside the other persyaratan dokumens. The surat keterangan kades field will be in all the paket"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cooperative/Koordinator Uploads Surat Keterangan Kades during Proposal Submission (Priority: P1)

As a Koordinator, while creating a proposal, in the selection of package details (Step 2 - Pemilihan Paket & Unggah Dokumen), I want to see and upload the "Surat Keterangan Kepala Desa" document alongside other package document requirements, so that it is submitted as part of the proposal.

**Why this priority**: Core document collection requirement for proposal submission.

**Independent Test**: Navigate to proposal creation wizard -> Step 2 (Pemilihan Paket). Verify "Surat Keterangan Kepala Desa" is listed as a mandatory requirement for the selected package. Upload a PDF document and complete the proposal submission.

---

### User Story 2 - Verifier Reviews Surat Keterangan Kades alongside other Proposal Documents (Priority: P1)

As a Verifikator, during proposal document verification (Step 1 - Verifikasi Pekebun & Dokumen), I want to review the uploaded "Surat Keterangan Kepala Desa" alongside the other proposal document requirements, so that I can approve or reject it.

**Why this priority**: Required validation step in the verification process.

**Independent Test**: Navigate to the Verifikasi queue, click an usulan. In Step 1 (Verifikasi Pekebun & Dokumen), verify "Surat Keterangan Kepala Desa" is listed in the proposal documents checklist. Click "Verifikasi" to preview and verify the document.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Revert/Remove `suratKeteranganKades` and `SURAT_KET_KADES` from Pekebun profile data model, upload step (`StepUploadDokumenPekebun.vue`, `FormPekebunView.vue`), store (`pekebun.ts`), and verification side-by-side checks (`VerifikasiPekebunDetailView.vue`).
- **FR-002**: Add `'SURAT_KET_KADES'` to the `tipeDokumen` union type in `DokumenPersyaratan` in `src/types/pengusulan.ts`.
- **FR-003**: Define `SURAT_KET_KADES` requirements object in `src/lib/pengusulan-persyaratan.config.ts` and add it to the `COMMON` array so that it is included in all packages (paket).
- **FR-004**: Add mock `SURAT_KET_KADES` documents to the `dokumen` array of mock proposal objects in `src/stores/rekomtek.ts` and `src/stores/pengusulan.ts`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: "Surat Keterangan Kepala Desa" is correctly listed and uploadable during proposal creation for all packages.
- **SC-002**: Verifikator can view, preview, and set verification status for "Surat Keterangan Kepala Desa" alongside other proposal requirements.
