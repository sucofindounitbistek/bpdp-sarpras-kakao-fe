# Feature Specification: Peta Global Verifikasi & Deteksi Tumpang Tindih Lahan

**Feature Branch**: `023-verification-overlap-map`

**Created**: 2026-08-06

**Status**: Draft

**Input**: User description: "munculkan peta global pada verifikasi pekebun & dokumen untuk verifikasi dari dinas (kab kota, provinsi, ditjenbun, bpdp). buatkan 2 legend: polygon biru untuk proposal yang sedang diverifikasi, polygon merah untuk proposal lainnya. tujuannya untuk melihat apakah ada irisan atau tumpang tindih antar lahan."

---

## Clarifications

### Session 2026-08-06

- Q: Di mana peta global ditempatkan dalam layout halaman verifikasi? → A: Section collapsible di atas atau di bawah form verifikasi

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Verifikator Melihat Peta Global dengan Poligon Proposal yang Sedang Diverifikasi (Priority: P1)

Sebagai verifikator (Dinas Kab/Kota, Dinas Provinsi, Ditjenbun, atau BPDP), saat saya membuka halaman verifikasi pekebun atau verifikasi dokumen dari suatu proposal, saya dapat melihat peta global yang menampilkan poligon lahan proposal yang sedang saya verifikasi (berwarna biru) beserta poligon lahan proposal-proposal lain yang terdaftar di sistem (berwarna merah). Hal ini memungkinkan saya mendeteksi secara visual apakah ada irisan atau tumpang tindih (overlap) antara lahan proposal yang sedang diverifikasi dengan lahan proposal lainnya.

**Why this priority**: Ini adalah kebutuhan inti — verifikator harus dapat mendeteksi tumpang tindih lahan secara visual untuk mencegah duplikasi atau klaim lahan yang sama oleh proposal berbeda.

**Independent Test**: Login sebagai verifikator, buka halaman verifikasi pekebun/dokumen, cari proposal yang memiliki data poligon lahan, dan verifikasi bahwa peta global menampilkan poligon biru (proposal aktif) dan poligon merah (proposal lain) dengan legend yang jelas.

**Acceptance Scenarios**:

1. **Given** verifikator membuka halaman verifikasi (CekiDitjenbun, CekiBpdp, atau halaman verifikasi Dinas) untuk suatu proposal yang memiliki data poligon lahan, **When** halaman dimuat, **Then** peta global satelit muncul menampilkan poligon lahan proposal yang sedang diverifikasi dengan warna biru dan poligon lahan proposal lain dengan warna merah.
2. **Given** peta global ditampilkan, **When** verifikator melihat area di mana poligon biru dan merah saling tumpang tindih, **Then** area tumpang tindih terlihat jelas secara visual (warna campuran atau garis tumpang tindih yang kontras).
3. **Given** peta global ditampilkan, **When** verifikator mengklik poligon proposal lain (merah), **Then** informasi ringkasan proposal tersebut (nomor proposal, nama lembaga) muncul dalam popup.
4. **Given** tidak ada proposal lain dengan data poligon di wilayah sekitar, **When** peta dimuat, **Then** hanya poligon biru (proposal aktif) yang terlihat, dan tidak ada poligon merah.

---

### User Story 2 - Legend dan Informasi Visual yang Jelas (Priority: P2)

Peta global menampilkan legend yang jelas dan mudah dipahami: poligon biru untuk "Proposal Sedang Diverifikasi" dan poligon merah untuk "Proposal Lain". Selain itu, jika terdeteksi adanya tumpang tindih, sistem menampilkan informasi daftar proposal yang tumpang tindih beserta luas area irisan.

**Why this priority**: Legend dan informasi tumpang tindih adalah komponen pendukung yang membuat peta global dapat ditindaklanjuti (actionable) oleh verifikator.

**Independent Test**: Buka peta global pada proposal yang memiliki tumpang tindih, verifikasi legend menampilkan dua warna dengan label yang benar, dan daftar proposal yang tumpang tindih muncul di bawah atau di samping peta.

**Acceptance Scenarios**:

1. **Given** peta global ditampilkan, **When** verifikator melihat area legend, **Then** legend menampilkan kotak warna biru dengan label "Proposal Sedang Diverifikasi" dan kotak warna merah dengan label "Proposal Lain".
2. **Given** terdapat proposal yang lahannya tumpang tindih dengan proposal yang sedang diverifikasi, **When** peta dimuat, **Then** daftar nama/nomor proposal yang tumpang tindih ditampilkan beserta estimasi luas area irisan (dalam hektar).

---

### User Story 3 - Peta Global Tersedia di Seluruh Halaman Verifikasi (Priority: P3)

Peta global tersedia di semua halaman verifikasi: verifikasi pekebun dan verifikasi dokumen untuk Dinas Kab/Kota, Dinas Provinsi, Ditjenbun, dan BPDP. Tampilan dan perilaku peta konsisten di seluruh halaman tersebut.

**Why this priority**: Memastikan semua verifikator di setiap level memiliki akses yang sama ke alat deteksi tumpang tindih.

**Independent Test**: Buka halaman verifikasi di setiap role (Dinas Kab/Kota, Dinas Provinsi, Ditjenbun, BPDP) dan verifikasi peta global muncul dengan perilaku yang sama.

**Acceptance Scenarios**:

1. **Given** verifikator Dinas Kab/Kota membuka halaman verifikasi pekebun, **When** halaman dimuat, **Then** peta global tersedia dengan poligon proposal yang relevan.
2. **Given** verifikator BPDP membuka halaman CekiBpdp, **When** halaman dimuat, **Then** peta global tersedia dengan tampilan dan perilaku yang identik seperti di halaman verifikasi lainnya.

