# Implementation Plan: Submit Storage Area & Proposal Document Validations to Backend

**Branch**: `063-submit-gudang-rab-validations` | **Date**: 2026-09-01 | **Spec**: [spec.md](./spec.md)

## Summary

Update `buildValidationPayloads()` in `StepSummaryDanSubmit.vue` to construct `storageAreaPayload` and `proposalDocPayload`. Invoke `pengusulanStore.bulkProposalDocumentValidations(proposalDocPayload)` and include `storage_area: storageAreaPayload` in `pengusulanStore.updateProposal()` upon submission and revision calls.

---

## Technical Context

- Vue 3 Composition API, Pinia Stores (`pengusulanStore`, `verifikasiKabDraftStore`).
- File: `bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepSummaryDanSubmit.vue`.
