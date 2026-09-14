# Feature Specification: Breadcrumb Role Removal & Menu-Only Navigation

**Feature Branch**: `018-remove-breadcrumb-roles`

**Created**: 2026-08-05

**Status**: Draft

**Input**: User description: "tolong breadcrumb tidak perlu menampilkan rolenya, jadi menu2 saja"

---

## Background & Context

Saat ini, komponen Breadcrumb (`Breadcrumb.vue`) dan beberapa halaman view secara eksplisit menampilkan nama peran/role atau nama section role (seperti `DINAS KABUPATEN / KOTA`, `DITJENBUN (VERIFIKATOR)`, `Ditjenbun Pusat`, `BPDPKS Pusat`) di dalam hirarki navigasinya.

Pengguna menginginkan agar Breadcrumb tidak lagi menampilkan nama peran tersebut, melainkan hanya menampilkan hirarki menu yang dilalui (misalnya: `Beranda > Verifikasi Rekomtek > Detail Usulan`). Hal ini akan menyederhanakan navigasi, membuatnya lebih bersih, dan berfokus pada menu fungsional.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Navigasi Breadcrumb Dinamis Tanpa Role (Priority: P1)

Sebagai Pengguna Sistem (Pemohon, Verifikator, Approval), saat saya membuka halaman manapun di aplikasi, saya ingin melihat breadcrumb yang bersih di mana nama section role dihilangkan, menyisakan hirarki menu utama saja.

**Why this priority**: Kebutuhan utama pengguna untuk membersihkan tampilan breadcrumb dari nama role.
**Independent Test**: Buka halaman antrean atau detail usulan (misal detail kabupaten). Periksa navigasi breadcrumb di bagian atas halaman dan pastikan tidak ada teks `DINAS KABUPATEN / KOTA` atau sejenisnya.

**Acceptance Scenarios**:
1. **Given** pengguna berada di halaman `QueueVerifikasiKabView.vue`, **When** halaman dimuat, **Then** breadcrumb yang tampil adalah `Beranda > Verifikasi & Rekomtek (Kab)` (tidak menampilkan `DINAS KABUPATEN / KOTA`).
2. **Given** pengguna berada di halaman detail usulan BPDP (`CekiBpdpView.vue`), **When** halaman dimuat, **Then** breadcrumb yang tampil adalah `Beranda > Verifikasi Kelayakan > Penilaian Kelayakan` (tidak menampilkan `BPDPKS Pusat` atau `BPDPKS (VERIFIKATOR)`).

---

## Requirements

### Functional Requirements

- **FR-001**: Komponen `Breadcrumb.vue` HARUS diubah agar tidak lagi memasukkan `matchedSectionTitle` ke dalam daftar item navigasi, sehingga section/peran disembunyikan.
- **FR-002**: Halaman-halaman view yang memiliki breadcrumb hardcoded (melewati prop `:items` ke `<Breadcrumb>`) HARUS didelegasikan ke resolusi dinamis `Breadcrumb.vue` dengan cara menghapus prop `:items` tersebut, ATAU array breadcrumb-nya diselaraskan untuk menghapus item yang merepresentasikan nama peran.
- **FR-003**: Semua halaman detail/sub-page HARUS tetap memiliki hirarki navigasi kembali ke menu induknya dengan benar (misal: `Beranda > Menu Induk > Judul Halaman Detail`).

---

## Success Criteria

### Measurable Outcomes

- **SC-001**: 100% halaman di aplikasi yang menampilkan `<Breadcrumb>` bersih dari nama role/section role.
- **SC-002**: Navigasi back click dari breadcrumbs ke menu induk tetap berfungsi 100% dengan benar.

---

## Assumptions

- Konfigurasi `activeMenu` dan `title` pada router meta sudah terdefinisi dengan baik sehingga `Breadcrumb.vue` dapat meresolusi hirarki secara dinamis dengan akurat.
