# Walkthrough: Add Surat Keterangan Kepala Desa Document

We added support for uploading and verifying the "Surat Keterangan Kepala Desa" document type.

## Changes Made

### Data Model & Types
- **[`src/types/pekebun.ts`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/types/pekebun.ts)**:
  - Added enum value `SURAT_KET_KADES = 'SURAT_KET_KADES'` in `TipeDokumenPekebun`.
  - Added `suratKeteranganKades` in `DokumenFormData` interface.

### Stores
- **[`src/stores/pekebun.ts`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/stores/pekebun.ts)**:
  - Mapped API document type `SURAT_KET_KADES`.
  - Appended `surat_keterangan_kades` file to FormData payload in both `create` and `update` actions.
- **[`src/stores/rekomtek.ts`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/stores/rekomtek.ts)**:
  - Added mock `SURAT_KET_KADES` documents to the 5 mock pekebun objects.

### Components & Views
- **[`src/components/master-data/StepUploadDokumenPekebun.vue`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/components/master-data/StepUploadDokumenPekebun.vue)**:
  - Added label `suratKeteranganKades` and rendered the 5th upload input slot in the wizard step.
- **[`src/views/master-data/FormPekebunView.vue`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/views/master-data/FormPekebunView.vue)**:
  - Initialized `suratKeteranganKades` on load and mapped existing documents.
  - Added required validation check for `suratKeteranganKades`.
- **[`src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue)**:
  - Implemented the side-by-side layout checking "Nama Lengkap" and "Alamat" (comparing `pekebun?.alamat`).
- **[`src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue)**:
  - Mapped document key validation rules.
- **[`src/views/dinas/provinsi/PratinjauPekebunDetailView.vue`](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/src/views/dinas/provinsi/PratinjauPekebunDetailView.vue)**:
  - Added mapping for document type labeling.

## Verification & Build Results

Production build compiles successfully:

```bash
✓ built in 9.14s
```
All tasks completed.
