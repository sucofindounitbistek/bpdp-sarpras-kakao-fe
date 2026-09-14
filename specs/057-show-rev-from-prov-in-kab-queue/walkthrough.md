# Walkthrough: Show Proposals with REV_FROM_PROV Status in QueueVerifikasiKabView

## Changes Made

- **`QueueVerifikasiKabView.vue`**:
  - Updated `onMounted()` to call `store.fetchProposals()` without restricting query parameter exclusively to `SUBMITTED`, enabling proposals in `REV_FROM_PROV` and other relevant statuses to load into the queue.
  - Enhanced `getBadgeVariant()` to map `REV_FROM_PROV`, `KAB_SUBMITTED`, `VALIDATED_PROV`, and `REV_FROM_KAB` to appropriate badge variants.

## Verification

- `tasks.md` marked 4/4 tasks `[X]`.
- Build task `npm run build` executed.
