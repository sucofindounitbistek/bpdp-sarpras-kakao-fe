# Quickstart: CPCL Lahan Polygon Capture

## Prerequisites

- Node.js version compatible with the project.
- Project dependencies installed with `npm install`.
- Application can run locally with the existing Vite workflow.

## Setup

1. Install dependencies: `npm install`
2. Start local app: `npm run dev`
3. Open the Pengusulan Sarpras BPDP new proposal form.
4. Navigate to the Data CPCL & Lahan step.

## Validation Scenarios

### Scenario 1: Create Valid Polygon

1. Fill required CPCL farmer and land fields.
2. Enter at least three valid latitude/longitude coordinate rows.
3. Confirm a closed polygon appears in the map preview.
4. Submit or save the proposal.

Expected outcome: The form accepts the CPCL row, keeps coordinate order, and includes polygon coordinate data in the proposal payload.

### Scenario 2: Block Too Few Points

1. Enter only two coordinate rows.
2. Attempt to preview or submit.

Expected outcome: Submission is blocked with a clear message that at least three points are required.

### Scenario 3: Block Invalid Ranges

1. Enter a latitude above 90 or below -90.
2. Enter a longitude above 180 or below -180.
3. Attempt to submit.

Expected outcome: Invalid fields are identified, the polygon is not accepted, and existing valid fields remain intact.

### Scenario 4: Edit Existing Polygon

1. Create a valid polygon.
2. Edit one coordinate value.
3. Remove one coordinate while at least three valid points remain.

Expected outcome: The preview updates after each change without clearing unrelated CPCL form data.

### Scenario 5: Restore Saved Coordinates

1. Open an existing proposal that already has CPCL polygon coordinates.
2. Navigate to Data CPCL & Lahan.

Expected outcome: Coordinate rows are restored and the map preview displays the saved polygon.

## Verification Commands

- Type/build validation: `npm run build`
- Test suite: `npm test`

## References

- Data model: [data-model.md](./data-model.md)
- UI contract: [contracts/ui-contract.md](./contracts/ui-contract.md)
