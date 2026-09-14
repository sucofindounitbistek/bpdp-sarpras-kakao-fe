# Research & Technical Decisions: Disable Selected Lahan

## Decisions

### Decision 1: Matching Lands to Proposals
- **Choice**: Match lands by comparing the certificate number (`lahan.nomorLegalitas` to proposal's `cpcl.nomorSuratLahan`).
- **Rationale**: The submitted proposals (`daftarCPCL`) do not preserve the original local `lahan.id` (they generate new CPCL IDs upon submission). Since a land certificate number is unique, matching by `nomorLegalitas` is the correct approach.

### Decision 2: Defining "Active Proposal"
- **Choice**: A proposal is considered active/ongoing if its status is neither `PengajuanStatus.REJECTED` nor `PengajuanStatus.DRAFT`.
- **Rationale**: Rejected proposals are inactive, allowing the land to be re-submitted. Draft proposals in the wizard are not yet finalized, but any submitted proposal undergoing verification or validation blocks the land.

### Decision 3: UI Feedback and Disabled State
- **Choice**:
  1. Add a helper function `getLahanActiveProposal(lahan)` returning the active proposal containing the land, if any.
  2. If a proposal is found, visually disable the land selection, bypass click actions, and render a label `(Sedang diajukan di [proposal.nomorResi])`.
  3. If all lands for a pekebun are active in other proposals, visually disable the pekebun card and bypass click actions.
