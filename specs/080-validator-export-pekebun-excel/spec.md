# Feature Specification: Fitur Ekspor Excel Data Pekebun & Lahan untuk Seluruh Validator (Kabupaten, Provinsi, Ditjenbun, BPDP)

**Feature Branch**: `080-validator-export-pekebun-excel`  
**Created**: 2026-09-12  
**Status**: Draft  
**Input**: User description: "Verifikasi Pekebun & Dokumen - All Validator - tambah tombol download template pekebun yang ada pada proposal ini (ada 2; templatenya dikasih mba ayu) pas di halaman tinjau pada tab my task. Pada semua validator ketika meninjau proposal di section pekebun dibuatkan fitur export pekebun dan terdapat 2 export dan keduanya excel: 1. Laporan Titik Koordinat (No, Nomor Proposal, Provinsi, Kabupaten, Nama Kelembagaan Pekebun, Nama Pekebun, NIK Pekebun, Luas Lahan (Ha), Jenis Legalitas (SHM atau SKT/GIRIK/SPORADIK), Nama Tertera di SHM, Nomor SHM, Nomor SKT/GIRIK/SPORADIK, Latitude, Longitude); 2. Laporan Profil Pekebun (No, Nama Pekebun, NIK Pekebun, KK Pekebun, Alamat Pekebun, Jenis Legalitas, No / Nama Dokumen Legalitas Lahan, Tanggal Terbit Legalitas Lahan, Luas Lahan Sesuai Legalitas (Ha), Luas Lahan (Ha))"

---

---

## Clarifications

### Session 2026-09-12

- Q: Bagaimana penyajian baris data Excel jika 1 bidang lahan memiliki poligon dengan banyak titik koordinat? → A: **1 baris per titik koordinat sudut poligon** (format standar spasial Ditjenbun; data atribut proposal, pekebun, dan lahan diduplikasi untuk setiap titik sudut koordinat berurutan).
- Q: Bagaimana bentuk tampilan tombol ekspor kedua laporan Excel tersebut di toolbar section pekebun? → A: **Satu tombol dropdown "Ekspor Data Pekebun ▾"** yang memuat 2 opsi: "Laporan Titik Koordinat (.xlsx)" dan "Laporan Profil Pekebun (.xlsx)".
- Q: Bagaimana ketentuan pengisian kolom "Nama Tertera di SHM" pada Laporan Titik Koordinat? → A: Jika jenis legalitas SHM atas nama sendiri: isi **Nama Pekebun**; Jika ada surat beda nama: isi **Nama Pemilik pada Sertifikat** (atau keterangan beda nama); Jika bukan SHM: isi strip **`-`**.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Ekspor Laporan Titik Koordinat Excel per Proposal (Priority: P1) 🎯 MVP

Sebagai Verifikator Proposal (Dinas Kabupaten, Dinas Provinsi, Ditjenbun, atau BPDP KS), ketika saya sedang meninjau rincian proposal pada bagian Data Pekebun & Lahan (baik dari antrean verifikasi "Tugasku / My Task"), saya ingin dapat mengunduh berkas Excel **Laporan Titik Koordinat** yang berisi pemetaan lengkap titik-titik koordinat spasial seluruh persil lahan pekebun yang terhubung dengan proposal tersebut, sehingga saya dapat melakukan verifikasi spasial eksternal (misalnya pada GIS/ArcGIS/Google Earth atau pencocokan database kementerian) dengan format baku.

**Why this priority**: Kebutuhan audit spasial dan verifikasi poligon lahan membutuhkan data tabular koordinat latitude & longitude yang presisi dan terhubung langsung dengan identitas pekebun dan nomor proposal.

**Independent Test**: Masuk sebagai verifikator (misal Verifikator Kabupaten atau Provinsi), buka halaman tinjau proposal dari tab My Task. Pada section data pekebun, klik tombol "Unduh Laporan Titik Koordinat". Berkas Excel (.xlsx) berhasil terunduh dengan header kolom yang sesuai format dan memuat seluruh baris koordinat persil lahan pekebun.

**Acceptance Scenarios**:

1. **Given** Verifikator membuka halaman tinjau proposal yang memiliki 1 atau lebih data pekebun dan lahan dengan koordinat,  
   **When** Verifikator menekan opsi "Laporan Titik Koordinat (.xlsx)",  
   **Then** Sistem men-generate dan mengunduh berkas Excel dengan penamaan format `Laporan_Titik_Koordinat_[NomorProposal]_[Tanggal].xlsx`.
2. **Given** Berkas Excel Laporan Titik Koordinat dibuka,  
   **Then** Kolom-kolom yang tersaji berurutan persis:  
   `No`, `Nomor Proposal`, `Provinsi`, `Kabupaten`, `Nama Kelembagaan Pekebun`, `Nama Pekebun`, `NIK Pekebun`, `Luas Lahan (Ha)`, `Jenis Legalitas (SHM atau SKT/GIRIK/SPORADIK)`, `Nama Tertera di SHM`, `Nomor SHM`, `Nomor SKT/GIRIK/SPORADIK`, `Latitude`, `Longitude`.
