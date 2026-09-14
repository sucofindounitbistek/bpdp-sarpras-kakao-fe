# Data Model: Pekebun Proposal Confirmation Modal

This feature involves purely UI confirmation enhancements and does not introduce new database tables, state schemas, or backend API DTO changes.

## Existing Entities Utilized

### Proposal Status Transitions
The Pekebun proposal submission flow modifies the `currentStatus` property of the proposal:
- Submitting the proposal from Lembaga Pekebun (Pemohon) transitions the state of the proposal draft to `SUBMITTED` (or similar initial state in the simulated store, e.g., representing "Verifikasi Dinas Kab/Kota").

No changes are made to these state properties or models.
