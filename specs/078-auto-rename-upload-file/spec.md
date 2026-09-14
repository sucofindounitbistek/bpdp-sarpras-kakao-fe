# Feature Specification: Standardized Auto-Rename for File Uploads

**Feature Branch**: `078-auto-rename-upload-file`

**Created**: 2026-09-09

**Status**: Draft

**Input**: User description: "Upload File All Role Format nama file perlu dibuat standar, dengan referensi: [Nama File]_[No Proposal]_[Nama Kelembagaan Pekebun] Auto Rename file disaat filenya di-upload pada aplikasi sarpras"

## Clarifications

### Session 2026-09-09
- Q: Bagian `[Nama File]` mengacu pada label kategori dokumen atau nama asli file pengguna? → A: Label/Tipe Dokumen Terstandar (misal `Proposal-Usulan`, `KTP`, `RAB-Usulan`, `SK-CPCL`, `BAST`).
- Q: Penamaan berkas saat tahap draf pengusulan baru (sebelum nomor proposal terbit)? → A: Menggunakan placeholder standar `DRAFT` (misal `[Nama-File]_DRAFT_[Nama-Kelembagaan].[ext]`).
- Q: Format baku Nomor Proposal yang digunakan sistem? → A: Mengikuti konvensi resmi sistem Sarpras: `SPKA{kode_penomoran}{MM}{YY}{sequence:04d}` (contoh: `SPKA109260001` untuk paket 1 Ekstensifikasi atau `SPKA209260001` untuk paket 2 Intensifikasi), yang sudah bersih alfanumerik tanpa karakter garis miring.
- Q: Standar pemisah kata di dalam setiap segmen? → A: Menggunakan tanda hubung (`-`) untuk spasi internal (misal `Koperasi-Tani-Makmur`), sedangkan garis bawah (`_`) khusus sebagai pemisah 3 segmen utama (`[Nama-File]_[No-Proposal]_[Nama-Kelembagaan]`).
- Q: Penanganan unggahan multi-berkas untuk kategori/slot yang sama? → A: Menggunakan Sub-Label spesifik dari form input (misal `Foto-Gudang-Depan`, `Foto-Gudang-Dalam`, `Legalitas-Lahan-Bidang-1`) sehingga nama berkas tetap deskriptif, unik, dan tidak bertabrakan.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Standardized Auto-Rename on Pemohon Document Upload (Priority: P1)

As a Pemohon (Kelembagaan Pekebun), when I upload required administrative documents, technical proposals, or revised documents (such as proposal summaries, farmer IDs, land certificates, or budget plans/RAB), the system automatically renames the uploaded file into the standard naming format: `[Nama File]_[No Proposal]_[Nama Kelembagaan Pekebun].[ext]` at the moment the file is selected and uploaded, ensuring that all uploaded documents have clear, uniform, and traceable names across the application.

**Why this priority**: Document naming chaos (such as raw names like `IMG_001.pdf`, `scan(1).jpg`, or arbitrary filenames) causes severe confusion during verification audits, archival searches, and document downloads across all approval tiers. Standardizing names at the point of upload provides immediate organization and traceability.

**Independent Test**: Can be fully tested by logging in as Pemohon, navigating to the proposal document upload form (or revision form), selecting a file with an arbitrary name (e.g., `my_scan.pdf`), and observing that the system instantly normalizes and displays the file name conforming to `[Nama File]_[No Proposal]_[Nama Kelembagaan Pekebun].[ext]` before and during the upload process.

**Acceptance Scenarios**:

1. **Given** a Pemohon is working on an active proposal with Nomor Proposal `SPKA109260001` and Kelembagaan Pekebun `Koperasi Tani Makmur`, **When** the Pemohon uploads a required document named `Proposal Usulan` using a local file `draft_final_v2.pdf`, **Then** the system automatically renames the file to `Proposal-Usulan_SPKA109260001_Koperasi-Tani-Makmur.pdf` upon selection/upload, displaying this standardized name in the upload preview card.
2. **Given** a Pemohon is revising rejected documents in an existing proposal, **When** the Pemohon re-uploads a replacement document for `RAB Usulan`, **Then** the replacement file is automatically renamed using the standard format with the proposal number and institution name, replacing the previous file reference.

---

