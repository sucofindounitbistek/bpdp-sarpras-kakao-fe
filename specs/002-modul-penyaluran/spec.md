# Feature Specification: Modul Penyaluran & Pengusulan Sarpras BPDPKS

**Feature Branch**: `002-modul-penyaluran`

**Created**: 2026-07-30

**Status**: Ready for Planning / Validated with Business Process Flowchart

**Input**: Review & alignment analysis of business processes and role functions against the official BPDPKS Sarpras Business Process Flowchart.

---

## Business Process & Role Alignment Analysis

Berdasarkan analisis diagram alur proses bisnis (*flowchart*) **Lini Proses Penyelenggaraan Sarana dan Prasarana Perkebunan (BPDPKS)**, modul ini melibatkan 5 aktor/role utama dengan alur kerja sekuensial bertingkat:

```
[ Lembaga Pekebun ]  --->  [ Dinas Kab/Kota ]  --->  [ Dinas Provinsi ]  --->  [ Ditjenbun ]  --->  [ BPDPKS ]
 (Penginputan CPCL &        (Verifikasi Admin &       (Validasi & Rekom       (Evaluasi Teknis &      (User Management,
  Pembuatan Proposal)        Verifikasi Lapangan)      Tingkat Provinsi)        Penerbitan SK)         PKS & Penyaluran)
         ^                         |                         |                       |
         |                         v                         v                       v
         +-------------------------+-------------------------+-----------------------+ (Alur Revisi / Dikembalikan)
```

### Matriks Tugas & Responsibilitas Role

| Role | Fungsi & Deskripsi Tanggung Jawab dalam Proses Bisnis | Fitur Utama dalam Modul |
| :--- | :--- | :--- |
| **1. Kelembagaan Pekebun** *(Koperasi / Kelompok Tani / GAPOKTAN)* | Menginput data identitas pekebun dan lahan (CPCL & Geotagging Poligon), membuat proposal pengajuan paket sarpras, mengunggah berkas legalitas, dan melakukan revisi proposal jika dikembalikan. | - Form Data Pekebun & Lahan (CPCL)<br>- Peta Geotagging Poligon Lahan<br>- Form Pembuatan Proposal<br>- Modul Revisi Proposal |
| **2. Dinas Kabupaten/Kota** | Menerima pengajuan proposal, melakukan verifikasi kelengkapan administrasi dan verifikasi lapangan (validasi fisik lahan/CPCL), serta menerbitkan **Surat Rekomendasi Teknis (Rekomtek) Kabupaten/Kota**. | - Dashboard Verifikasi Kab/Kota<br>- Check-list Verifikasi Admin & Lapangan<br>- Penerbitan Rekomtek Kabupaten |
| **3. Dinas Provinsi** | Menerima proposal & Rekomtek Kab/Kota, memverifikasi kesesuaian target dan kriteria provinsi, serta menerbitkan **Surat Pengantar / Rekomendasi Provinsi**. | - Dashboard Verifikasi Provinsi<br>- Validasi Rekomtek Kab/Kota<br>- Penerbitan Surat Pengantar Provinsi |
| **4. Ditjenbun** *(Direktorat Jenderal Perkebunan)* | Evaluasi teknis nasional, verifikasi kesesuaian kuota/pagu anggaran nasional, dan menerbitkan **Surat Keputusan (SK) Penetapan Penerima Sarpras**. | - Dashboard Evaluasi Ditjenbun<br>- Penilaian Kelayakan Nasional<br>- Penerbitan SK Penetapan Penerima |
| **5. BPDPKS / BPDP** | Menerima SK Penetapan dari Ditjenbun, mengelola Perjanjian Kerja Sama (PKS), pencairan/penyaluran dana & bantuan, serta **User Management & System Governance**. | - Dashboard Penyaluran BPDPKS<br>- User Management & Role Permissions<br>- Modul PKS & BAST/LPJ |

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dynamic Sidebar & Role Switcher Simulation (Priority: P1) 🎯 Core UX

Sebagai Pengguna / Peninjau Aplikasi, saya ingin dapat berpindah role pengguna melalui dropdown Role Switcher di header topbar, sehingga saya dapat melihat secara instan navigasi sidebar dan tampilan dashboard khusus untuk setiap role sesuai alur proses bisnis.