3. **Given** Suatu persil lahan berbentuk poligon dengan N titik batas koordinat,  
   **When** Data diekspor ke Excel,  
   **Then** Sistem mengekspor setiap titik koordinat sudut poligon sebagai 1 baris terpisah berurutan, dengan atribut proposal, kelembagaan, pekebun, dan legalitas lahan terisi lengkap di setiap barisnya.
4. **Given** Jenis legalitas lahan adalah SHM,  
   **Then** Kolom `Nomor SHM` terisi nomor sertifikat, dan kolom `Nomor SKT/GIRIK/SPORADIK` bernilai strip `-` atau kosong.  
   Sebaliknya, jika jenis legalitas adalah SKT/Girik/Sporadik, kolom `Nomor SKT/GIRIK/SPORADIK` terisi nomor dokumen, dan `Nomor SHM` bernilai strip `-`.

---

### User Story 2 - Ekspor Laporan Profil Pekebun Excel per Proposal (Priority: P1) 🎯 MVP

Sebagai Verifikator Proposal (Dinas Kabupaten, Dinas Provinsi, Ditjenbun, atau BPDP KS), ketika saya sedang meninjau rincian proposal pada bagian Data Pekebun, saya ingin dapat mengunduh berkas Excel **Laporan Profil Pekebun** yang merangkum data identitas kependudukan pekebun, alamat, serta legalitas lahannya, sehingga saya dapat memvalidasi kesesuaian data calon penerima bantuan sarpras dengan dokumen kependudukan (KTP/KK) dan alas hak lahan secara offline.

**Why this priority**: Validator membutuhkan rekapitulasi data profil pekebun dan legalitas lahan dalam bentuk spreadsheet untuk verifikasi administrasi dan arsip telaah verifikasi.

**Independent Test**: Masuk ke halaman verifikasi/tinjau proposal pada tingkat Kabupaten, Provinsi, Ditjenbun, atau BPDP. Pada toolbar section pekebun, klik "Unduh Laporan Profil Pekebun". Berkas Excel (.xlsx) terunduh dan memuat data lengkap seluruh anggota pekebun beserta data KK, NIK, alamat, dan legalitas lahan.

**Acceptance Scenarios**:

1. **Given** Verifikator membuka halaman tinjau proposal,  
   **When** Verifikator menekan opsi "Laporan Profil Pekebun (.xlsx)",  
   **Then** Sistem men-generate dan mengunduh berkas Excel dengan penamaan format `Laporan_Profil_Pekebun_[NomorProposal]_[Tanggal].xlsx`.
2. **Given** Berkas Excel Laporan Profil Pekebun dibuka,  
   **Then** Kolom-kolom yang tersaji berurutan persis:  
   `No`, `Nama Pekebun`, `NIK Pekebun`, `KK Pekebun`, `Alamat Pekebun`, `Jenis Legalitas`, `No / Nama Dokumen Legalitas Lahan`, `Tanggal Terbit Legalitas Lahan`, `Luas Lahan Sesuai Legalitas (Ha)`, `Luas Lahan (Ha)`.
3. **Given** Seorang pekebun memiliki lebih dari 1 bidang lahan yang diajukan dalam proposal,  
   **When** Laporan Profil Pekebun diekspor,  
   **Then** Setiap bidang lahan disajikan per baris dengan identitas pekebun yang bersangkutan, sehingga seluruh dokumen legalitas dan luas lahan tercatat lengkap tanpa ada yang terpotong.
4. **Given** Kolom `Luas Lahan Sesuai Legalitas (Ha)` dan `Luas Lahan (Ha)`,  
   **Then** Menampilkan angka numerik luas yang diformat konsisten (misal: desimal pemisah titik/koma dengan presisi 2 angka desimal).

---

### User Story 3 - Akses Terintegrasi Tombol Ekspor pada Seluruh Tingkat Validator (Priority: P2)

Sebagai Validator di semua tingkatan (Dinas Kabupaten di `StepVerifikasiPekebunDanDokumenProposal.vue`, serta Dinas Provinsi, Ditjenbun, dan BPDP di `PratinjauPekebunDanDokumenProposal.vue`), saya ingin tombol ekspor ini tersedia secara seragam dan mudah diakses di bagian atas (header/toolbar) section data pekebun, sehingga alur kerja peninjauan konsisten di semua peran.

**Why this priority**: Menjaga konsistensi pengalaman pengguna (UX) bagi semua validator internal lintas lembaga pemangku kepentingan.

**Independent Test**: Login berturut-turut sebagai akun Kabupaten, Provinsi, Ditjenbun, dan BPDP, lalu buka halaman tinjau proposal yang sedang aktif diverifikasi. Pastikan tombol unduh kedua template laporan excel muncul dengan desain serasi di section pekebun pada seluruh view tersebut.

**Acceptance Scenarios**:

1. **Given** Verifikator Kabupaten meninjau proposal di `StepVerifikasiPekebunDanDokumenProposal.vue` (Sub-bagian B: Daftar Calon Pekebun & CPCL),  
   **Then** Tersedia tombol ekspor data pekebun (menu dropdown atau tombol aksi) berdampingan dengan tombol aksi yang sudah ada.
