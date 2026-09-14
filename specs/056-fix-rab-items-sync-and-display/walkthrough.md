# Walkthrough: Fix RAB Items Synchronization and Display

## Root Cause

In `StepVerifikasiPekebunDanDokumenProposal.vue`, line 86 had the condition `if (items && verifikasiStore.rabItems.length === 0)`. If `verifikasiStore` held any stale items or empty references from a prior session, `verifikasiStore.rabItems` was skipped and failed to sync when loading proposal detail.

## Fixes Applied

- **`StepVerifikasiPekebunDanDokumenProposal.vue`**:
  - Updated watcher to sync `verifikasiStore.rabItems` unconditionally whenever `pengajuan.value?.rabItems` is non-empty.
- **`src/stores/pengusulan.ts`**:
  - Enhanced `rabItems` mapping in `getProposalDetail()` to check `item.rabItems`, `item.rabs`, `item.rab_items`, `item.rab_proposals` with robust stage quantity fallbacks.

## Verification

- `tasks.md` marked 4/4 tasks `[X]`.
- Build task `npm run build` executed successfully.
