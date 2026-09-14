# Data Model: Verification Queue Filters

## TypeScript Types

```typescript
export interface QueueFilterState {
  search: string;
  status: string;        // Selected status code (empty string for 'all')
  jenisSarpras: string;  // Selected sarpras code (empty string for 'all')
}
```

## Static Filter Options Source
All options are pulled dynamically from `LOCALIZATION` config inside `src/config/localization.ts` to enforce externalized wording consistency (Constitution XV):

### Status Options
Mapped from `LOCALIZATION.proposalStatus`:
- `DRAFT`: Draft
- `SUBMITTED`: Diajukan
- `REVISION_ADMIN`: Perlu Perbaikan Administrasi
- `VERIFIED_ADMIN`: Terverifikasi Administrasi
- `VERIFIED_FIELD`: Terverifikasi Lapangan
- `REKOMTEK_KAB_ISSUED`: Rekomendasi Teknis Kabupaten/Kota
- `VALIDATED_PROV`: Validasi Provinsi
- `SK_DITJENBUN_ISSUED`: SK Ditjenbun Diterbitkan
- `PKS_BPDP_SIGNED`: PKS BPDP Ditandatangani
- `DISBURSED`: Dana Disalurkan
- `COMPLETED`: Selesai
- `REJECTED`: Ditolak

### Jenis Sarpras Options
Mapped from `LOCALIZATION.jenisSarpras`.