2. **Given** Verifikator Provinsi, Ditjenbun, atau BPDP meninjau proposal di `PratinjauPekebunDanDokumenProposal.vue`,  
   **Then** Tersedia tombol ekspor yang sama pada header tabel/daftar data pekebun.
3. **Given** Proposal belum memiliki data pekebun atau data pekebun kosong,  
   **Then** Tombol ekspor dinonaktifkan (*disabled*) dengan tooltip penjelasan bahwa tidak ada data untuk diekspor.

---

### Edge Cases

- **Proposal dengan koordinat berupa format Poligon kompleks / WKT / GeoJSON**: Sistem harus dapat mem-parsing titik-titik koordinat latitude dan longitude dengan aman tanpa menyebabkan runtime crash.
- **Pekebun tanpa nomor KK atau nomor surat legalitas null/kosong**: Sistem menampilkan tanda strip (`-`) tanpa error `undefined`.
- **Nama Tertera di SHM**: Jika pekebun memiliki surat keterangan beda nama atau nama tertera di sertifikat berbeda, sistem memprioritaskan nama pemilik yang tertera di sertifikat / nama pekebun jika sama.
- **Proposal dengan ratusan pekebun & lahan**: Pembuatan berkas Excel harus efisien di sisi browser/server dan tidak menyebabkan freeze pada tampilan verifikasi.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST menyediakan tombol aksi ekspor Excel pada section Data Pekebun di halaman tinjau proposal untuk seluruh peran validator (Dinas Kabupaten, Dinas Provinsi, Ditjenbun, dan BPDP).
- **FR-002**: Tombol ekspor MUST menyediakan 2 pilihan laporan:
  1. **Laporan Titik Koordinat (.xlsx)**
  2. **Laporan Profil Pekebun (.xlsx)**
- **FR-003**: File ekspor Laporan Titik Koordinat MUST memiliki urutan dan penamaan header kolom sebagai berikut:
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
  13. `Latitude`
  14. `Longitude`
- **FR-004**: File ekspor Laporan Profil Pekebun MUST memiliki urutan dan penamaan header kolom sebagai berikut:
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
- **FR-005**: Tanggal Terbit Legalitas Lahan pada Laporan Profil Pekebun MUST diformat standar Indonesia yang mudah dibaca (misal: `DD-MM-YYYY` atau format tanggal Excel yang valid).
- **FR-006**: Angka Luas Lahan MUST disajikan dalam satuan Hektar (Ha) dengan format angka desimal yang valid di Excel.
- **FR-007**: Berkas hasil ekspor MUST berupa format spreadsheet Excel (.xlsx) dengan styling header yang jelas (bold, auto-width kolom).
- **FR-008**: Sistem MUST menamai berkas unduhan secara otomatis dengan format:
  - Titik Koordinat: `Laporan_Titik_Koordinat_[NomorProposal]_[YYYYMMDD].xlsx`
  - Profil Pekebun: `Laporan_Profil_Pekebun_[NomorProposal]_[YYYYMMDD].xlsx`

---

### Key Entities

- **Proposal**: Memiliki identitas nomor proposal, nama kelembagaan pekebun pemohon, nama provinsi, dan kabupaten.
- **Pekebun (FarmerProfile)**: Entitas anggota pekebun yang memuat Nama, NIK, Nomor KK, dan Alamat Pekebun.
- **Lahan (LandPlot)**: Entitas bidang lahan yang terhubung dengan pekebun dan proposal, memuat Jenis Legalitas, Nomor Legalitas, Tanggal Penerbitan Legalitas, Luas Lahan Sesuai Legalitas, Luas Lahan Pengajuan, Nama Pemilik di Legalitas / Surat Beda Nama, serta Koordinat Batas (Latitude & Longitude).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Validator dapat mengunduh berkas Excel Laporan Titik Koordinat maupun Laporan Profil Pekebun dalam waktu kurang dari 3 detik setelah mengklik tombol ekspor.
- **SC-002**: 100% kolom pada kedua berkas Excel yang diunduh cocok persis dengan susunan kolom dan penamaan yang ditentukan oleh user/template.
- **SC-003**: Berkas Excel dapat dibuka langsung di aplikasi spreadsheet (Microsoft Excel, LibreOffice Calc, Google Sheets) tanpa error "corrupted file" atau peringatan konversi format.
- **SC-004**: Fitur ekspor tersedia dan berfungsi identik di ke-4 peran validator (Kabupaten, Provinsi, Ditjenbun, BPDP).

---

## Assumptions

- Data proposal, kelembagaan, pekebun, dan lahan yang sedang ditinjau validator sudah dimuat di state halaman verifikasi atau dapat ditarik menggunakan endpoint proposal detail yang sudah ada.
- Penamaan Provinsi dan Kabupaten diambil dari data wilayah proposal atau kelembagaan pemohon.
- Jika satu pekebun memiliki lebih dari satu bidang lahan, Laporan Profil Pekebun mencantumkan tiap bidang lahan sebagai baris terpisah agar data legalitas tiap bidang tidak hilang/tertumpuk.
