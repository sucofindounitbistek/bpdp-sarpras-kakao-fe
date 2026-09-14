# Phase 0 Research: Proposal Rejection Status Alignment at Dinas Kabupaten

## Research Findings

### Decision: Standardize Rejection Status Code to `REV_FROM_KAB`

- **Context**: In `StepVerifikasiPekebunDanDokumenProposal.vue`, rejection currently calls `pengusulanStore.updateStatus(id, PengajuanStatus.REVISION_ADMIN, notes)`.
- **Finding**: `PengajuanStatus.REV_FROM_KAB` (value `'REV_FROM_KAB'`) is already defined in `@/types/pengusulan.ts` and supported by the backend API and queue filters. `DetailVerifikasiKabView.vue` already uses `'REV_FROM_KAB'`.
- **Rationale**: Setting the status strictly to `REV_FROM_KAB` ensures that returned proposals accurately state "Revisi dari Kabupaten" across all queues, status badges, timelines, and audit trails.
- **Alternatives Considered**:
  - Keep `REVISION_ADMIN`: Rejected because `REVISION_ADMIN` is a generic status, whereas `REV_FROM_KAB` explicitly identifies the tier (Kabupaten) that requested the revision.

## Technical Resolution

- Replace all calls using `PengajuanStatus.REVISION_ADMIN` during Kabupaten verification rejection with `PengajuanStatus.REV_FROM_KAB` (or `'REV_FROM_KAB'`).
- Ensure `pengusulanStore.updateStatus` and `pengusulanStore.updateProposal` pass `status: 'REV_FROM_KAB'`.