### User Story 2 - Standardized Auto-Rename for Multi-Tier Verification Roles (Priority: P2)

As a Verifikator at Dinas Kabupaten, Dinas Provinsi, Ditjen Perkebunan, or BPDPKS, when I upload official endorsement documents, signed review sheets, signed budget plans, recommendation letters (Rekomtek), or formal decree letters (SK Dirut), the system automatically applies the standardized naming convention `[Nama File]_[No Proposal]_[Nama Kelembagaan Pekebun].[ext]` based on the document type, the proposal number under review, and the associated kelembagaan pekebun.

**Why this priority**: Verifiers handle hundreds of proposals across jurisdictions. Standardized naming for official signed review artifacts ensures that files exported, shared, or archived between government agencies remain unambiguously linked to the specific proposal and farmer institution.

**Independent Test**: Can be fully tested by accessing the verification workspace as a Dinas Verifier or BPDP Officer, uploading a signed recommendation or approval document for an active proposal, and verifying that the stored and displayed filename strictly adheres to the standard pattern.

**Acceptance Scenarios**:

1. **Given** a Dinas Kabupaten officer is completing proposal verification for proposal `SPKA209260001` belonging to `Gapoktan Sawit Subur`, **When** the officer uploads the signed budget plan (`RAB Ditandatangani`), **Then** the file is automatically renamed to `RAB-Ditandatangani_SPKA209260001_Gapoktan-Sawit-Subur.pdf`.
2. **Given** a Ditjenbun or BPDPKS user is uploading an official Rekomtek or SK Dirut file, **When** the file is uploaded to the proposal record, **Then** the resulting file name includes the standardized document type, proposal number, and kelembagaan name.

---

### User Story 3 - Standardized Auto-Rename for Penyaluran & BAST Uploads (Priority: P3)

As a Penyalur / Vendor or Administrative Officer, when I upload delivery order receipts, warehouse inspection photos, or Berita Acara Serah Terima (BAST) files in the distribution/disbursement module, the system automatically applies the standardized file naming convention reflecting the target proposal and farmer group.

**Why this priority**: Handover documentation and distribution proofs must be auditable by financial oversight bodies. Consistent naming guarantees that all delivery and settlement files can be audited without manual renaming.

**Independent Test**: Can be fully tested by navigating to the BAST reporting or distribution documentation page, uploading a handover proof document, and validating the standardized naming format.

**Acceptance Scenarios**:

1. **Given** an officer is uploading a BAST document for proposal `SPKA109260045` from `KUD Sawit Mandiri`, **When** the file is uploaded, **Then** the system automatically applies the standardized naming format `BAST_SPKA109260045_KUD-Sawit-Mandiri.pdf`.

---

### Edge Cases

