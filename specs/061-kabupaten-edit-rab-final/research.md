# Phase 0 Research: RAB FINAL Flag Creation at Dinas Kabupaten

## Research Findings

### Decision: Submit RAB with `flag: 'FINAL'` when saving RAB in Kabupaten Verification

- **Context**: Creating proposals uses `flag: 'PROPOSAL'`. Kabupaten verification edits budget and requires `flag: 'FINAL'`.
- **Rationale**: `rabService.createRab(proposalId, payload)` accepts `flag`. Setting `flag: 'FINAL'` creates the evaluation RAB without overwriting initial proposal RAB.
- **Alternatives Considered**:
  - Overwriting `PROPOSAL` RAB: Rejected (loses original audit history).
