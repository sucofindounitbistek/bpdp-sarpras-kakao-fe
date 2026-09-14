# Feature Specification: Multi-Lahan Pekebun (Form Wizard Step 3)

**Feature Branch**: `009-multi-lahan-pekebun`

**Created**: 2026-08-04

**Status**: Draft

**Input**: User description: "Tahap 3: Data Lahan Pekebun ini bisa lebih dari 1 pengisiannya. bisakah /ui-ux-pro-max dan /frontend-design memberikan inovasi sekiranya seperti apa yang paling compact untuk dibuat uxnya agar bisa mengisi lebih dari 1 data lahan pekebun. halaman ini ada di role pekebun di master data pekebun"

---

## UX Design Innovation (UI/UX Pro Max & Frontend Design)

Instead of stacking multiple huge forms vertically (which causes extreme vertical scroll and layout clutter), we propose a **"List-First Accordion Grid with Segmented Tabs"** layout:

### ASCII Wireframe Layout

```text
+--------------------------------------------------------------+
| [Breadcrumbs] Beranda > Master Data Pekebun > Tambah Pekebun  |
+--------------------------------------------------------------+
| WIZARD STEPS: 1. Identitas  2. Dokumen  [3. Data Lahan]      |
+--------------------------------------------------------------+
| DAFTAR LAHAN PEKEBUN                                         |
|                                                              |
| Lahan 1: SHM - 12345/2024 (2.5 Ha) - Desa Harapan    [Edit] [Delete]
| Lahan 2: STDB - 98765/2025 (1.8 Ha) - Desa Makmur    [Edit] [Delete]
|                                                              |
| [ + Tambah Lahan Baru ]                                      |
+--------------------------------------------------------------+
| [EXPANDED LAHAN DRAWER] (Hanya 1 yang terbuka untuk edit)    |
|                                                              |
|  +--------------------------------------------------------+  |
|  | [ Tab: Legalitas ]  [ Tab: Alamat & File ]  [ Tab: Peta ] |  |
|  +--------------------------------------------------------+  |
|  | Tab Content area (Compact Input Grid / Map Leaflet)    |  |
|  +--------------------------------------------------------+  |
|  | [Simpan Lahan] [Batal]                                  |  |
+--------------------------------------------------------------+
```

### Visual Styling Details (Forest Green Theme `#066C2A`)
1. **Summary Cards**: Rendered as a grid of minimalist border cards (`border-slate-200` in light theme, `border-slate-800` in dark theme) using simple typography. If a card has validation errors, it exhibits a subtle left border highlight in `border-red-500` and displays a small warning badge.
2. **Interactive Toggles**: Expanding/collapsing panels are animated with a smooth vertical transition (`transition-all duration-200 ease-in-out`).
3. **Internal Segmented Tabs**: The heavy input fields (Legalitas, Address, Leaflet Map) are split into three tabs. This divides form workload so the Leaflet map is only initialized and rendered when the user explicitly clicks the "Poligon & Peta" tab.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Viewing Land Summaries (Priority: P1)

As a Pekebun, when I visit Step 3 of the registration form, I want to see a clean, compact list of all my registered land records, so that I can review my total acreage and verification status at a glance.

**Why this priority**: High priority because users need to see their active list of lands.

**Independent Test**: Load Step 3. Verify that a list of existing land cards is shown with columns/rows for legal type, acreage, location, and edit/delete actions.

**Acceptance Scenarios**:
1. **Given** the user is on Step 3 and has previously added 2 lands, **When** the page loads, **Then** they see 2 summary cards showing legal details and acreage, and a button to add a new land.
2. **Given** the land list, **When** no lands are registered, **Then** an empty state banner is displayed with a call-to-action button to "+ Tambah Lahan Baru".

---

### User Story 2 - Add/Edit Land in In-Line Accordion (Priority: P1)

As a Pekebun, I want to add a new land or edit an existing one inside an inline accordion panel, so that I can fill out details without reloading the page or causing vertical screen bloat.

**Why this priority**: High priority. This is the primary method to input multiple land records.

**Independent Test**: Click "Tambah Lahan Baru" or "Edit" on a land. Verify that the form expands smoothly and only one land's form is open at any time.

**Acceptance Scenarios**:
1. **Given** the land list, **When** the user clicks "+ Tambah Lahan Baru", **Then** a new form panel expands below, and any previously open land form collapses.
2. **Given** an open land form, **When** the user clicks "Simpan Lahan", **Then** the form collapses and its card representation in the list is updated with the new details.

---

### User Story 3 - Map Coordinates Tab (Priority: P2)

As a Pekebun, I want to edit my land's map polygon coordinates on an interactive map located inside the land's form tab, so that mapping tools do not clutter the form when I am filling out text fields.

**Why this priority**: Medium priority. Necessary for boundary registration but is secondary to text input.

**Independent Test**: Expand a land form, click the "Poligon & Peta" tab, and verify that the Leaflet map initializes, renders the current polygon, and coordinate rows can be reordered/added.

**Acceptance Scenarios**:
1. **Given** a land form, **When** the user clicks the "Poligon & Peta" tab, **Then** the Leaflet map container is instantiated and displays the coordinates.
2. **Given** the map is active, **When** coordinates are changed in the table, **Then** the polygon outline on the Leaflet map updates reactively.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST support adding multiple land records in Step 3 of the Pekebun form wizard.
- **FR-002**: System MUST render a list of added lands showing key info: Nomor Legalitas, Luas Lahan (Ha), Lokasi, and validation state.
- **FR-003**: System MUST support expanding exactly ONE land form accordion panel at a time for adding or editing.
- **FR-004**: Each land form panel MUST include a Leaflet map and polygon coordinate input table, which are initialized and bound to that specific land's coordinate data.
- **FR-005**: System MUST validate each land record's schema (using the Zod schema) and coordinate polygon structure on submission.
- **FR-006**: System MUST update the wizard data structure (in Pinia store) to store an array of `LahanFormData` under the active Pekebun draft.

### Key Entities

- **PekebunDraft**:
  - `identitas`: IdentitasFormData
  - `dokumen`: DokumenFormData
  - `lahanList`: LahanFormData[] (extended from single `lahanData`)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can toggle open/close any land panel in under 100ms.
- **SC-002**: Page height remains under 900px on desktop regardless of the number of lands added, due to collapsed summaries.
- **SC-003**: 100% of validation errors on nested land records are displayed directly on the corresponding land card.

## Assumptions

- **Multiple Lands Schema**: The frontend store will be adapted to support `lahanList: LahanFormData[]` instead of a single `lahanData` object.
- **Mock Data Compatibility**: Existing mock data for Pekebun list will be adapted to handle multiple lands or fallback to a single-element list.
