# Interface Contract: Show REV_FROM_PROV Status in QueueVerifikasiKabView

## Badge Variant Mapping Contract

```typescript
const getBadgeVariant = (status: string) => {
  switch (status) {
    case 'SUBMITTED':
    case 'KAB_SUBMITTED':
      return 'info';
    case 'REV_FROM_PROV':
    case 'VERIFIED_ADMIN':
    case 'VERIFIED_FIELD':
      return 'warning';
    case 'REKOMTEK_KAB_ISSUED':
    case 'VALIDATED_PROV':
      return 'success';
    case 'REVISION_ADMIN':
    case 'REV_FROM_KAB':
      return 'danger';
    default:
      return 'secondary';
  }
};
```
