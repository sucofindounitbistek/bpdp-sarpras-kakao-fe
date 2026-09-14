# Data Model: RAB PDF Generation

This feature involves purely UI rendering enhancements and does not introduce new database tables, state schemas, or backend API DTO changes.

## Existing Entities Utilized

### RAB Store State
The `usePengusulanDraftStore` is read to collect the active RAB item records:
- `rabItems`: List of active `RabItem` objects.
- `rabTotal`: Total raw calculation.
- `rabTotalRounded`: Floor value calculation.
- `selectedPaket`: Used to fetch the package descriptions and display the package title in the table header.

No changes are made to these state properties or models.
