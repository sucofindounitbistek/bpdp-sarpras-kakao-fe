# Feature Specification: Skeleton Loading Coverage

**Feature Branch**: `012-skeleton-loading-coverage`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "tolong dong ada banyak halaman yang belum melakukan skeleton loading karena takut dianggap ngelag dan seagala macem, tolong dicek ke semua halaman mana aja yang belum dan tolong implementasikan"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add skeleton loading to Dinas Kabupaten/Kota Views (Priority: P1)

As a Dinas Kabupaten/Kota user, when I open the verification queue or detailed verification forms, I want to see a skeleton layout placeholder instead of an empty screen so that I know the system is active and loading data.

**Why this priority**: High value for regional users who might experience varying latency. A loading placeholder improves perceived performance.

**Independent Test**: Can be tested by opening the Dinas Kabupaten/Kota queue and verification detail page and observing the placeholder animation before the actual data renders.

**Acceptance Scenarios**:

1. **Given** the Dinas Kabupaten/Kota queue page is loading data, **When** the page initializes, **Then** a list skeleton placeholder is displayed.
2. **Given** a Dinas Kabupaten/Kota detail verification page is loading data, **When** the page initializes, **Then** a wizard-like card skeleton placeholder is displayed.
3. **Given** data loading is completed, **When** the payload is hydrated, **Then** the skeleton loader fades out and the real content is fully displayed.

---

### User Story 2 - Add skeleton loading to Dinas Provinsi Views (Priority: P1)

As a Dinas Provinsi user, when I navigate to the provincial queue or verification detail view, I want to see custom skeleton loading grids matching the layout so that the user interface feels responsive.

**Why this priority**: Same critical business flow as regional kabupaten verification.

**Independent Test**: Can be tested by opening the provincial queue and detail verification pages with network throttling.

**Acceptance Scenarios**:

1. **Given** the Dinas Provinsi queue page is loading data, **When** the page initializes, **Then** a table skeleton is displayed.
2. **Given** the Dinas Provinsi detail verification page is loading data, **When** the page initializes, **Then** card and checklist skeletons are displayed.

---

### User Story 3 - Add skeleton loading to Ditjenbun Process Views (Priority: P1)

As a Ditjenbun (Pusat) user, when I access the list of proposals, plenary session configurations, SK publisher, or target verification screens, I want the system to render skeletons matching those lists and forms.

**Why this priority**: Ditjenbun handles large volume lists and document generation, where processing delays are common.

**Independent Test**: Verify that plenary list view, SK publisher screen, and verification forms render appropriate skeleton blocks when loading.

**Acceptance Scenarios**:

1. **Given** the plenary list or SK publisher view is fetching data, **When** the page loads, **Then** layout-specific skeleton placeholders are displayed.

---

### User Story 4 - Add skeleton loading to BPDPKS Admin & Partner Views (Priority: P2)

As a BPDPKS Administrator or partner user, when accessing the user list, partner agreement page, or BAST reporting module, I want the pages to show skeletons during state updates.

**Why this priority**: Improves administrative tracking flows.

**Independent Test**: Verify user management table, Penyaluran PKS page, and BAST form loading states.

**Acceptance Scenarios**:

1. **Given** the user management list is updating, **When** the page re-hydrates, **Then** table-row skeletons are displayed.

---

### User Story 5 - Add skeleton loading to Pemohon/Pengusul Views (Priority: P2)

As a farmer representative or regional applicant, when creating a new proposal, loading active proposal lists, or updating proposal draft steps, I want clear skeleton indicators.

**Why this priority**: Improves end-user satisfaction and prevents double-form submission mistakes due to perceived lag.

**Independent Test**: Verify the tracking proposal list and step-by-step proposal drafts show appropriate layouts during load.

**Acceptance Scenarios**:

1. **Given** tracking list is loading, **When** the view opens, **Then** search-filter and table-row skeletons are displayed.

---

### Edge Cases

- **Slow Connections**: What happens if the data takes longer than 10 seconds to load? The skeleton loading placeholder must remain visible, and if it fails/timeouts, it should gracefully switch to showing an error state rather than an infinite loading state.
- **Empty States**: If the backend returns no data (empty array), the system must switch from the skeleton load placeholder to a clear "No Data Found" empty-state layout, rather than keeping the skeleton or rendering empty tables.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render skeleton loading placeholders during initial page loading, data re-fetching, or step transitions.
- **FR-002**: Skeletons MUST match the structural layout of the respective targets (e.g. lists must use block rows, detail views must use layout boxes).
- **FR-003**: The skeleton loader MUST automatically transition to the real page content once data hydration completes successfully.
- **FR-004**: If data loading fails, the system MUST transition to an error/retry placeholder instead of showing an infinite skeleton loading animation.
- **FR-005**: All forms and lists that fetch data asynchronously MUST implement a loading state flag to toggle skeleton visibility.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the active views in the application MUST use skeleton loading placeholders during data fetching.
- **SC-002**: The transition from skeleton loading states to active content states MUST be smooth and take place within 100ms after data resolution.
- **SC-003**: Users must see immediate visual feedback (the placeholder skeleton screen) in less than 150ms upon navigating to any view.

## Assumptions

- **A-001**: Centralized UI component for skeleton loaders is available and reusable across all view layouts.
- **A-002**: The state stores provide synchronous status flags or loading properties to indicate asynchronous fetch progress.
