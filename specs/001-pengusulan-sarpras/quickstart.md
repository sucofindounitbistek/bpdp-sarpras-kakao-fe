# Quickstart Validation Guide: Modul Pengusulan Sarpras BPDP

Panduan pengujian end-to-end untuk memvalidasi alur pengusulan Sarpras pada aplikasi Vue 3.

## Prerequisites
- Server lokal Vite aktif (`npm run dev`)
- Node.js & Vue 3 environment terkonfigurasi.

## Verification Steps

### Scenario 1: Pengajuan Usulan Baru (Role: PEMOHON)
1. Buka `http://localhost:5173/login` dan lakukan login sebagai Pengurus Koperasi.
2. Navigasi ke Halaman Form Pengusulan (`/pengusulan/baru`).
3. Isi Step 1 (Profil Lembaga) -> Klik **Lanjut**.
4. Isi Step 2 (Data CPCL / Lahan Pekebun) -> Klik **Lanjut**.
5. Pilih Step 3 (Paket Sarpras: Benih/Pupuk) -> Klik **Lanjut**.
6. Unggah Berkas Wajib (KTP, STDB, Proposal) pada Step 4.
7. Klik **Submit Pengajuan**.
8. **Hasil**: Toast `Pengajuan Berhasil Disimpan` muncul, status pengajuan berubah menjadi `SUBMITTED`, dan nomor resi pengusulan diterbitkan.

### Scenario 2: Verifikasi Administrasi Dinas (Role: DINAS_KAB)
1. Login sebagai Dinas Kab/Kota.
2. Buka daftar antrean pengajuan di `/dinas/verifikasi`.
3. Pilih pengajuan yang baru dikirim.
4. Periksa berkas lampiran. Tekan tombol **Setujui Administrasi** & upload berkas BAHV & Rekomtek.
5. **Hasil**: Status pengajuan berubah menjadi `REKOMTEK_KAB_ISSUED`.
