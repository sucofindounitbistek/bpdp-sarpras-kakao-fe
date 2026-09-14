# Data Model: CPCL Lahan Polygon Capture

## Proposal

Represents one Pengusulan Sarpras BPDP submission.

### Fields

- `id`: Unique proposal identifier.
- `daftarCPCL`: List of CPCL and land records included in the proposal.
- Existing proposal fields remain unchanged.

### Relationships

- Has many `CPCLLahanData` records.

## CPCLLahanData

Represents one calon petani/calon lahan entry and its proposed land boundary.

### Fields

- `id`: Unique CPCL row identifier.
- `namaPekebun`: Farmer name.
- `nik`: Farmer NIK, exactly 16 digits.
- `nomorKK`: Family card number, exactly 16 digits.
- `luasLahanHektar`: Land area in hectares, greater than 0.
- `jenisHakLahan`: Land-right type; allowed values `SHM`, `SKT`, `STDB`.
- `nomorSuratLahan`: Land document number.
- `coordinatePoints`: Ordered land-boundary points entered by the user.
- `koordinatPoligon`: Serialized polygon coordinate data submitted with CPCL data.

### Relationships

- Belongs to one `Proposal`.
- Has many `CoordinatePoint` records.
- Produces one `LandBoundaryPolygon` when valid.

### Validation Rules

- Must include at least three valid coordinate points.
- Must reject incomplete coordinate rows.
- Must reject malformed latitude or longitude values.
- Must reject duplicate coordinate points.
- Must prevent submission when the coordinate list cannot form a valid polygon.

## CoordinatePoint

Represents one ordered vertex in the land boundary.

### Fields

- `order`: Position in the polygon boundary, starting from 1.
- `latitude`: Decimal latitude value.
- `longitude`: Decimal longitude value.

### Validation Rules

- `order` must be unique within the CPCL land boundary.
- `latitude` must be between -90 and 90.
- `longitude` must be between -180 and 180.
- A latitude/longitude pair must not duplicate another point in the same boundary.

## LandBoundaryPolygon

Represents the closed land boundary preview generated from ordered coordinate points.

### Fields

- `points`: Ordered list of `CoordinatePoint` values.
- `isValid`: Whether the points can form an accepted boundary.
- `validationMessages`: User-facing issues blocking preview or submission.

### State Transitions

- `Empty`: No coordinate points entered.
- `Incomplete`: One or more rows missing latitude or longitude.
- `Invalid`: Values exist but fail range, duplicate, count, or geometry validation.
- `Previewable`: At least three valid ordered points can draw a closed polygon.
- `Submitted`: Valid polygon data has been included in the proposal payload.
