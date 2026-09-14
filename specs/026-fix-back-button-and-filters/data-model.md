# Data Model: fix-back-button-and-filters

## Client State Model

### 1. useVerifikasiKabDraftStore (State)
No changes are made to the store data model itself, but the store state is modified during navigation:
- `currentStep`: `1 | 2 | 3 | 4` (Currently, step 2 is invalid for the Dinas Kab workflow UI. The transition changes the value back to 1).

### 2. QueueFilter Props and Option Data Shapes
The `QueueFilter` component receives custom options for dropdown rendering:
- `statusOptions` (Prop, optional): `Array<{ value: string, label: string }>`
- `jenisSarprasOptions` (Prop, optional): `Array<{ value: string, label: string }>`

## Proposal Status Mappings
We leverage existing status mappings from the core application types and localization configurations:
- `PengajuanStatus`: Type definition in `@/types/pengusulan`.
- `UsulanStatus`: Type definition in `@/types/rekomtek`.
- `LOCALIZATION.proposalStatus`: The mapping of `PengajuanStatus` to Indonesian display labels.
- `LOCALIZATION.jenisSarpras`: The mapping of `JenisSarpras` to display labels.
