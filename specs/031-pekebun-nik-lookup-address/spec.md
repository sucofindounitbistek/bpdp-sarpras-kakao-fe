# Feature Specification: NIK Lookup Updates Alamat and Kodepos

**Feature Branch**: `031-pekebun-nik-lookup-address`

**Created**: 2026-08-10

**Status**: Draft

**Input**: User description: "i need the mock cari NIK in halaman tambah pekebun to also update the Alamat and kodepos"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Cari NIK Otomatis Mengisi Alamat dan Kodepos (Priority: P1) 🎯 MVP

Sebagai Pengurus Lembaga Pekebun, saya ingin NIK lookup (Cari NIK) secara otomatis mengisi bidang Alamat dan Kodepos (selain Nama, Nomor KK, Status Pernikahan, Tempat/Tanggal Lahir), sehingga saya tidak perlu mengetiknya secara manual untuk NIK yang valid.

**Why this priority**: Menghindari redundansi penginputan data manual dan mempercepat proses registrasi data master pekebun.

**Independent Test**:
1. Login sebagai Pemohon.
2. Masuk ke halaman Master Data > Pekebun > Tambah Pekebun (`/master-data/pekebun/tambah`).
3. Masukkan salah satu NIK mock yang valid (misal: `7301021508850001`).
4. Klik tombol **Cari NIK**.
5. Verifikasi bahwa bidang **Alamat Sesuai KTP** dan **Kodepos** terisi secara otomatis dengan data dari Dukcapil (misal: alamat `"Jl. Poros Masamba No. 45, Desa Bone"` dan kodepos `"92961"`).
6. Verifikasi jika NIK tidak ditemukan, bidang Alamat dan Kodepos direset menjadi kosong.

**Acceptance Scenarios**:

1. **Given** Pengguna memasukkan NIK terdaftar, **When** mengklik Cari NIK, **Then** bidang Alamat Sesuai KTP dan Kodepos terisi data yang valid.
2. **Given** NIK tidak terdaftar/gagal lookup, **When** proses selesai, **Then** bidang Alamat Sesuai KTP dan Kodepos dikosongkan.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Model/interface `DukcapilResult` MUST diperluas untuk opsional menyimpan data `alamat` dan `kodepos`.
- **FR-002**: Registry data mock `MOCK_DUKCAPIL` di `src/stores/pekebun.ts` MUST diupdate dengan menambahkan properti `alamat` dan `kodepos` pada masing-masing entri NIK terdaftar.
- **FR-003**: Fungsi `handleLookupNik` di `src/views/master-data/FormPekebunView.vue` MUST memetakan properti `alamat` dan `kodepos` dari hasil verifikasi NIK ke form state `identitasData.value.alamat` dan `identitasData.value.kodepos`.
- **FR-004**: Jika NIK tidak ditemukan, properti `alamat` dan `kodepos` di form state MUST direset menjadi string kosong `''`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% NIK terdaftar yang diverifikasi mengisi otomatis form Alamat dan Kodepos.
- **SC-002**: Input Alamat dan Kodepos dibersihkan saat verifikasi NIK gagal/tidak ditemukan.

## Assumptions

- **A-001**: Mock data Dukcapil diselaraskan dengan database Master Data Pekebun yang sudah ada agar tidak terjadi inkonsistensi saat disimpan.
