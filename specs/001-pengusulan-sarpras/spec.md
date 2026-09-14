# Feature Specification: Modul Pengusulan Sarpras BPDP

**Feature Branch**: `dev/raihan`

**Created**: 2026-07-29

**Status**: Completed (Open Access / No Login Required & Sidebar Navigation Layout)

**Input**: User description: "Ubah aplikasi ke mode Open Access (tanpa login), langsung akses dashboard dan fitur pengusulan sarpras"

## User Scenarios & Testing *(mandatory)*

### User Story 0 - Open Access & Sidebar Navigation (Priority: P1) 🎯 UX Core

Sebagai Pengguna, saya ingin membuka aplikasi secara langsung tanpa melewati layar login (Open Access) dan menavigasi seluruh modul dashboard via Sidebar Navigation di sisi kiri.

**Why this priority**: Memudahkan peninjauan UI & simulasi fitur tanpa hambatan autentikasi.

**Independent Test**: Pengguna membuka URL aplikasi (`/`), langsung diarahkan ke Dashboard Overview (`/dashboard`), dan dapat beralih role simulasi via dropdown Role Switcher di footer sidebar.

**Acceptance Scenarios**:

1. **Given** Pengguna membuka aplikasi di browser, **When** mengakses URL apapun, **Then** aplikasi menampilkan halaman langsung tanpa pengalihan ke halaman login.
2. **Given** Pengguna berada pada Sidebar Navigation, **When** mengubah pilihan pada dropdown "Switch Role Simulasi", **Then** role aktif di-update secara instan di Pinia store tanpa memerlukan relogin.

---

### User Story 1 - Pengajuan Usulan Sarpras oleh Lembaga Pekebun (Priority: P1) 🎯 MVP

Sebagai Pengurus Lembaga Pekebun (Koperasi / Kelompok Tani / GAPOKTAN), saya ingin mengajukan usulan bantuan Sarana dan Prasarana (Sarpras) BPDP secara online dengan mengunggah profil kelembagaan, data pekebun/lahan (CPCL), jenis paket sarpras, serta dokumen persyaratan legalitas.

---

### User Story 2 - Verifikasi Administrasi & Lapangan oleh Dinas Kabupaten/Kota (Priority: P2)

Sebagai Petugas Dinas Kabupaten/Kota, saya ingin memeriksa berkas administrasi dan melakukan verifikasi lapangan (CPCL & Geotagging) serta menerbitkan Surat Rekomendasi Teknis (Rekomtek) daerah.

---

### User Story 3 - Validasi Provinsi, Evaluasi Ditjenbun, & Penetapan SK (Priority: P3)

Sebagai Penilai Ditjenbun, saya ingin mereview hasil Rekomtek daerah dan menerbitkan Surat Keputusan (SK) Penetapan Penerima Sarpras.

---

### User Story 4 - Penyaluran Dana & Pelaporan PKS / BAST oleh BPDPKS (Priority: P4)

Sebagai Verifikator BPDPKS, saya ingin mengelola Perjanjian Kerja Sama (PKS), pencairan dana ke rekening penampung, serta pelaporan Berita Acara Serah Terima (BAST) dan LPJ.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Sistem MUST menyediakan akses langsung (Open Access / tanpa login) ke seluruh halaman dashboard (Principle XIII).
- **FR-002**: Sistem MUST menyediakan dropdown Role Switcher di footer Sidebar Navigation untuk mengganti role aktif (PEMOHON, DINAS_KAB, DINAS_PROV, DITJENBUN, BPDPKS) secara instan.
- **FR-003**: Sistem MUST menerapkan Vue 3 `<script setup>`, TypeScript strict mode, Zod validation, dan Pinia state management.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Seluruh fitur dan halaman dashboard dapat diakses langsung 100% tanpa hambatan login.
- **SC-002**: Kompilasi type check TypeScript (`vue-tsc -b`) dan production build (`vite build`) lulus **0 error**.
