# Feature Specification: Adjust Minimum Land Coordinates

**Feature Branch**: `039-adjust-min-coordinates-lahan`

**Created**: 2026-08-25

**Status**: Draft

**Input**: User description: "i need the minimum titik koordinat in the stepdatalahanpekebun to be 3 instead of 4"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Add Land with Triangular Boundary (Priority: P1)

As a Pekebun, when registering my land in Step 3 of the Pekebun registration form, I want to define my land boundary using exactly 3 coordinate points (a triangle), so that I can successfully register parcels that have three corners without being forced to provide a fourth coordinate.

**Why this priority**: This is the core functional change required by the user to support triangular land boundaries.

**Independent Test**: Go to Step 3 of the Pekebun registration form. Add a land record, click the "Poligon & Peta" tab, input exactly 3 distinct valid coordinates, verify the map renders a green shaded triangle, and click "Simpan Lahan" to successfully save the land record.

**Acceptance Scenarios**:

1. **Given** the user is entering land coordinates, **When** they provide exactly 3 valid and distinct coordinate points, **Then** the validation succeeds, the preview polygon is rendered as a triangle, and the user can save the land.
2. **Given** the user is entering land coordinates, **When** they provide fewer than 3 coordinates (e.g., 2 coordinates), **Then** the validation fails, a validation warning is displayed, and saving is blocked.

---

### User Story 2 - Real-Time Coordinate Count UI Hints (Priority: P2)

As a Pekebun, when I am inputting coordinates in the coordinate table, I want the system to show clear instructions and status messages indicating that a minimum of 3 points is required, so that I understand the system constraints while typing.

**Why this priority**: Helps with usability and guides the user to successfully complete the form.

**Independent Test**: Open the land edit panel under the "Poligon & Peta" tab. Verify that the placeholder text or help text states that a minimum of 3 coordinates is required, and that the text changes to "Poligon valid" when 3 valid coordinates are provided.

**Acceptance Scenarios**:

1. **Given** the coordinate list has fewer than 3 coordinate points, **When** viewing the preview status area, **Then** the message "Pratinjau poligon akan terbentuk setelah minimal 3 titik koordinat dimasukkan." is shown in a neutral grey color.
2. **Given** the coordinate list has 3 or more coordinate points and they form a valid polygon, **When** viewing the preview status area, **Then** the message "Poligon valid dengan [X] titik koordinat." is shown in a green success alert.

### Edge Cases

- **Duplicate Coordinates**: If a user inputs 3 coordinate points but 2 of them are duplicates, the system must detect this and display an error message "Titik koordinat tidak boleh duplikat." and block saving.
- **Incomplete Coordinates**: If a user inputs 3 rows in the coordinate table but fails to enter a latitude or longitude in one of the rows, the system must show "Lengkapi latitude dan lng pada titik koordinat ini." and block saving.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow saving land data with a minimum of 3 coordinate points in `StepDataLahanPekebun.vue`.
- **FR-002**: The coordinate validation in `lahanPekebunSchema` (Zod schema) MUST enforce a minimum of 3 points for the `coordinates` array field.
- **FR-003**: The coordinate validation utility `validateCoordinatePolygon` MUST require a minimum of 3 points for a valid polygon and return an error if fewer than 3 points are present.
- **FR-004**: The user-facing copy, instructions, and validation error messages MUST explicitly mention 3 coordinate points as the minimum boundary requirement.
- **FR-005**: All user-facing copies, messages, and validation strings regarding coordinate minimum limits MUST be externalized into `src/config/localization.ts` per Principle XV.

### Key Entities *(include if feature involves data)*

- **LahanPekebun**:
  - `coordinates`: Array of `{ lat: number, lng: number }` containing at least 3 points.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can register a land parcel with exactly 3 coordinate points without encountering Zod validation or map rendering errors.
- **SC-002**: 100% of user-facing coordinate limit messages in the Pekebun Master Data module are aligned to show a minimum of "3" points instead of "4".
- **SC-003**: Zero hardcoded Indonesian or English text strings for coordinate validation limits remain in `StepDataLahanPekebun.vue` (all externalized to `src/config/localization.ts`).

## Assumptions

- **Existing Code Compatibility**: Since the codebase already implements a minimum of 3 points in some files (such as Zod schema and helper library), this feature will audit the entire flow to confirm that no hidden checks, documentation, or localization keys require 4 coordinates, and that everything is unified to 3.
- **Map Library Support**: The Leaflet map engine natively supports rendering 3-point polygons (triangles) without issue.
