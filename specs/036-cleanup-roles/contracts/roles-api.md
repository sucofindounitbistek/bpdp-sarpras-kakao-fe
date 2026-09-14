# Interface Contract: Active User Roles (036-cleanup-roles)

## Role Selection Dropdown Contract: `src/components/ui/RoleSwitcher.vue`

```typescript
const roles = [
  { id: 'PEMOHON', label: 'Kelembagaan Pekebun', shortLabel: 'Pemohon' },
  { id: 'DINAS_KAB', label: 'Dinas Kab/Kota', shortLabel: 'Dinas Kab' },
  { id: 'DINAS_PROV', label: 'Dinas Provinsi', shortLabel: 'Dinas Prov' },
  { id: 'DITJENBUN_VERIFIKATOR', label: 'Ditjenbun Verifikator', shortLabel: 'Verif Ditjen' },
  { id: 'DITJENBUN_APPROVAL', label: 'Ditjenbun Approval (Ketua)', shortLabel: 'Approve Ditjen' },
  { id: 'BPDP_VERIFIKATOR', label: 'BPDP Verifikator (Staf)', shortLabel: 'Verif BPDP' },
  { id: 'BPDP_APPROVAL', label: 'BPDP Approval (Kadiv)', shortLabel: 'Approve BPDP' },
];
```
