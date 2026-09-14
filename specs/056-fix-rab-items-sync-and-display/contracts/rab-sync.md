# Interface Contract: Fix RAB Items Synchronization and Display

## Sync Watcher Contract in `StepVerifikasiPekebunDanDokumenProposal.vue`

```typescript
watch(
  () => pengajuan.value?.rabItems,
  (items) => {
    if (items && Array.isArray(items) && items.length > 0) {
      verifikasiStore.rabItems = items.map((r) => ({ ...r }));
    }
  },
  { immediate: true },
);
```
