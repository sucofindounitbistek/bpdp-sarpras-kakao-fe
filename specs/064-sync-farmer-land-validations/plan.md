# Implementation Plan: Sync Farmer & Land Document Validations from Backend

**Branch**: `064-sync-farmer-land-validations` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

## Summary

Expose `getFarmerDocumentValidations` and `getLandDocumentValidations` in `proposal.service.ts` and `pengusulanStore`. Add `syncFarmerDocumentValidations` and `syncLandDocumentValidations` in `verifikasiKabDraftStore`. Call them in `DetailVerifikasiKabView.vue` upon page load.

---

## Technical Context

- `proposal.service.ts`
- `pengusulanStore` (`src/stores/pengusulan.ts`)
- `verifikasiKabDraftStore` (`src/stores/verifikasiKabDraft.ts`)
- `DetailVerifikasiKabView.vue`
