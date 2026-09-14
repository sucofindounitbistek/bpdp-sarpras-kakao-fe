# Feature Specification: Proposal Document Validation in StepVerifikasiPekebunDanDokumenProposal

**Feature Branch**: `052-proposal-document-validation`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "i also need to integrate the proposal document validation to the StepVerifikasiPekebunDanDokumenProposal.vue"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enforce Mandatory Proposal Document Upload & Verification Gate (Priority: P1)

As a Dinas Kabupaten verifier, I want the system to validate that all mandatory proposal documents (`wajib = true`) are uploaded and approved before proceeding to Step 3 (SK CPCL), so that unverified or incomplete proposal packages cannot pass verification.

**Why this priority**: Highly critical for legal and regulatory compliance. Submitting a proposal to SK CPCL generation without mandatory legal/institutional documents introduces compliance risks.

**Independent Test**: Log in as Dinas Kabupaten, open a proposal with missing mandatory documents or unverified documents, click "Simpan & Lanjut ke SK CPCL", and confirm that the system blocks navigation and displays clear toast feedback listing the unfulfilled mandatory documents.

**Acceptance Scenarios**:

1. **Given** a proposal where a mandatory document (`wajib = true`) is missing ("Belum diunggah"), **When** the verifier clicks "Simpan & Lanjut ke SK CPCL", **Then** system blocks navigation and displays an error toast stating which mandatory document is missing.
2. **Given** a proposal where a mandatory document is uploaded but still in `PENDING` verification status, **When** the verifier clicks "Simpan & Lanjut ke SK CPCL", **Then** system blocks navigation and prompts the verifier to verify the document first.
3. **Given** all mandatory documents are uploaded and marked `APPROVED`, **When** the verifier clicks "Simpan & Lanjut ke SK CPCL", **Then** system successfully advances to Step 3 (`verifikasiStore.currentStep = 3`).

---

### User Story 2 - Mandatory Rejection Notes Validation for Proposal Documents (Priority: P2)

As a verifier, I want to be forced to enter explicit rejection notes whenever I reject any proposal document, so that applicants receive clear actionable feedback for required revisions.

**Why this priority**: Ensures applicants know exactly why a document was rejected and what needs correction during revision.

**Independent Test**: Mark any proposal document as "Tolak" in the document verification modal (`DokVerifModal`) or inline table, clear the rejection notes input, click return for revision, and confirm system prevents submission until notes are provided.

**Acceptance Scenarios**:

1. **Given** one or more proposal documents marked `REJECTED` with empty notes, **When** the verifier attempts to submit rejection, **Then** system displays a validation warning toast and highlights the missing note requirement.

---

### Edge Cases

- **Optional Documents**: Documents with `wajib = false` that are not uploaded must not block step progression if no rejection is active.
- **RAB Signed Upload**: If `RAB_RK` is present, the signed RAB upload (`rabDitandatangani`) in Step 4 must be validated if required for final submission.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The `validateAndProceed()` function in `StepVerifikasiPekebunDanDokumenProposal.vue` MUST check that all mandatory proposal documents (`p.wajib = true`) for the selected package are uploaded and marked `APPROVED`.
- **FR-002**: If any mandatory document is missing or not approved, `validateAndProceed()` MUST block navigation and show a toast error identifying the unfulfilled document(s).
- **FR-003**: The system MUST validate that all uploaded proposal documents have an explicit verification decision (`APPROVED` or `REJECTED`) before allowing progression.
- **FR-004**: The system MUST enforce non-empty rejection notes (`notes.trim()`) for every rejected proposal document before submitting revision status (`PengajuanStatus.REVISION_ADMIN`).

### Key Entities

- **ProposalDocumentValidation**:
  - `persyaratanId`: Identifier of the proposal requirement.
  - `wajib`: Boolean indicating mandatory requirement status.
  - `status`: Verification decision (`APPROVED` / `REJECTED` / `PENDING`).
  - `notes`: Verifier note string explaining rejection rationale.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of proposals proceeding to Step 3 have all mandatory documents uploaded and approved.
- **SC-002**: Zero unhandled runtime errors when validating incomplete or fully approved proposal documents.

## Assumptions

- `currentPersyaratan` contains complete requirements configuration for the active proposal package (`PAKET_PERSYARATAN_CONFIG`).
- `getVerification(id)` reliably returns current verification status and notes.
