# Feature Specification: Penambahan Kolom Tanggal dan Tahun Terbit Rekomtek pada Ekspor Data Ditjenbun & Excel Pekebun

**Feature Branch**: `084-export-pekebun-rekomtek-date`  
**Created**: 2026-09-14  
**Status**: Ready for Planning  
**Input**: User description: "Ditjenbun, Data hasil penarikan perlu mencantumkan kolom tanggal dan tahun terbit Rekomtek terkait dengan export excel keduanya yang pekebun tambahkan kolom tangga dan tahun terbit rekomtek"

---

## 1. Overview & Business Value

Pada alur verifikasi tingkat **Ditjenbun (Direktorat Jenderal Perkebunan)** Kementerian Pertanian, verifikator dan pemangku kepentingan melakukan penarikan data usulan proposal dan data pekebun untuk keperluan verifikasi administrasi, rekonsiliasi kelembagaan, serta audit penyaluran bantuan dana sarana dan prasarana kelapa.

Saat ini, kedua berkas ekspor spreadsheet Excel data pekebun (yaitu **Laporan Titik Koordinat** dan **Laporan Profil Pekebun**) serta data hasil penarikan daftar usulan Ditjenbun belum mencantumkan atribut tanggal dan tahun penerbitan Rekomendasi Teknis (Rekomtek). Hal ini menyulitkan auditor dan verifikator eksternal dalam merekonsiliasi periode terbitnya Rekomtek terhadap usulan pekebun yang bersangkutan.

Fitur ini menambahkan kolom **Tanggal Terbit Rekomtek** dan **Tahun Terbit Rekomtek** secara eksplisit pada kedua laporan Excel data pekebun serta memastikan rekonsiliasi data hasil penarikan usulan Ditjenbun menyajikan informasi penerbitan Rekomtek secara lengkap dan akurat.

---

## Clarifications

### Session 2026-09-14
- Q: Dari mana sistem mengambil nilai acuan Tanggal Terbit Rekomtek untuk dicantumkan ke dalam kolom laporan hasil penarikan? → A: **Tersimpan Otomatis Saat Generate**: Tanggal terbit Rekomtek otomatis tersimpan saat proses pen-generate-an Rekomtek dilakukan di sistem Ditjenbun. Tanggal yang tersimpan tersebut menjadi acuan resmi untuk nilai `Tanggal Terbit Rekomtek` (format `DD-MM-YYYY`) dan `Tahun Terbit Rekomtek` (format `YYYY`) pada kedua ekspor Excel pekebun dan data hasil penarikan usulan.
- Q: Di manakah posisi penempatan kolom Tanggal Terbit Rekomtek dan Tahun Terbit Rekomtek pada kedua laporan Excel pekebun? → A: **Option A (Sebelum Koordinat / Di Akhir Profil)**: Pada Laporan Titik Koordinat diletakkan setelah data nomor legalitas sebelum kolom `Latitude` & `Longitude` (total 16 kolom, mempertahankan atribut spasial di posisi paling akhir); pada Laporan Profil Pekebun diletakkan di akhir tabel setelah kolom `Luas Lahan (Ha)` (total 12 kolom).

---

## 2. User Scenarios & Testing *(mandatory)*

### User Story 1 - Penambahan Kolom Rekomtek pada Laporan Titik Koordinat Excel (Priority: P1) 🎯 MVP

Sebagai Verifikator Ditjenbun (atau verifikator validator lain saat meninjau usulan Ditjenbun), ketika saya mengunduh **Laporan Titik Koordinat** berformat Excel (.xlsx/.xls) dari bagian Data Pekebun pada usulan yang ditinjau, saya ingin berkas Excel tersebut memuat kolom `Tanggal Terbit Rekomtek` dan `Tahun Terbit Rekomtek`, sehingga data spasial koordinat persil lahan pekebun terhubung langsung dengan tanggal dan tahun legalitas terbitnya Rekomtek untuk keperluan audit teknis spasial kementerian.

