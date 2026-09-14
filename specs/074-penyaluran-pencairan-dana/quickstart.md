# Quickstart: Validasi Modul Penyaluran & Pencairan Dana

Panduan validasi manual end-to-end (fase client-simulated). Rujukan entitas: [data-model.md](./data-model.md); rute & menu: [contracts/ui-routes.md](./contracts/ui-routes.md); status backend: [contracts/backend-api.md](./contracts/backend-api.md).

## Prasyarat

- Node versi project (`.nvmrc`/existing), dependensi terpasang
- Peran demo tersedia via pemilih peran (role switcher) aplikasi: `KELEMBAGAAN_PEKEBUN`, `BPDP_VERIFIKATOR`, `BPDP_STAFF`, `BPDP_KADIV`, `SURVEYOR_SCI` (sub-peran Pendok/Verdok/QC/Pusat via data seed), `BANK_MITRA`
- Seed demo ter-load (lihat "Seed Demo" di data-model.md)

## Setup

```bash
npm install
npm run dev
```

Buka aplikasi dan login (SSO dev / akun demo), pilih peran sesuai skenario.

## Validasi Build (wajib sebelum selesai)

```bash
npm run build   # vue-tsc -b && vite build — HARUS lolos tanpa error
```

## Skenario Validasi (urutan = alur bisnis; tiap skenario independen-demonstrasi)

### S1 — PKS 3 Pihak (US1, milestone M1)

1. `BPDP_VERIFIKATOR` → menu "PKS 3 Pihak": proposal SK Dirut Terbit tampil → **Proses Dokumen** → unduh dokumen PKS berhasil (format Word-ready `.doc` + kop "B" terisi profil).
2. `KELEMBAGAAN_PEKEBUN`: unduh template surat kuasa → unggah → isi & submit **Komparisi A.1** (legalitas auto dari profil).
3. `BANK_MITRA`: isi & submit **Komparisi A.3** (nomor rekening KP divalidasi 10–16 digit).
4. `BPDP_VERIFIKATOR`: submit A.2 → set **jadwal ttd** → KP & Bank menerima notifikasi jadwal → unggah hasil ttd → status PKS = `AKTIF`.

**Expected**: status PKS berjalan DIPROSES→KOMPARISI→PENJADWALAN→DITANDATANGANI→AKTIF; semua keputusan tercatat dengan waktu.

### S2 — Wizard Pengajuan Pencairan (US2, M1) — termasuk revisi FINAL

1. `KELEMBAGAAN_PEKEBUN` → menu "Penyaluran Dana" → **Tambah Permohonan**.
2. Step 1: pilih proposal (hanya SK Dirut Terbit) → Data A & B tampil otomatis → pilih jenis pembelian & peruntukan → pilih ≥2 divisi, isi **nilai per divisi** → **total muncul otomatis read-only** (coba input manual total = tidak bisa) → isi rekening + skema transfer.
3. Negatif: isi nilai divisi sehingga Σ > sisa saldo → submit ditolak dengan pesan sisa saldo.
4. Step 2: unduh surat permohonan **PDF** dan **Word** → unggah berttd + dokumen D + unduh/unggah BA.
5. Step 3: "Cek" kelengkapan → Sesuai → simpan; permohonan muncul di list dengan nomor `SRPR-KLPA/DANA/2026/NNN`.

**Expected**: SC-002 (total = Σ divisi selalu), validasi inline (zod) pada rekening/kodepos/email, toast sukses/gagal (tanpa dialog native).

### S3 — Tahap 1 (40%) + Escrow mock (US3, M3)

1. KP: lengkapi checklist 10 dokumen Tahap 1 (3 generated + 7 upload) → ajukan → **ID Penyaluran `….T1`** terbit.
2. `BPDP_VERIFIKATOR`: input nominal (default 40% total) → proses penyaluran → EscrowSaldoCard menampilkan SPP sintetis + status `PENDING→PAID` + saldo 40% masuk.

**Expected**: nominal deviasi menampilkan % dan meminta konfirmasi; tracker mencatat dana masuk.

