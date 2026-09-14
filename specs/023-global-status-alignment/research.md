# Research: Global Proposal Status Alignment

## Centralized Mapping Configuration
- All proposal status strings will be updated inside `src/config/localization.ts` under the `proposalStatus` object.
- Because all views pull statuses using `getStatusLabel` from `src/types/pengusulan.ts` which accesses `LOCALIZATION.proposalStatus` directly, updating this object will automatically apply the changes globally to all roles.

## Cleaning Local Workarounds
- In `TrackingPengusulanView.vue`, we will revert the local `getAlignedStatusLabel` function and restore imports to use the global `getStatusLabel` and `PengajuanStatus` type.
- In `QueueVerifikasiKabView.vue`, we will remove the local `getStatusLabel` switch statement override and instead import the global `getStatusLabel` directly to ensure consistency.