**Why this priority**: Laporan Titik Koordinat merupakan berkas utama yang ditarik untuk evaluasi spasial GIS di Ditjenbun, sehingga tanggal dan tahun terbit Rekomtek wajib melekat pada data persil pekebun.

**Independent Test**: Buka halaman tinjau usulan Ditjenbun yang telah memiliki data Rekomtek, klik "Ekspor Data Pekebun" lalu pilih "Laporan Titik Koordinat". Buka berkas spreadsheet hasil unduhan dan pastikan kolom `Tanggal Terbit Rekomtek` dan `Tahun Terbit Rekomtek` tersaji dengan nilai yang sesuai.

**Acceptance Scenarios**:

1. **Given** Usulan telah memiliki Rekomtek yang diterbitkan pada tanggal 14 September 2026,  
   **When** Pengguna mengunduh "Laporan Titik Koordinat",  
   **Then** Berkas Excel memiliki kolom `Tanggal Terbit Rekomtek` dengan isi `14-09-2026` dan kolom `Tahun Terbit Rekomtek` dengan isi `2026` pada seluruh baris koordinat persil pekebun.
2. **Given** Usulan berstatus awal (misal: belum diterbitkan Rekomtek / dalam antrean asistensi),  
   **When** Pengguna mengunduh "Laporan Titik Koordinat",  
   **Then** Kolom `Tanggal Terbit Rekomtek` dan `Tahun Terbit Rekomtek` terisi tanda strip `-` secara konsisten tanpa menyebabkan galat format ataupun kegagalan unduhan.
3. **Given** Susunan kolom Laporan Titik Koordinat bertambah dari 14 kolom menjadi 16 kolom,  
   **Then** Lebar kolom dan penataan teks otomatis rapi (center-aligned untuk tanggal dan tahun) dan kompatibel dibuka di aplikasi spreadsheet standar.

---

### User Story 2 - Penambahan Kolom Rekomtek pada Laporan Profil Pekebun Excel (Priority: P1) 🎯 MVP

Sebagai Verifikator Ditjenbun, ketika saya mengunduh **Laporan Profil Pekebun** berformat Excel (.xlsx/.xls), saya ingin berkas tersebut mencantumkan kolom `Tanggal Terbit Rekomtek` dan `Tahun Terbit Rekomtek`, sehingga rekap kependudukan dan legalitas pekebun dapat segera dikonfirmasi periode pengesahan rekomteknya oleh pimpinan.

**Why this priority**: Menjawab kebutuhan langsung pengguna bahwa *kedua* ekspor Excel pekebun harus memiliki kolom tanggal dan tahun terbit Rekomtek untuk validasi administratif penerima bantuan sarpras.

**Independent Test**: Masuk ke halaman verifikasi usulan, pilih "Laporan Profil Pekebun" pada menu ekspor data pekebun. Berkas Excel terunduh dengan susunan kolom lengkap (12 kolom) yang memuat tanggal dan tahun terbit Rekomtek.

**Acceptance Scenarios**:

1. **Given** Usulan memiliki tanggal terbit Rekomtek yang tercatat,  
   **When** Pengguna mengunduh "Laporan Profil Pekebun",  
   **Then** Kolom `Tanggal Terbit Rekomtek` dan `Tahun Terbit Rekomtek` tercetak akurat untuk setiap baris persil pekebun.
2. **Given** Susunan kolom Laporan Profil Pekebun bertambah dari 10 kolom menjadi 12 kolom,  
   **Then** Kedua kolom baru tersebut berada pada posisi yang konsisten dan terintegrasi dengan baik di dalam tabel spreadsheet.
3. **Given** Rekomtek belum memiliki tanggal terbit,  
   **Then** Nilai kedua kolom tersebut otomatis menampilkan `-`.

---

### User Story 3 - Penyertaan Tanggal & Tahun Terbit Rekomtek pada Penarikan Data Usulan Ditjenbun (Priority: P2)

