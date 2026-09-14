# Quickstart Validation Guide: Revisi Data dan Dokumen Pekebun

**Feature**: `069-revisi-data-dokumen-pekebun`
**Date**: 2026-09-03

## 1. Prerequisites

1. **Backend**: `bpdp-sarpras-kelapa-be` berjalan di `http://localhost:8080`.
2. **Frontend**: `bpdp-sarpras-kelapa-fe` berjalan di `http://localhost:5173`.
3. **Akun Pengguna**:
   - Role **Dinas Kabupaten/Kota** (`DINAS_KAB`) untuk memverifikasi dan mengembalikan usulan dengan penolakan pekebun.
   - Role **Kelembagaan Pekebun** (`LEMBAGA`) untuk membuka halaman revisi usulan dan mengoreksi data pekebun.

---

## 2. End-to-End Test Scenarios

### Skenario 1: Verifikasi Penolakan Pekebun oleh Dinas Kabupaten
1. Buka proposal usulan berstatus diajukan di `/dinas/verifikasi/kabupaten/:id`.
2. Buka salah satu anggota CPCL pekebun di `/dinas/verifikasi/kabupaten/:id/pekebun/:cpclId`.
3. Pada dokumen KTP, tandai field `Nama Lengkap` sebagai **Tidak Sesuai** dan isi catatan: *"Nama tidak sesuai KTP"*.
4. Pada dokumen Scan KK, tandai dokumen sebagai **Tidak Sesuai** dan isi catatan: *"Scan KK buram"*.
5. Klik **Kembalikan (Revisi)** dengan status proposal berubah menjadi `REV_FROM_KAB`.

### Skenario 2: Tinjauan Penolakan pada Halaman Revisi Pemohon
1. Login sebagai Kelembagaan Pekebun, buka proposal usulan berstatus `REV_FROM_KAB` di `/pemohon/revisi-proposal/:id`.
2. Buka Tab **Pekebun & Lahan**.
3. **Ekspektasi**:
   - Hanya kartu pekebun yang ditolak pada Skenario 1 yang muncul. Anggota pekebun lain yang disetujui tidak ditampilkan.
   - Di dalam kartu pekebun tersebut, hanya input teks `Nama Lengkap` dan dropzone unggah `Scan KK` yang ditampilkan.
   - Catatan verifikator terlihat jelas di bawah masing-masing item.

### Skenario 3: Koreksi Teks & Upload Berkas Baru
1. Ketik perbaikan nama pada input teks `Nama Lengkap`.
2. Unggah berkas pengganti PDF/Gambar pada dropzone `Scan KK`.
3. **Ekspektasi**:
   - Status kartu pekebun berubah menjadi **"Telah Diperbarui"**.
   - Badge / counter sisa item perbaikan berkurang.
   - Tombol utama **"Kirim Ulang Usulan Revisi"** aktif jika seluruh tab revisi lainnya telah terpenuhi.

### Skenario 4: Pengiriman Ulang & Verifikasi Sinkronisasi Master Data
1. Klik tombol **Kirim Ulang Usulan Revisi**.
2. **Ekspektasi**:
   - Proposal sukses dikirimkan kembali dan status berubah menjadi `SUBMITTED`.
   - Buka menu **Master Data Pekebun** di frontend atau query tabel `pekebuns` di database:
     - Nama pekebun telah terupdate sesuai nilai yang dikoreksi.
     - Berkas dokumen KTP/KK pada tabel `dokumen_pekebuns` telah terhubung ke `file_id` yang baru diunggah.
