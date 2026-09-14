# Quickstart & Verification Guide: Export Data Proposal Dinas Kabupaten Sesuai Wilayah Terkait

**Feature**: [`085-export-proposal-wilayah-kabupaten`](spec.md) | **Date**: 2026-09-14

---

## 1. Prasyarat & Lingkungan

- Pastikan dependensi Node.js terinstal: `npm install`
- Server pengembangan dapat dijalankan via: `npm run dev`
- Target browser: Google Chrome, Microsoft Edge, Mozilla Firefox

---

## 2. Skenario Verifikasi Fungsional

### Skenario 1: Tampilan Indikator Wilayah Terkunci pada Modal Ekspor
1. Masuk ke aplikasi sebagai verifikator Dinas Kabupaten (misal akun Kab. Luwu Utara).
2. Navigasikan ke halaman **Antrean Verifikasi Kabupaten** (`/dinas/verifikasi/kabupaten`).
3. Klik tombol **Ekspor Data** di atas tabel antrean.
4. **Verifikasi Visual**:
   - Terdapat banner/card informatif hijau bertuliskan:
     `Cakupan Wilayah: Kab. Luwu Utara (Terkunci Otomatis)`
   - Terdapat catatan penjelas bahwa filter wilayah manual ditangguhkan menunggu API Wilayah dan data dibatasi otomatis untuk kabupaten dinas terkait.
   - Tidak ada dropdown/input wilayah yang membingungkan atau rusak.

### Skenario 2: Akurasi Hitungan Pratinjau (*Live Match Count*)
1. Pada modal yang terbuka, amati indikator: `Total data yang akan diekspor: X Proposal`.
2. Ubah filter status atau paket sarpras.
3. **Verifikasi**:
   - Jumlah proposal diperbarui secara reaktif dan hanya menghitung proposal dari kabupaten dinas terkait.

### Skenario 3: Ekspor Berkas CSV
1. Pilih format **CSV / Excel**.
2. Klik tombol **Unduh Data**.
3. Buka berkas CSV hasil unduhan di aplikasi spreadsheet (Microsoft Excel / LibreOffice).
4. **Verifikasi**:
   - Jumlah baris data cocok 100% dengan angka pada pratinjau.
   - Seluruh proposal berasal dari kelembagaan / lahan di kabupaten dinas terkait. Tidak ada usulan dari kabupaten lain.

### Skenario 4: Ekspor Berkas PDF
1. Buka kembali modal, pilih format **Printable PDF**.
2. Klik tombol **Cetak / Ekspor PDF**.
3. **Verifikasi**:
   - Dialog cetak / pratinjau PDF terbuka.
   - Pada ringkasan filter di bagian atas dokumen tercantum nama kabupaten yang aktif.
   - Seluruh usulan di tabel PDF adalah usulan wilayah kabupaten dinas terkait.

---

## 3. Verifikasi Otomatis & Standar Kualitas

Jalankan perintah berikut di terminal:

```bash
# 1. Menjalankan pengujian unit fungsi export proposal
npx vitest run src/utils/exportProposal.test.ts

# 2. Type-checking menyeluruh TypeScript
npx vue-tsc -b

# 3. Build bundle produksi
npm run build
```

**Kriteria Lolos**:
- Seluruh unit test lulus 100%.
- Exit code `vue-tsc -b` adalah `0` (tanpa error tipe).
- Build Vite produksi berhasil tanpa error.
