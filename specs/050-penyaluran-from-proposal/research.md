# Research: Integrasi Penyaluran Barang dari Proposal Selesai & Penghapusan Form Tambah Manual

**Feature**: `050-penyaluran-from-proposal`
**Date**: 2026-08-28

## 1. Integrasi Data Proposal Selesai ke Penyaluran Barang

- **Decision**: Menghubungkan modul Penyaluran Barang secara langsung dengan entitas Proposal yang berstatus `SELESAI`. Di level Pinia Store (`penyaluranBarang.ts`), buat mekanisme sinkronisasi data proposal selesai menjadi entitas permohonan penyaluran berstatus `DRAFT` (Siap Diajukan Salur).
- **Rationale**: Menghindari duplikasi input manual dari form kosong. Proposal yang telah melewati verifikasi Dinas Kab/Kota, Provinsi, dan BPDP membawa data legalitas, lokasi kelembagaan, kategori paket (Ekstensifikasi / Intensifikasi), dan rincian item RAB yang valid.
- **Alternatives considered**:
  - *Membuat tombol "Buat Penyaluran" di halaman Tracking Detail Proposal*: Ditolak karena pengguna menginginkan manajemen daftar penyaluran tetap terpusat di menu Penyaluran Barang, namun data daftarnya langsung terisi dari proposal yang selesai.
  - *Mempertahankan form tambah manual*: Ditolak secara eksplisit oleh pengguna.

## 2. Alur Status & Inisiasi Penyaluran

- **Decision**: Proposal yang berstatus `SELESAI` otomatis muncul pada tabel Penyaluran Barang dengan status awal `DRAFT`. Pekebun diberikan tombol aksi `"Ajukan Penyaluran"` untuk melakukan konfirmasi pengajuan menuju verifikasi teknis (`MENUNGGU_VERIFIKASI_TEKNIS`).
- **Rationale**: Memberikan kontrol kepada pengurus lembaga pekebun untuk memastikan kesiapan penerimaan barang bantuan sebelum diajukan ke antrean verifikasi teknis BPDP.
- **Alternatives considered**:
  - *Langsung berstatus MENUNGGU_VERIFIKASI_TEKNIS tanpa konfirmasi*: Ditolak (hasil klarifikasi opsi B dipilih pengguna).

## 3. Penyesuaian Antarmuka & Routing

- **Decision**:
  1. Hapus tombol *"Buat Permohonan Baru"* pada header dan empty state di `PekebunPermohonanBarangView.vue`.
  2. Tambahkan aksi *"Ajukan Penyaluran"* di tabel untuk baris berstatus `DRAFT`.
  3. Konfigurasikan router agar rute `/penyaluran-barang/pemohon/tambah` dialihkan (*redirect*) ke `/penyaluran-barang/pemohon`.
- **Rationale**: Menjamin konsistensi navigasi dan mencegah akses langsung ke formulir manual yang sudah ditiadakan.
