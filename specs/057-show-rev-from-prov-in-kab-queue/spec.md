# Feature Specification: Show Proposals with REV_FROM_PROV Status in QueueVerifikasiKabView

**Feature Branch**: `057-show-rev-from-prov-in-kab-queue`

**Created**: 2026-08-31

**Status**: Draft

**Input**: User description: "I need the queueverifikasikabview to also show the proposal with status REV_FROM_PROV"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Display Proposals in REV_FROM_PROV Status in Dinas Kabupaten Queue (Priority: P1)

As a Dinas Kabupaten verifier, I want proposals returned from Dinas Provinsi with status `REV_FROM_PROV` to be displayed in my verification queue (`QueueVerifikasiKabView.vue`), so that I can review the provincial revision feedback and take appropriate re-verification action.

**Why this priority**: Crucial cross-tier workflow step. When Provinsi returns a proposal for revision at Kabupaten level, Kabupaten verifiers must see and access those proposals.

**Independent Test**: Navigate to Dinas Kabupaten verification queue (`/dinas/verifikasi`), verify that proposals with status `REV_FROM_PROV` appear in the table with a distinct "Revisi dari Provinsi" badge and warning styling.

**Acceptance Scenarios**:

1. **Given** a proposal in status `REV_FROM_PROV`, **When** `QueueVerifikasiKabView.vue` mounts and fetches proposals, **Then** the proposal is included in `filteredItems` and rendered in the table.
2. **Given** a proposal with status `REV_FROM_PROV` in the table, **When** rendering its status badge, **Then** `getBadgeVariant('REV_FROM_PROV')` returns `'warning'` badge styling.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: `QueueVerifikasiKabView.vue` MUST fetch proposals without restricting status parameter solely to `SUBMITTED`, ensuring proposals with status `REV_FROM_PROV` (and `KAB_SUBMITTED`, `REVISION_ADMIN`, `REV_FROM_KAB`) are loaded.
- **FR-002**: `QueueVerifikasiKabView.vue` MUST include `REV_FROM_PROV` in `getBadgeVariant()` return mapping with `warning` variant style.
- **FR-003**: Filtering by status in `QueueFilter.vue` MUST include `REV_FROM_PROV` option for Kabupaten verifiers.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of proposals in `REV_FROM_PROV` status appear in `QueueVerifikasiKabView.vue`.
- **SC-002**: Zero missing proposals when switching status filters.
