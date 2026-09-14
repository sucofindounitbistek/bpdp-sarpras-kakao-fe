# Quickstart: Modul Penyaluran Barang (Ekstensifikasi & Intensifikasi)

**Feature**: `045-penyaluran-barang-ekstensifikasi-intensifikasi`
**Date**: 2026-08-27

---

## 1. Menjalankan Aplikasi
1. Pastikan dependensi telah terinstall:
   ```bash
   npm install
   ```
2. Jalankan development server:
   ```bash
   npm run dev
   ```
3. Buka browser pada `http://localhost:5173`.

---

## 2. Skenario Pengujian Alur Lintas Role (End-to-End Walkthrough)

### Tahap 1: Pengajuan oleh Kelembagaan Pekebun
1. Pada header dropdown *Role Switcher*, pilih role **`Kelembagaan Pekebun`**.
2. Pada sidebar, klik menu **`Penyaluran Barang`** (badge Mockup).
3. Isi data preferensi RAB barang (e.g. *Bibit Kelapa Kopyor*, 500 Batang).
4. Klik tombol **Download Surat Permohonan** -> browser mengunduh berkas PDF preview.
5. Unggah surat permohonan dan klik **Kirim Permohonan**.
6. Status permohonan menjadi `Menunggu Verifikasi BPDP`.

### Tahap 2: Verifikasi oleh BPDP Verifikator (Teknis)
1. Ganti role di topbar ke **`BPDP (Verifikator)`**.
2. Pada sidebar, pilih menu **`Penyaluran Barang`**.
3. Buka permohonan yang baru masuk, periksa berkas, lalu klik **Setujui (Kirim Nota Dinas ke PPK)**.
4. Status permohonan menjadi `Disposisi ke PPK`.

### Tahap 3: Disposisi oleh BPDP PPK
1. Ganti role di topbar ke **`BPDP PPK`**.
2. Pada sidebar, pilih menu **`Penyaluran Barang`**.
3. Buka permohonan dan klik **Disposisi ke BPDP ULP** (Tender e-catalog).
4. Status permohonan menjadi `Disposisi ke ULP`.

### Tahap 4: Pelaksanaan Tender oleh BPDP ULP
1. Ganti role di topbar ke **`BPDP ULP`**.
2. Pada sidebar, pilih menu **`Penyaluran Barang`**.
3. Klik **Mulai Pemilihan Penyedia** (status menjadi `Proses Pemilihan Penyedia`).
4. Setelah proses selesai, klik **Selesai Tender & Tetapkan Pemenang**, masukkan nama PT/Vendor dan nilai penawaran.
5. Status permohonan menjadi `Penetapan Pemenang`.

### Tahap 5: Pembuatan Dokumen Kontrak "A" & Surat Surveyor
1. Ganti role kembali ke **`BPDP (Verifikator)`**.
2. Buka menu **`Penyaluran Barang`** -> permohonan berstatus *Penetapan Pemenang*.
3. Klik **Input Dokumen Kontrak "A"**, isi nomor kontrak, upload berkas kontrak, harga satuan, termin pembayaran & penyaluran.
4. Klik **Simpan Kontrak** (status berubah menjadi `Proses Pelaksanaan Kontrak`).
5. Klik **Terbitkan Surat Tugas Surveyor** untuk sampling & monitoring.
6. Alur pengadaan barang selesai dengan sukses.
