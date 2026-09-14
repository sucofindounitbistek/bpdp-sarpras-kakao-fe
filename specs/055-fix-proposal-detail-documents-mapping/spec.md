# Feature Specification: Fix Proposal Detail Documents Mapping in Stores & Verification Views

**Feature Branch**: `055-fix-proposal-detail-documents-mapping`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "why the document data doesn't show up in the DetailVerifikasiKabView.vue? It has previously worked. But I think it got messed up again when fixing the conflict in pengusulam store"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Restore Proposal Document Data Rendering in DetailVerifikasiKabView (Priority: P1)

As a Dinas Kabupaten verifier viewing proposal details in `DetailVerifikasiKabView.vue` and `StepVerifikasiPekebunDanDokumenProposal.vue`, I want uploaded proposal documents (Surat Permohonan, Legalitas Kelembagaan, Proposal Teknis, RAB) to load and render reliably, so that I can preview and verify each document.

**Why this priority**: Highest priority verification bug. Without document list rendering, verifiers cannot review or approve proposal documents.

**Independent Test**: Open any proposal in `DetailVerifikasiKabView.vue` (`/dinas/verifikasi/kabupaten/:id`), expand proposal documents section, verify that all uploaded documents display with filename, view button, and verification status.

**Acceptance Scenarios**:

1. **Given** a proposal fetched via `getProposalDetail(id)`, **When** `DetailVerifikasiKabView.vue` or `StepVerifikasiPekebunDanDokumenProposal.vue` mounts, **Then** `pengajuan.dokumen` and `pengajuan.documents` are fully populated in both `activePengajuan` and `listPengajuan`.
2. **Given** document type matching in `getDokumen(persyaratanId)`, **When** matching requirement IDs against backend document types, **Then** alias mapping matches canonical types (e.g. `SURAT_PERMOHONAN`, `DOKUMEN_LEGALITAS_KELEMBAGAAN`, `RAB_PROPOSAL`, `PROPOSAL_TEKNIS`) with requirement IDs.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `getProposalDetail` in `usePengusulanStore` MUST map backend `item.documents` to `dokumen` array on the returned `Proposal` object, `activePengajuan`, AND update the corresponding item in `listPengajuan`.
- **FR-002**: `getDokumen(persyaratanId)` in `StepVerifikasiPekebunDanDokumenProposal.vue` MUST check both `dokumen` and `documents` arrays and match using case-insensitive document type aliases.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of uploaded proposal documents display in `DetailVerifikasiKabView.vue`.
- **SC-002**: Zero broken document preview or missing file warnings for valid uploaded documents.
