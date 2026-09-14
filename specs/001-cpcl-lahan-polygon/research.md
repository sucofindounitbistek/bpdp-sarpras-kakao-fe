# Research: CPCL Lahan Polygon Capture

## Decision: Store Coordinates As Ordered Decimal Latitude/Longitude Points

**Rationale**: The existing CPCL model already has `koordinatPoligon`, and the feature requires user-entered coordinates to form a polygon. Ordered decimal latitude/longitude points are simple for users, easy to validate, and compatible with common geographic data exchange formats.

**Alternatives considered**: Free-form text only was rejected because it cannot reliably validate or preview polygons. Map-only drawing was rejected because the specification limits scope to typed coordinate input.

## Decision: Require Minimum Three Valid Points And Auto-Close Polygon Preview

**Rationale**: Three points are the minimum needed to form a polygon. Users should not need to repeat the first point at the end; the preview can treat the boundary as closed while preserving the user-entered list.

**Alternatives considered**: Requiring users to enter a final duplicate closing point was rejected because it adds unnecessary errors and duplicate handling. Allowing fewer points was rejected because it cannot represent land area.

## Decision: Validate Coordinate Ranges, Duplicates, Incomplete Rows, And Basic Geometry Errors

**Rationale**: The spec requires clear feedback for invalid, duplicate, malformed, and self-crossing coordinate input. Latitude must be between -90 and 90; longitude must be between -180 and 180. Duplicate points and self-crossing boundaries should block final submission because they reduce reviewer confidence and can make land boundaries invalid.

**Alternatives considered**: Only checking whether the coordinate string is present was rejected because the current `koordinatPoligon` minimum-length validation cannot ensure valid land boundaries.

## Decision: Keep Existing CPCL Submission Flow And Payload Surface

**Rationale**: The project already submits `PengajuanSarpras` through `pengusulanService.submitNew` and stores CPCL entries in `daftarCPCL`. Extending the Data CPCL step preserves the form wizard and minimizes risk.

**Alternatives considered**: Adding a separate land-boundary endpoint or separate wizard step was rejected because the feature belongs inside the existing Data CPCL & Lahan step.

## Decision: Add A Browser Map Preview In The Existing Form Step

**Rationale**: The user specifically requested a map polygon preview. The app is a browser frontend, so the map should live in the CPCL step near coordinate entry, updating as input changes.

**Alternatives considered**: Static coordinate summary only was rejected because users need visual confirmation. A separate full-page map editor was rejected as larger scope than needed.

## Decision: Test With Unit, Component, And Build Validation

**Rationale**: Coordinate validation is deterministic and should be unit tested. The form behavior and preview states should be component tested. The feature also adds map-related dependencies, so type/build validation is required.

**Alternatives considered**: Manual-only testing was rejected because validation edge cases are regression-prone.
