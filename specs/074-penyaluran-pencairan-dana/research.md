# Research: Modul Penyaluran & Pencairan Dana

**Date**: 2026-09-04 | **Status**: Semua NEEDS CLARIFICATION terpecahkan

Riset dilakukan langsung terhadap repo frontend (`bpdp-sarpras-kelapa-fe`), repo backend sibling (`bpdp-sarpras-kelapa-be`, `bpdp-iam-be`), dan preseden fitur (specs 015, 045). Bukti path file dicantumkan per keputusan.

---

## D-1. Mode pengiriman: mockup client-simulated (bukan API nyata)

- **Decision**: Modul dibangun 100% client-simulated — data demo + mutasi state di Pinia store `src/stores/penyaluranDana.ts` (persist via `pinia-plugin-persistedstate`), mengikuti preseden `src/stores/penyaluranBarang.ts` (INITIAL_DEMO_DATA inline, tanpa service call).
- **Rationale**: Verifikasi Konstitusi XIII ke `bpdp-sarpras-kelapa-be` (2026-09-04): grep seluruh kode Go untuk `pencairan|escrow|pks-3pihak|penyaluran-dana|Pencairan` → **0 hasil**. Tidak ada route/handler/DTO. Keputusan klarifikasi pengguna juga menegaskan fase "FE only". Konstitusi XIII melarang mengarang endpoint palsu → client-simulated + dokumentasi gap di `contracts/backend-api.md`.
- **Alternatives considered**: (a) Integrasi API nyata — ditolak: endpoint tidak ada; (b) mock HTTP interceptor — ditolak: lebih rumit, tidak ada pola existing-nya; (c) store murni tanpa persist — ditolak: perpindahan peran (KP→BPDP→SCI→Bank) wajib mempertahankan data antar sesi, pola persist sudah dipakai `pengusulanDraft.ts`.

## D-2. Peran baru: tambah kode peran di FE mengikuti preseden PPK/ULP/SURVEYOR

- **Decision**: Tambah 4 entri `ROLE_DETAILS_MAP` (`src/types/role.ts`): `BPDP_STAFF`, `BPDP_KADIV`, `SURVEYOR_SCI` (dengan field `subRole?: 'PENDOK'|'VERDOK'|'QC'|'PUSAT'` pada data pengguna demo — satu peran IAM + sub-peran, sesuai asumsi spec), `BANK_MITRA`. Navigasi: section baru di `src/composables/useNavigation.ts`; proteksi rute via `meta.roles` di `src/router/index.ts`. `BPDP_VERIFIKATOR` existing dipakai untuk PKS 3 Pihak.
- **Rationale**: Preseden terbukti: 045 menambahkan `BPDP_PPK`, `BPDP_ULP`, `SURVEYOR` dengan cara yang sama (role.ts, useNavigation, router) tanpa menyentuh IAM. Overlay permission dinamis IAM (`rolePermission.service.getMyPermissions`) bersifat opsional/fallback (console.warn) sehingga modul tetap berjalan saat IAM belum mengenal peran baru.
- **Alternatives considered**: (a) 4 peran SCI terpisah — ditolak: rencana implementasi sumber merekomendasikan satu peran + sub-peran, memperkecil ledakan peran IAM; (b) memetakan BPDP_STAFF/KADIV ke BPDP_VERIFIKATOR/APPROVAL existing — ditolak untuk kejelasan antrean demo, namun rute approval tetap membuka `BPDP_APPROVAL` sebagai fallback akses agar bisa diuji dengan akun BPDP existing.

## D-3. Wizard & pola UI: clone pola Penyaluran Barang + Form Pengusulan

