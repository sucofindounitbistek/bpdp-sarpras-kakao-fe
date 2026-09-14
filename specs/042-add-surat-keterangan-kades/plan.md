# Implementation Plan: Surat Keterangan Kades as Proposal Persyaratan

**Branch**: `042-add-surat-keterangan-kades` | **Date**: 2026-08-25 | **Spec**: [spec.md](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/specs/042-add-surat-keterangan-kades/spec.md)

## Summary

We are shifting the Surat Keterangan Kepala Desa upload field from the Pekebun master profile data to a proposal-level package document requirement.

## Proposed Changes

### Reverting Pekebun-level changes
- **[`src/types/pekebun.ts`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/types/pekebun.ts)**: Revert enum `SURAT_KET_KADES` and property `suratKeteranganKades` from `DokumenFormData`.
- **[`src/stores/pekebun.ts`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/stores/pekebun.ts)**: Revert `mapDocumentType` mapping and payload appends.
- **[`src/components/master-data/StepUploadDokumenPekebun.vue`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/components/master-data/StepUploadDokumenPekebun.vue)**: Revert upload slot additions.
- **[`src/views/master-data/FormPekebunView.vue`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/views/master-data/FormPekebunView.vue)**: Revert initial state, validations, and mapping edits.
- **[`src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue)**: Revert side-by-side template layout check panel and mapping keys check.
- **[`src/views/dinas/provinsi/PratinjauPekebunDetailView.vue`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/views/dinas/provinsi/PratinjauPekebunDetailView.vue)**: Revert `dokumenLabels` mapping.

### Adding Proposal-level changes
- **[`src/types/pengusulan.ts`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/types/pengusulan.ts)**: Add `'SURAT_KET_KADES'` to the `tipeDokumen` union.
- **[`src/lib/pengusulan-persyaratan.config.ts`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/lib/pengusulan-persyaratan.config.ts)**: Define the static requirement `SURAT_KET_KADES` and add it to `COMMON` array (loaded across all packages).
- **[`src/stores/rekomtek.ts`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/stores/rekomtek.ts)** & **[`src/stores/pengusulan.ts`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/stores/pengusulan.ts)**: Add mock `SURAT_KET_KADES` proposal documents.
- **[`src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue)**: Add key validation mapping for `SURAT_KET_KADES` so it verifies properly in the document modal checklist.

## Verification Plan

### Automated Tests
- Production build compilation (`npm run build`).

### Manual Verification
- Verify upload slot appears during proposal creation.
- Verify verifier can inspect and save status of the document.
