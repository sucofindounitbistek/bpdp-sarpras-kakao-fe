# Feature Specification: fix-back-button-and-filters

**Feature Branch**: `026-fix-back-button-and-filters`

**Created**: 2026-08-07

**Status**: Draft

**Input**: User description: "button kembali pastikan bisa berfungsi ya karena ketika back kenapa isinya menghilang semua ya ini di step2 ya. Semua filter jangan ada yang duplicate tolong di cek kembali karena filter isinya masih aneh"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dinas Kabupaten "Kembali" Button Fix (Priority: P1)

As a Dinas Kabupaten verifier on the SK CPCL step (Step 2 in wizard / Step ID 3), I want to be able to click the "Kembali" button and return successfully to Step 1 (Verifikasi Pekebun & Dokumen) instead of the page going completely blank.

**Why this priority**: High priority as it is a blocking UI bug that breaks user navigation inside the verification wizard.

**Independent Test**:
Can be tested by navigating to Dinas Kabupaten verification page, proceeding to the SK CPCL step (Step 2 in UI), clicking the "Kembali" button, and confirming the UI returns to the "Verifikasi Pekebun & Dokumen" step without going blank.

**Acceptance Scenarios**:
1. **Given** a Dinas Kabupaten verifier is on the SK CPCL step (Step ID 3), **When** they click the "Kembali" button, **Then** the wizard step is set to 1.
2. **Given** the step changes to 1, **Then** the "Verifikasi Pekebun & Dokumen" step content is rendered correctly and the layout is preserved.

---

### User Story 2 - Deduplicated and Functioning Status Filters (Priority: P1)

As any user browsing the list of proposals (Dinas Kabupaten, Dinas Provinsi, Pemohon, Ditjenbun, BPDP), I want to see unique status choices in the status filter dropdown, and selecting a status option should correctly show all items representing that status.

**Why this priority**: Essential for filter usability and accuracy. Duplicate choices ("Verifikasi Dinas Kab/Kota" and "Selesai" showing multiple times) confuse users.

**Independent Test**:
Can be tested by opening the queue list pages (Dinas Kabupaten, Dinas Provinsi, Pemohon tracking, Ditjenbun Rekomtek, and BPDP Rekomtek) and verifying that:
1. The status filter dropdown contains no duplicate status options by display label.
2. Selecting a status label filters the list to include all items having any status code that maps to that label.

**Acceptance Scenarios**:
1. **Given** a user is on a queue/tracking page, **When** they open the status filter dropdown, **Then** every option label in the list MUST be unique.
2. **Given** a user selects a status label like "Verifikasi Dinas Kab/Kota", **Then** the list is filtered to display all items whose current status maps to that label (e.g. `SUBMITTED`, `VERIFIED_ADMIN`, and `VERIFIED_FIELD`).
3. **Given** a user selects a status label like "Selesai", **Then** the list displays all items whose status maps to that label (e.g. `PKS_BPDP_SIGNED`, `DISBURSED`, and `COMPLETED`).

---

### User Story 3 - Role-Specific Statuses for Ditjenbun and BPDP (Priority: P2)

As a Ditjenbun or BPDP verifier, I want to see status filter options that are relevant to my role and process, rather than unrelated Dinas/Pemohon statuses.

**Why this priority**: Improves filter relevance and prevents empty/broken search results.

**Independent Test**:
Can be tested by logging in as Ditjenbun or BPDP and checking the status filter dropdown in the Rekomtek queue page to ensure it contains only the statuses relevant to that role's workflow.

**Acceptance Scenarios**:
1. **Given** a Ditjenbun verifier is on the Antrean Rekomtek page, **When** they view the status dropdown, **Then** they see only Ditjenbun-relevant statuses (e.g. "Perlu Verifikasi Ditjenbun", "Perbaikan Dinas Kab", "Perbaikan Dinas Prov", "Menunggu Approval Ditjenbun").
2. **Given** a BPDP verifier is on the Antrean BPDP page, **When** they view the status dropdown, **Then** they see only BPDP-relevant statuses (e.g. "Perlu Verifikasi BPDP", "Menunggu Approval Kadiv", "Penerbitan SK Dirut", "Selesai (SK Terbit)").

---

### Edge Cases

- **Filter Reset**: Clicking the "Reset Filter" button MUST reset all filters (search query, status, and jenis sarpras) back to empty values, showing the full unfiltered list.
- **Role Switching**: If a user switches roles, the list and filter dropdown options must refresh to match the new role's context and status definitions.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: In `src/views/dinas/kabupaten/StepDataCPCL.vue`, clicking the "Kembali" button MUST set `verifikasiStore.currentStep = 1`.
- **FR-002**: The `QueueFilter.vue` component MUST support an optional `statusOptions` prop. If provided, it MUST render these options in the status select dropdown.
- **FR-003**: If `statusOptions` is not provided to `QueueFilter.vue`, it MUST compute default status options from `LOCALIZATION.proposalStatus`, automatically deduplicating them so each unique label only appears once.
- **FR-004**: The status filters in `QueueVerifikasiKabView.vue` and `QueueVerifikasiProvinsiView.vue` MUST compare status labels instead of raw keys to ensure items under different status codes that map to the same label are correctly displayed when that label is selected.
- **FR-005**: In `TrackingPengusulanView.vue`, the `statusOptions` array MUST be computed and deduplicated by display label, and the matching logic MUST verify label equality.
- **FR-006**: In `AntreanRekomtekView.vue` and `AntreanBpdpView.vue`, the status options passed to `QueueFilter.vue` MUST be specific to their respective roles' workflows (Ditjenbun and BPDP).

### Key Entities *(include if feature involves data)*

- **Pengajuan (Proposal)**: Represents the main submission with a `currentStatus` field of type `PengajuanStatus` or `UsulanStatus`.
- **QueueFilter**: The UI component managing the inputs and selects for filtering queue records.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero duplicate labels exist in the status filter dropdowns in Dinas Kabupaten, Dinas Provinsi, Tracking Pengusulan, Ditjenbun, and BPDP views.
- **SC-002**: The back button on Dinas Kabupaten's Step 2 (SK CPCL) successfully returns to Step 1 without any white-screen or missing content.
- **SC-003**: 100% of proposals with status codes mapping to the selected filter label are displayed when filtered.

## Assumptions

- The `LOCALIZATION` file holds the correct mappings for all statuses.
- The step progression and state values in the stores align with the Vue routing and wizard configs.
