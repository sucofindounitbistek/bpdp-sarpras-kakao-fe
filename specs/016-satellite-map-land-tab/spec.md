# Feature Specification: Peta Satelit Leaflet pada Tab Lahan & Koordinat Usulan

**Feature Branch**: `016-satellite-map-land-tab`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "bisa ga ketika ada tab lahan yang memberikan informasi koordinat tampilkan leafletnya juga, ada di beberapa menu soalnya. gunakan map yang satelit juga ya untuk semua mapnya"

---

## Background & Context

Pada aplikasi Sarpras Kakao, informasi lahan pekebun dan CPCL mencakup titik koordinat serta poligon batas lahan. Saat ini, beberapa menu (seperti modal `DetailPekebunModal.vue` pada Tab Lahan) hanya menampilkan teks koordinat secara mentah (*raw JSON/text*) tanpa tampilan peta visual Leaflet.

Selain itu, peta yang sudah ada di beberapa menu (seperti `StepDataCPCL.vue` dan `StepDataLahanPekebun.vue`) masih menggunakan *tile layer* jalan standar (OpenStreetMap), padahal untuk sektor pertanian/kebun kakao, tampilan **Peta Satelit** jauh lebih relevan untuk memverifikasi kontur tanah dan batas fisik lahan.

Fitur ini bertujuan untuk:
1. **Mengubah seluruh peta Leaflet di aplikasi** menjadi tampilan **Peta Satelit** (*Satellite Imagery Tile Layer*).
2. **Menampilkan komponen peta Leaflet interaktif** pada setiap tab/menu yang menyajikan informasi koordinat & poligon lahan (seperti `DetailPekebunModal.vue`, `StepDataLahanPekebun.vue`, `StepDataCPCL.vue`, dan modal verifikasi terkait).
3. **Menyediakan komponen reusable `SatelliteMapPreview.vue`** yang dapat dengan mudah dipasang di berbagai menu untuk menggambar poligon lahan di atas peta satelit.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Pengguna Melihat Peta Satelit di Modal Detail Pekebun (Tab Lahan) (Priority: P1)

Sebagai pengguna (Pekebun, Dinas Kabupaten, Dinas Provinsi, Ditjenbun, atau BPDP), saat saya membuka modal "Detail Pekebun" dan memilih **Tab Lahan**, saya dapat melihat peta satelit Leaflet interaktif yang secara otomatis menggambar poligon lahan pekebun tersebut beserta marker koordinatnya.

**Why this priority**: Permintaan langsung pengguna; modal detail pekebun sebelumnya hanya menampilkan teks koordinat tanpa peta.

**Independent Test**: Buka menu Master Data Pekebun atau daftar CPCL, klik tombol "Detail Pekebun", lalu berpindah ke **Tab Lahan**. Verifikasi peta Leaflet satelit muncul dan menggambar poligon area lahan.

**Acceptance Scenarios**:

1. **Given** pengguna membuka `DetailPekebunModal.vue` dan memilih Tab Lahan, **When** data koordinat poligon tersedia, **Then** peta Leaflet berbasis *Esri World Imagery (Satelit)* tampil dengan poligon hijau terisi transparan yang pas (*fit bounds*) di area kebun.
2. **Given** poligon lahan memiliki multiple titik koordinat, **When** peta dimuat, **Then** setiap titik sudut poligon diberi marker/popup urutan titik dan luas area lahan ditampilkan pada overlay info peta.
3. **Given** data koordinat kosong / belum diinput, **When** Tab Lahan dibuka, **Then** peta menampilkan pesan "Koordinat poligon belum diisi" dengan koordinat default wilayah Indonesia.

---

### User Story 2 — Standardisasi Seluruh Peta ke Mode Satelit (Priority: P1)

Sebagai pengguna di semua alur pengusulan & verifikasi, saat saya berinteraksi dengan peta input poligon (misal di `StepDataCPCL.vue` dan `StepDataLahanPekebun.vue`), tampilan dasar peta menggunakan **Tile Layer Satelit** yang jernih dan mendukung zoom detail.

**Why this priority**: Memenuhi permintaan wajib: *"gunakan map yang satelit juga ya untuk semua mapnya"*.

