# Research: Fix RAB Display and Synchronization in Proposal Verification

## Research Tasks & Findings

### 1. Root Cause of Missing RAB Items in StepVerifikasiPekebunDanDokumenProposal.vue

- **Finding**: When navigating to `/dinas/verifikasi/kabupaten/:id`, `DetailVerifikasiKabView.vue` calls `pengusulanStore.getProposalDetail(id)` on `onMounted`. However:
  1. `pengajuan.value` in `StepVerifikasiPekebunDanDokumenProposal.vue` is initially retrieved from `listPengajuan` or `activePengajuan`.
  2. If `activePengajuan` is initially null, `pengajuan.value` falls back to `listPengajuan.find(...)`. `listPengajuan` is populated from `fetchPengajuanList()` which returns proposal summaries without detailed `rabItems`.
  3. The `watch` in `StepVerifikasiPekebunDanDokumenProposal.vue` had an immediate check `if (items && Array.isArray(items) && items.length > 0)`. If `items` was empty or `undefined` initially, the watcher ran immediately, did nothing, and if `activePengajuan` took time to load or if `items` was empty initially, subsequent updates were ignored if deep watching wasn't active or if `rabItems` array reference was updated.
  4. Backend DTO mapping in `getProposalDetail()` in `src/stores/pengusulan.ts` handled `item.rabItems` and nested `item.rabs`, but fell back to empty array if backend returned `item.rabs` directly as flat item objects or `item.rab_proposals`.

- **Decision**:
  1. Enhance `watch` in `StepVerifikasiPekebunDanDokumenProposal.vue` to watch `() => pengajuan.value?.rabItems` with `{ immediate: true, deep: true }`, ensuring `verifikasiStore.rabItems` is updated whenever `rabItems` populated or refreshed.
  2. Extend `getProposalDetail()` mapper in `src/stores/pengusulan.ts` to normalize all backend RAB representations (flat arrays, nested `rabs.items`, `rab_items`, `rabs`, `rab_proposals`, and DTO field aliases like `harga_satuan`, `hargaSatuan`, `price_per_unit`).
  3. Add explicit reset/sync method or proposal ID check in `verifikasiKabDraftStore` to ensure clean state when switching between proposal verifications.

- **Rationale**: Vue 3 reactivity requires watching active nested structures with `{ deep: true }` or watching computed properties when store detail loads asynchronously after component mounting.

- **Alternatives Considered**:
  - *Hardcoding initial fetch inside component*: Rejected because `DetailVerifikasiKabView.vue` already manages component mounting lifecycle and proposal loading.