- **Decision**: List+statistik KP mengikuti `PekebunPermohonanBarangView.vue` (kartu statistik + tabel + modal); wizard 3-step mengikuti komposisi step Form Pengusulan (`FormPengusulanView.vue`, step components terpisah); tracker mengikuti `PenyaluranTimelineTracker.vue`; verifikasi per-dokumen Sesuai/Tidak + catatan mengikuti pola Satker + `RiwayatPerbaikanList`.
- **Rationale**: Spec eksplisit menyebut pola-pola ini sebagai acuan (fondasi eksisting #3); meminimalkan risiko UI dan review.
- **Alternatives considered**: Desain baru dari nol — ditolak: inkonsisten dengan basis kode dan konstitusi (IV, XIV, XVII).

## D-4. Total permohonan: computed dari nilai per divisi (revisi FINAL)

- **Decision**: `total = computed(() => Σ divisiItems.nilai)` di store/getter — TIDAK disimpan sebagai state bebas (Prinsip V zero-redundant state). UI menampilkan total read-only; zod memvalidasi setiap nilai divisi > 0.
- **Rationale**: Revisi FINAL spec + SC-002 (total selalu = Σ divisi); Prinsip V melarang state duplikat turunan.
- **Alternatives considered**: Simpan total sebagai field yang di-sync saat submit — ditolak: rawan mismatch; hanya boleh di-serialize saat persist (derived value diizinkan pada snapshot persist).

## D-5. Gate 40/30/30 dan lock tahap

- **Decision**: `PencairanTahap` menyimpan `persen` (40/30/30) dan `gateProgress` (0.7/1.0). Tombol "Ajukan Tahap n" disabled + tooltip syarat bila `laporanMonitoring.progress < gate`; nominal default dihitung `total × persen` tetap diinput/konfirmasi BPDP (FR-017), sistem menampilkan % hasil hitung dan meminta konfirmasi bila menyimpang (edge case spec).
- **Rationale**: SC-003 (0 pelanggaran gate) + alur sumber #2.5–2.6; basis 40/30/30 tidak diklarifikasi (deferred) → konfirmasi persentase menjaga kebenaran tanpa menebak basis final.
- **Alternatives considered**: Hard-lock nominal persis 40% — ditolak: sumber memberi wewenang input nominal pada BPDP.

## D-6. Generator dokumen: HTML→print PDF client-side; gap format Word

- **Decision**: Generator dokumen (`utils/pencairanDocsGenerator.ts`) mengikuti pola `permohonanPdfGenerator.ts` (string HTML → window.print/download). Dokumen: template Surat Kuasa, Surat Permohonan (isi + ttd), PKS 3 Pihak + kop "B", Berita Acara, Surat Persetujuan. Format **Word (.docx) tidak dibuat** di fase ini (tidak ada lib docx di project; menambah dependensi = keputusan fase integrasi) — tombol "Unduh Word" men-download file HTML `.doc` (MIME `application/msword`, trik HTML-in-doc yang dibuka Word) SEBAGAI opsi format kedua tanpa dependensi baru.
- **Rationale**: FR-013 minta PDF **dan** Word; pola existing hanya HTML/PDF; konstitusi anti-dependensi prematur (YAGNI). `.doc`-via-HTML memenuhi janji UI tanpa risiko.
- **Alternatives considered**: (a) tambah pustaka `docx` — ditolak (bloat fase mockup); (b) hanya PDF — ditolak: melanggar FR-013.

## D-7. Integrasi pembayaran escrow (Odoo): mock + status tertunda

- **Decision**: `TransferEscrow` disimulasikan di store: aksi "Proses Penyaluran" menghasilkan `odooSppNo` sintetis (`SPP-<yyyymmdd>-<seq>`), `statusPembayaran: PENDING → PAID` setelah delay/konfirmasi. Tidak ada network call. Gap integrasi + kontrak masa depan terdokumentasi di `contracts/backend-api.md`.
- **Rationale**: Asumsi spec (mode mock pola DUKCAPIL); edge case gangguan integrasi → status tertunda bukan gagal diam-diam.
- **Alternatives considered**: Simulasi fetch dengan delay acat gagal — ditolak: menambah kompleksitas tanpa nilai validasi FE.

## D-8. Notifikasi: event log in-app (bell) simulasi + toast

- **Decision**: Setiap milestone menulis entri ke `notifications` di store (ditampilkan pada bell existing jika store notifikasi existing tersedia; minimal: toast + badge pada tracker). Kanal email/WA di luar scope FE — dicatat sebagai event di riwayat.
- **Rationale**: FR-030/SC-006; kanal eksternal adalah urusan backend; FE membuktikan pemicu & payload event.
- **Alternatives considered**: Integrasi service notifikasi nyata — tidak ada endpoint (D-1).

## D-9. Penomoran & ID Penyaluran

- **Decision**: Nomor permohonan: `SRPR-KLPA/DANA/<YYYY>/<NNN>` (counter di store, seed demo). ID Penyaluran per permohonan-tahap: `<KODE-PERMOHONAN>.T1|.T2|.T3` — karena klarifikasi Q1=banyak permohonan per proposal, kode permohonan dijadikan basis (bukan nomor proposal) agar unik; contoh seed tetap `SPKA106260001.T1` (permohonan pertama proposal SPKA106260001).
- **Rationale**: FR-015/FR-029/FR-032 + keputusan klarifikasi Q1.
- **Alternatives considered**: Suffix `-2` untuk permohonan kedua pada proposal sama — ditolak: bentrok dengan format baku `.Tn` dari diagram.

## D-10. Dashboard pipeline: tambah stage, bukan modul dashboard baru

- **Decision**: Tambah kanal "Pencairan Dana" pada statistik/tracking (view KP) + item nav terpisah; integrasi ke `MetricCards.vue`/pipeline dashboard existing hanya menambahkan 1 kartu/stage stage config bila struktur mendukung tanpa refactor.
- **Rationale**: FR-031 non-invasif; menghindari perubahan besar modul dashboard (non-destructive addition, konvensi 045).
- **Alternatives considered**: Merombak dashboard pipeline — ditolak: di luar scope, berisiko regresi modul lain.

## D-11. Format Rupiah & tanggal: pakai util terpusat

- **Decision**: Import `formatRupiah`/`formatDate` dari `src/utils/exportProposal.ts` untuk SEMUA tampilan nominal/tanggal modul ini.
- **Rationale**: Prinsip V — modul penyaluran-barang melanggar ini (6 file mendefinisikan `formatRupiah` inline); modul baru wajib tidak mengulanginya.
- **Alternatives considered**: Ikut tren inline — ditolak (konstitusi).

## D-12. Status pipeline & state machine (ringkas, detail di data-model.md)

- **Decision**: Status PKS: DIPROSES→KOMPARISI→PENJADWALAN→DITANDATANGANI→AKTIF. Status tahap: DIAJUKAN→VERIF_SCI→VERIF_BPDP→DISETUJUI→DITRANSFER (+DITOLAK/perbaikan loop kembali ke DIAJUKAN dengan riwayat). Verifikasi SCI: PENDOK→VERDOK→QC→PUSAT. Semua transisi hanya via aksi store terpusat (auditable).
- **Rationale**: Spec 5.3 pipeline + FR-020/021; transisi terpusat memudahkan tracker & riwayat.
- **Alternatives considered**: Status bebas per komponen — ditolak (single source of truth).

---

## Ringkasan verifikasi Konstitusi XIII (backend)

| Target | Metode | Hasil |
|--------|--------|-------|
| `bpdp-sarpras-kelapa-be` (repo Go sibling, ada di disk) | grep `pencairan\|escrow\|pks-3pihak\|penyaluran-dana\|Pencairan` seluruh `*.go` | **0 kecocokan** → tidak ada endpoint |
| `bpdp-iam-be` | peran baru belum terdaftar (peran dikelola IAM; FE menambah kode peran mengikuti preseden 045) | gap terdokumentasi |
| Kesimpulan | — | Seluruh modul = client-simulated berlabel jelas; kontrak API masa depan ditulis di `contracts/backend-api.md` sebagai spesifikasi untuk tim backend (bukan kode FE) |
