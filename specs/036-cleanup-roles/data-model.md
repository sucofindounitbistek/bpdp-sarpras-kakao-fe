# Data Model: Role Cleanup (036-cleanup-roles)

## Updated User Role Definition (`src/types/auth.ts` / `src/stores/auth.ts`)

```typescript
export type ActiveUserRole =
  | 'PEMOHON'
  | 'DINAS_KAB'
  | 'DINAS_PROV'
  | 'DITJENBUN_VERIFIKATOR'
  | 'DITJENBUN_APPROVAL'
  | 'BPDP_VERIFIKATOR'
  | 'BPDP_APPROVAL';
```

## Active Role Details Map (`src/types/role.ts`)

| Role Key | Role Name | Scope |
|---|---|---|
| `PEMOHON` | Kelembagaan Pekebun | Pekebun / Kelompok Tani / Koperasi |
| `DINAS_KAB` | Dinas Kabupaten / Kota | Regional Kabupaten / Kota |
| `DINAS_PROV` | Dinas Provinsi | Regional Provinsi |
| `DITJENBUN_VERIFIKATOR` | Ditjenbun Verifikator | Nasional / Asistensi Pusat |
| `DITJENBUN_APPROVAL` | Ditjenbun Approval (Ketua Tim) | Nasional / Keputusan Pusat |
| `BPDP_VERIFIKATOR` | BPDP Verifikator (Staff) | Nasional / Verifikator BPDP |
| `BPDP_APPROVAL` | BPDP Approval (Kadiv) | Nasional / Persetujuan BPDP |
