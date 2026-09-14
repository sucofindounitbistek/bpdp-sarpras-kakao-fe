# Data Model: Show RAB Document using RAB_RK

The RAB document is retrieved from the `dokumen` array of the proposal:

```typescript
interface DokumenPersyaratan {
  id: string;
  tipeDokumen: 'RAB_RK' | string;
  namaFile: string;
  urlFile: string;
  ukuranBytes: number;
  isValid: boolean;
}
```

The document verification state remains mapped to the `rabDocument` key:

```typescript
interface VerificationItem {
  status: 'APPROVED' | 'REJECTED' | 'PENDING';
  notes: string;
}
```
