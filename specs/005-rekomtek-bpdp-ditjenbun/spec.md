# Feature Specification: Verifikasi Rekomtek dan SK Dirut (Ditjenbun & BPDP)

**Feature Branch**: `005-rekomtek-bpdp-ditjenbun`

**Created**: 2026-07-31

**Status**: Draft

**Input**: User description: "buat agar ditjenbun verifikator dan ketua dipisah rolenya dan pada Verifikasi Rekomtek juga dipisah verifikator dengan ketua, begitu pula dengan role staff bpdp dengan kadiv bpdp. itu juga dibuat pilihannya di role switcher"

## Clarifications

### Session 2026-07-31

- Q: Format dan Cara Pembuatan Dokumen Rekomtek & SK Dirut → A: File PDF dinamis yang di-generate penuh oleh backend berdasarkan data usulan (Option C).
- Q: Logika Pilihan Pengembalian Proposal untuk Perbaikan oleh Ditjenbun Verifikator → A: Dropdown pilihan tujuan pengembalian ("Dinas Provinsi" atau "Dinas Kabupaten/Kota") dan input alasan ketidaksesuaian (Option A).
- Q: Mekanisme Pemilihan Bentuk Bantuan (Uang/Barang) oleh Ditjenbun Verifikator → A: Ditentukan per usulan (satu jenis bantuan berlaku untuk satu usulan secara keseluruhan) (Option A).
- Q: Proses Dokumen Kelayakan Rekomtek oleh BPDP Verifikator → A: Di-generate otomatis oleh sistem (PDF) berdasarkan isian form checklist kelayakan di UI (Option A).
- Q: Pemisahan Peran (Verifikator vs Approval) → A: Peran Ditjenbun Verifikator & Ketua Tim (Approval) dipisah menjadi dua role berbeda. Begitu pula BPDP Verifikator (Staff) & BPDP Approval (Kadiv) dipisah menjadi dua role berbeda. Batasan halaman dan tombol diimplementasikan secara terpisah sesuai otorisasi peran masing-masing.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Alur Verifikator Ditjenbun (Asistensi & Rekomtek)
Verifikator Ditjenbun (`DITJENBUN_VERIFIKATOR`) memverifikasi usulan masuk, mencakup SK CPCL, Surat Pengantar, data pekebun/lahan/kelembagaan. Jika ada ketidaksesuaian, mengirimkan instruksi perbaikan ke Dinas. Jika sesuai, menentukan bentuk bantuan (uang/barang), men-generate rekomtek, mengunduh rekomtek untuk ditandatangani, dan mengunggah rekomtek bertanda tangan beserta nomor rekomtek untuk diajukan ke Ketua Tim.

**Acceptance Scenarios**:
1. **Given** pengguna masuk sebagai `DITJENBUN_VERIFIKATOR`, **When** membuka halaman antrean rekomtek, **Then** sistem menampilkan tab antrean verifikasi dan memblokir akses ke antrean approval ketua.
2. **Given** pengguna membuka halaman asistensi usulan, **When** memverifikasi kelayakan berkas, memilih bentuk bantuan, mengisi nomor rekomtek, dan mengunggah signed rekomtek, **Then** tombol "Ajukan ke Ditjenbun Approval" aktif.

### User Story 2 - Alur Approval Ditjenbun (Ketua Tim)
Ketua Tim Ditjenbun (`DITJENBUN_APPROVAL`) meninjau hasil rekomtek yang diajukan oleh verifikator. Ketua tim mengunduh rekomtek signed untuk validasi akhir. Jika sesuai, menyetujui usulan (Push ke BPDP). Jika tidak, menolak usulan (Pushback ke Verifikator Ditjenbun).

**Acceptance Scenarios**:
1. **Given** pengguna masuk sebagai `DITJENBUN_APPROVAL`, **When** membuka halaman antrean rekomtek, **Then** sistem menampilkan tab antrean persetujuan ketua dan memblokir akses ke halaman input asistensi.
2. **Given** pengguna meninjau usulan, **When** memilih "Push ke BPDP Verifikator", **Then** usulan diteruskan ke antrean BPDP Verifikator dengan status `VERIFIKASI_BPDP`.

### User Story 3 - Alur Verifikator BPDP (Kelayakan & SK Dirut)
Verifikator BPDP (`BPDP_VERIFIKATOR`) memverifikasi berkas rekomtek dari Ditjenbun beserta dokumen pendukung, men-generate laporan kelayakan, mengunggah draft kelayakan, dan mengajukan persetujuan ke Kadiv BPDP. Verifikator juga bertugas men-generate draf SK Dirut, mengunduh draf, mengunggah signed SK Dirut, dan menyelesaikan usulan ke status `SELESAI`.

**Acceptance Scenarios**:
1. **Given** pengguna masuk sebagai `BPDP_VERIFIKATOR`, **When** membuka antrean kelayakan, **Then** sistem menampilkan tab verifikasi kelayakan dan tab penerbitan SK Dirut, serta memblokir tab approval Kadiv.
2. **Given** kelayakan disetujui Kadiv, **When** pengguna men-generate SK Dirut, mengisi nomor SK Dirut, mengunggah signed SK Dirut, dan mengklik "Selesaikan Usulan", **Then** status usulan berganti ke `SELESAI` dan data terkunci.