**Why this priority**: Memungkinkan pengujian visual dan verifikasi proses bisnis seluruh role tanpa hambatan autentikasi backend (Open Access Mockup).

**Independent Test**: Pilih role yang berbeda pada header topbar dropdown, verifikasi bahwa menu sidebar, indikator breadcrumb, dan konten dashboard berubah secara langsung (under 200ms) sesuai role yang dipilih.

**Acceptance Scenarios**:

1. **Given** Pengguna berada pada aplikasi, **When** memilih role "Kelembagaan Pekebun", **Then** sidebar menampilkan menu: *Dashboard, Data Pekebun & Lahan (CPCL), Pembuatan Proposal, dan Revisi Proposal*.
2. **Given** Pengguna berada pada aplikasi, **When** memilih role "Dinas Kab/Kota", **Then** sidebar menampilkan menu: *Dashboard dan Verifikasi Kab/Kota (Rekomtek)*.
3. **Given** Pengguna berada pada aplikasi, **When** memilih role "Dinas Provinsi", **Then** sidebar menampilkan menu: *Dashboard dan Verifikasi Provinsi*.
4. **Given** Pengguna berada pada aplikasi, **When** memilih role "Ditjenbun", **Then** sidebar menampilkan menu: *Dashboard dan Evaluasi & Penetapan SK Ditjenbun*.
5. **Given** Pengguna berada pada aplikasi, **When** memilih role "BPDP", **Then** sidebar menampilkan menu: *Dashboard, User Management, dan Penyaluran & PKS*.

---

### User Story 2 - Pengusulan Sarpras oleh Kelembagaan Pekebun (Priority: P1)

Sebagai Pengurus Lembaga Pekebun, saya ingin menginput data anggota pekebun & polygon lahan (CPCL) serta membuat proposal pengusulan paket sarpras agar dapat diverifikasi oleh Dinas Kabupaten/Kota.

**Acceptance Scenarios**:

1. **Given** Role aktif adalah "Kelembagaan Pekebun", **When** pengguna mengisi data pekebun & lahan, **Then** peta interaktif geotagging poligon lahan dapat disimpan dan terhubung dengan ID CPCL.
2. **Given** Data CPCL sudah siap, **When** pengurus mengajukan proposal sarpras, **Then** status proposal berubah menjadi `Diajukan ke Dinas Kab/Kota`.

---

### User Story 3 - Verifikasi & Rekomtek Dinas Kabupaten/Kota (Priority: P2)

Sebagai Verifikator Dinas Kabupaten/Kota, saya ingin memeriksa kelengkapan administrasi dan hasil verifikasi lapangan CPCL, lalu menerbitkan Surat Rekomendasi Teknis (Rekomtek) Kabupaten/Kota.

**Acceptance Scenarios**:

1. **Given** Terdapat proposal masuk dari Lembaga Pekebun, **When** Dinas Kab/Kota menyetujui verifikasi admin & lapangan, **Then** sistem menerbitkan Rekomtek Kab/Kota dan meneruskan status ke `Diajukan ke Dinas Provinsi`.
2. **Given** Berkas proposal belum sesuai, **When** Dinas Kab/Kota memilih "Kembalikan / Catatan Revisi", **Then** status proposal berubah menjadi `Revisi Proposal` dan dapat diperbaiki oleh Lembaga Pekebun.

---

### User Story 4 - Validasi Dinas Provinsi & Evaluasi Ditjenbun (Priority: P3)

Sebagai Verifikator Provinsi / Evaluator Ditjenbun, saya ingin memvalidasi usulan daerah dan menerbitkan SK Penetapan Penerima Sarpras.

**Acceptance Scenarios**:

1. **Given** Proposal dengan Rekomtek Kab/Kota diterima Dinas Provinsi, **When** diverifikasi valid, **Then** diteruskan ke Ditjenbun.
2. **Given** Proposal dievaluasi Ditjenbun, **When** memenuhi syarat teknis & anggaran nasional, **Then** Ditjenbun menerbitkan SK Penetapan dan meneruskannya ke BPDPKS.

