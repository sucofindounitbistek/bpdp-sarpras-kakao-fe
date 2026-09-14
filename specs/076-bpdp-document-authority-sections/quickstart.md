# Quickstart: Skenario Validasi Fitur Section Kewenangan Dokumen BPDP

**Feature**: `076-bpdp-document-authority-sections`
**Date**: 2026-09-08

## 1. Prasyarat Pengujian

1. Frontend berjalan lokal via `npm run dev` pada port `5173` (atau port aktif saat ini).
2. Backend `bpdp-sarpras-kelapa-be` berjalan pada port `8080`.
3. Akun uji aktif dengan role:
   - `BPDP_APPROVAL` (Kepala Divisi BPDP)
   - `BPDP_VERIFIKATOR` (Peneliti BPDP)

## 2. Skenario Validasi

### Skenario 1: Verifikasi Tampilan Mode Inspeksi (BPDP Approval)
1. Buka browser dan login sebagai `BPDP_APPROVAL`.
2. Akses halaman proposal berstatus `SK_DIRUT_PUBLISHED` atau `SELESAI` via URL:
   `/bpdp/approval/:id`
3. Masuk ke **Step 2: Inspeksi Dokumen & Pushback**.
4. **Verifikasi**:
   - Terdapat 4 kartu section mandiri:
     1. **Dinas Kabupaten / Kota** (berisi 4 berkas: RAB Final, SK CPCL, BA Verifikasi Dokumen, BA Verifikasi Lapangan).
     2. **Dinas Provinsi** (berisi 1 berkas: Surat Pengantar SK CPCL).
     3. **Ditjen Perkebunan** (berisi 1 berkas: Rekomendasi Teknis / REKOMTEK).
     4. **BPDP** (berisi 1 berkas: Laporan Keputusan Hasil Penelitian).
   - Setiap kartu memiliki badge peran pembeda dan deskripsi ringkas kewenangannya.
   - Klik tombol **Tolak** pada salah satu dokumen Kabupaten -> pastikan textarea catatan penolakan muncul di bawah dokumen tersebut dan ringkasan temuan di panel kanan ter-update.

### Skenario 2: Verifikasi Tampilan Mode Reguler (BPDP Approval)
1. Akses halaman proposal berstatus `BPDP_VERIF_SUBMITTED` pada `/bpdp/approval/:id`.
2. Masuk ke **Step 2: Persetujuan Penelitian**.
3. **Verifikasi**:
   - Panel kiri berfokus pada evaluasi Keputusan Laporan Penelitian BPDP.
   - Panel kanan ("Hasil Penelitian Dokumen Usulan") menampilkan 3 sub-section instansi:
     1. Sub-section Kabupaten
     2. Sub-section Provinsi
     3. Sub-section Ditjenbun
   - Setiap sub-section menampilkan nama dokumen, badge status disetujui/ditolak dari peneliti, serta tombol pratinjau.

### Skenario 3: Verifikasi Tampilan Penelitian Dokumen (BPDP Verifikator)
1. Login sebagai `BPDP_VERIFIKATOR`.
2. Akses halaman `/bpdp/ceki/:id`.
3. Masuk ke **Step 2: Penelitian Kepatuhan & Dokumen**.
4. **Verifikasi**:
   - 5 dokumen resmi terkelompok dalam kartu section instansi:
     - Section Kabupaten: 3 dokumen (BA Dokumen, BA Lapangan, SK CPCL).
     - Section Provinsi: 1 dokumen (Surat Pengantar SK CPCL).
     - Section Ditjenbun: 1 dokumen (Rekomendasi Teknis).
   - Seluruh interaksi toggle kesesuaian (Sesuai / Tidak Sesuai), catatan perbaikan, dan unduh berkas berfungsi normal.

## 3. Validasi Build & Bebas Kesalahan
Jalankan di terminal frontend:
```bash
npm run build
```
Pastikan kompilasi TypeScript dan Vite selesai dengan status **exit code 0 (0 error)**.
