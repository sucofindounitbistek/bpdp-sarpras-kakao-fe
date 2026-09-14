# Research: Align Proposal Status List with Detail Steps

## Stepper/Workflow Step Labels
In `TrackingPengusulanView.vue`, the stepper references labels from `LOCALIZATION.workflowSteps`:
- Step 1: `LOCALIZATION.workflowSteps.submitPemohon` ("Submit Proposal")
- Step 2: `LOCALIZATION.workflowSteps.rekomtekKab` ("Verifikasi Dinas Kab/Kota")
- Step 3: `LOCALIZATION.workflowSteps.asistensiProv` ("Asistensi Dinas Provinsi")
- Step 4: `LOCALIZATION.workflowSteps.rekomtekDitjenbun` ("Penerbitan Rekomtek Ditjenbun")
- Step 5: `LOCALIZATION.workflowSteps.skDirutBpdp` ("Penerbitan SK Dirut BPDP")

In addition, there are standard states outside the main stepper stages:
- `DRAFT`: Not submitted yet.
- `REVISION_ADMIN`: Step 1 warning ("Perlu Perbaikan").
- `REJECTED`: Proposal rejected ("Ditolak").

## Proposed Status Resolution Function
We will implement an helper function `getAlignedStatusLabel(status: PengajuanStatus): string`:
- `DRAFT` -> "Draft"
- `REVISION_ADMIN` -> "Perlu Perbaikan"
- `SUBMITTED`, `VERIFIED_ADMIN`, `VERIFIED_FIELD` -> `LOCALIZATION.workflowSteps.rekomtekKab` ("Verifikasi Dinas Kab/Kota")
- `REKOMTEK_KAB_ISSUED` -> `LOCALIZATION.workflowSteps.asistensiProv` ("Asistensi Dinas Provinsi")
- `VALIDATED_PROV` -> `LOCALIZATION.workflowSteps.rekomtekDitjenbun` ("Penerbitan Rekomtek Ditjenbun")
- `SK_DITJENBUN_ISSUED` -> `LOCALIZATION.workflowSteps.skDirutBpdp` ("Penerbitan SK Dirut BPDP")
- `PKS_BPDP_SIGNED`, `DISBURSED`, `COMPLETED` -> "Selesai" (or `LOCALIZATION.stepStatus.completed` / "Selesai")
- `REJECTED` -> "Ditolak"
