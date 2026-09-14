# Research: Breadcrumb Role Removal & Menu-Only Navigation

## Findings & Decisions

### 1. Breadcrumb.vue Modification
Komponen `Breadcrumb.vue` saat ini menggunakan data section navigasi dari composable `useNavigation()` untuk meresolusi section title.
Di dalam `Breadcrumb.vue` lines 61-66:
```typescript
  if (matchedItemLabel) {
    // Add section if it is not "UTAMA"
    if (matchedSectionTitle && matchedSectionTitle !== 'UTAMA') {
      list.push({ label: matchedSectionTitle });
    }
```
Jika blok pengecekan `matchedSectionTitle` di atas dihilangkan, maka breadcrumb otomatis tidak akan merender item kategori role/section (seperti `DINAS KABUPATEN / KOTA` atau `BPDPKS (VERIFIKATOR)`).
Daftar navigasi langsung menghubungkan `Beranda` dengan label item menu fungsional.

### 2. Removal of Hardcoded Prop `:items`
Untuk merapikan navigasi di seluruh aplikasi dan menjamin kepatuhan terhadap peniadaan role, kita akan menghapus parameter `:items="breadcrumbs"` dari views berikut dan membiarkan `Breadcrumb.vue` meresolusi jalurnya secara dinamis berdasarkan meta rute:
- `src/views/DashboardView.vue`
- `src/views/ditjenbun/AntreanRekomtekView.vue`
- `src/views/ditjenbun/CekiDitjenbunView.vue`
- `src/views/ditjenbun/ApprovalDitjenbunView.vue`
- `src/views/dinas/ProvVerifikasiView.vue`
- `src/views/dinas/KabVerifikasiView.vue`
- `src/views/bpdp/CekiBpdpView.vue`
- `src/views/bpdp/ApprovalBpdpView.vue`

Unused local variables `breadcrumbs` dan import tipe di views tersebut juga akan dibersihkan untuk menghindari warning kompilator TypeScript (TS6133).
