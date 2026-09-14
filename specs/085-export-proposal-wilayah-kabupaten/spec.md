# Feature Specification: Export Data Proposal Dinas Kabupaten Sesuai Wilayah Terkait

**Feature Branch**: `085-export-proposal-wilayah-kabupaten`

**Created**: 2026-09-14

**Status**: Ready for Planning

**Input**: User description: "Export data di list proposal pada role Dinas Kabupaten/Kota hanya bisa narik data dari wilayah terkait filter per wilayah untuk downloadnya, belum bisa dikerjain karena api wilayah belum jadi"

## Clarifications

### Session 2026-09-14

- Q: Acuan apa yang dijadikan dasar pencocokan wilayah usulan proposal dengan wilayah tugas Dinas Kabupaten saat ekspor? → A: Option C (Pencocokan Berlapis / Hybrid Matching): Utamakan pencocokan ID/kode numerik wilayah (`regency_id` atau `kode_kabupaten`), dengan fallback pencocokan nama kabupaten via standard helper `getKabupatenNama()`.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Pembatasan Data Ekspor Sesuai Wilayah Tugas Dinas Kabupaten (Priority: P1)

Sebagai verifikator/petugas Dinas Kabupaten/Kota, saya ingin mengekspor data daftar proposal (dalam format CSV maupun PDF) sehingga data yang ditarik hanya mencakup usulan proposal dari wilayah kabupaten/kota yang menjadi kewenangan saya tanpa bercampur dengan data kabupaten/kota lain.

**Why this priority**: Menjaga integritas dan kerahasiaan data lintas wilayah administratif daerah, memastikan petugas dinas kabupaten hanya mengunduh data yang relevan dengan yurisdiksinya.

**Independent Test**: Masuk sebagai akun dengan peran Dinas Kabupaten (misal: Kabupaten Luwu Utara), buka antrean verifikasi proposal, buka modal ekspor, lalu unduh data CSV/PDF. Pastikan seluruh baris data yang diekspor berasal dari wilayah kabupaten terkait.

**Acceptance Scenarios**:

1. **Given** pengguna terautentikasi dengan peran `DINAS_KAB` yang terdaftar pada wilayah kabupaten tertentu, **When** pengguna membuka modal ekspor dan memicu unduh berkas CSV atau PDF, **Then** sistem hanya menyertakan proposal yang berlokasi pada kabupaten kewenangan pengguna tersebut.
2. **Given** terdapat data proposal dari kabupaten lain di dalam sistem, **When** proses penarikan data ekspor dieksekusi oleh akun Dinas Kabupaten, **Then** sistem secara ketat mengecualikan seluruh usulan dari luar wilayah kabupaten pengguna dari hasil unduhan dan hitungan ringkasan pratinjau ekspor.

---

### User Story 2 - Penanganan Filter Per Wilayah yang Ditunda Karena Ketiadaan API Wilayah (Priority: P2)

Sebagai pengguna Dinas Kabupaten/Kota, saya ingin memahami cakupan wilayah ekspor yang sedang aktif tanpa kebingungan mencari filter wilayah per kecamatan/desa yang belum tersedia karena API Wilayah masih dalam tahap pengembangan.

**Why this priority**: Menghindari kebingungan pengguna (*user expectation mismatch*) akibat fitur pemilih wilayah terperinci yang belum dapat diimplementasikan sampai backend API Wilayah rampung.

**Independent Test**: Buka modal ekspor pada tampilan antrean Dinas Kabupaten, amati area opsi filter; pastikan filter tingkat wilayah tidak membingungkan pengguna dan menampilkan indikasi cakupan wilayah otomatis sesuai profil dinas pengguna.

**Acceptance Scenarios**:

1. **Given** modal ekspor dibuka oleh petugas Dinas Kabupaten, **When** antarmuka filter ditampilkan, **Then** sistem menampilkan info card/badge informatif bertuliskan **"Cakupan Wilayah: [Nama Kabupaten]"** (misal: *Kabupaten Luwu Utara*) dengan indikasi status terkunci otomatis sesuai wilayah penugasan pengguna.
2. **Given** filter per wilayah belum dapat dioperasikan secara dinamis melalui API, **When** ekspor dijalankan, **Then** sistem secara otomatis menerapkan filter wilayah berbasis identitas wilayah akun dinas yang aktif tanpa memerlukan pemilihan manual oleh pengguna.

---

### User Story 3 - Konsistensi Hitungan Pratinjau dan Format Berkas Ekspor (Priority: P3)

Sebagai petugas Dinas Kabupaten, saya ingin jumlah proposal yang tertera pada banner pratinjau ekspor (*live match count*) sama persis dengan jumlah baris data yang dihasilkan pada berkas CSV dan dokumen PDF yang diunduh.

**Why this priority**: Memberikan kepastian angka sebelum mengunduh dan mencetak laporan resmi untuk keperluan dinas.

**Independent Test**: Cocokkan angka pada indikator "Total data yang akan diekspor: X Proposal" dengan jumlah baris di file CSV dan tabel PDF setelah filter tanggal/status diterapkan.

**Acceptance Scenarios**:

