# Quickstart: Pengujian Modal Konfirmasi Penolakan Terkelompok Dinas Kabupaten

## 1. Prerequisites
- Frontend development server aktif: `npm run dev` pada direktori `bpdp-sarpras-kelapa-fe`.
- Login sebagai Verifikator Dinas Kabupaten / buka halaman detail verifikasi proposal: `http://localhost:5173/dinas/verifikasi/:id`.

## 2. Testing Steps

### Scenario 1: Penolakan Dokumen Proposal Saja
1. Buka Tab Berkas Proposal di Langkah 1 Verifikasi.
2. Tandai salah satu dokumen (misal: "Rencana Anggaran Biaya") sebagai **Tolak** dan isi alasan: *"Format rincian RAB belum sesuai"*.
3. Klik tombol **Kembalikan ke Pemohon (Revisi)** di bar navigasi bawah.
4. **Verifikasi**:
   - Modal muncul dengan judul *"Konfirmasi Pengembalian Berkas Usulan (Revisi)"*.
   - Tabel Bagian A (Dokumen Usulan & Kelembagaan) memuat baris RAB dengan nomor, nama, dan catatan.
   - Bagian B (Data Pekebun) tidak menampilkan data kosong atau menampilkan indikator bersih.
   - Tombol Batal menutup modal.

### Scenario 2: Penolakan Campuran (Dokumen Proposal + Pekebun & Lahan Multi-Item)
1. Tolak Dokumen RAB dan Foto Gudang.
2. Buka Tab Pekebun & Lahan, tolak Scan KTP pekebun A (*"NIK buram"*), tolak SHM pekebun A (*"Nomor SHM salah"*), dan tolak SHM pekebun B (*"Lahan beririsan"*).
3. Klik **Kembalikan ke Pemohon (Revisi)**.
4. **Verifikasi**:
   - Tabel A menampilkan 2 baris (RAB dan Foto Gudang).
   - Tabel B menampilkan Pekebun A dengan 2 baris item yang dikelompokkan rapi di bawah nama Pekebun A, dan Pekebun B dengan 1 baris item.
5. Klik **Kembalikan ke Pemohon**.
6. **Verifikasi**:
   - Tombol menunjukkan loading spinner.
   - Proposal beralih status ke `REV_FROM_KAB` dan browser terarahkan kembali ke `/dinas/verifikasi`.
