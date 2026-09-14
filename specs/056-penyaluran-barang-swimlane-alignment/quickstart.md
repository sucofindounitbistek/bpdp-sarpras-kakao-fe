# Quickstart Validation: Penyaluran Barang

## Prerequisites & Roles
- Akses aplikasi web Frontend di `http://localhost:5173`
- Switch role via User Selector / Sidebar:
  1. **Kelembagaan Pekebun**: `/penyaluran-barang/pemohon`
  2. **BPDP Verifikator (Teknis)**: `/penyaluran-barang/verifikator`
  3. **BPDP PPK**: `/penyaluran-barang/ppk`
  4. **BPDP ULP**: `/penyaluran-barang/ulp`
  5. **Surveyor**: `/penyaluran-barang/surveyor`

## End-to-End Test Workflow

1. **Langkah 1 (Pekebun)**:
   - Buka `/penyaluran-barang/pemohon`, klik *Tambah Permohonan Baru*.
   - Lengkapi identitas dan tabel preferensi RAB barang.
   - Klik *Download Format Surat Permohonan*, verifikasi PDF ter-download.
   - Unggah berkas PDF bertandatangan, lalu klik *Kirim Permohonan ke BPDP*.
   - Verifikasi status: `Menunggu Verifikasi BPDP`.

2. **Langkah 2 (BPDP Teknis)**:
   - Ganti role ke *BPDP Verifikator*, buka `/penyaluran-barang/verifikator`.
   - Pilih permohonan baru, klik *Verifikasi Permohonan*.
   - Pilih *Setuju* (Kirim Nota Dinas ke PPK).
   - Verifikasi status berubah menjadi `Disposisi ke PPK`.

3. **Langkah 3 (BPDP PPK)**:
   - Ganti role ke *BPDP PPK*, buka `/penyaluran-barang/ppk`.
   - Klik *Disposisi Pengadaan*, pilih jalur `ULP_TENDER`.
   - Verifikasi status berubah menjadi `Diteruskan ke ULP`.

4. **Langkah 4 (BPDP ULP)**:
   - Ganti role ke *BPDP ULP*, buka `/penyaluran-barang/ulp`.
   - Klik *Mulai Pemilihan Penyedia* (status: `Proses Pemilihan Penyedia`).
   - Klik *Selesaikan Tender & Tetapkan Pemenang*, masukkan nama vendor dan nilai kontrak.
   - Verifikasi status berubah menjadi `Pemenang Ditetapkan` (kembali ke BPDP Teknis).

5. **Langkah 5 (BPDP Teknis - Kontrak & Penugasan)**:
   - Buka kembali `/penyaluran-barang/verifikator`.
   - Klik *Input Dokumen Kontrak "A"*, lengkapi seluruh 10 poin form & berkas.
   - Simpan kontrak (status: `Proses Pelaksanaan Kontrak`).
   - Klik *Terbitkan Surat Tugas Surveyor* (status: `Surveyor Aktif`).

6. **Langkah 6 (Surveyor)**:
   - Ganti role ke *Surveyor*, buka `/penyaluran-barang/surveyor`.
   - Verifikasi antrean penugasan muncul dengan nomor surat tugas dan rincian lokasi gudang pekebun.
