# Interface Contract: Provincial Dinas Institutional Accounts (034-sidebar-lembaga-provinsi)

## Navigation Contract

### `useNavigation.ts`
Adds navigation entry under `DINAS_PROV` role array:
```typescript
{
  title: 'DINAS PROVINSI',
  role: ['DINAS_PROV'],
  items: [
    { label: 'Asistensi Surat Keterangan CPCL', to: '/dinas/verifikasi/provinsi', icon: CheckSquare },
    { label: 'Lembaga', to: '/dinas/provinsi/lembaga', icon: Building2 }
  ]
}
```

---

## Route Contract

### `router/index.ts`
```typescript
{
  path: '/dinas/provinsi/lembaga',
  name: 'dinas-provinsi-lembaga',
  component: () => import('@/views/dinas/provinsi/LembagaProvinsiView.vue'),
  meta: { roles: ['DINAS_PROV', 'DINAS_KAB'], title: 'Daftar Akun Kelembagaan Pekebun' }
}
```
