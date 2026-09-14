# Data Model: Align Proposal Status List with Detail Steps

## Mapping Function Signature

```typescript
function getAlignedStatusLabel(status: string): string
```

## Mapping Logic Mappings
We will resolve labels dynamically from `LOCALIZATION` inside `TrackingPengusulanView.vue`:

```typescript
const getAlignedStatusLabel = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'Draft';
    case 'REVISION_ADMIN':
      return 'Perlu Perbaikan';
    case 'SUBMITTED':
    case 'VERIFIED_ADMIN':
    case 'VERIFIED_FIELD':
      return LOCALIZATION.workflowSteps.rekomtekKab; // "Verifikasi Dinas Kab/Kota"
    case 'REKOMTEK_KAB_ISSUED':
      return LOCALIZATION.workflowSteps.asistensiProv; // "Asistensi Dinas Provinsi"
    case 'VALIDATED_PROV':
      return LOCALIZATION.workflowSteps.rekomtekDitjenbun; // "Penerbitan Rekomtek Ditjenbun"
    case 'SK_DITJENBUN_ISSUED':
      return LOCALIZATION.workflowSteps.skDirutBpdp; // "Penerbitan SK Dirut BPDP"
    case 'PKS_BPDP_SIGNED':
    case 'DISBURSED':
    case 'COMPLETED':
      return 'Selesai';
    case 'REJECTED':
      return 'Ditolak';
    default:
      return status;
  }
};
```
