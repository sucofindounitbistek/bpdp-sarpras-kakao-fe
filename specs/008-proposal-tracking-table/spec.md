# Feature Specification: Proposal Tracking Table & Detail View

**Feature Branch**: `008-proposal-tracking-table`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "buatkan pada halaman pengusulan/pengajuan-proposal dibuat list table dulu nantinya ada detailnya seperti halaman sekarang"

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Viewing Proposals in a Table List (Priority: P1)

As a Lembaga Pekebun user, when I visit the tracking page, I want to see a clean, compact table list of all my submitted proposals instead of full-sized cards, so that I can quickly scan their statuses, registration dates, and basic info.

**Why this priority**: High priority because the primary request is to display a table of proposals.

**Independent Test**: Visit the proposal tracking page `/pengusulan/pengajuan-proposal`. Verify that it renders a table containing all proposals, and search/filter components correctly filter the rows.

**Acceptance Scenarios**:

1. **Given** the user has submitted proposals, **When** they load the tracking page, **Then** they see a table with columns: Nomor Resi, Kelembagaan Pekebun, Paket Usulan, Total Anggaran, Status Saat Ini, and Aksi.
2. **Given** the table list view, **When** the user applies search text or selects filters (Status or Paket), **Then** only matching proposals are displayed in the table.

---

### User Story 2 - Accessing Proposal Detail View (Priority: P1)

As a Lembaga Pekebun user, I want to click on a "Detail" action in the table to view the complete details of that proposal (CPCL list, attachments, and the workflow timeline) in the exact layout as the previous version, so that I can see full tracking details.

**Why this priority**: High priority because users must be able to view details and monitor detailed workflow progress of specific proposals.

**Independent Test**: Click "Detail" on a row and verify that the view switches to the detailed proposal card. Verify that the "Kembali ke Daftar" button returns the user to the list table.

**Acceptance Scenarios**:

1. **Given** the user is viewing the proposal table, **When** they click "Lihat Detail" on a proposal row, **Then** the view transitions to show the detailed layout (CPCL list, attachments, budget, and workflow timeline) for that specific proposal.
2. **Given** the user is viewing a proposal's details, **When** they click the "Kembali ke Daftar" button, **Then** the view returns to the proposal table list.

---

### User Story 3 - Compact Mobile View (Priority: P2)

As a mobile user, I want the proposal list table to adapt nicely on small screen viewports (375px) without horizontal overflow or clipped content, following the project's mobile-first responsive standard.

**Why this priority**: Medium priority, required for mobile responsiveness and design compliance.

**Independent Test**: Resize screen to 375px and verify that the table has responsive scroll wraps or a card list fallback, and interactive targets are at least 44x44px.

**Acceptance Scenarios**:

1. **Given** a mobile screen size, **When** viewing the proposal table, **Then** the table is housed in an overflow-x-auto container preventing screen breaking, or uses responsive styles to fit correctly.

---

### Edge Cases

- **No Proposals Found**: When there are no proposals matching the search query/filters, or if the user has never created a proposal, the table should be hidden and replaced with an empty state placeholder ("Tidak ada proposal ditemukan") with a button to "Buat Proposal Baru".
- **Dynamic Status Styling**: If a proposal is in a "Revision" state, the status badge must clearly highlight this (using red/danger theme) to prompt immediate action.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST render a data table listing all proposals of the logged-in Lembaga Pekebun on the `/pengusulan/pengajuan-proposal` route.
- **FR-002**: The table MUST have columns: Nomor Resi, Kelembagaan Pekebun, Paket Usulan, Total Anggaran, Status Saat Ini, and Aksi.
- **FR-003**: The table rows MUST be searchable using the existing search input text field (matching Nomor Resi, Lembaga Name, Paket Usulan, or Details).
- **FR-004**: The table rows MUST be filterable by Status and Paket Sarpras using the existing dropdown controls.
- **FR-005**: System MUST support toggling between the list table view and the detailed proposal view.
- **FR-006**: The detailed view MUST contain all detailed components of the selected proposal: CPCL Pekebun count, documents checklist, total budget estimation, and the 5-step workflow timeline.
- **FR-007**: The detailed view MUST have a prominent "Kembali ke Daftar" button aligned with the header.

### Key Entities

- **Proposal**:
  - `id`: string (unique identifier)
  - `nomorResi`: string (receipt number)
  - `lembaga`: object (contains `namaLembaga`)
  - `jenisSarpras`: string (type of package)
  - `totalAnggaranPengajuan`: number (proposed budget)
  - `currentStatus`: string (current workflow status)
  - `daftarCPCL`: array (list of CPCL farmers)
  - `dokumen`: array (uploaded files checklist)

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can load the proposal list table and search/filter for a proposal in under 1 second.
- **SC-002**: Users can toggle between the table list and the detailed view in one click.
- **SC-003**: 100% of the columns in the list table fit within standard desktop screens without layout clipping.

## Assumptions

- **In-place state toggle**: An in-place state (`selectedProposalId` or similar) in `TrackingPengusulanView.vue` is used to toggle between the list table and the detail view. This is chosen for simplicity (YAGNI) instead of introducing new router paths.
- **Data Persistence**: The existing Pinia store `usePengusulanStore` stores all proposal list data locally, meaning no extra backend API changes are needed for the demo mockup.
- **Forest Green Brand Theme**: The primary color `#066C2A` is consistently used for buttons, borders, and main elements in both list and detail views.
