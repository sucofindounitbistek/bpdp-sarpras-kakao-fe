# Implementation Plan: Dynamic Verification Action Button for Rejection & Revision (035-revisi-button-verifikasi)

**Branch**: `035-revisi-button-verifikasi` | **Date**: 2026-08-14 | **Spec**: [`spec.md`](./spec.md)

**Input**: Feature specification from `/specs/035-revisi-button-verifikasi/spec.md`

## Summary

This feature updates proposal verification components in Dinas Kabupaten (`StepVerifikasiPekebunDanDokumenProposal.vue`, `StepDataCPCL.vue`, `StepSummaryDanSubmit.vue`) and Dinas Provinsi (`StepDataCPCL.vue`, `StepSummaryDanSubmit.vue`) so that whenever one or more items/documents are marked as rejected ("Tolak" / `REJECTED`), the primary bottom action button dynamically transforms from "Lanjut / Submit" to **"Kembalikan Untuk Revisi"** (`bg-rose-600` / `RotateCcw`), directly triggering the rejection & return workflow rather than advancing steps.

## Technical Context

**Language/Version**: Vue 3 (Composition API `<script setup>`), TypeScript (Strict Mode)  
**Primary Dependencies**: Vue Router, Lucide Vue Next (`RotateCcw`, `XCircle`, `ArrowRight`, `CheckCircle`)  
**Storage**: Pinia stores (`verifikasiKabDraft.ts`, `pengusulan.ts`, `pekebun.ts`)  
**Testing**: Manual runtime verification & strict type-checking (`vue-tsc -b`)  
**Target Platform**: Responsive Web (Mobile to Desktop)  
**Project Type**: Vue 3 Frontend Single-Page Application  
**Scale/Scope**: 4 files modified (`StepVerifikasiPekebunDanDokumenProposal.vue`, `StepDataCPCL.vue`, `StepSummaryDanSubmit.vue`, `localization.ts`)  

## Constitution Check

- [x] **Principle I (Vue 3 SFC & Component Architecture)**: View components use `<script setup>`.
- [x] **Principle II (Strict TypeScript)**: Reactive computed boolean properties.
- [x] **Principle IV & X (UI/UX Pro Max Standards)**: Dynamic button transformation with distinct rose/emerald styling.
- [x] **Principle XV (Mandatory Wording Externalization)**: Externalized wording in `src/config/localization.ts`.

## Proposed Changes

### Configuration Layer
#### [MODIFY] [`localization.ts`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/config/localization.ts)
Add `verification` dictionary containing `returnForRevision` ("Kembalikan Untuk Revisi"), `rejectionNotesWarning`, and `rejectionSuccessToast`.

### View & Component Layer

#### [MODIFY] [`StepVerifikasiPekebunDanDokumenProposal.vue`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue)
- Compute `hasRejectedItems` reactively across all document & pekebun verification items.
- Update bottom action section: replace dual buttons with a single dynamic primary button:
  - `hasRejectedItems === true`: Render **"Kembalikan Untuk Revisi"** (`bg-rose-600`), calling `submitRejection()`.
  - `hasRejectedItems === false`: Render **"Simpan & Lanjut ke SK CPCL"** (`bg-[#066C2A]`), calling `validateAndProceed()`.

#### [MODIFY] [`StepDataCPCL.vue`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepDataCPCL.vue)
- Add dynamic button toggle logic for SK CPCL verification step.

#### [MODIFY] [`StepSummaryDanSubmit.vue`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepSummaryDanSubmit.vue)
- Enforce dynamic button toggle logic for summary submit step.

## Verification Plan

### Automated Tests
- Type checking: `npx vue-tsc -b`

### Manual Verification
1. Navigate to Dinas Kabupaten verification `/dinas/verifikasi/kabupaten/1`.
2. Verify primary button is "Simpan & Lanjut ke SK CPCL" when no items are rejected.
3. Reject 1 document ("Tolak" + reason note).
4. Verify primary button dynamically transforms to **"Kembalikan Untuk Revisi"** (rose red).
5. Click "Kembalikan Untuk Revisi" and confirm rejection modal returns proposal to Pemohon for revision.