### S4 — Rantai Verifikasi SCI + Approval BPDP + Transfer Bank (US4, M2)

1. `SURVEYOR_SCI` (Pendok→Verdok→QC→Pusat): tiap tingkat keputusan Sesuai/Tidak + catatan. Negatif: Tolak tanpa catatan → ditolak sistem; Tidak Sesuai + catatan → KP melihat "Dikembalikan untuk Perbaikan" → perbaiki → submit ulang (riwayat utuh).
2. Kantor Pusat: unggah VPD → push ke BPDP.
3. `BPDP_STAFF` review → `BPDP_KADIV` approve (Ya) → generate + upload **Surat Persetujuan**.
4. `BANK_MITRA`: notifikasi → konfirmasi transfer → status tahap `DITRANSFER`.

**Expected**: tingkat berikut terkunci sebelum sebelumnya Sesuai; SC-004 (semua penolakan bercatatan).

### S5 — Gate Tahap 2/3 + Monitoring (US5, M4)

1. Setelah Tahap 1 `DITRANSFER`, KP dapat **mengajukan Tahap 2** (Surat Permohonan "C") — pengajuan tidak diblokir monitoring; halaman menampilkan catatan bahwa penyaluran dana menunggu verifikasi monitoring.
2. Negatif: sebagai BPDP, coba **Proses Penyaluran ke Escrow** Tahap 2 sebelum laporan ≥70% diverifikasi → ditolak dengan alasan gate.
3. `SURVEYOR_SCI` → Monitoring Lapangan: surat tugas → unggah laporan E (progress 75% seed) → `BPDP` verifikasi Ya (tab Monitoring) → dokumen monitoring otomatis tersinkron ke checklist.
4. KP melengkapi **dokumen pembayaran Tahap 2** → BPDP **Proses Penyaluran ke Escrow** (30%) → dana masuk; lanjut rantai verifikasi + Surat Persetujuan → Bank transfer.
5. Ulangi Tahap 3 dengan laporan G 100% → 100% dana terdistribusi; progress bar 40/30/30 penuh.

**Expected**: SC-003 (0 bypass gate); pratinjau PKS Tahap 1 tampil di Tahap 2/3.

### S6 — Pengembalian Dana (US6, M5)

KP unggah permohonan pengembalian → `BPDP` penelitian "Tidak Sesuai" (loop perbaikan) → "Lengkap dan Sesuai" → Surat Pemberitahuan + SK Pembatalan terbit.

### S7 — Sisa Dana & Penutupan Rekening (US7, M5)

Negatif: form penutupan terkunci sebelum bukti sisa dana diunggah → KP unggah bukti → gerbang terbuka → unggah surat penutupan → `BPDP` terima → `BANK_MITRA` proses → status `SELESAI`.

### S8 — Tracking, Notifikasi & Dashboard (US8)

Buka detail permohonan: timeline 6-aktor, progress 40/30/30, saldo escrow, riwayat perbaikan; statistik list (Total/Dalam Proses/Perlu Perbaikan/Dana Masuk) konsisten; stage/kartu "Pencairan Dana" muncul di dashboard; milestone memicu notifikasi in-app + toast.

## Cek Lintas Konstitusi (spot check)

- Toggle dark/light: semua komponen modul konsisten (Prinsip IV/X)
- Viewport 375px: tanpa horizontal overflow; target sentuh ≥44px (VII)
- Skeleton tampil saat load list/tracker (XII); breadcrumb di semua halaman (VI)
- Tidak ada `alert/confirm/prompt` (XI); tanpa modal di dalam modal (XVI)
- Container sejajar navbar `mx-4 lg:mx-6` (XVII); wording baru tidak ada yang hardcode di template (XV) — cek `grep -i "penyaluran dana" src/views/penyaluran-dana` harus via config

## Kriteria Selesai

Semua S1–S8 berjalan sesuai expected, `npm run build` hijau, tidak ada regresi pada modul lain (penyaluran barang, pengusulan, verifikasi) — khususnya setelah redirect stub `/bpdp/penyaluran`.
