# Quickstart Validation: Integrasi Penyaluran Barang dari Proposal Selesai

**Feature**: `050-penyaluran-from-proposal`
**Date**: 2026-08-28

## Skenario Validasi Manual

### Skenario 1: Verifikasi Penghapusan Tombol 'Buat Permohonan Baru'
1. Buka aplikasi pada rute `/penyaluran-barang/pemohon`.
2. Amati header halaman: pastikan tidak ada tombol *"Buat Permohonan Baru"*.
3. Akses langsung URL `http://localhost:5173/penyaluran-barang/pemohon/tambah` di browser.
4. **Hasil yang diharapkan**: Sistem mengalihkan (*redirect*) kembali ke `/penyaluran-barang/pemohon`.

### Skenario 2: Verifikasi Munculnya Data Penyaluran dari Proposal Selesai
1. Pastikan terdapat proposal dengan status `SELESAI` (misalnya pada store/demo data).
2. Masuk ke halaman `/penyaluran-barang/pemohon`.
3. **Hasil yang diharapkan**: Item dari proposal tersebut tampil di tabel dengan status badge `Draft` (Siap Diajukan Salur).
4. Klik tombol **"Ajukan Penyaluran"** pada baris draft tersebut.
5. Konfirmasi pengajuan: status item berubah menjadi **`Verifikasi Teknis`** (`MENUNGGU_VERIFIKASI_TEKNIS`) dan toast berhasil muncul.

### Skenario 3: Verifikasi Detail & Tabel RAB
1. Klik tombol **"Detail"** pada item penyaluran.
2. **Hasil yang diharapkan**: Modal terbuka menampilkan status tracker, rincian kelembagaan, serta tabel RAB terselaraskan format proposal (tahap 1, tahap 2, total, harga, subtotal).
