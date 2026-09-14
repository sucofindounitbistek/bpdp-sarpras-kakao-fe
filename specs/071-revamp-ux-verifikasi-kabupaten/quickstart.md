# Quickstart & Verification Guide: Revamp UX Halaman Verifikasi Usulan Kabupaten

**Feature**: `071-revamp-ux-verifikasi-kabupaten`
**Date**: 2026-09-03

## 1. Lingkungan Uji Coba

- URL Halaman: `http://localhost:5173/dinas/verifikasi/kabupaten/545`
- Role Pengguna: `DINAS_KAB` (Dinas Kabupaten)

---

## 2. Skenario Pengujian Antarmuka

### Skenario 1: Verifikasi Tampilan Awal Accordion
1. Akses halaman `/dinas/verifikasi/kabupaten/545`.
2. Amati bahwa halaman menyajikan 5 modul terstruktur dalam kartu accordion seragam.
3. Periksa kondisi awal (*initial state*):
   - **Modul 1 (Peta Spasial)**: Tertutup (*collapsed*).
   - **Modul 2 (Pekebun CPCL)**: Terbuka (*expanded*).
   - **Modul 3 (Berkas Proposal)**: Terbuka (*expanded*).
   - **Modul 4 (Gudang Serah Terima)**: Tertutup (*collapsed* jika paket memiliki gudang).
   - **Modul 5 (RAB)**: Tertutup (*collapsed*).

### Skenario 2: Uji Buka-Tutup & Multi-Expand
1. Klik header **Modul 1 (Peta Spasial)**. Pastikan peta poligon Leaflet terbuka mulus dan modul lain (Pekebun & Berkas Proposal) tidak tertutup paksa.
2. Klik header **Modul 5 (Rencana Anggaran Biaya)**. Pastikan rincian stepper dan tabel RAB tampil rapi.
3. Klik tombol **"Tutup Semua"** di bilah atas. Pastikan kelima modul terlipat rapi.
4. Klik tombol **"Buka Semua"** di bilah atas. Pastikan kelima modul terbuka secara serentak.

### Skenario 3: Reaktivitas Badge Status
1. Di dalam **Modul 3 (Berkas Proposal)**, klik tombol **"Setujui Semua Item"**.
2. Amati badge pada header Modul 3 berubah menjadi hijau **"Semua Sesuai"**.
3. Di dalam **Modul 2 (Pekebun CPCL)**, amati tally status menghitung jumlah pekebun yang berstatus Sesuai vs Belum Diverifikasi secara akurat.

---

## 3. Verifikasi Kompilasi & Build

```bash
# Typecheck
npx vue-tsc -b

# Production Build
npm run build
```
Hasil yang diharapkan: Exit code 0 tanpa galat.
