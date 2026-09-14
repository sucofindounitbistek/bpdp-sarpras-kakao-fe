# Implementation Plan: Rename Nomor Resi to Nomor Proposal

**Branch**: `010-rename-resi-to-proposal` | **Date**: 2026-08-04 | **Spec**: [spec.md](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/specs/010-rename-resi-to-proposal/spec.md)

## Summary

This plan covers renaming all UI-level occurrences of "Nomor Resi", "No. Resi", and "Resi" to "Nomor Proposal", "No. Proposal", and "Proposal" respectively. Variable names and store keys will be left unchanged to preserve codebase payload integrity.

## Technical Context

- **Language/Version**: TypeScript / Vue 3
- **Storage**: Pinia state remains untouched (stores `nomorResi` parameter as-is).
- **Constraints**: Only update text nodes, placeholders, breadcrumb labels, and toast messages in HTML templates.

## Proposed Changes

We will edit the user-facing text nodes in the following 7 view files:

### 1. Module Pengusulan
#### [MODIFY] [TrackingPengusulanView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/pengusulan/TrackingPengusulanView.vue)
- Update breadcrumb label detail from "Detail - resi" to "Detail - Proposal: nomorResi".
- Rename table header from "Nomor Resi" to "Nomor Proposal".
- Rename details label from "Nomor Resi" to "Nomor Proposal".
- Rename search input placeholder to "Cari nomor proposal, lembaga...".

#### [MODIFY] [StepPilihPekebunLahan.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/pengusulan/StepPilihPekebunLahan.vue)
- Update submission success toast message from "Nomor Resi:" to "Nomor Proposal:".

### 2. Module Dinas & Ditjenbun Verification queues
#### [MODIFY] [PenetapanPlenoView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/ditjenbun/PenetapanPlenoView.vue)
- Update table header from "Nomor Resi" to "Nomor Proposal".

#### [MODIFY] [QueueVerifikasiProvinsiView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/dinas/provinsi/QueueVerifikasiProvinsiView.vue)
- Update table header from "Nomor Resi" to "Nomor Proposal".

#### [MODIFY] [DetailVerifikasiProvinsiView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/dinas/provinsi/DetailVerifikasiProvinsiView.vue)
- Update header resi label: "Resi: {{ nomorResi }}" to "Proposal: {{ nomorResi }}".

#### [MODIFY] [QueueVerifikasiKabView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/dinas/kabupaten/QueueVerifikasiKabView.vue)
- Update table header from "Nomor Resi" to "Nomor Proposal".

#### [MODIFY] [DetailVerifikasiKabView.vue](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/src/views/dinas/kabupaten/DetailVerifikasiKabView.vue)
- Update header resi label: "Resi: {{ nomorResi }}" to "Proposal: {{ nomorResi }}".

## Verification Plan

### Automated Tests
- Run `npx vue-tsc -b` and `npm run build` to verify there are no typescript breaks.

### Manual Verification
- Check all modified pages in browser to ensure they display "Nomor Proposal" or "Proposal" in headers, details, breadcrumbs, and search inputs.
