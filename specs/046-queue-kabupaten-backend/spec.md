# Feature Specification: Queue Kabupaten Backend Integration

**Feature Branch**: `046-queue-kabupaten-backend`

**Created**: 2026-08-27

**Status**: Draft

**Input**: User description: "i need the queueVerifikasiKabView to use the backend to get the data list. Check the PROPOSAL_API_CONTRACT.md in this case we would use the status \"SUBMITTED\""

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Submitted Proposals in Kabupaten Verification Queue (Priority: P1)

Dinas Kabupaten officer opens verification queue page and sees a list of submitted proposals fetched dynamically from the backend instead of static mock data.

**Why this priority**: Core requirement to replace mock data with live database records.

**Independent Test**: Mount view, inspect network log to confirm GET `/api/v1/proposals?status=SUBMITTED` is called. Confirm list matches backend database items with "SUBMITTED" status.

**Acceptance Scenarios**:

1. **Given** page is mounted, **When** API request is pending, **Then** show Skeleton Loader components matching the table geometry.
2. **Given** API request succeeds with data, **When** loading finishes, **Then** render rows with Nomor Proposal, Nama Kelembagaan, Paket Usulan, Total Anggaran, and Status "SUBMITTED".
3. **Given** API request returns no data, **When** loading finishes, **Then** render empty table state showing "Proposal tidak ditemukan".

---

### User Story 2 - Local Search and Filter (Priority: P2)

Dinas Kabupaten officer filters the queue results using search bar and paket usulan select input.

**Why this priority**: Helps manage lists when there are many proposals.

**Independent Test**: Type a keyword in search input, verify table updates instantly to match rows.

**Acceptance Scenarios**:

1. **Given** proposals are loaded, **When** user types "Maju" in search, **Then** display only rows where nomor proposal or nama kelembagaan contains "Maju".
2. **Given** proposals are loaded, **When** user filters by "Ekstensifikasi Kelapa", **Then** display only rows with Ekstensifikasi Kelapa.

---

### Edge Cases

- **API Request Failure**: If API request fails (e.g. 500 error or network offline), display a toast error notification using `useToast` (adhering to Principle XI and Principle IX) and show empty table placeholder.
- **Unauthorized / Session Expiry**: If API returns 401, Axios interceptor handles redirect or warning, page gracefully fails loading.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST fetch the proposal list from GET `/api/v1/proposals` on view mount.
- **FR-002**: The request query parameter `status` MUST be set to `"SUBMITTED"`.
- **FR-003**: The view MUST display a skeleton loading state (`Skeleton.vue`) while fetching data from the backend.
- **FR-004**: System MUST display an error toast notification if fetching fails and render an empty state.
- **FR-005**: All user-facing copy and error messages MUST be externalized into central localization configuration (Principle XV).

### Key Entities

- **Proposal**: Represents a submitted proposal with fields `id`, `nomor_proposal`, `kelembagaan_id`, `paket_sarpras`, `total_anggaran`, and `status`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User sees verification queue with real backend data in under 1 second under normal network.
- **SC-002**: Queue only contains proposals whose status is "SUBMITTED".
- **SC-003**: No blank screens or Cumulative Layout Shifts occur during load due to skeleton layout matching table row heights.

## Assumptions

- Backend endpoint GET `/api/v1/proposals?status=SUBMITTED` is fully operational and authenticated.
- Local filtering is sufficient for search and package filters on the kabupaten queue view for this version.
