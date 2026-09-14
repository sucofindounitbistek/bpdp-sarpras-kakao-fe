# Feature Specification: Create FINAL Flag RAB on Edit RAB at Dinas Kabupaten

**Feature Branch**: `061-kabupaten-edit-rab-final`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "i need the edit rab in the kabupaten to create a new rab in the proposal with the flag of FINAL. basically the same one when creating the proposal in http://localhost:5173/pengusulan/baru"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create FINAL RAB Revision at Dinas Kabupaten (Priority: P1)

As a Dinas Kabupaten verifier, when I edit the RAB during proposal verification, I want the edited RAB items to be submitted/created as a new RAB aggregate associated with the proposal marked with flag `FINAL`, preserving the original `PROPOSAL` RAB and establishing the finalized RAB for recommendation/approval.

**Why this priority**: Crucial for financial validation. The initial proposal RAB (`flag: 'PROPOSAL'`) must remain intact for audit comparison, while Kabupaten verifiers produce the official evaluated RAB (`flag: 'FINAL'`).

**Independent Test**: Navigate to Kabupaten proposal verification (`/dinas/verifikasi/kabupaten/:id`), edit RAB items in the verification step, click save/submit, and verify that the API request creates/saves a new RAB object with `flag: 'FINAL'` linked to the proposal.

**Acceptance Scenarios**:

1. **Given** a proposal under verification at Dinas Kabupaten tier, **When** the verifier modifies RAB line items and saves, **Then** a new RAB creation/update request is issued with `flag: 'FINAL'`.
2. **Given** a proposal with both `PROPOSAL` and `FINAL` RABs, **When** loaded in verification/approval views, **Then** the active evaluated budget displays data from the `FINAL` RAB while maintaining access to original proposal budget data.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Editing RAB items in Dinas Kabupaten verification (`StepVerifikasiPekebunDanDokumenProposal.vue` and `verifikasiKabDraft` store) MUST create or update a proposal RAB payload with `flag: 'FINAL'`.
- **FR-002**: RAB items structure created in Kabupaten MUST mirror the RAB item schema used during proposal creation (`uraian`, `volume`/`jumlahTotal`, `unit`/`satuan`, `price_per_unit`/`hargaSatuan`, `item_type`, stage distribution `details`).
- **FR-003**: Saving edited RAB at Kabupaten level MUST update total proposal budget based on the `FINAL` RAB total.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of RAB edits saved by Dinas Kabupaten create/update a RAB entity with `flag: 'FINAL'`.
- **SC-002**: Original proposal RAB (`flag: 'PROPOSAL'`) remains unmodified for audit trail integrity.
