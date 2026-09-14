# Feature Specification: Fix RAB Display and Synchronization in Proposal Verification

**Feature Branch**: `058-fix-rab-verifikasi-proposal`
**Created**: 2026-08-31
**Status**: Draft
**Input**: User description: "please check the rab still doesn't show up in the StepVerifikasiPekebunDanDokumenProposal.vue"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatic Load and Sync of RAB Items in Verification View (Priority: P1)

As a Dinas Kabupaten verifier, when I open the proposal verification page (`StepVerifikasiPekebunDanDokumenProposal.vue`), I want the RAB table to automatically populate with the active proposal's RAB items, so that I can inspect the budget details, edit items if necessary, and proceed with generating and uploading the signed RAB document.

**Why this priority**: Without RAB items properly populated in `StepVerifikasiPekebunDanDokumenProposal.vue`, the verifier cannot review proposed budget items, Step 2 ("Generate & Unduh RAB") remains locked or downloads empty data, blocking proposal verification completion.

**Independent Test**:
1. Open any proposal verification detail page (`/dinas/verifikasi/kabupaten/:id`).
2. Verify that the RAB Proposal section and the RAB Kabupaten editable table (`RabTable.vue`) automatically display all RAB items attached to the proposal.
3. Confirm that switching proposals cleanly clears previous RAB items and loads the new proposal's RAB items without showing blank tables or leftover data.

**Acceptance Scenarios**:

1. **Given** a proposal containing RAB data in backend or store, **When** `StepVerifikasiPekebunDanDokumenProposal.vue` mounts or `pengajuan.value` resolves with loaded `rabItems`, **Then** `verifikasiStore.rabItems` is updated with a reactive copy of `pengajuan.value.rabItems`.
2. **Given** a proposal payload from the backend with RAB items under alternative keys (`rabs`, `rab_items`, `rabItems`, `rabs.items`, or `rab_proposals`), **When** `getProposalDetail()` processes the payload in `pengusulanStore`, **Then** all RAB items are normalized into the standardized `RabItem` structure with valid `uraian`, `jenis`, `volume`, `satuan`, `hargaSatuan`, and stage amounts (`jumlahTahap1` to `jumlahTahap4`).
3. **Given** a proposal with no pre-existing RAB items, **When** the verifier views the RAB section, **Then** an informative state is displayed with an explicit option to add new RAB items or sync from defaults.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `StepVerifikasiPekebunDanDokumenProposal.vue` MUST watch `pengajuan.value?.rabItems` and update `verifikasiStore.rabItems` whenever active proposal details are loaded or updated.
- **FR-002**: `pengusulanStore.getProposalDetail()` MUST normalize RAB payloads across all backend variations (`item.rabs`, `item.rab_items`, `item.rabItems`, `item.rab_proposals`) and support both direct item arrays and nested `{ items: [...] }` structures.
- **FR-003**: `verifikasiKabDraftStore` MUST ensure that `rabItems` state is explicitly scoped or reset per proposal ID to prevent cross-proposal draft contamination.
- **FR-004**: `RabTable.vue` MUST cleanly render items when `items` prop receives initialized RAB data, ensuring fallbacks for `jenis`, `uraian`, `satuan`, `hargaSatuan`, and subtotal calculations.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of proposals with existing RAB data render their RAB items in `StepVerifikasiPekebunDanDokumenProposal.vue` immediately upon page load without manual refresh.
- **SC-002**: Zero occurrences of empty RAB tables when proposal RAB data exists in backend responses.
- **SC-003**: 0% cross-contamination of RAB items when navigating between different proposal verification views.
