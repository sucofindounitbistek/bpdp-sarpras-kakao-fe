# Feature Specification: Fix RAB Items Synchronization and Display in Verification Views

**Feature Branch**: `056-fix-rab-items-sync-and-display`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "sekarang kenapa rab nya tidak muncul?"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sync RAB Items to Verifikasi Store and Display in Verification Table (Priority: P1)

As a Dinas Kabupaten verifier, I want the RAB table in `StepVerifikasiPekebunDanDokumenProposal.vue` to reliably populate with RAB items from the active proposal, so that I can inspect budget details and perform RAB verification.

**Why this priority**: Core verification step. Verifiers must review RAB items before generating SK CPCL or approving proposals.

**Independent Test**: Open any proposal verification page (`/dinas/verifikasi/kabupaten/:id`), navigate to RAB section, and verify that all RAB items (uraian, volume, satuan, harga satuan, subtotal) populate cleanly in `RabTable.vue`.

**Acceptance Scenarios**:

1. **Given** a proposal with RAB items loaded from backend or store, **When** `StepVerifikasiPekebunDanDokumenProposal.vue` mounts or `pengajuan.value` resolves, **Then** `verifikasiStore.rabItems` is updated with proposal `rabItems`.
2. **Given** `getProposalDetail()` in `src/stores/pengusulan.ts`, **When** parsing RAB items from backend, **Then** fallback logic checks `item.rabs`, `item.rab_items`, and `item.rabItems`, mapping `price_per_unit`, `unit`, `uraian`, and stage details (`jumlahTahap1` to `jumlahTahap4`).

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `StepVerifikasiPekebunDanDokumenProposal.vue` MUST sync `verifikasiStore.rabItems` whenever `pengajuan.value?.rabItems` is populated, overriding stale draft items from previous proposals.
- **FR-002**: `getProposalDetail()` in `src/stores/pengusulan.ts` MUST map RAB items from all backend payload representations (`item.rabs`, `item.rab_items`, `item.rabItems`).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of proposal RAB items display accurately in `RabTable.vue` upon opening proposal detail.
- **SC-002**: Zero stale RAB items remaining from previously opened proposals.
