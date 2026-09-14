# Quickstart Validation: Pekebun Timeline Step View & Wording Refinement

## Prerequisites
- Server Node.js (v18+)
- Proyek front-end dikonfigurasi & dependencies diinstal (`npm install`)

---

## Run Development Server
Jalankan perintah berikut di terminal:
```bash
npm run dev
```
Buka peramban ke [http://localhost:5173](http://localhost:5173) (atau port yang tertera) dan masuk sebagai Pemohon/BPDP/Dinas.

---

## Validation Scenarios

### Scenario 1: Penyelarasan Wording
1. Navigasi ke menu **Pengajuan Proposal** atau tracking status usulan.
2. Klik salah satu usulan untuk membuka detail usulan.
3. Di bagian bawah detail usulan, cari kartu **Alur Posisi Pengajuan (Workflow Timeline)**.
4. Verifikasi wording yang tampil tepat 5 langkah dengan urutan:
   - Langkah 1: `Submit Proposal`
   - Langkah 2: `Verifikasi Dinas Kab/Kota`
   - Langkah 3: `Asistensi Dinas Provinsi`
   - Langkah 4: `Penerbitan Rekomtek Ditjenbun`
   - Langkah 5: `Penerbitan SK Dirut BPDP`

### Scenario 2: Responsivitas Mobile-First (WCAG AA & Compact Layout)
1. Buka Chrome DevTools (`F12`), ubah viewport ke mode device emulasi (e.g., iPhone SE dengan lebar 375px).
2. Verifikasi stepper bertransformasi menjadi vertikal stacked list yang rapi:
   - Garis penghubung vertikal di sisi kiri menyambungkan lingkaran nomor langkah.
   - Tidak ada teks label yang terpotong.
   - Tidak ada overflow horizontal pada halaman.
3. Ubah kembali viewport ke desktop (lebar > 768px).
4. Verifikasi stepper kembali menjadi horizontal dengan garis lurus kontinu di belakang lingkaran langkah.

### Scenario 3: Pengujian Status Aktif/Selesai
1. Pilih proposal dengan status `SUBMITTED`. Verifikasi:
   - Langkah 1 berwarna Hijau (Selesai).
   - Langkah 2 berwarna Amber/Pulsing (Aktif).
   - Langkah 3, 4, 5 berwarna Abu-abu (Pending).
2. Pilih proposal dengan status `SK_DITJENBUN_ISSUED`. Verifikasi:
   - Langkah 1, 2, 3, 4 berwarna Hijau (Selesai).
   - Langkah 5 berwarna Amber/Pulsing (Aktif).
3. Pilih proposal dengan status `COMPLETED`. Verifikasi:
   - Langkah 1 s.d 5 semuanya berwarna Hijau (Selesai).
4. Pilih proposal dengan status `REVISION_ADMIN`. Verifikasi:
   - Langkah 1 berwarna Amber khusus dengan ikon peringatan (`AlertTriangle` / `Clock`).