- **Special Characters in Kelembagaan Name or Fallback Numbers**: While standard proposal numbers follow the clean `SPKA{kode}{MM}{YY}{seq}` alphanumeric format, kelembagaan names or legacy/custom proposal identifiers may contain spaces, quotes (`"`), commas, or punctuation. The system must automatically sanitize and convert incompatible characters to safe delimiters (hyphens `-` for internal segment words, and underscores `_` strictly between the three main segments) without breaking the naming structure.
- **Uploading Before Proposal Number is Issued (Draft Stage)**: When a Pemohon creates a new proposal from scratch (Step 1 - Step 3) before an official proposal number has been minted by the system, the system uses the standardized placeholder `DRAFT` for the proposal number segment (yielding `[Nama File]_DRAFT_[Nama Kelembagaan Pekebun].[ext]`). Once the proposal is officially submitted and the official proposal number is assigned, the proposal document records reference the finalized proposal number.
- **Definition of `[Nama File]`**: The `[Nama File]` segment strictly represents the predefined, standardized Document Category / Type label corresponding to the specific upload slot (e.g., `Proposal-Usulan`, `KTP`, `KK`, `Akta-Lembaga`, `RAB-Usulan`, `RAB-Kabupaten`, `SK-CPCL`, `Rekomtek`, `SK-Dirut`, `BAST`), entirely replacing raw or disorganized client filenames.
- **Multi-File Uploads in a Single Category**: For upload slots that allow multiple files (such as warehouse photos or multiple land legality documents), the system incorporates the specific input sub-label (e.g., `Foto-Gudang-Depan`, `Foto-Gudang-Dalam`, `Legalitas-Lahan-Bidang-1`) into the `[Nama File]` segment to prevent filename collisions.
- **Very Long Institution or Document Names**: When the combination of document name, proposal number, and farmer institution exceeds reasonable filesystem limits (e.g., over 150 characters), the system must cleanly truncate the variable name portion while preserving the proposal number and file extension intact.
- **File Extension Preservation**: Original file extension (e.g., `.pdf`, `.jpg`, `.png`, `.xlsx`) must always be retained in lowercase without duplication (e.g., avoiding `.pdf.pdf`).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST automatically rename every uploaded file across all roles to match the standardized format: `[Nama File]_[No Proposal]_[Nama Kelembagaan Pekebun].[extension]`.
- **FR-002**: The system MUST trigger the auto-rename operation at the moment the file is uploaded or selected, presenting the standardized filename immediately in the user interface upload preview card.
- **FR-003**: The system MUST sanitize all segments of the filename by removing or converting illegal filesystem characters (including `/`, `\`, `:`, `*`, `?`, `"`, `<`, `>`, `|`, and whitespace) into uniform hyphen (`-`) or underscore (`_`) separators.
- **FR-004**: The system MUST preserve the original file extension in lowercase format at the end of the standardized filename.
- **FR-005**: For document uploads where a proposal number has not yet been assigned (e.g., initial creation draft), the system MUST use the standardized `DRAFT` placeholder in place of the proposal number, yielding `[Nama File]_DRAFT_[Nama Kelembagaan Pekebun].[extension]`.
- **FR-006**: The system MUST derive `[Nama File]` from the predefined, standardized Document Type / Category label corresponding to each document upload slot (e.g., `Proposal-Usulan`, `KTP`, `KK`, `Akta-Lembaga`, `RAB-Usulan`, `RAB-Kabupaten`, `SK-CPCL`, `Rekomtek`, `SK-Dirut`, `BAST`), formatted cleanly without spaces or special characters.
- **FR-007**: The system MUST derive `[Nama Kelembagaan Pekebun]` dynamically from the active proposal context or user profile organization.
- **FR-008**: The system MUST enforce a safe character limit (maximum 180 characters) by safely truncating excessively long names while keeping the proposal number and file extension intact.
- **FR-009**: The system MUST ensure that file downloads by any reviewer, verifier, or auditor serve the file with the standardized filename.
- **FR-010**: For upload categories with multiple distinct files (such as warehouse photos or multi-parcel land documents), the system MUST incorporate the specific input sub-label into the `[Nama File]` segment (e.g., `Foto-Gudang-Depan`, `Foto-Gudang-Dalam`, `Legalitas-Lahan-Bidang-1`) to ensure clear differentiation and eliminate naming collisions.

### Key Entities *(include if feature involves data)*

- **Standardized File Upload**: Represents an uploaded document file possessing original metadata, sanitized standardized filename, target storage key, MIME type, file size, and upload timestamp.
- **Proposal Reference Context**: Represents the business proposal context providing the official proposal number, submission status, and associated kelembagaan pekebun identifier.
- **Kelembagaan Pekebun Context**: Represents the farmer institution (Poktan, Gapoktan, or Koperasi) that owns or is referenced by the active proposal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of files uploaded through any application upload interface strictly adhere to the standardized naming pattern.
- **SC-002**: Zero file upload failures or storage errors caused by illegal filesystem characters (slashes, colons, spaces) in proposal numbers or institution names.
- **SC-003**: Users across all roles see the standardized filename reflected in the UI within 200 milliseconds of selecting a file.
- **SC-004**: 100% of downloaded files retain their standardized name when saved to local storage by reviewers or auditors.

## Assumptions

- Users upload valid permitted file types (PDF, PNG, JPG/JPEG) within existing size limits (up to 5MB - 10MB as defined per document type).
- The active proposal context (Nomor Proposal and Nama Kelembagaan) is available or retrievable in all views where proposal-related file uploads take place.
- If an upload occurs completely outside any proposal context (e.g., independent Master Data Pekebun management), a fallback naming pattern substituting the proposal number with a contextual identifier (e.g., NIK or farmer ID) will be applied.
