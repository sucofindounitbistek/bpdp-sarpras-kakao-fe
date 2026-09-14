# Data Model: provinsi-approval-modal

This feature involves purely UI confirmation enhancements and does not introduce new database tables, state schemas, or backend API DTO changes.

## Existing Entities Utilized

### Proposal Status Transitions
The verification flows modify the `currentStatus` property of the proposal:
- Submitting from Dinas Kabupaten to Dinas Provinsi transitions the status to `REKOMTEK_KAB_ISSUED`.
- Submitting from Dinas Provinsi to Ditjenbun transitions the status to `REKOMTEK_KAB_ISSUED` (simulated).
- Rejection/Revisi from Dinas Provinsi to Dinas Kabupaten transitions the status to `REVISION_ADMIN`.

No changes are made to these state properties or models.