Sebagai Verifikator atau Administrator Ditjenbun, ketika saya melakukan penarikan data rekapitulasi usulan (ekspor data antrean usulan Rekomtek / ekspor daftar proposal ke CSV dan PDF), saya ingin kolom tanggal dan tahun terbit Rekomtek tercantum mendampingi nomor Rekomtek, sehingga berkas rekapitulasi usulan Ditjenbun lengkap dan sinkron dengan laporan detail pekebun.

**Why this priority**: Memastikan konsistensi istilah "Data hasil penarikan Ditjenbun" di seluruh tingkat penarikan data (baik level agregat daftar usulan maupun level rincian pekebun).

**Independent Test**: Pada halaman Antrean Usulan Rekomtek Ditjenbun, klik tombol "Ekspor Data" dan unduh berkas rekapitulasi. Pastikan informasi tanggal dan tahun terbit Rekomtek tercantum pada daftar baris usulan yang telah memiliki nomor Rekomtek.

**Acceptance Scenarios**:

1. **Given** Pengguna berada di halaman Antrean Usulan Rekomtek Ditjenbun dan membuka modal Ekspor Data,  
   **When** Pengguna mengekspor data usulan ke format CSV atau cetak ringkasan,  
   **Then** Informasi tanggal terbit dan tahun terbit Rekomtek tersaji mendampingi kolom nomor Rekomtek.
2. **Given** Usulan yang belum diterbitkan Rekomtek berada dalam antrean hasil ekspor,  
   **Then** Kolom tanggal dan tahun terbit Rekomtek terisi tanda `-`.

---

## 3. Edge Cases & Handling

- **Proposal Belum Diterbitkan/Digenerate Rekomtek**: Jika usulan belum pernah di-generate Rekomteknya di Ditjenbun, nilai tanggal dan tahun terbit Rekomtek otomatis diisi dengan karakter strip (`-`) tanpa nilai `null`, `undefined`, atau `Invalid Date`.
- **Penyimpanan Tanggal Saat Generate**: Saat verifikator Ditjenbun menekan aksi "Generate Draf Rekomtek" / menerbitkan Rekomtek, sistem menyimpan timestamp/tanggal tersebut sebagai tanggal terbit Rekomtek permanen pada data usulan (`tanggal_rekomtek`).
- **Tahun Terbit Rekomtek Berupa 4 Digit Angka Numerik**: Ekstraksi tahun dilakukan secara otomatis dari tanggal terbit tersimpan (contoh: `2026`).
- **Ukuran File dan Performa Ekspor**: Penambahan 2 kolom baru pada ribuan baris koordinat poligon pekebun tidak boleh menurunkan efisiensi pembentukan berkas spreadsheet di peramban.

---

## 4. Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST menyertakan kolom `Tanggal Terbit Rekomtek` dan `Tahun Terbit Rekomtek` pada berkas Excel **Laporan Titik Koordinat**.
- **FR-002**: Urutan header kolom pada **Laporan Titik Koordinat** MUST menjadi 16 kolom dengan susunan:
  1. `No`
  2. `Nomor Proposal`
  3. `Provinsi`
  4. `Kabupaten`
  5. `Nama Kelembagaan Pekebun`
  6. `Nama Pekebun`
  7. `NIK Pekebun`
  8. `Luas Lahan (Ha)`
  9. `Jenis Legalitas (SHM atau SKT/GIRIK/SPORADIK)`
  10. `Nama Tertera di SHM`
  11. `Nomor SHM`
  12. `Nomor SKT/GIRIK/SPORADIK`
  13. `Tanggal Terbit Rekomtek`
  14. `Tahun Terbit Rekomtek`
  15. `Latitude`
  16. `Longitude`
- **FR-003**: Sistem MUST menyertakan kolom `Tanggal Terbit Rekomtek` dan `Tahun Terbit Rekomtek` pada berkas Excel **Laporan Profil Pekebun**.
- **FR-004**: Urutan header kolom pada **Laporan Profil Pekebun** MUST menjadi 12 kolom dengan susunan:
  1. `No`
  2. `Nama Pekebun`
  3. `NIK Pekebun`
  4. `KK Pekebun`
  5. `Alamat Pekebun`
  6. `Jenis Legalitas`
  7. `No / Nama Dokumen Legalitas Lahan`
  8. `Tanggal Terbit Legalitas Lahan`
  9. `Luas Lahan Sesuai Legalitas (Ha)`
  10. `Luas Lahan (Ha)`
  11. `Tanggal Terbit Rekomtek`
  12. `Tahun Terbit Rekomtek`