---

### Edge Cases

- Apa yang terjadi jika proposal yang sedang diverifikasi tidak memiliki data poligon lahan? Peta tetap menampilkan area default (Indonesia) dengan pesan "Proposal ini belum memiliki data poligon lahan" — poligon merah (proposal lain) tetap ditampilkan jika ada.
- Apa yang terjadi jika tidak ada proposal lain dalam radius yang relevan? Hanya poligon biru yang terlihat, legend tetap ditampilkan dengan keterangan bahwa tidak ada proposal lain di area sekitar.
- Bagaimana jika jumlah proposal lain sangat banyak (ratusan)? Peta harus tetap responsif; poligon merah ditampilkan dengan tingkat transparansi yang sesuai agar tidak menutupi peta dasar.
- Bagaimana jika data poligon proposal lain tidak lengkap atau rusak? Proposal dengan data poligon tidak valid diabaikan dan tidak ditampilkan di peta.
- Bagaimana tampilan peta pada perangkat mobile? Peta harus responsif dan dapat di-scroll/di-zoom dengan gesture touch.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem HARUS menampilkan peta global berbasis citra satelit pada halaman verifikasi pekebun dan verifikasi dokumen untuk role Dinas Kab/Kota, Dinas Provinsi, Ditjenbun, dan BPDP.
- **FR-002**: Peta global HARUS menampilkan poligon lahan proposal yang sedang diverifikasi dengan warna biru (outline dan fill transparan).
- **FR-003**: Peta global HARUS menampilkan poligon lahan proposal lain yang terdaftar di sistem dengan warna merah (outline dan fill transparan).
- **FR-004**: Peta global HARUS menampilkan legend dengan dua entri: "Proposal Sedang Diverifikasi" (biru) dan "Proposal Lain" (merah).
- **FR-005**: Sistem HARUS mendeteksi dan menampilkan daftar proposal yang lahannya tumpang tindih dengan proposal yang sedang diverifikasi, termasuk estimasi luas area irisan.
- **FR-006**: Saat verifikator mengklik poligon proposal lain (merah), sistem HARUS menampilkan popup berisi informasi ringkasan: nomor proposal dan nama lembaga.
- **FR-007**: Peta global HARUS secara otomatis menyesuaikan tampilan (fit bounds) untuk mencakup poligon proposal yang sedang diverifikasi saat pertama kali dimuat.
- **FR-008**: Peta global HARUS tersedia di seluruh halaman verifikasi: CekiDitjenbunView, CekiBpdpView, dan halaman verifikasi Dinas Kab/Kota serta Dinas Provinsi.
- **FR-009**: Peta global HARUS mendukung interaksi standar peta: zoom, pan, dan klik pada poligon.
- **FR-010**: Peta global HARUS responsif dan mendukung tampilan mobile (viewport 375px) tanpa horizontal overflow.
- **FR-011**: Peta global HARUS mendukung tema gelap (dark mode) dengan kontrol peta yang tetap terlihat kontras.
- **FR-012**: Peta global HARUS ditampilkan sebagai section yang dapat di-collapse (dibuka/tutup) di atas atau di bawah form verifikasi utama, sehingga verifikator dapat membuka atau menyembunyikannya sesuai kebutuhan tanpa mengganggu alur verifikasi.

### Key Entities

- **VerificationMap**: Komponen peta global yang menampilkan overlay poligon proposal. Atribut: poligon proposal aktif (biru), daftar poligon proposal lain (merah), legend, daftar overlap.
- **ProposalPolygon**: Data poligon lahan dari suatu proposal. Atribut: proposal ID, nomor proposal, nama lembaga, koordinat poligon (array of [lat, lng]), warna (biru/merah), informasi overlap.
- **OverlapInfo**: Informasi tumpang tindih antara dua proposal. Atribut: proposal A ID, proposal B ID, luas area irisan (hektar), persentase overlap.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Verifikator dapat melihat peta global dengan poligon proposal dalam waktu < 3 detik setelah halaman verifikasi dimuat.
- **SC-002**: 100% proposal yang memiliki data poligon lahan ditampilkan di peta global (proposal aktif dan proposal lain dalam radius yang relevan).
- **SC-003**: Verifikator dapat mengidentifikasi tumpang tindih lahan secara visual dalam waktu < 10 detik setelah peta dimuat.
- **SC-004**: Daftar proposal yang tumpang tindih ditampilkan dengan akurasi luas irisan yang dapat diverifikasi.
- **SC-005**: Peta global tersedia di 100% halaman verifikasi (Dinas Kab/Kota, Dinas Provinsi, Ditjenbun, BPDP) dengan tampilan dan perilaku yang konsisten.

---

## Assumptions

- Data poligon lahan proposal sudah tersedia di sistem (dari input pengusulan CPCL dan lahan pekebun).
- Tile layer peta satelit yang digunakan adalah Esri World Imagery atau sejenisnya, sesuai dengan standar yang sudah diterapkan di fitur 016-satellite-map-land-tab.
- Komponen peta Leaflet (`SatelliteMapPreview.vue`) yang sudah ada dapat digunakan sebagai dasar untuk membangun peta global ini.
- Proposal yang ditampilkan sebagai "proposal lain" (merah) adalah proposal yang memiliki data poligon dan berada dalam radius geografis yang relevan (misalnya dalam satu provinsi atau radius 50 km dari proposal aktif).
- Verifikator yang menjadi target pengguna adalah: DINAS_KAB, DINAS_PROV, DITJENBUN_VERIFIKATOR, BPDP_VERIFIKATOR.
- Data poligon proposal disimpan dalam format GeoJSON atau array koordinat [lat, lng] yang sudah distandarisasi di sistem.