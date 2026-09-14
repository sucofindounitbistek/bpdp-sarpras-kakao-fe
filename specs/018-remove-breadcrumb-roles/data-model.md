# Data Model: Breadcrumb Role Removal & Menu-Only Navigation

## Entity Definitions

Fitur ini murni perubahan presentasi UI dan perilaku navigasi klien. Tidak ada perubahan skema database atau model data domain pada backend.

## BreadcrumbItem Model (Client-side)
Struktur data item breadcrumb yang dikonsumsi oleh template `Breadcrumb.vue`:

```typescript
export interface BreadcrumbItem {
  label: string;  // Teks yang ditampilkan pada menu navigasi
  to?: string;    // Jalur router link (opsional jika leaf node / active item)
  active?: boolean; // Indikator halaman aktif saat ini
}
```

Struktur ini tetap dipertahankan untuk menjamin kecocokan tipe data internal dengan vue-router.
Kategori role/section title (`matchedSectionTitle` dari `useNavigation()`) tidak lagi dimasukkan ke dalam daftar `BreadcrumbItem[]` yang dihasilkan.
