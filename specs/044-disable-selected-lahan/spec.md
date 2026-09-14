# Feature Specification: Disabling Selected Lahan in Active Proposals

**Feature Branch**: `044-disable-selected-lahan`

**Created**: 2026-08-25

**Status**: Draft

**Input**: User description: "can you make the lahan unselectable if there's already a proposal going on for that lahan"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Disable Selection of Lahan with Active Proposals (Priority: P1)

When a cooperative is creating a proposal and selecting pekebuns and their lands (Step 3), any land that is already associated with an ongoing (non-rejected) proposal must be disabled/unselectable to prevent double-submitting the same land.

**Why this priority**: Crucial business rule to prevent duplicate funding and double-submitting lands.

**Independent Test**: Can be tested by opening Step 3 in a proposal creation flow, checking that lands from active mock proposals (such as Ahmad Supardi's land `SHM-99182`) are disabled, show a warning badge, and cannot be checked.

**Acceptance Scenarios**:

1. **Given** a land has its certificate number `nomorLegalitas` present in an active proposal (e.g. status `SUBMITTED`, `VERIFIED_ADMIN`, etc.), **When** viewing the land in Step 3 selection, **Then** the checkbox for that land MUST be disabled and show a label "Sedang diajukan".
2. **Given** a land with an active proposal, **When** clicking on the land's checkbox or list item, **Then** it MUST NOT toggle selection state or add the land ID to `selectedLahanIds`.
3. **Given** a pekebun has all of their lands already active in other proposals, **When** looking at the pekebun list, **Then** the pekebun card/header MUST be visually disabled and clicking it MUST NOT select the pekebun.

---

### User Story 2 - Warning Badges and Proposal Reference (Priority: P2)

Provide clean UX visibility by informing the user which proposal is currently blocking the land.

**Why this priority**: Enhances usability by showing the specific proposal reference (e.g., proposal code or resi number) that contains the land.

**Independent Test**: Verify that the disabled land shows the resi number of the blocking proposal (e.g. `BPDP-Kelapa-202607-001`).

**Acceptance Scenarios**:

1. **Given** a land is unselectable, **When** rendering the land details, **Then** it MUST display `(Sedang diajukan di [Nomor Resi])` in a warning-colored badge or text.

## Edge Cases

- **Proposal Rejected**: If a proposal containing a land is `REJECTED`, the land MUST become selectable again.
- **Multiple Lands**: If a pekebun has multiple lands, only the lands that are in active proposals are disabled; other lands owned by the same pekebun must remain selectable.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST match land active status by comparing the land's certificate number (`nomorLegalitas`) against the `nomorSuratLahan` field inside the `daftarCPCL` array of all proposals in `usePengusulanStore().listPengajuan`.
- **FR-002**: A land is considered active if it is found in any proposal where the proposal status is NOT `PengajuanStatus.REJECTED` and NOT `PengajuanStatus.DRAFT`.
- **FR-003**: The land checkbox in `StepPilihPekebunLahan.vue` MUST be disabled if the land is active.
- **FR-004**: If a land is active, the UI MUST display `(Sedang diajukan di [proposal.nomorResi])` next to it.
- **FR-005**: If all lands for a pekebun are active/unselectable, the pekebun header checkbox in `StepPilihPekebunLahan.vue` MUST be disabled.

### Key Entities

- **LahanPekebun**: Reused entity representing a land.
- **PengajuanSarpras**: Reused entity representing a proposal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Lands with active proposals are 100% blocked from double-selection in Step 3.
- **SC-002**: Unselectable lands clearly display the blocking proposal's resi number.

## Assumptions

- **Assumed Scope**: Only active proposals (statuses other than `REJECTED`) block a land. Drafts (which are local to the current user's session) do not block since they are not submitted yet.
