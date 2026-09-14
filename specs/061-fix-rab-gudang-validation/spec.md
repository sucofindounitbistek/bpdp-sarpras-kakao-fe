# Feature Specification: Fix RAB and Gudang Validation Display in Regency Verification

**Feature Branch**: `061-fix-rab-gudang-validation`

**Created**: 2026-09-01

**Status**: Draft

**Input**: User description: "the rab and gudang validation still doesn't show up in http://localhost:5173/dinas/verifikasi/kabupaten/22"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Display Gudang (Storage Area) Validation Section (Priority: P1)

As a Regency Dinas Verifier (Dinas Kabupaten), when reviewing proposal verification detail at `/dinas/verifikasi/kabupaten/:id` (such as proposal #22), I want the Gudang (Storage Area) validation section (containing warehouse address, coordinates, exterior photo, and interior photo controls) to automatically display whenever storage area data is present, so that I can inspect and validate the warehouse information.

**Why this priority**: Without the Gudang validation card visible, verifiers cannot review or approve/reject warehouse details required for fertilizer and physical goods package proposals.

**Independent Test**: Open proposal #22 (or any proposal containing storage area records) in the Regency Verification view, navigate to Step 1, and verify that the "Gudang (Tempat Penyerahan)" validation card displays with address, coordinate, and photo preview buttons.

**Acceptance Scenarios**:

1. **Given** a proposal payload containing storage area details (`storage_area` or `gudangSerahTerima`) or belonging to a goods/fertilizer package type, **When** the verifier opens `/dinas/verifikasi/kabupaten/:id`, **Then** the Gudang validation card renders cleanly with approval and rejection controls.
2. **Given** storage area photo fields (exterior / interior photos) present in the payload, **When** the verifier clicks the preview button ("Lihat"), **Then** the Document Preview Modal opens displaying the warehouse photo.

---

### User Story 2 - Display RAB Inspection & Regency RAB Table (Priority: P1)

As a Regency Dinas Verifier, when reviewing proposal verification detail, I want the RAB inspection section and RAB Kabupaten editing table to display automatically whenever RAB items or budget data exist, so that I can review proposed items, edit volume/unit prices, and generate the final Regency RAB document.

**Why this priority**: Verifiers must be able to review and adjust budget items for all proposal types without being blocked by optional document pre-requisite checks.

**Independent Test**: Open proposal #22 detail page, navigate to Step 1, and verify that the RAB inspection section, RAB Proposal items, and RAB Kabupaten editable table display and recalculate sub-totals dynamically upon editing.

**Acceptance Scenarios**:

1. **Given** a proposal with RAB items loaded in the payload or store, **When** the verifier views Step 1, **Then** the RAB inspection section and RAB Kabupaten table (`RabTable.vue`) display automatically.
2. **Given** a proposal with pre-existing RAB items, **When** the verifier edits volume or price fields in the RAB table, **Then** total calculations update reactively and persist to the draft store.

---

### Edge Cases

- **Package Wording Variations**: Package types might be delivered as `EKSTENSIFIKASI`, `INTENSIFIKASI`, `PUPUK`, `PEMELIHARAAN`, or custom strings; package matching MUST handle case-insensitive strings and fall back to checking if `storage_area` or `gudangSerahTerima` object properties exist.
- **Missing Photos**: If warehouse photo URLs are null or missing, display "Foto belum diunggah" gracefully without hiding the rest of the address/coordinate validation card.
- **Empty RAB Items**: If a proposal has zero RAB items initially, display an explicit empty state with options to add RAB items or initialize defaults.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST render the Gudang (Storage Area) validation section whenever `storage_area` or `gudangSerahTerima` data exists in the proposal payload or the proposal package involves warehouse delivery.
- **FR-002**: Package type checks for storage area validation MUST support flexible case-insensitive matching across package codes and package names (`EKSTENSIFIKASI`, `INTENSIFIKASI`, `PUPUK`, etc.).
- **FR-003**: The system MUST render the RAB inspection section and RAB Kabupaten table whenever RAB items exist or RAB verification is active in Step 1.
- **FR-004**: The system MUST automatically sync proposal RAB items (`pengajuan.rabItems`) into `verifikasiStore.rabItems` upon loading proposal detail.
- **FR-005**: The system MUST provide approval/rejection toggle buttons and rejection notes inputs for all displayed Gudang and RAB validation items.

### Key Entities *(include if feature involves data)*

- **StorageArea / GudangSerahTerima**: Warehouse entity containing `address` / `alamat`, `coordinate` / `koordinat`, `fotoTampakDepan`, `fotoTampakDalam`.
- **RabItem**: Budget line item entity containing `jenis`, `uraian`, `volume`, `satuan`, `hargaSatuan`, `subTotal`, and stage distribution fields.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of proposals with storage area data (including proposal #22) display the Gudang validation card in `/dinas/verifikasi/kabupaten/:id`.
- **SC-002**: 100% of proposals with RAB data display the RAB inspection section and editable RAB table in Step 1.
- **SC-003**: 0 console errors or UI layout breaks when rendering proposals with partial or missing storage area photo fields.

## Assumptions

- Proposal #22 represents a valid proposal in the system containing storage area and/or RAB data.
- Backend API returns storage area records under `storage_area` or `gudangSerahTerima`.
