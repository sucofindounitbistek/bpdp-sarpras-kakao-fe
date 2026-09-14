# Phase 0 Research: Fix RAB Items Synchronization and Display

## Research Task 1: Watcher Condition Analysis

- **Root Cause**: In `StepVerifikasiPekebunDanDokumenProposal.vue` lines 83-91:
  ```typescript
  watch(
    () => pengajuan.value?.rabItems,
    (items) => {
      if (items && verifikasiStore.rabItems.length === 0) {
        verifikasiStore.rabItems = items.map((r) => ({ ...r }));
      }
    },
    { immediate: true },
  );
  ```
  The condition `verifikasiStore.rabItems.length === 0` prevented `verifikasiStore.rabItems` from populating if `verifikasiStore` was persisted in `localStorage` from a previous session or initialized with stale items.
- **Decision**: Update watcher to sync `verifikasiStore.rabItems` whenever `pengajuan.value?.rabItems` is non-empty.

## Research Task 2: Backend Payload Representation Fallback

- **Decision**: Update `getProposalDetail()` in `src/stores/pengusulan.ts`:
  - Check `item.rabs`, `item.rab_items`, `item.rabItems`, and `item.rab_proposals`.
  - Extract stage quantities (`jumlahTahap1` to `jumlahTahap4`), unit price (`price_per_unit`), and subtotal (`total_price`).
