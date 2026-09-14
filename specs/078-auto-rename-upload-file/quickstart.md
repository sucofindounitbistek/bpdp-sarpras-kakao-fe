# Quickstart & Validation Guide: Auto-Rename File Upload

**Feature**: `078-auto-rename-upload-file`  
**Date**: 2026-09-09  
**Status**: Complete  

Panduan ini berisi langkah-langkah verifikasi cepat untuk menguji fungsi auto-rename berkas secara menyeluruh dari sisi antarmuka dan pengunggahan berkas ke backend.

---

## 1. Prasyarat & Menjalankan Aplikasi

1. Buka terminal di direktori `bpdp-sarpras-kelapa-fe`:
   ```bash
   npm run dev
   ```
2. Buka peramban di `http://localhost:5173` (atau port Vite yang aktif).
3. Pastikan backend `bpdp-sarpras-kelapa-be` aktif atau gunakan token autentikasi yang valid.

---

## 2. Skenario Pengujian

### Skenario 1: Unggah Berkas Tahap Draf Pemohon (Belum Ada No Proposal)
1. Login sebagai peran **Pemohon** (Kelembagaan Pekebun).
2. Buat pengusulan baru, masuk ke langkah **Step Upload Dokumen**.
3. Pilih berkas lokal dari komputer Anda dengan nama sembarang, misal: `Scan_KTP_Ketua(1).pdf`.
4. **Hasil yang Diharapkan**:
   - Kartu pratinjau `FileUpload.vue` secara instan menampilkan nama berkas baru:
     ```text
     KTP_DRAFT_Koperasi-Tani-Makmur.pdf
     ```
   - Karakter spasi, kurung, dan simbol acak otomatis dibersihkan.
   - Tombol "Pilih Berkas" berubah menjadi "Ganti Berkas" dengan teks nama standar berwarna hijau/emerald.

### Skenario 2: Unggah Berkas pada Proposal dengan Nomor Aktif
1. Masuk ke halaman **Revisi Proposal** atau **Detail Pengusulan** yang telah memiliki Nomor Proposal (contoh: `SPKA109260001`).
2. Unggah berkas perbaikan untuk dokumen `RAB Usulan`.
3. Pilih berkas lokal: `rab_revisi_final_ttd.pdf`.
4. **Hasil yang Diharapkan**:
   - Berkas di-rename secara otomatis menjadi:
     ```text
     RAB-Usulan_SPKA109260001_Koperasi-Tani-Makmur.pdf
     ```
   - Payload multipart yang dikirim ke backend membawa nama berkas standar tersebut.

### Skenario 3: Unggah Multi-Berkas dengan Sub-Label (Foto Gudang)
1. Buka langkah **Step Paket Sarpras** (khususnya bagian gudang serah terima).
2. Unggah foto tampak depan dan tampak dalam gudang menggunakan berkas kamera biasa: `IMG_20260909_12345.jpg`.
3. **Hasil yang Diharapkan**:
   - Foto tampak depan otomatis menjadi:
     ```text
     Foto-Gudang-Depan_SPKA109260001_Koperasi-Tani-Makmur.jpg
     ```
   - Foto tampak dalam otomatis menjadi:
     ```text
     Foto-Gudang-Dalam_SPKA109260001_Koperasi-Tani-Makmur.jpg
     ```

### Skenario 4: Unggah Dokumen Verifikator (RAB TTD, Rekomtek, SK Dirut)
1. Login sebagai **Dinas Kabupaten / Provinsi / Ditjenbun / BPDPKS**.
2. Masuk ke halaman verifikasi usulan aktif.
3. Unggah dokumen resmi bertandatangan (misal `RAB Ditandatangani`).
4. **Hasil yang Diharapkan**:
   - Berkas tersimpan dan tampil dengan nama:
     ```text
     RAB-Ditandatangani_SPKA209260001_Nama-Kelembagaan.pdf
     ```
5. Klik tautan dokumen untuk mengunduh, pastikan berkas yang terunduh ke komputer penguji tetap mempertahankan nama standar tersebut.

---

## 3. Validasi Build & Tipe Data
Jalankan pemeriksaan tipe data dan kompilasi production:
```bash
npm run build
```
Pastikan kompilasi lulus 100% tanpa error TypeScript.