1. **Given** filter status atau rentang tanggal dipilih di dalam modal ekspor, **When** sistem menghitung jumlah data yang cocok, **Then** hitungan hanya mencakup data proposal yang sesuai filter dan berada di wilayah kabupaten pengguna.
2. **Given** berkas CSV atau PDF diunduh, **When** isi dokumen dibuka, **Then** total baris dan data wilayah (kabupaten) seluruhnya konsisten dengan filter wilayah otomatis dinas kabupaten.

---

### Edge Cases

- **Akun Dinas Kabupaten Tanpa Wilayah Terdefinisi**: Jika profil akun Dinas Kabupaten tidak memiliki informasi kabupaten/kota yang valid, sistem harus menampilkan peringatan bahwa wilayah kerja belum terkonfigurasi dan mencegah penarikan data proposal luar wilayah.
- **Proposal dengan Titik Lahan Lintas Batas**: Jika usulan memiliki lahan di perbatasan, proposal hanya ditarik jika wilayah kabupaten kelembagaan pengusul atau titik koordinatnya sesuai dengan penugasan dinas kabupaten.
- **Kondisi Data Kosong**: Jika tidak ada proposal pada wilayah terkait untuk filter status/tanggal tertentu, sistem menampilkan jumlah 0 proposal pada pratinjau dan mencegah unduhan berkas kosong dengan pesan peringatan yang informatif.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST memastikan proses ekspor data proposal (CSV dan PDF) pada antarmuka Dinas Kabupaten/Kota hanya menarik data usulan yang berada di wilayah administratif kabupaten/kota dinas yang bersangkutan.
- **FR-002**: Sistem MUST meniadakan ketergantungan pada API Wilayah yang belum tersedia untuk proses penarikan data ekspor dengan menerapkan pembatasan wilayah otomatis berbasis profil pengguna dinas aktif.
- **FR-003**: Sistem MUST menghitung indikator pratinjau total data (*match count*) pada modal ekspor dengan memperhitungkan batasan wilayah dinas aktif, sehingga jumlah yang ditampilkan akurat sebelum tombol unduh ditekan.
- **FR-004**: Sistem MUST menerapkan mekanisme scoping data wilayah secara berlapis: meneruskan parameter wilayah (`regency_id` / identitas kabupaten) ke API penarikan ekspor dan menjalankan sanitasi/penyaringan di sisi klien (*client-side filtering*) untuk memastikan tidak ada proposal luar wilayah yang lolos ke dalam berkas unduhan.
- **FR-005**: Sistem MUST menampilkan info card/badge informatif pada modal ekspor untuk peran Dinas Kabupaten yang menegaskan cakupan wilayah kerja aktif dan memberitahukan bahwa penyaringan wilayah terkunci otomatis.
- **FR-006**: Sistem MUST menyediakan penanganan pesan yang jelas (*fallback message*) jika tidak ditemukan proposal di wilayah kabupaten dinas terkait untuk kriteria filter yang dipilih.
- **FR-007**: Sistem MUST menerapkan aturan pencocokan wilayah berlapis (*hybrid matching rule*): mengutamakan verifikasi kecocokan `regency_id` atau `kode_kabupaten`, dan menggunakan fallback pencocokan nama kabupaten dinas melalui standard helper `getKabupatenNama()` guna memastikan seluruh variasi format data usulan tersaring dengan presisi.

### Key Entities

- **Proposal**: Dokumen usulan bantuan sarpras kelapa yang memiliki atribut lokasi wilayah (kabupaten/kota dan provinsi) baik pada level kelembagaan maupun sebaran lahan pekebun.
- **User Dinas Kabupaten**: Pengguna sistem terautentikasi dengan peran `DINAS_KAB` yang terikat pada satu wilayah kabupaten/kota operasional (`regency_id`, `province_id`, `nomenklatur_dinas`).
- **Export Filter Context**: Parameter penyaring ekspor (rentang tanggal, status proposal, paket sarpras, dan pembatasan cakupan wilayah kabupaten).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% proposal yang dihasilkan dalam berkas ekspor CSV dan PDF oleh akun Dinas Kabupaten terbukti berasal dari wilayah kabupaten/kota yang ditugaskan kepada akun tersebut.
- **SC-002**: 0 kasus kebocoran data proposal dari kabupaten lain pada hasil unduhan peran Dinas Kabupaten.
- **SC-003**: Selisih antara angka pada banner pratinjau jumlah ekspor dengan jumlah baris dokumen unduhan adalah 0 (100% akurat).
- **SC-004**: Proses penyiapan data ekspor wilayah kabupaten selesai dalam waktu kurang dari 3 detik untuk volume proposal hingga 500 usulan.

## Assumptions

- Akun Dinas Kabupaten yang telah masuk ke dalam aplikasi memiliki atribut identitas wilayah (nama kabupaten, kode kabupaten, atau `regency_id`) yang dapat diakses melalui data sesi pengguna (`authStore.user`) atau pemetaan wilayah dinas (`getKabupatenNama`).
- Fitur pemilih wilayah bertingkat (dropdown Kecamatan / Desa) untuk penyaringan ekspor ditangguhkan (*deferred*) hingga API Wilayah resmi selesai diimplementasikan di sisi backend.
- Komponen `ExportProposalModal` yang digunakan bersama lintas peran dapat menerima parameter pembatasan cakupan wilayah khusus ketika dipanggil dari tampilan antrean verifikasi Dinas Kabupaten (`QueueVerifikasiKabView`).
