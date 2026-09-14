# Feature Specification: Standarisasi Dokumen Persyaratan Dinamis Master Paket Lintas Role

**Feature Branch**: `077-dynamic-package-document-requirements`

**Created**: 2026-09-08

**Status**: Draft

**Input**: User description: "sepertinya dibuat dinamis dulu aja mengikuti aturan dinamis master karena sekarang masih dalam fase develop /speckit-specify bisakah agar semua halamanya untuk section persyaratan dokumen disesuaikan dengan master paket persyaratan dokumen"


---

## Clarifications

### Session 2026-09-08

- Q: Bagaimana penanganan tampilan checklist verifikasi jika proposal lama memiliki dokumen yang berbeda dengan Master Paket terkini?
  - A: **Gabungkan Keduanya (Union)**: Tampilkan seluruh dokumen persyaratan dari Master Paket terkini, dan jika pada proposal terdapat dokumen terunggah yang kodenya tidak ada di master terkini, tetap tampilkan sebagai 'Dokumen Tambahan/Lainnya' sehingga dokumen existing tidak hilang.
- Q: Bagaimana pengelompokan visual checklist dokumen usulan pemohon di halaman verifikasi?
  - A: **Satu Section Bersama ('Dokumen Persyaratan Usulan Pemohon')**: Gabungkan dalam satu container section terpadu yang berisi checklist dinamis master paket, terpisah secara visual dari section dokumen instansi (SK CPCL, BA, Rekomtek).

---

Saat ini sistem telah memiliki Master Data Paket Sarpras dan Master Dokumen Persyaratan di Backend (`/api/v1/master-sarpras/paket/:code/persyaratan`), yang sudah dipakai secara dinamis pada tahap Pengusulan Baru (Pemohon) di `StepPaketSarpras.vue`.

Namun, pada halaman-halaman verifikasi dan reviu proposal di role lainnya:
1. **Dinas Kabupaten** (`StepVerifikasiPekebunDanDokumenProposal.vue`, `StepSummaryDanSubmit.vue`)
2. **Dinas Provinsi** (`StepSummaryDanSubmit.vue`, `PratinjauPekebunDanDokumenProposal.vue`)
3. **Ditjenbun & BPDP** (`PratinjauPekebunDanDokumenProposal.vue`, tab Berkas Dokumen Usulan)

Daftar dokumen persyaratan usulan yang ditampilkan **masih mengambil dari file TypeScript statis (`PAKET_PERSYARATAN_CONFIG`)**.
Akibatnya:
- Ketika Admin menambahkan, mengubah, atau menonaktifkan dokumen persyaratan untuk suatu paket di Master Data, perubahan tersebut **hanya terlihat oleh Pemohon**, namun **tidak tercermin di halaman verifikator (Dinas Kab/Prov/Ditjenbun/BPDP)**.
- Terjadi inkonsistensi checklist antara apa yang diunggah pemohon dengan apa yang diminta/divalidasi oleh pemeriksa.

Karena sistem masih dalam fase pengembangan aktif (*development stage*), seluruh section dan komponen yang menampilkan persyaratan dokumen usulan harus diselaraskan secara **dinamis mengikuti aturan master paket persyaratan dokumen (`master_paket_dokumen`)** dengan graceful fallback ke file konfigurasi lokal.

---

## 2. User Scenarios & Acceptance Criteria *(mandatory)*

### User Story 1 - Verifikasi Dokumen Usulan Dinamis di Dinas Kabupaten (Priority: P1)

Sebagai Verifikator Dinas Kabupaten, saat saya membuka rincian proposal pengusulan pada halaman `StepVerifikasiPekebunDanDokumenProposal.vue`, saya ingin daftar dokumen usulan yang perlu diverifikasi dimuat secara dinamis dari aturan Master Paket dokumen terkait, sehingga checklist dokumen selalu sinkron dengan aturan paket terbaru yang dipilih pemohon.

**Why this priority**: Dinas Kabupaten adalah pintu verifikasi pertama berkas usulan pemohon. Jika checklist di kabupaten tidak dinamis, berkas baru dari master tidak akan bisa divalidasi atau diberi catatan.

**Independent Test**:
1. Pilih proposal dengan paket tertentu (misal `EKSTENSIFIKASI`).
2. Buka halaman verifikasi proposal di Dinas Kabupaten.
3. Periksa apakah daftar dokumen yang ditampilkan sesuai dengan hasil response endpoint `GET /api/v1/master-sarpras/paket/:code/persyaratan`.

**Acceptance Scenarios**:
1. **Given** Verifikator membuka proposal dengan paket sarpras tertentu, **When** Data proposal dimuat, **Then** Halaman memanggil `masterStore.fetchPersyaratan(paketCode)` untuk mengambil checklist persyaratan dokumen dinamis.
2. **Given** API master mengembalikan daftar dokumen persyaratan untuk paket tersebut, **When** Komponen me-render checklist, **Then** Setiap dokumen menampilkan judul, status wajib/opsional, file terunggah, dan form validasi (sesuai/tolak & catatan) yang sinkron.
3. **Given** Terjadi kegagalan jaringan atau server master tidak merespons, **When** Data dicoba dimuat, **Then** Sistem menggunakan fallback aman dari `PAKET_PERSYARATAN_CONFIG` tanpa menyebabkan error/layar putih.

---

### User Story 2 - Pratinjau Dokumen Dinamis pada Tab Pratinjau Proposal Multi-Role (Priority: P2)

