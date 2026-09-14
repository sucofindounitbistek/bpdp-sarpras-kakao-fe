# Quickstart: Pengujian Fitur Penambahan Kolom Tanggal & Tahun Terbit Rekomtek

**Feature Directory**: `specs/084-export-pekebun-rekomtek-date/`  
**Date**: 2026-09-14  
**Status**: Ready  

---

## 1. Prerequisites

- Pastikan dependensi terpasang di `bpdp-sarpras-kelapa-fe`:
  ```bash
  npm install
  ```
- Jalankan server development frontend:
  ```bash
  npm run dev
  ```

---

## 2. Skenario Uji 1: Verifikasi Ekspor Excel Laporan Titik Koordinat (16 Kolom)

1. Buka browser dan login sebagai akun **Verifikator Ditjenbun** (atau beralih peran via Role Switcher ke `DITJENBUN_VERIFIKATOR`).
2. Masuk ke halaman **Antrean Usulan Rekomtek** (`/ditjenbun/rekomtek`) dan buka salah satu usulan untuk verifikasi (`/ditjenbun/rekomtek/ceki/:id`).
3. Tekan tombol **"Generate Draf Rekomtek"** atau input nomor Rekomtek dan pratinjau dokumen Rekomtek untuk memastikan tanggal generate tersimpan.
4. Gulir ke bagian **Data Pekebun**, klik tombol dropdown **"Ekspor Data Pekebun"**.
5. Pilih **"1. Laporan Titik Koordinat"**.
6. Buka berkas Excel hasil unduhan:
   - Pastikan terdapat **16 kolom** sesuai spesifikasi.
   - Kolom 13 bernilai `Tanggal Terbit Rekomtek` (contoh: `14-09-2026`).
   - Kolom 14 bernilai `Tahun Terbit Rekomtek` (contoh: `2026`).
   - Kolom 15 dan 16 tetap berisi `Latitude` dan `Longitude`.

---

## 3. Skenario Uji 2: Verifikasi Ekspor Excel Laporan Profil Pekebun (12 Kolom)

1. Pada halaman yang sama, klik kembali dropdown **"Ekspor Data Pekebun"**.
2. Pilih **"2. Laporan Profil Pekebun"**.
3. Buka berkas Excel hasil unduhan:
   - Pastikan terdapat **12 kolom** sesuai spesifikasi.
   - Kolom 11 bernilai `Tanggal Terbit Rekomtek` (contoh: `14-09-2026`).
   - Kolom 12 bernilai `Tahun Terbit Rekomtek` (contoh: `2026`).

---

## 4. Skenario Uji 3: Fallback Proposal Belum Terbit Rekomtek

1. Buka usulan yang masih berstatus awal (belum pernah digenerate Rekomtek).
2. Unduh kedua berkas Excel pekebun.
3. Pastikan kolom `Tanggal Terbit Rekomtek` dan `Tahun Terbit Rekomtek` berisi tanda strip `-` tanpa galat runtime atau nilai `Invalid Date`.

---

## 5. Skenario Uji 4: Penarikan Data Usulan Ditjenbun (`exportProposal`)

1. Kembali ke halaman **Antrean Usulan Rekomtek** (`/ditjenbun/rekomtek`).
2. Klik tombol **"Ekspor Data"** di header antrean.
3. Pilih unduh format CSV atau cetak PDF ringkasan.
4. Pastikan kolom `Tanggal Terbit Rekomtek` dan `Tahun Terbit Rekomtek` tercantum mendampingi `No. Rekomtek`.
