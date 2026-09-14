# Quickstart & Verification Guide: Standarisasi Dokumen Persyaratan Dinamis Master Paket

**Feature**: `077-dynamic-package-document-requirements`

## 1. Persiapan Lingkungan

1. Pastikan backend `bpdp-sarpras-kelapa-be` berjalan di port 8080 (`go run cmd/api/main.go`).
2. Pastikan frontend `bpdp-sarpras-kelapa-fe` berjalan di port 5173 (`npm run dev`).

## 2. Skenario Pengujian

### Skenario 1: Verifikasi Proposal Dinas Kabupaten
1. Buka browser dan masuk sebagai role **Dinas Kabupaten**.
2. Masuk ke menu Antrean Verifikasi Proposal, lalu pilih salah satu proposal.
3. Buka tab/step **Verifikasi Dokumen Proposal**.
4. Verifikasi bahwa section **Dokumen Persyaratan Usulan Pemohon** menampilkan daftar syarat yang dimuat dari database master paket (bukan hanya list statis).
5. Dokumen yang terunggah memiliki tombol "Pratinjau Dokumen", status radio Sesuai/Tolak, dan input Catatan Penolakan.

### Skenario 2: Pratinjau Proposal di Tingkat Provinsi / Ditjenbun / BPDP
1. Buka proposal yang sama di akun **Dinas Provinsi** atau **Ditjenbun** atau **BPDP**.
2. Buka tab **Pratinjau Dokumen Usulan** (`PratinjauPekebunDanDokumenProposal.vue`).
3. Verifikasi bahwa daftar berkas pemohon yang ditampilkan identik dan sinkron dengan master paket dan dokumen terunggah.

### Skenario 3: Proposal Existing dengan Berkas Tambahan (Union Strategy)
1. Proposal yang memiliki berkas di luar master paket terkini tetap menampilkan berkas tersebut di bagian bawah daftar dengan penanda dokumen tambahan tanpa menyebabkan error.
