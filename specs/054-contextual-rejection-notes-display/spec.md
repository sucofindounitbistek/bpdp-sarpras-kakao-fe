# Feature Specification: Contextual Rejection Notes Display across Pekebun and Proposal Pages

**Feature Branch**: `054-contextual-rejection-notes-display`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "from the validations in the verifikasi kabupaten, can we show it according to where the validations are rejected. For example if the dokumen pekebun, or pekebun lahan is rejected can we show it in the pekebun page? and also if the proposal document is rejected we need to show it in the proposal"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Display Pekebun & Lahan Rejection Feedback on Pekebun Views (Priority: P1)

As an applicant (Pemohon) or reviewer viewing Pekebun details, I want rejected Pekebun documents (KTP, KK, Swafoto, Surat Kuasa) and Lahan documents (Surat Lahan) to display contextual rejection badges and verifier notes directly on the Pekebun page/tab, so that I can immediately identify which specific farmer files require revision.

**Why this priority**: Highly critical for applicant user experience. Placing farmer rejection feedback directly next to farmer data eliminates guesswork during proposal revision.

**Independent Test**: Navigate to a proposal in `REVISION_ADMIN` status with rejected Pekebun documents, open the Pekebun tab / list / detail view, and verify that rejected items show a prominent "Revisi Required" badge with the exact verifier note.

**Acceptance Scenarios**:

1. **Given** a proposal in revision status with a rejected Pekebun document, **When** viewing the Pekebun list or detail view, **Then** a contextual warning alert/badge displays the rejection reason next to the affected document.
2. **Given** a rejected Lahan document or boundary coordinate, **When** viewing the Pekebun Lahan section, **Then** the verifier's rejection feedback note is rendered within the Lahan card.

---

### User Story 2 - Display Proposal Document Rejection Feedback on Proposal Document Views (Priority: P2)

As an applicant (Pemohon) or reviewer, I want rejected proposal-level documents (Surat Permohonan, Proposal Teknis, Gudang Serah Terima, RAB) to display contextual rejection banners and notes directly within the Proposal Documents page/tab, so that proposal-level revision items are isolated from farmer-level items.

**Why this priority**: Isolates proposal document revision feedback from farmer-level feedback, keeping revision workflows organized and clear.

**Independent Test**: Navigate to a proposal in `REVISION_ADMIN` status with rejected proposal documents or storage area items, open the Proposal Documents section/tab, and verify that rejected proposal files show warning banners containing the verifier's feedback notes.

**Acceptance Scenarios**:

1. **Given** a rejected proposal document (e.g. Surat Permohonan or Proposal Teknis), **When** the user views the Proposal Document tab/section, **Then** a rejection feedback alert is rendered directly on that document's row/card.
2. **Given** a rejected storage area item (alamat, koordinat, foto), **When** viewing the Storage Area / Gudang section, **Then** the rejection note is displayed next to the storage item.

---

### Edge Cases

- **Proposals in Non-Revision Status**: Proposals in `SUBMITTED`, `VERIFIED_ADMIN`, or `COMPLETED` statuses must hide revision alerts or show static historical status without edit controls.
- **Multiple Rejections on Single Item**: If an item has both general and item-specific notes, both notes must be concatenated cleanly without text truncation.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST categorize verifier rejection notes into Pekebun-level notes (KTP, KK, Swafoto, Surat Kuasa, Surat Lahan) and Proposal-level notes (Proposal Documents, Gudang, RAB).
- **FR-002**: The Pekebun views (`PekebunListView.vue`, `VerifikasiPekebunDetailView.vue`, `StepDataCPCL.vue`, `PratinjauPekebunDanDokumenTab.vue`) MUST render contextual rejection alert banners for farmer items matching rejected keys.
- **FR-003**: The Proposal Document views (`StepUploadDokumen.vue`, `TrackingPengusulanDetailView.vue`, `PratinjauPekebunDanDokumenProposal.vue`) MUST render contextual rejection alert banners for proposal document items matching rejected keys.
- **FR-004**: Storage Area (Gudang) and RAB document sections MUST render specific verifier notes directly in their respective section cards when marked rejected.

### Key Entities

- **ContextualRejectionNote**:
  - `targetType`: Entity type (`PEKEBUN_DOC` / `LAHAN_DOC` / `PROPOSAL_DOC` / `GUDANG` / `RAB`).
  - `targetId`: Associated entity or document ID.
  - `label`: Human-readable document/item title.
  - `notes`: Verifier feedback comment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of rejected Pekebun document notes appear on the Pekebun page/tab.
- **SC-002**: 100% of rejected Proposal document notes appear on the Proposal page/tab.
- **SC-003**: Zero layout overflow or unhandled exceptions when rendering multiline rejection comments.

## Assumptions

- Rejection notes are preserved in `useVerifikasiKabDraftStore` and proposal status `catatanDinas`.
- Component views read active proposal status and verification notes state reactively.
