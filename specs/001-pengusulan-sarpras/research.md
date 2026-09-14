# Research: Modul Pengusulan Sarpras BPDP

**Feature**: Modul Pengusulan Sarpras (Specs: `specs/001-pengusulan-sarpras/spec.md`)

## 1. Component & Architecture Decisions

### Decision 1: Form Multi-Step Wizard State Management
- **Decision**: Menggunakan `useFormWizard.ts` composable (Pinia + Vue 3 Composition API) untuk mengontrol tahap navigasi wizard dan persitensi draft form lokal.
- **Rationale**: Form pengusulan memiliki 4 tahap utama (Profil Lembaga, Data CPCL, Paket Sarpras, Upload Berkas). Pengguna dapat menyimpan draft sementara dan tidak kehilangan inputan saat perpindahan step.
- **Alternatives Considered**: Direct single-page form dengan scroll. Ditolak karena terlalu panjang dan menyulitkan pengisian di perangkat mobile/tablet daerah.

### Decision 2: Geotagging & Poligon Lahan CPCL
- **Decision**: Menyimpan data koordinat poligon lahan sebagai GeoJSON string / array latitude-longitude pada objek CPCL.
- **Rationale**: Memudahkan pemetaaan peta interaktif (Leaflet / Mapbox) di masa depan serta validasi tumpang tindih lahan.
- **Alternatives Considered**: Hanya menyimpan titik koordinat tunggal (Point). Ditolak karena verifikasi lahan CPCL membutuhkan kepastian batas poligon fisik lahan.

### Decision 3: Document Upload & File Handling
- **Decision**: Menggunakan `FileUpload.vue` UI Primitive berbasis SVG dengan skema validasi tipe MIME (PDF, PNG, JPG) dan batas ukuran 5MB per berkas.
- **Rationale**: Memenuhi standar konsistensi visual di `DESIGN.md` dan menjamin performa unggah di wilayah dengan bandwidth terbatas.
- **Alternatives Considered**: Menggunakan emoji status atau komponen native tanpa preview. Ditolak sesuai aturan perbaikan di `DESIGN.md`.

### Decision 4: Workflow State & Access Control (RBAC Guard)
- **Decision**: Menggunakan Enum Status Workflow `PengajuanStatus` di Vue Router guard (`meta.roles`) dan Pinia Store (`auth.ts`).
- **Rationale**: Memastikan tiap role pengguna (PEMOHON, DINAS_KAB, DINAS_PROV, DITJENBUN, BPDPKS) hanya dapat melihat dan mengeksekusi aksi yang sesuai dengan hak aksesnya.
- **Alternatives Considered**: Hardcoded role check per tombol di tiap View. Ditolak karena rawan kebocoran akses.
