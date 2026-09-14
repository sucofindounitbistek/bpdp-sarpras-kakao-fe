# Quickstart & Verification Guide: Sinkronisasi Dua Arah Dokumen Legalitas KP dan Surat Penunjukan Ketua (IAM ⇄ Sarpras)

**Feature**: `079-sync-iam-legalitas-dokumen`  
**Date**: 2026-09-09

Panduan ini berisi skenario verifikasi mandiri (*runnable test workflows*) untuk membuktikan bahwa integrasi sinkronisasi dokumen antara IAM dan Sarpras berjalan dengan benar sesuai spesifikasi.

---

## Prasyarat Lingkungan
1. Layanan backend `bpdp-iam-be` aktif di port `8080` (atau mock server internal).
2. Layanan backend `bpdp-sarpras-kelapa-be` aktif di port `8082`.
3. Aplikasi frontend `bpdp-sarpras-kelapa-fe` aktif di `http://localhost:5173`.
4. Akun Kelembagaan Pekebun (`kelembagaan_id = 105`) yang telah memiliki dokumen `legalitas_kp` dan `penunjukan_ketua` di database IAM.
5. Konfigurasi `X-Internal-Secret` terpasang sama pada kedua backend.

---

## Skenario 1: Auto-Attach Dokumen dari IAM saat Pengusulan Baru (User Story 1 - MVP)

1. **Langkah Pengujian**:
   * Buka browser dan login ke `bpdp-sarpras-kelapa-fe` sebagai akun Pemohon Kelembagaan Pekebun.
   * Masuk ke menu **Pengusulan Sarpras** ➔ Buat Usulan Baru.
   * Lalui langkah pemilihan paket, pemilihan pekebun & lahan, hingga tiba di **Tahap 4: Upload Dokumen Persyaratan**.
2. **Kriteria Kelulusan (Expected Outcome)**:
   * Slot **"4. Legalitas Kelembagaan / Akta"** dan **"5. Surat Penunjukan Ketua / SK Pengurus"** langsung bertanda hijau dengan status **"✓ Terverifikasi dari IAM"**.
   * Pemohon **tidak perlu memilih berkas apa pun**.
   * Klik tombol **"Lihat Dokumen"** pada masing-masing slot: dokumen PDF terbuka secara sempurna melalui Presigned URL.
   * Klik tombol **"Lanjut ke Tahap RAB"**: sistem mengizinkan navigasi tanpa error validasi berkas.

---

## Skenario 2: Revisi Kedua Dokumen & Reverse-Sync ke IAM (User Story 2)

1. **Langkah Pengujian**:
   * Masuk sebagai Verifikator Dinas Kabupaten, buka usulan aktif.
   * Tolak Dokumen Akta dan Dokumen SK Penunjukan Ketua dengan catatan revisi: *"Masa berlaku SK habis dan akta perlu lembar AHU"*.
   * Kembalikan usulan ke status `REV_FROM_KAB`.
   * Login kembali sebagai Pemohon, buka **Detail Usulan** ➔ **Halaman Revisi** (`RevisiProposalView.vue`).
   * Amati tampilan kedua dokumen berlabel oranye/merah *"Perlu Perbaikan"*.
   * Unggah berkas baru untuk Akta Legalitas (`Akta_Perubahan_2026.pdf`) dan SK Penunjukan Ketua (`SK_Ketua_Baru_2026.pdf`).
   * Isi kolom tanggapan pemohon dan klik **"Submit Perbaikan Usulan"**.
2. **Kriteria Kelulusan (Expected Outcome)**:
   * Usulan di Sarpras berhasil berpindah status kembali ke `VERIFIKASI_KABUPATEN`.
   * Di tabel `dokumen_proposals` Sarpras, kedua dokumen tercatat sebagai `version = 2`, sementara versi 1 berstatus `SUPERSEDED`.
   * Cek database IAM: tabel `kelembagaan_pekebun_uploads` untuk lembaga tersebut telah menunjuk ke `object_key` berkas baru yang diunggah dari Sarpras.
   * Tabel `audit_logs` di IAM mencatat kejadian pembaruan otomatis dari Sarpras.

---

## Skenario 3: Peninjauan Riwayat Versi Dokumen oleh Verifikator (User Story 3)

1. **Langkah Pengujian**:
   * Login sebagai Verifikator Dinas Kabupaten.
   * Buka usulan revisi di antrean verifikasi usulan.
   * Buka tab **Dokumen Persyaratan**.
2. **Kriteria Kelulusan (Expected Outcome)**:
   * Slot Akta dan SK Penunjukan Ketua berlabel **"Versi 2 (Revisi)"**.
   * Klik tombol **"Bandingkan dengan Versi 1"**: modal perbandingan terbuka menampilkan berkas lama (V1 yang ditolak), catatan dinas sebelumnya, berkas baru (V2), dan catatan tanggapan pemohon.
   * Klik **"Setujui Dokumen"**: status dokumen berubah hijau menjadi "SESUAI".

---

## Skenario 4: Graceful Fallback saat Layanan IAM Down (Resilience)

1. **Langkah Pengujian**:
   * Simulasikan server IAM mati (hentikan proses IAM BE).
   * Pemohon membuka halaman Pengusulan Tahap 4 di Sarpras.
2. **Kriteria Kelulusan (Expected Outcome)**:
   * Form tidak mengalami layar putih (*white screen/crash*).
   * Tampil notifikasi informatif: *"Gagal mengambil dokumen otomatis dari IAM. Anda dapat mengunggah berkas secara manual."*
   * Form upload manual aktif dan dapat menerima berkas lokal seperti biasa.
