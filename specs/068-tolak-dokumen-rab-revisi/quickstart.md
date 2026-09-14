# Quickstart Validation Guide: Tolak Dokumen RAB Dinas Kabupaten & Alur Revisi Dokumen RAB Kelembagaan Pekebun

## Tujuan Validasi
Memastikan seluruh alur penolakan Dokumen RAB oleh Dinas Kabupaten, tinjauan overview read-only dan pengunggahan berkas baru oleh Kelembagaan Pekebun, serta pengiriman ulang proposal berjalan secara mulus dari ujung ke ujung (end-to-end).

---

## Skenario 1: Penolakan Dokumen RAB oleh Dinas Kabupaten/Kota

### Langkah Pengujian:
1. Login sebagai pengguna dengan peran **Dinas Kabupaten**.
2. Masuk ke menu **Verifikasi Proposal** (`/dinas/verifikasi`) dan pilih usulan berstatus `SUBMITTED`.
3. Buka tab verifikasi berkas dan scroll ke bagian **Pemeriksaan RAB**.
4. Pada baris **Dokumen RAB Ditandatangani**, klik tombol **Tolak**.
5. Masukkan catatan penolakan pada textarea (misalnya: *"Stempel basah kelembagaan belum tertera pada dokumen"*).
6. Klik tombol **Kembalikan (Revisi)** di footer halaman dan konfirmasi modal.

### Hasil yang Diharapkan:
- Sistem menampilkan notifikasi sukses pengembalian revisi.
- Status proposal di antrean dan database berubah menjadi `REV_FROM_KAB`.
- Catatan penolakan tersimpan pada validasi dokumen proposal.

---

## Skenario 2: Tinjauan Overview & Upload Ulang Dokumen RAB oleh Kelembagaan Pekebun

### Langkah Pengujian:
1. Login sebagai pengguna dengan peran **Kelembagaan Pekebun**.
2. Buka menu **Tracking Proposal** (`/pengusulan/tracking`) dan temukan usulan yang berstatus `REV_FROM_KAB`.
3. Klik tombol **Revisi Proposal** untuk membuka halaman revisi usulan.
4. Buka **Tab Rencana Anggaran Biaya (RAB)**:
   - Pastikan banner penolakan tampil dengan catatan: *"Stempel basah kelembagaan belum tertera pada dokumen"*.
   - Pastikan tabel rincian RAB tampil dalam mode **Overview (Read-Only)** dengan total anggaran yang sesuai.
   - Klik tombol **Cetak / Unduh RAB (PDF)** dan pastikan berkas format surat RAB berhasil diunduh.
5. Pada bagian **Unggah Dokumen RAB Baru**, pilih file PDF berkas yang sudah diperbaiki.

### Hasil yang Diharapkan:
- Berkas berhasil diunggah dan menghasilkan `file_id` baru.
- Status Dokumen RAB di Tab RAB berubah menjadi **Telah Diperbarui**.
- Buka Tab **Dokumen Proposal**: Dokumen RAB juga otomatis terindikasi berstatus **Telah Diperbarui**.
- Counter item yang perlu perbaikan berkurang hingga 0.

---

## Skenario 3: Pengiriman Ulang Usulan Revisi

### Langkah Pengujian:
1. Pastikan seluruh item dokumen yang ditolak telah berstatus **Telah Diperbarui**.
2. Pastikan tombol **Kirim Ulang Usulan Revisi** aktif (enabled).
3. Klik tombol **Kirim Ulang Usulan Revisi**.

### Hasil yang Diharapkan:
- Muncul toast notifikasi *"Revisi proposal berhasil dikirim ulang"*.
- Pengguna dialihkan ke halaman **Tracking Proposal**.
- Status usulan kembali menjadi `SUBMITTED`.
- Total anggaran proposal tetap konsisten sama dengan nilai awal.
