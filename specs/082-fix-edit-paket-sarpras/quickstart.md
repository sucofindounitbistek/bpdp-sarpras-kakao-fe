# Quickstart Validation Guide: Paket Sarpras & Dokumen Persyaratan (Frontend)

**Feature**: `082-fix-edit-paket-sarpras`  
**Date**: 2026-09-12  
**Status**: Ready  

---

## 1. Prerequisites

- Frontend dev server running on `http://localhost:5173`.
- Backend server running on `http://localhost:8080`.
- Login sebagai Superadmin atau Admin BPDPKS.

---

## 2. Validation Scenarios

### Scenario 1: Membuka Modal Edit Paket Sarpras (Hanya 1 Field Nama Paket)
1. Buka menu **Master Data > Paket Sarpras** (`/master-data/paket-sarpras`).
2. Klik tombol **Edit** pada salah satu paket (misal: Ekstensifikasi).
3. **Verifikasi**:
   - Modal tampil tanpa input redundan "Label Singkat".
   - Input **Nama Paket** terisi teks nama lengkap paket.
   - Checklist dokumen menampilkan badge `[WAJIB]` atau `[OPSIONAL]` pada tiap item.

### Scenario 2: Submit Pembaruan Paket Sarpras Tanpa Kendala
1. Ubah salah satu nilai non-kritis (misal: jumlah tahap atau keterangan).
2. Biarkan Nama Paket terisi nilai default.
3. Klik tombol **"Simpan Perubahan"**.
4. **Verifikasi**:
   - Tidak ada toast error *"Nama paket wajib diisi"*.
   - Muncul toast hijau: *"Paket [Nama] berhasil diperbarui"*.
   - Modal tertutup dan kartu paket ter-refresh.

### Scenario 3: Pengaturan Status Wajib vs Opsional Dokumen Persyaratan
1. Buka menu **Master Data > Dokumen Persyaratan** (`/master-data/dokumen-persyaratan`).
2. Klik tombol Edit pada salah satu dokumen.
3. Ubah status sifat dokumen dari "Wajib" menjadi "Opsional" (atau sebaliknya).
4. Klik **"Simpan"**.
5. **Verifikasi**:
   - Tabel menampilkan badge baru yang sesuai (`WAJIB` warna merah, `OPSIONAL` warna abu-abu).
   - Pada kartu paket sarpras yang menggunakan dokumen tersebut, badge dokumen ikut berubah.

### Scenario 4: Verifikasi Alur Proposal dengan Dokumen Opsional Kosong
1. Login sebagai Pemohon, buka pengajuan proposal baru hingga tahapan **Upload Dokumen**.
2. Unggah seluruh dokumen bertanda **Wajib**.
3. Kosongkan dokumen bertanda **Opsional**.
4. Klik **Lanjutkan / Simpan**.
5. **Verifikasi**:
   - Sistem mengizinkan lanjut ke tahap berikutnya tanpa error validasi berkas.