Sebagai Verifikator/Approver di Dinas Provinsi, Ditjenbun, maupun BPDP, saat saya membuka tab "Pratinjau Dokumen Usulan" atau komponen `PratinjauPekebunDanDokumenProposal.vue`, saya ingin daftar persyaratan dokumen usulan pemohon ditampilkan secara dinamis sesuai Master Paket dokumen, sehingga penelaah di tingkat provinsi, pusat, dan BPDP melihat struktur berkas yang sama persis.

**Why this priority**: Mencegah miskomunikasi antar instansi di mana Ditjenbun atau Provinsi mempertanyakan mengapa ada dokumen yang ada/tidak ada di checklist.

**Independent Test**:
1. Buka halaman detail verifikasi di Provinsi / Ditjenbun / BPDP yang memuat komponen `PratinjauPekebunDanDokumenProposal.vue`.
2. Pastikan daftar berkas dokumen pemohon terdaftar lengkap sesuai master persyaratan paket.

**Acceptance Scenarios**:
1. **Given** Pengguna berada pada tab Pratinjau Dokumen Usulan di level Provinsi, Ditjenbun, atau BPDP, **When** Komponen dibuka, **Then** Dokumen pemohon dirender berdasarkan konfigurasi dinamis master paket proposal tersebut.
2. **Given** Dokumen sudah diunggah oleh pemohon, **When** Pengguna mengklik pratinjau, **Then** File PDF/gambar dapat dibuka dengan pratinjau modal seperti biasa.

---

### User Story 3 - Ringkasan dan Submit Proposal Kabupaten & Provinsi (Priority: P3)

Sebagai Petugas Dinas Kabupaten atau Provinsi yang sedang menyusun Berita Acara / Ringkasan Pengajuan (`StepSummaryDanSubmit.vue`), saya ingin tabel ringkasan berkas persyaratan menampilkan daftar dokumen yang sesuai dengan master paket dinamis.

**Why this priority**: Menjaga keabsahan lembar ringkasan sebelum dokumen diajukan ke jenjang di atasnya.

**Acceptance Scenarios**:
1. **Given** Pengguna berada di langkah `StepSummaryDanSubmit.vue`, **When** Ringkasan berkas usulan ditampilkan, **Then** Daftar checklist berkas menggunakan data persyaratan dinamis dari `masterStore`.

---

## 3. Scope & Boundary (Batasan Masalah)

### Included (In-Scope):
1. Mengintegrasikan pemanggilan `masterStore.fetchPersyaratan(paketCode)` pada:
   - `StepVerifikasiPekebunDanDokumenProposal.vue` (Dinas Kabupaten)
   - `StepSummaryDanSubmit.vue` (Dinas Kabupaten)
   - `StepSummaryDanSubmit.vue` (Dinas Provinsi)
   - `PratinjauPekebunDanDokumenProposal.vue` (Komponen bersama di Prov, Ditjenbun, BPDP)
   - `StepPilihPekebunLahan.vue` & `StepRAB.vue` (jika mengacu pada persyaratan dinamis)
2. Memastikan pemetaan dokumen (`getProposalDoc`, `getUploadStatus`, dan `validations`) tetap kompatibel antara kode dokumen lama dan kode dokumen master baru.
3. Mempertahankan fallback ke `PAKET_PERSYARATAN_CONFIG` jika data master belum selesai dimuat atau offline.

### Excluded (Out-of-Scope):
- Dokumen administratif instansi tingkat lanjut (*SK CPCL, Berita Acara Verifikasi, Surat Pengantar Provinsi, Rekomtek Ditjenbun, Laporan Kelayakan BPDP*) tetap berada pada section kewenangan instansinya masing-masing (karena ini dokumen SOP regulasi antar instansi yang berlaku seragam untuk semua paket sarpras).

---

## 4. Functional Requirements (FR)

- **FR-001**: Sistem MUST memuat dokumen persyaratan usulan secara dinamis dari `masterSarprasStore` (`GET /api/v1/master-sarpras/paket/:code/persyaratan`) pada seluruh view verifikasi yang menampilkan berkas pemohon.
- **FR-002**: Sistem MUST memetakan berkas yang diunggah pemohon (`proposal.documents`) ke item persyaratan dinamis berdasarkan `dokumen_code` (case-insensitive & pembersihan strip/underscore).
- **FR-003**: Sistem MUST menyediakan graceful fallback ke `PAKET_PERSYARATAN_CONFIG` apabila endpoint master tidak tersedia.
- **FR-004**: Sistem MUST menjaga fungsionalitas validasi verifikator (status Sesuai/Tidak Sesuai, Catatan Perbaikan, dan Pratinjau Dokumen) tanpa regresi.
- **FR-005**: Sistem MUST melakukan sinkronisasi otomatis ketika proposal yang dibuka berganti atau ketika paket usulan berubah.

---

## 5. Non-Functional Requirements (NFR)

- **NFR-001 (Performance & Caching)**: `fetchPersyaratan` harus memanfaatkan caching yang sudah ada di `masterSarprasStore` (`persyaratanMap`) agar tidak melakukan HTTP request berulang untuk paket yang sama.
- **NFR-002 (Zero Layout Shift)**: Menyediakan loading skeleton atau fallback visual yang halus saat data persyaratan sedang di-fetch.
- **NFR-003 (Error Resilience)**: Kegagalan fetch data master tidak boleh menyebabkan aplikasi crash (*white screen*).
