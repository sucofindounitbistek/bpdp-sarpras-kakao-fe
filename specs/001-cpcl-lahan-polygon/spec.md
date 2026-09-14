# Feature Specification: CPCL Lahan Polygon Capture

**Feature Branch**: `[001-cpcl-lahan-polygon]`

**Created**: 2026-07-30

**Status**: Draft

**Input**: User description: "i need to implement leaflet in the form pengusulan sarpras bpdp in the data cpcl & lahan part, the user would input coordinates to create polygon on the map"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create Land Polygon From Coordinates (Priority: P1)

As a user completing the Pengusulan Sarpras BPDP form, I need to enter land boundary coordinates in the Data CPCL & Lahan section so the proposed land area is shown as a polygon on a map and can be submitted with the proposal.

**Why this priority**: The land boundary is core proposal evidence. Users need visual confirmation before submitting CPCL and land data.

**Independent Test**: Can be fully tested by opening the Data CPCL & Lahan section, entering a valid set of boundary coordinates, confirming the map displays a closed polygon, and submitting the form data.

**Acceptance Scenarios**:

1. **Given** the user is on the Data CPCL & Lahan section, **When** they enter at least three valid coordinate points, **Then** the system displays a closed polygon representing the land boundary.
2. **Given** a polygon is displayed, **When** the user reviews the map, **Then** each entered coordinate is represented in the correct order as part of the boundary.
3. **Given** the user submits the form with a valid polygon, **When** the proposal is saved, **Then** the coordinate list and polygon boundary are retained with the CPCL and land data.

---

### User Story 2 - Validate Coordinate Input (Priority: P2)

As a user entering land coordinates, I need clear validation feedback so I can correct invalid, incomplete, or unordered points before submission.

**Why this priority**: Accurate boundary data prevents invalid proposal submissions and reduces review corrections.

**Independent Test**: Can be tested by entering invalid coordinate values, too few points, or incomplete rows and confirming that the form blocks submission with clear correction guidance.

**Acceptance Scenarios**:

1. **Given** the user enters fewer than three coordinate points, **When** they try to display or submit the polygon, **Then** the system explains that at least three points are required.
2. **Given** the user enters a coordinate outside valid latitude or longitude ranges, **When** validation runs, **Then** the system identifies the invalid coordinate and prevents submission until corrected.
3. **Given** the user leaves a coordinate value incomplete, **When** they proceed, **Then** the system highlights the incomplete value and keeps existing valid inputs intact.

---

### User Story 3 - Edit Polygon Coordinates Before Submission (Priority: P3)

As a user, I need to adjust coordinate points after seeing the polygon so I can correct boundary mistakes without restarting the entire form.

**Why this priority**: Field data entry often requires correction after visual review.

**Independent Test**: Can be tested by creating a polygon, changing or removing one coordinate point, and confirming the displayed polygon updates while other form data remains unchanged.

**Acceptance Scenarios**:

1. **Given** a polygon has been displayed, **When** the user edits a coordinate point, **Then** the polygon updates to reflect the new boundary.
2. **Given** the user removes a coordinate point but at least three valid points remain, **When** the map refreshes, **Then** the polygon is redrawn using the remaining points.
3. **Given** the user removes enough points to make the polygon invalid, **When** validation runs, **Then** the system removes or marks the polygon preview as invalid and explains what must be fixed.

---

### Edge Cases

- The user enters duplicate coordinate points.
- The user enters coordinates in an order that creates a self-crossing polygon.
- The user enters points far away from the expected proposal region.
- The map cannot be displayed due to poor connectivity or unavailable map data.
- The user navigates away from the section after entering coordinates but before submitting.
- Existing saved proposal data already contains coordinates when the form is opened for editing.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide a coordinate entry area in the Pengusulan Sarpras BPDP form's Data CPCL & Lahan section.
- **FR-002**: Users MUST be able to add, edit, reorder, and remove coordinate points before form submission.
- **FR-003**: System MUST require at least three valid coordinate points before a land boundary polygon can be accepted.
- **FR-004**: System MUST validate latitude and longitude values against valid geographic coordinate ranges.
- **FR-005**: System MUST display a closed polygon preview when the entered coordinate list forms a valid land boundary.
- **FR-006**: System MUST update the polygon preview whenever the user changes the coordinate list.
- **FR-007**: System MUST prevent proposal submission when required coordinate data is missing, invalid, or insufficient to form a polygon.
- **FR-008**: System MUST preserve valid coordinate inputs when validation errors occur.
- **FR-009**: System MUST save the coordinate list and resulting land boundary as part of the CPCL and land data for the proposal.
- **FR-010**: System MUST load existing saved coordinate data and polygon preview when a user edits a previously saved proposal.
- **FR-011**: System MUST provide user-friendly guidance when the map preview cannot be displayed, while still preserving entered coordinate data.
- **FR-012**: System MUST identify duplicate or malformed coordinate rows and explain how the user can correct them.

### Key Entities *(include if feature involves data)*

- **Proposal**: A Pengusulan Sarpras BPDP submission that includes CPCL and land information.
- **CPCL & Lahan Data**: The proposal section containing candidate recipient and land details, including the land boundary coordinates.
- **Coordinate Point**: A latitude and longitude pair entered by the user, ordered as part of the land boundary.
- **Land Boundary Polygon**: The closed area formed from the ordered coordinate points and associated with the proposal land record.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 95% of users can create a valid land polygon from coordinates in under 3 minutes after reaching the Data CPCL & Lahan section.
- **SC-002**: 100% of invalid coordinate submissions are blocked with clear correction guidance before final proposal submission.
- **SC-003**: 90% of users can identify whether their entered coordinates match the intended land boundary from the map preview on the first attempt.
- **SC-004**: Coordinate-related correction requests from proposal reviewers decrease by at least 40% after the feature is introduced.
- **SC-005**: Previously saved coordinate data is restored correctly for 100% of editable proposals that contain land boundary data.

## Assumptions

- Users entering the form have access to land boundary coordinate data from field measurement, survey records, or another trusted source.
- Coordinates are entered as latitude and longitude decimal values.
- The polygon boundary is based on the order of coordinate points entered by the user.
- The feature is limited to polygon creation from typed coordinate inputs; drawing freehand directly on the map is outside this scope.
- Existing proposal save and edit flows will continue to handle the rest of the CPCL and land data.
- When the map preview is unavailable, users should still be able to keep their entered coordinates and retry preview later.
