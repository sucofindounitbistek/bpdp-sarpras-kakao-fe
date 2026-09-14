# Research: Fix RAB and Gudang Validation Display in Regency Verification

## Executive Summary

In `StepVerifikasiPekebunDanDokumenProposal.vue`, two conditional rendering guards prevent the Gudang (Storage Area) and RAB validation sections from displaying on proposal verification views (such as `/dinas/verifikasi/kabupaten/22`):

1. **Gudang Validation Guard**: Guarded by `v-if="isPupukPaket"`. `isPupukPaket` strictly compared `pengajuan.value?.jenisSarpras === JenisSarpras.EKSTENSIFIKASI || pengajuan.value?.jenisSarpras === JenisSarpras.INTENSIFIKASI`. This failed when package strings were delivered as `paket_sarpras`, `jenis_sarpras`, lowercase strings, or when storage area data (`storage_area` / `gudangSerahTerima`) existed on packages with different naming formats.
2. **RAB Inspection Guard**: Guarded by `v-if="getDokumen('RAB_RK')"`. This hidden the entire RAB inspection section whenever an explicit file document with type `RAB_RK` was absent, even when structured RAB items existed in the proposal payload.

---

## Research Findings & Technical Decisions

### Decision 1: Inclusive Storage Area / Gudang Display Guard

- **Decision**: Update `hasStorageArea` computed property to evaluate:
  1. Presence of `storage_area` or `gudangSerahTerima` object in `pengajuan.value` (address, coordinate, or photo properties present).
  2. Case-insensitive and alias-aware check for package type (`isPupukPaket`).
- **Rationale**: If a proposal has warehouse details stored in `storage_area` or `gudangSerahTerima`, the verifier MUST be able to view and validate it regardless of package string formatting.
- **Alternatives Considered**:
  - *Hardcoding specific proposal IDs*: Rejected because it violates maintainability; condition must be dynamic and driven by proposal payload.

---

### Decision 2: RAB Inspection & Table Visibility Guard

- **Decision**: Update RAB inspection and table rendering to display whenever:
  1. Structured RAB items exist (`pengajuan.value.rabItems?.length > 0` or `verifikasiStore.rabItems.length > 0`).
  2. Or an uploaded RAB document (`RAB_RK`, `RAB_PROPOSAL`, `RAB_DETAIL`, `RAB`) is attached.
  3. Or the step is Step 1 of Regency Verification (allowing default RAB generation/editing).
- **Rationale**: Ensures the RAB section and RAB Kabupaten table (`RabTable.vue`) are always accessible for verifiers to inspect, edit, generate, and upload signed RABs.

---

### Decision 3: Package String Normalization Helper

- **Decision**: Create a robust helper `normalizePaketSarpras(pengajuan)` that extracts package identifier across `jenisSarpras`, `jenis_sarpras`, `paket_sarpras`, `paketSarpras` and converts to uppercase trimmed format.
- **Rationale**: Prevents breakage caused by subtle naming differences in backend payload responses.

---

## Dependencies & Best Practices

- **Vue 3 Computed Properties**: Use reactive computed properties for `hasStorageArea`, `hasRabContent`, and `normalizedPaket`.
- **Validation Key Synchronization**: Ensure `syncProposalValidations()` in `verifikasiKabDraftStore` includes `gudangAlamat`, `gudangKoordinat`, `fotoTampakDepan`, `fotoTampakDalam`, and `rabDocument` keys regardless of package aliases.
