# Feature Specification: Active Sidebar & Aligned Breadcrumbs

**Feature Branch**: `011-sidebar-active-breadcrumbs`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "aktif sidebar tolong di perbaiki lagi ketika berada di sub sub menu, kemudian breadcrumb dibuat mengikuti judul sidebar juga dan lokasnya"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Maintain Active Highlight for Sub-Sub-Menus (Priority: P1)

As an application user navigating the portal, when I click on a sub-menu item (e.g., entering verification queue details or adding new data) which redirects me to a detailed view or form, the corresponding main sidebar menu item must remain highlighted/active.

**Why this priority**: Crucial for navigation clarity, ensuring users always know which main module or section they are currently working in.

**Independent Test**: Navigate to a nested sub-sub-menu or detail path (e.g., `/bpdp/ceki/1` or `/master-data/pekebun/tambah`) and verify that the corresponding parent sidebar menu remains active and styled as the active item.

**Acceptance Scenarios**:

1. **Given** I am on the BPDPKS queue page `/bpdp/antrean` (Sidebar: "Verifikasi Kelayakan" is active), **When** I click a proposal to verify and navigate to `/bpdp/ceki/1`, **Then** the sidebar item "Verifikasi Kelayakan" must remain styled as active.
2. **Given** I am on the Master Data Pekebun list page `/master-data/pekebun` (Sidebar: "Pekebun" is active), **When** I navigate to `/master-data/pekebun/tambah` to add a new pekebun, **Then** the sidebar item "Pekebun" must remain active.
3. **Given** I am on the Dinas Provinsi queue page `/dinas/verifikasi/provinsi`, **When** I navigate to the details page `/dinas/verifikasi/provinsi/1`, **Then** the sidebar item "Verifikasi & Rekomtek (Prov)" must remain active.

---

### User Story 2 - Breadcrumbs Aligning with Sidebar Titles and Hierarchy (Priority: P2)

As an application user, when I visit a page, the breadcrumbs visible at the top of the content area must match the corresponding sidebar labels and section titles, reflecting the correct hierarchy and path of the active feature.

**Why this priority**: Ensures visual consistency between the sidebar labels and the breadcrumb labels, avoiding confusion when names differ.

**Independent Test**: Inspect the breadcrumb component on pages and verify that the labels match the sidebar titles and correctly represent the hierarchy (e.g. Beranda > MASTER DATA > Pekebun > Tambah Pekebun).

**Acceptance Scenarios**:

1. **Given** I am on the Pekebun list page `/master-data/pekebun`, **Then** the breadcrumbs must display: `Beranda` (linking to `/dashboard`) > `Pekebun` (active, no link).
2. **Given** I am on the Pekebun creation page `/master-data/pekebun/tambah`, **Then** the breadcrumbs must display: `Beranda` > `Pekebun` (linking to `/master-data/pekebun`) > `Tambah Pekebun` (active).
3. **Given** I am on the Dinas Provinsi detail page `/dinas/verifikasi/provinsi/:id`, **Then** the breadcrumbs must display: `Beranda` > `Verifikasi & Rekomtek (Prov)` (linking to `/dinas/verifikasi/provinsi`) > `Detail Verifikasi Usulan` (active).

---

### Edge Cases

- **Accessing redirects**: When hitting a redirect path (e.g., `/dinas/verifikasi`), the redirection must land on the correct child path, and both sidebar active highlighting and breadcrumbs must correctly match the final destination route.
- **Dynamic titles in Breadcrumbs**: When viewing detail pages with dynamic data (e.g., proposals), the final breadcrumb item must have a clear, descriptive fallback (e.g., "Detail Verifikasi Usulan") if the dynamic ID data is loading.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The sidebar component MUST support matching sub-sub-menu pages to their parent menu items using an explicit mapping mechanism (e.g., using a Vue Router meta property `activeMenu` on routes, or prefix checking rules).
- **FR-002**: The router configuration MUST specify which parent sidebar menu should be active for detail pages, forms, and secondary screens.
- **FR-003**: The breadcrumbs in all views MUST be updated to match the exact wording of the corresponding sidebar item labels (e.g., "Pekebun", "Verifikasi & Rekomtek (Prov)", "Verifikasi Kelayakan").
- **FR-004**: The breadcrumb paths MUST follow the location hierarchy relative to the sidebar section or parent routes.

### Key Entities

- **Sidebar Configuration**: Defines the menu items, icons, and base paths.
- **Route Meta**: Object containing metadata for routes, specifically extending it to support defining the active sidebar menu (`activeMenu`) and custom breadcrumb titles if necessary.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of nested/sub-sub-menu routes (including detail pages and forms) retain active sidebar highlight of their logical parent menu item.
- **SC-002**: Breadcrumb labels on 100% of pages match the corresponding sidebar labels and section paths.
- **SC-003**: Navigation links in breadcrumbs are fully functional and redirect to the correct parents without dead ends.

## Assumptions

- The existing `Breadcrumb` component will be reused, but the items array passed to it from the views will be corrected/standardized.
- Vue Router's meta properties can be read inside the sidebar component to resolve custom active states.