---

### User Story 5 - User Management & Penyaluran BPDPKS (Priority: P4)

Sebagai Admin / Verifikator BPDPKS, saya ingin mengelola hak akses pengguna (User Management) dan memantau alur penyaluran PKS serta BAST.

**Acceptance Scenarios**:

1. **Given** Role aktif adalah "BPDP", **When** mengakses menu User Management, **Then** sistem menampilkan tabel daftar pengguna serta kartu deskripsi hak akses dan tanggung jawab kelima role secara transparan.
2. **Given** Proposal memiliki SK Penetapan Ditjenbun, **When** diverifikasi BPDP, **Then** status pencairan dana dan penandatanganan PKS dapat diproses.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST menyediakan dropdown Role Switcher di Topbar Header untuk mensimulasikan perpindahan 5 role (Kelembagaan Pekebun, Dinas Kab/Kota, Dinas Provinsi, Ditjenbun, BPDPKS).
- **FR-002**: Sidebar Navigation MUST menyesuaikan daftar menu dan badge status secara dinamis berdasarkan role yang aktif.
- **FR-003**: Modul Kelembagaan Pekebun MUST mencakup formulir CPCL (Data Pekebun), komponen peta Poligon Geotagging Lahan, Form Pengajuan Proposal Sarpras, dan halaman Revisi Proposal.
- **FR-004**: Modul Dinas Kabupaten/Kota MUST mencakup daftar antrean verifikasi administrasi & lapangan, checklist dokumen, dan form penerbitan Rekomtek Kabupaten.
- **FR-005**: Modul Dinas Provinsi MUST mencakup verifikasi Rekomtek Kab/Kota, sinkronisasi kuota daerah, dan form pengantar rekomendasi provinsi.
- **FR-006**: Modul Ditjenbun MUST mencakup lembar evaluasi teknis nasional dan penetapan SK Penerima Sarpras.
- **FR-007**: Modul BPDPKS MUST menyediakan halaman User Management yang menampilkan daftar user, filter role, serta penjelasan rinci fungsi/tanggung jawab setiap role sesuai proses bisnis.
- **FR-008**: Seluruh tampilan dashboard MUST dilengkapi visualisasi kartu metrik (KPI Summary) dan grafik ringkasan yang relevan dengan konteks role aktif.

### Key Entities

- **Role**: Definisi peranan dalam sistem (`id`, `code`, `name`, `description`, `permissions`).
- **Pekebun & Lahan (CPCL)**: Data petani dan lahan (`id`, `namaPekebun`, `nik`, `luasLahanHa`, `polygonCoordinates`, `statusSertifikat`).
- **Proposal Sarpras**: Berkas pengajuan bantuan (`id`, `lembagaId`, `jenisPaket`, `status` [Draft, Submitted, Rekomtek_Kab, Rekomtek_Prov, SK_Ditjenbun, Penyaluran_BPDPKS, Revisi], `dokumenUrls`).
- **Verifikasi Record**: Log hasil verifikasi tiap tingkatan (`id`, `proposalId`, `verifiedByRole`, `statusResult`, `catatanRevisi`, `nomorSuratRekomtek`).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Kesesuaian 100% antara alur sistem dan modul frontend dengan diagram alur proses bisnis resmi BPDPKS.
- **SC-002**: Perpindahan role via Role Switcher merespons dalam waktu < 200ms tanpa memerlukan reload halaman penuh.
- **SC-003**: 100% dari 5 role memiliki mockup dashboard dan alur navigasi terspesialisasi yang berfungsi penuh dalam mode Open Access.
- **SC-004**: Desain UI mematuhi standar aksesibilitas WCAG AA dengan skema warna utama Forest Green (`#066C2A`) dan aksen modern.

---

## Assumptions

- **Open Access / Client-Simulated Mode**: Sesuai dengan prinsip tata kelola frontend, seluruh autentikasi dinonaktifkan sementara dan dikelola via Pinia Role Store agar memudahkan verifikasi UI/UX.
- **Teknologi Stack**: Menggunakan Vue 3 `<script setup>`, TypeScript strict mode, TailwindCSS, dan Lucide Icons.