- **FR-005**: Format penulisan `Tanggal Terbit Rekomtek` MUST mengikuti standar tanggal Indonesia yang mudah dibaca (`DD-MM-YYYY`, contoh: `14-09-2026`).
- **FR-006**: Format penulisan `Tahun Terbit Rekomtek` MUST disajikan dalam format tahun 4 digit (`YYYY`, contoh: `2026`).
- **FR-007**: Jika usulan belum memiliki Rekomtek yang diterbitkan atau tanggal terbit bernilai kosong, nilai pada kolom `Tanggal Terbit Rekomtek` dan `Tahun Terbit Rekomtek` MUST diisi dengan tanda strip (`-`).
- **FR-008**: Menu unduh ekspor pada komponen antarmuka validator (`DropdownEksporPekebun`) MUST memperbarui deskripsi jumlah kolom pada submenu Laporan Titik Koordinat (menjadi 16 kolom) dan Laporan Profil Pekebun (menjadi 12 kolom).
- **FR-009**: Sistem MUST mendukung penarikan data rekapitulasi usulan Ditjenbun (`exportProposal`) dengan menyertakan informasi tanggal terbit dan tahun terbit Rekomtek berdampingan dengan kolom nomor Rekomtek.

---

### Key Entities

- **Proposal / Usulan**: Memiliki atribut identifikasi usulan, status verifikasi Ditjenbun, nomor Rekomtek, dokumen Rekomtek, tanggal penerbitan Rekomtek, dan relasi data pekebun serta persil lahan.
- **Rekomtek (Rekomendasi Teknis)**: Dokumen keputusan resmi Ditjenbun yang memiliki Nomor Rekomtek, Tanggal Penerbitan / Tanggal Surat, dan Tahun Penerbitan.
- **Pekebun & Lahan**: Anggota pekebun calon penerima bantuan beserta bidang lahan dan titik koordinat poligon yang tercakup dalam usulan yang diterbitkan Rekomteknya.

---

## 5. Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% berkas Excel Laporan Titik Koordinat dan Laporan Profil Pekebun yang diunduh dari modul penarikan data memuat kolom `Tanggal Terbit Rekomtek` dan `Tahun Terbit Rekomtek` dengan header dan pemetaan data yang presisi.
- **SC-002**: Format tanggal terbit selalu valid dalam format `DD-MM-YYYY` dan tahun terbit selalu 4 digit `YYYY` (atau strip `-` bila belum terbit), tanpa ada nilai `undefined` atau `NaN` pada 100% sampel pengujian.
- **SC-003**: Waktu pembentukan dan pengunduhan berkas spreadsheet tetap instan (< 2 detik untuk usulan dengan ratusan data pekebun dan titik koordinat).
- **SC-004**: Berkas hasil unduhan dapat dibuka langsung tanpa peringatan kerusakan struktur pada aplikasi spreadsheet (Microsoft Excel, Google Sheets, LibreOffice Calc).

---

## 6. Assumptions

- Tanggal terbit Rekomtek diperoleh dari atribut tanggal terbit resmi pada usulan/dokumen Rekomtek, atau waktu pengesahan dokumen Rekomtek Ditjenbun.
- Apabila usulan berada pada tahap sebelum Rekomtek terbit (misal: verifikasi awal di tingkat kabupaten atau provinsi), kedua kolom tersebut valid menampilkan `-`.
- Penambahan kolom pada kedua berkas Excel pekebun berlaku untuk seluruh validator yang memiliki akses ke menu ekspor data pekebun dengan tetap berfokus pada kebutuhan utama Ditjenbun.