**Independent Test**: Buka form pengusulan CPCL (`StepDataCPCL.vue`) dan `StepDataLahanPekebun.vue`. Verifikasi peta yang muncul berkulit citra satelit (bukan peta jalan garis OpenStreetMap).

**Acceptance Scenarios**:

1. **Given** peta dimuat di halaman pengusulan CPCL atau form lahan pekebun, **When** *tile layer* dirender, **Then** URL *tile layer* yang digunakan adalah Esri World Imagery Satellite (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`) atau Google Satellite layer dengan label jalan/batas wilayah (*hybrid reference*).
2. **Given** pengguna melakukan zoom in/out pada peta satelit, **When** tingkat zoom berubah (zoom level 1-19), **Then** citra satelit tetap dimuat dengan cepat dan presisi.

---

### User Story 3 — Reusable Component `SatelliteMapPreview.vue` di Semua Tab Lahan (Priority: P2)

Sebagai pengembang, komponen `SatelliteMapPreview.vue` dibuat kapsular dan reusable sehingga dapat dipasang pada tab lahan usulan di menu verifikasi (Dinas Kabupaten, Dinas Provinsi, Ditjenbun, BPDP).

**Why this priority**: Memudahkan integrasi peta satelit di berbagai menu verifikasi usulan.

**Independent Test**: Pasang `<SatelliteMapPreview :coordinates="koordinatPoligon" :luas-lahan="luas" />` di komponen modal/tab lahan apapun dan pastikan peta otomatis memvisualisasikan poligon.

**Acceptance Scenarios**:

1. **Given** komponen `<SatelliteMapPreview>` diberi prop string / array koordinat poligon, **When** komponen di-mount, **Then** Leaflet me-render poligon satelit dengan kontrol fullscreen & zoom yang rapi.

---

## Requirements

### Functional Requirements

- **FR-001**: Seluruh peta Leaflet di aplikasi (termasuk `StepDataCPCL.vue`, `StepDataLahanPekebun.vue`, dan modal detail) HARUS menggunakan Tile Layer Satelit (`Esri World Imagery` atau `Google Satellite` dengan overlay label wilayah).
- **FR-002**: Halaman modal `DetailPekebunModal.vue` pada **Tab Lahan** HARUS menampilkan peta Leaflet interaktif yang memvisualisasikan poligon lahan pekebun berdasarkan koordinat yang tersimpan.
- **FR-003**: Dibuat komponen reusable `src/components/ui/SatelliteMapPreview.vue` yang menerima prop `coordinates` (string JSON atau array point), `luasLahan` (opsional), dan `height` (default `320px`).
- **FR-004**: Peta satelit HARUS secara otomatis melakukan `fitBounds` sesuai bounding box poligon koordinat agar poligon selalu berada tepat di tengah layar peta (*auto-center & auto-zoom*).
- **FR-005**: Poligon lahan pada peta satelit HARUS diberi style warna yang jelas: stroke garis `#066C2A` (Forest Green), ketebalan 3px, dan fill opacity `0.25`.

### Key Entities

- **SatelliteMapPreview.vue**: Komponen presentasional Leaflet peta satelit.
- **DetailPekebunModal.vue**: Modal detail pekebun dengan Tab Identitas, Tab Lahan (peta satelit), dan Tab Dokumen.
- **StepDataLahanPekebun.vue**: Form input data lahan pekebun dengan peta satelit Leaflet.
- **StepDataCPCL.vue**: Form pengusulan CPCL dengan peta satelit Leaflet.

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% peta Leaflet di aplikasi menggunakan Tile Layer Satelit.
- **SC-002**: Pengguna dapat melihat visualisasi poligon lahan pada Tab Lahan di `DetailPekebunModal.vue` tanpa perlu membaca teks JSON koordinat mentah.
- **SC-003**: Peta satelit secara otomatis terpusat (*fit bounds*) ke area poligon dalam waktu < 300ms setelah tab aktif dibuka.

---

## Assumptions

- Tile layer Esri World Imagery (`https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`) dapat diakses secara publik tanpa lisensi berbayar.
- Data koordinat disimpan dalam bentuk array `[latitude, longitude]` atau string JSON `[{"latitude": -2.5, "longitude": 120.3}, ...]`.
