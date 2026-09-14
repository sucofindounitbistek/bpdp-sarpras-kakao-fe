# Research: Peta Global Verifikasi & Deteksi Tumpang Tindih Lahan

**Feature**: 023-verification-overlap-map
**Date**: 2026-08-06

## Decision 1: Base Map Component Strategy

**Decision**: Buat komponen baru `VerificationOverlapMap.vue` yang extend pattern `SatelliteMapPreview.vue`, bukan modifikasi `SatelliteMapPreview.vue`.

**Rationale**:
- `SatelliteMapPreview` dibuat untuk single-polygon read-only preview
- `VerificationOverlapMap` butuh multi-polygon rendering, legend, popup, dan overlap detection
- Memisahkan komponen menghindari regresi pada existing usage `SatelliteMapPreview`
- Keduanya share tile layer config dan Leaflet initialization pattern yang sama

**Alternatives considered**:
- Modifikasi `SatelliteMapPreview` agar support multi-polygon: Rejected - terlalu banyak conditional logic, melanggar Single Responsibility
- Gunakan `@vue-leaflet/vue-leaflet` components: Rejected - project sudah menggunakan direct Leaflet API; konsistensi lebih penting

## Decision 2: Overlap Detection Algorithm

**Decision**: Client-side polygon intersection menggunakan library `turf.js` (`@turf/turf`) untuk menghitung `intersect` dan `area`.

**Rationale**:
- `turf.js` adalah library GIS standar untuk operasi geometri di browser
- `turf.intersect(poly1, poly2)` mengembalikan polygon intersection
- `turf.area(intersection)` mengembalikan luas dalam meter persegi
- Tidak perlu backend baru; semua data poligon sudah ada di client (mock stores)

**Alternatives considered**:
- Custom intersection algorithm: Rejected - kompleks, rawan bug, reinvent wheel
- Backend endpoint untuk overlap detection: Rejected - tidak ada backend endpoint yang tersedia, melanggar Konstitusi XIII (tidak boleh invent endpoint)

## Decision 3: Leaflet Multi-Polygon Rendering

**Decision**: Gunakan `L.polygon()` untuk setiap proposal dengan warna berbeda, `L.layerGroup()` untuk grouping, dan `L.control()` custom untuk legend.

**Rationale**:
- Pattern sudah proven di `SatelliteMapPreview`, `StepDataCPCL`, `StepDataLahanPekebun`
- `L.polygon` support `bindPopup()` untuk info proposal
- `L.control({ position: 'bottomright' })` untuk legend custom HTML
- Warna: biru (`#2563EB`, opacity 0.3) untuk proposal aktif, merah (`#DC2626`, opacity 0.2) untuk proposal lain

**Alternatives considered**:
- `L.geoJSON()` layer: Rejected - overkill; data poligon bukan GeoJSON FeatureCollection
- Canvas-based rendering: Rejected - Leaflet SVG sudah cukup untuk jumlah poligon yang diharapkan (< 100)

## Decision 4: Data Source for "Other Proposals"

**Decision**: Ambil dari `useRekomtekStore().listUsulan` dan `usePekebunStore().listPekebun`, filter berdasarkan radius geografis (50 km dari centroid proposal aktif).

**Rationale**:
- Data sudah tersedia di Pinia stores (mock data)
- Filter radius mengurangi beban rendering (tidak perlu render semua proposal di Indonesia)
- Centroid proposal aktif dihitung dari rata-rata koordinat poligon

**Alternatives considered**:
- Semua proposal di sistem: Rejected - tidak scalable, peta terlalu penuh
- Filter berdasarkan provinsi: Rejected - proposal bisa lintas provinsi, radius geografis lebih akurat

## Decision 5: Collapsible Section Implementation

**Decision**: Gunakan komponen section dengan `v-model` toggle, animasi `transition-all`, dan ikon `ChevronDown`/`ChevronUp` dari lucide-vue-next.

**Rationale**:
- Pattern sudah ada di proyek (card dengan expand/collapse)
- Tidak perlu library accordion eksternal
- State default: collapsed (tidak mengganggu alur verifikasi utama)

**Alternatives considered**:
- Modal: Rejected oleh user (memilih section collapsible)
- Tab: Rejected - menambah kompleksitas navigasi yang tidak perlu

## Decision 6: Turf.js Integration

**Decision**: Install `@turf/turf` sebagai dependency baru.

**Rationale**:
- `turf.intersect()` dan `turf.area()` adalah fungsi yang dibutuhkan untuk overlap detection
- Library sudah mature dan widely used di GIS web applications
- Bundle size: dapat di-tree-shake karena hanya import fungsi yang dibutuhkan

**Alternatives considered**:
- `jsts` (Java Topology Suite port): Rejected - lebih berat, dokumentasi kurang
- Manual calculation: Rejected - tidak akurat untuk proyeksi geografis