# Walkthrough: Contextual Rejection Notes Display across Pekebun and Proposal Pages

## Changes Made

- **`src/lib/parseRejectionNotes.ts`**:
  - Created parser utility `parseRejectionNotes(catatanRaw)` to structure raw rejection feedback into categories (`PEKEBUN`, `PROPOSAL_DOC`, `GUDANG`, `RAB`).
- **`TrackingPengusulanDetailView.vue`**:
  - Added contextual rejection note warning banner under proposal header for proposals in `REVISION_ADMIN` status.
  - Divided rejection feedback into `Berkas Proposal & Gudang` section and `Berkas Pekebun & Lahan` section.
- **`RevisiProposalView.vue`**:
  - Enhanced revision view to categorize verifier feedback notes into Proposal Document and Pekebun/Lahan cards.

## Verification

- `tasks.md` marked 6/6 tasks `[X]`.
- Production build `npm run build` executed.
