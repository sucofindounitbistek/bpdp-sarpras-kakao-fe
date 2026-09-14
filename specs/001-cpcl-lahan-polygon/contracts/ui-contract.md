# UI Contract: Data CPCL & Lahan Polygon Capture

## Surface

Existing Pengusulan Sarpras BPDP form, Data CPCL & Lahan step.

## Inputs

- User can add coordinate rows.
- Each row contains latitude and longitude decimal fields.
- User can edit existing coordinate values.
- User can remove coordinate rows.
- User can reorder points to adjust polygon boundary order.

## Preview Behavior

- With fewer than three valid points, no accepted polygon preview is shown.
- With three or more valid ordered points, a closed polygon preview is shown on the map.
- Preview updates after coordinate add, edit, remove, or reorder actions.
- Existing valid form data remains visible when validation errors occur.

## Validation Messages

- Fewer than three points: "Minimal 3 titik koordinat diperlukan untuk membuat poligon lahan."
- Invalid latitude: "Latitude harus berada antara -90 dan 90."
- Invalid longitude: "Longitude harus berada antara -180 dan 180."
- Incomplete row: "Lengkapi latitude dan longitude pada titik koordinat ini."
- Duplicate point: "Titik koordinat tidak boleh duplikat."
- Invalid polygon shape: "Urutan titik koordinat belum membentuk poligon lahan yang valid."
- Map unavailable: "Peta belum dapat ditampilkan. Koordinat tetap tersimpan, silakan coba lagi."

## Submission Rules

- Form submission is blocked while coordinate validation errors exist.
- Valid coordinate points are serialized into the CPCL polygon field before proposal submission.
- Editing an existing proposal with saved polygon data restores coordinate rows and polygon preview.

## Accessibility And Usability

- Coordinate inputs must have clear labels per row and field.
- Validation messages must be visible near the affected coordinate row or map area.
- The polygon preview must not be the only source of validation status; text feedback is required.