### User Story 4 - Alur Approval BPDP (Kadiv BPDP)
Kepala Divisi BPDP (`BPDP_APPROVAL`) meninjau dokumen kelayakan rekomtek yang diajukan oleh staf. Kadiv menyetujui kelayakan (Push ke SK Dirut), mengembalikan laporan ke verifikator BPDP (Pushback), atau menolak usulan dengan mengirimkan usulan kembali ke Ditjenbun (Kembalikan ke Ditjenbun).

**Acceptance Scenarios**:
1. **Given** pengguna masuk sebagai `BPDP_APPROVAL`, **When** membuka antrean, **Then** sistem menampilkan antrean approval Kadiv dan memblokir halaman input kelayakan serta finalisasi SK.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST mendefinisikan empat peran pengguna terpisah di frontend dan switcher role: `DITJENBUN_VERIFIKATOR`, `DITJENBUN_APPROVAL`, `BPDP_VERIFIKATOR`, dan `BPDP_APPROVAL`.
- **FR-002**: Sistem MUST membatasi akses URL rute detail secara ketat berdasarkan otorisasi peran menggunakan Navigation Guard:
  * `/ditjenbun/rekomtek/ceki/:id` hanya boleh diakses oleh `DITJENBUN_VERIFIKATOR`.
  * `/ditjenbun/rekomtek/approval/:id` hanya boleh diakses oleh `DITJENBUN_APPROVAL`.
  * `/bpdp/ceki/:id` hanya boleh diakses oleh `BPDP_VERIFIKATOR`.
  * `/bpdp/approval/:id` hanya boleh diakses oleh `BPDP_APPROVAL`.
  * `/bpdp/finalisasi/:id` hanya boleh diakses oleh `BPDP_VERIFIKATOR`.
- **FR-003**: Sistem MUST menyembunyikan tab antrean yang tidak relevan dengan peran pengguna aktif pada dashboard antrean rekomtek Ditjenbun dan BPDP.
- **FR-004**: Sistem MUST memfasilitasi Verifikator Ditjenbun (`DITJENBUN_VERIFIKATOR`) untuk menginput bantuan (uang/barang), generate draf rekomtek, mengisi nomor rekomtek, mengunggah signed rekomtek, dan mengajukan usulan.
- **FR-005**: Halaman Approval Ditjenbun MUST membatasi Ketua Tim (`DITJENBUN_APPROVAL`) hanya untuk melakukan aksi persetujuan (push ke BPDP) atau penolakan (pushback ke verifikator).
- **FR-006**: Sistem MUST memfasilitasi Verifikator BPDP (`BPDP_VERIFIKATOR`) untuk memverifikasi berkas, generate laporan kelayakan (layak/tidak layak), mengajukan kelayakan ke Kadiv, generate draf SK Dirut, serta mengunggah signed SK Dirut untuk finalisasi status ke `SELESAI`.
- **FR-007**: Halaman Approval BPDP MUST membatasi Kadiv (`BPDP_APPROVAL`) hanya untuk melakukan aksi Setuju, Pushback ke staf verifikator, atau menerbitkan Surat Pengembalian Rekomtek ke Ditjenbun.

### Key Entities

- **Usulan (Proposal)**: Data pengusulan sarpras kakao, status alur (`DITJENBUN_VERIFIKATOR`, `DITJENBUN_APPROVAL`, `BPDP_VERIFIKATOR`, `BPDP_APPROVAL`, `SELESAI`), log riwayat aksi, bantuanType, rekomtek, kelayakan, dan skDirut.
- **StatusLog**: Catatan kronologis perubahan status usulan dengan pelakunya (`DITJENBUN_VERIFIKATOR`, `DITJENBUN_APPROVAL`, `BPDP_VERIFIKATOR`, `BPDP_APPROVAL`).

## Success Criteria *(mandatory)*

- **SC-001**: Pengguna dengan peran tidak sah otomatis diredireksi ke halaman `/access-denied` secara real-time saat mencoba memicu URL terlarang.
- **SC-002**: Tombol simulasi penukaran peran (Role Switcher) di pojok kiri atas dan DesktopHeader menampilkan empat peran baru secara akurat dan reaktif.
- **SC-003**: Log riwayat status (status history log) mencatat secara akurat setiap aksi verifikasi beserta tanggal, nama aktor, dan peran aktor yang tepat.

## Assumptions

- **A-001**: Proses autentikasi token backend telah mendukung klaim peran `DITJENBUN_VERIFIKATOR`, `DITJENBUN_APPROVAL`, `BPDP_VERIFIKATOR`, dan `BPDP_APPROVAL`.
- **A-002**: Berkas yang diunggah divalidasi dengan format berkas PDF dengan batas ukuran berkas maksimum 10MB.
