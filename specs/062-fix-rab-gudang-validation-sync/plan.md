# Implementation Plan: Sync Existing RAB and Storage Area Validation Statuses

**Branch**: `062-fix-rab-gudang-validation-sync` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

## Summary

Expand `syncProposalValidations()` in `verifikasiKabDraftStore.ts` to map `RAB_RK` / `RAB_PROPOSAL` to `rabDocument` and sync `storage_area` validation properties into `gudangAlamat`, `gudangKoordinat`, `fotoTampakDepan`, `fotoTampakDalam`. Update `StepVerifikasiPekebunDanDokumenProposal.vue` for safe rendering.

---

## Technical Context

- Vue 3 Composition API, Pinia Stores (`verifikasiKabDraftStore`), TypeScript Strict Mode.
- `syncProposalValidations(validations, documents, proposal)` in `src/stores/verifikasiKabDraft.ts`.
- `StepVerifikasiPekebunDanDokumenProposal.vue` and `DetailVerifikasiKabView.vue`.

---

## Project Structure

```text
bpdp-sarpras-kelapa-fe/src/
├── stores/
│   └── verifikasiKabDraft.ts                       # Expand syncProposalValidations
└── views/
    └── dinas/
        └── kabupaten/
            ├── DetailVerifikasiKabView.vue         # Pass proposal object to syncProposalValidations
            └── StepVerifikasiPekebunDanDokumenProposal.vue # Optional chaining for getDokumen('RAB_RK')
```
