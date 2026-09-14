# Feature Specification: Edit Data Pekebun

**Feature Branch**: `043-edit-pekebun-data`

**Created**: 2026-08-25

**Status**: Draft

**Input**: User description: "Tambah fitur edit data pekebun"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Registered Pekebun from List Actions (Priority: P1)

As a Koordinator, in the Pekebun list page, I want to see an Edit button on registered (non-draft) pekebun rows, so that I can modify their details.

**Why this priority**: Core entry point for editing registered pekebun records.

**Independent Test**: Navigate to Master Data Pekebun -> locate a registered pekebun row -> click Edit icon -> verify FormPekebunView opens with prepopulated details -> edit name -> click "Simpan Pekebun" -> verify name is updated.

**Acceptance Scenarios**:

1. **Given** a registered pekebun row in the Pekebun list, **When** I click the Edit button, **Then** I should be navigated to the edit form populated with that pekebun's data.
2. **Given** I am in the edit form for a registered pekebun, **When** I complete updates and click "Simpan Pekebun", **Then** the updates should be saved and I should be redirected back to the list page with a success toast.

---

### User Story 2 - Edit Registered Pekebun from Detail Modal (Priority: P2)

As a Koordinator, while viewing a registered pekebun's detailed modal popup, I want to click an "Edit Data" button inside the footer, so that I can directly transition to editing the data.

**Why this priority**: Convenience pathway for editing while reviewing detail page.

**Independent Test**: Open Detail modal -> click "Edit Data" button -> verify modal closes and redirects to Edit page.

**Acceptance Scenarios**:

1. **Given** the Detail Pekebun Modal is open, **When** I click the Edit Data button, **Then** the modal should close and I should be navigated to the edit form.

---

### Edge Cases

- **Double-saving**: System should disable the save buttons while the edit submission request is in progress to prevent double submissions.
- **Hiding draft option**: Since the pekebun is already registered, the "Simpan Draft" button must be hidden to prevent downgrading registered status.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Add an edit route `/master-data/pekebun/edit/:id` that points to `FormPekebunView.vue`.
- **FR-002**: Show a green edit button next to the view detail button in the Master Data list table for all non-draft pekebuns.
- **FR-003**: Populate the edit form fields, uploaded documents, and lahan items when opening route `/master-data/pekebun/edit/:id`.
- **FR-004**: Hide the "Simpan Draft" button in the form wizard footer when editing a registered pekebun.

### Key Entities

- **Pekebun**: Represents a registered farmer with identity details, documents list, and associated lands.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: User can modify any field of a registered pekebun and successfully commit updates within 3 wizard steps.
- **SC-002**: The "Simpan Draft" action is completely disabled/hidden when updating registered records.

## Assumptions

- Editing is only allowed for the Kelembagaan role that owns/managed the pekebun master data.
