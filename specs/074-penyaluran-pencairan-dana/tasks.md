# Tasks: Modul Penyaluran & Pencairan Dana (SARPRAS Kelapa)

**Input**: Design documents from `/specs/074-penyaluran-pencairan-dana/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tidak ada task test otomatis — konstitusi proyek melarang perluasan unit testing; validasi via walkthrough `quickstart.md` (S1–S8) + `npm run build` (vue-tsc strict).

**Organization**: Tasks dikelompokkan per user story (US1–US8) sesuai prioritas spec; fase diurutkan P1 → P2 → P3 → P4 (US8/P2 dikerjakan sebelum US5/P3).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Dapat paralel (file berbeda, tanpa dependensi task yang belum selesai)
- **[Story]**: User story pemilik task (US1–US8)
- Path file eksplisit di setiap deskripsi

## Path Conventions

Single project: `src/` di root repo (SPA Vue existing). Modul: `src/views/penyaluran-dana/`, `src/components/penyaluran-dana/`, `src/stores/penyaluranDana.ts`, `src/types/penyaluranDana.ts`, `src/schemas/penyaluranDana.ts`, `src/utils/pencairanDocsGenerator.ts`.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Scaffold modul agar rute & build tetap hijau selama implementasi bertahap.

- [x] T001 Buat scaffold modul: 8 stub view (judul + `Breadcrumb.vue` + `Skeleton.vue`, satu placeholder section) di `src/views/penyaluran-dana/` (PemohonPencairanView, PemohonWizardPermohonanView, PemohonDetailTrackingView, BpdpPks3PihakView, BpdpApprovalPencairanView, SciVerifikasiDokumenView, SciMonitoringLapanganView, BankMitraView) + folder kosong `src/components/penyaluran-dana/`
- [x] T002 [P] Tambah section `penyaluranDana` di `src/config/localization.ts`: label menu, semua label status (PKS/tahap/verifikasi/penutupan), label tipe dokumen (18 tipe), toast sukses/gagal umum — mengikuti struktur section modul existing

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Fondasi bersama — HARUS selesai sebelum user story mana pun.

**⚠️ CRITICAL**: Semua task US bergantung fase ini.

- [x] T003 [P] Buat semua tipe & enum entitas di `src/types/penyaluranDana.ts` sesuai data-model.md: PKS3Pihak, Komparisi, Pencairan, PencairanDivisiItem, PencairanTahap, DokumenPencairan, VerifikasiRantai, SuratPersetujuanPencairan, TransferEscrow, PengembalianDana, PenutupanRekening, NotifikasiEvent + enum status + `DIVISI_PEKERJAAN` (10 divisi) + template checklist dokumen per tahap + mapper label→key localization
- [x] T004 [P] Tambah 4 peran baru (BPDP_STAFF, BPDP_KADIV, SURVEYOR_SCI dengan note sub-peran pendok/verdok/qc/pusat, BANK_MITRA) ke `ROLE_DETAILS_MAP` di `src/types/role.ts` (preseden BPDP_PPK/BPDP_ULP)
- [x] T005 Buat schema zod di `src/schemas/penyaluranDana.ts`: wizard permohonan (divisiItems ≥1, nilai >0, divisi unik, Σ ≤ sisaSaldo refiner, nomorRekening 10–16 digit, kodepos 5 digit, email), komparisi A.3 (noRekeningKp), gate nominal (flag deviasi %), upload file (PDF/JPG/DOCX) (depends T003)
- [x] T006 Buat Pinia store core di `src/stores/penyaluranDana.ts`: state seluruh entitas + persist `pinia-plugin-persistedstate` + `INITIAL_DEMO_DATA` (seed: 2 proposal SK_DIRUT_TERBIT, 1 PKS AKTIF, 2 permohonan — satu T1 DITRANSFER satu DRAFT, bank mitra + rekening escrow, laporan monitoring 75%) + getter `totalPermohonan` (computed Σ divisi, BUKAN state bebas) + helper generator nomor `SRPR-KLPA/DANA/YYYY/NNN` & ID Penyaluran `.T1/.T2/.T3` + comment `// CLIENT-SIMULATED: ...` sesuai contracts/backend-api.md (depends T003, T005)
- [x] T007 Daftarkan seluruh rute `/penyaluran-dana/*` di `src/router/index.ts` (lazy import stub, `meta.roles` + `activeMenu` sesuai contracts/ui-routes.md); ganti rute `/bpdp/penyaluran` menjadi redirect → `/penyaluran-dana/pks-3-pihak`, hapus stub `src/views/bpdpks/PenyaluranDanaView.vue`, dan sesuaikan `activeMenu` referensi di `src/views/bpdpks/PelaporanBASTView.vue`
- [x] T008 [P] Buat basis generator dokumen di `src/utils/pencairanDocsGenerator.ts`: template HTML dasar + renderer kop surat "B" (data KP/sk/pks/ketua dari profil) + helper `downloadPdf()` (window.print) + `downloadDoc()` (HTML→file `.doc`, MIME msword) + import `formatRupiah`/`formatDate` dari `src/utils/exportProposal.ts` (JANGAN re-implement inline)
- [x] T009 [P] Tambah NavSection di `src/composables/useNavigation.ts`: KP → "Penyaluran Dana" (`/penyaluran-dana/pemohon`); BPDP_VERIFIKATOR → "PKS 3 Pihak"; BPDP_KADIV/BPDP_APPROVAL → "Approval Pencairan"; SURVEYOR_SCI → "Verifikasi Dokumen" + "Monitoring Lapangan"; BANK_MITRA → "Komparisi & Transfer" (label dari localization T002)

**Checkpoint**: Foundation ready — `npm run dev` jalan, semua rute stub terakses sesuai peran, build hijau.

---

## Phase 3: User Story 1 - Proses PKS 3 Pihak (Priority: P1) 🎯 MVP

**Goal**: PKS 3 Pihak end-to-end: proses BPDP → generate dokumen → komparisi A.1/A.2/A.3 → penjadwalan TTD → AKTIF (US1 spec; milestone M1).

**Independent Test**: Quickstart **S1** — ganti peran BPDP_VERIFIKATOR → KELEMBAGAAN_PEKEBUN → BANK_MITRA → BPDP_VERIFIKATOR; status PKS berjalan DIPROSES→…→AKTIF; dokumen PKS & template surat kuasa ter-unduh; notifikasi jadwal diterima KP & Bank.

### Implementation for User Story 1

- [x] T010 [US1] Tambah aksi PKS di `src/stores/penyaluranDana.ts`: `prosesDokumenPks` (buat PKS3Pihak DIPROSES + payload kop B), `submitKomparisi` (A.1/A.2/A.3 per pihak + submittedAt; status→KOMPARISI saat lengkap), `setJadwalTtd` (+NotifikasiEvent JADWAL_TTD ke KP & BANK), `uploadHasilTtd` (→AKTIF) + seed NotifikasiEvent SK_DIRUT_TERBIT (depends T006)
- [x] T011 [P] [US1] Buat `src/components/penyaluran-dana/KomparisiPanel.vue`: form A.1 (legalitas read-only dari profil + lampiran), A.2 (narasi BPDP), A.3 (narasi bank + noRekeningKp zod) — role-aware, satu komponen tiga varian, validasi inline vee-validate+zod
- [x] T012 [P] [US1] Buat `src/components/penyaluran-dana/PksStatusCard.vue`: pipeline mini status PKS + unduh template surat kuasa + unggah surat kuasa + unduh dokumen PKS
- [x] T013 [P] [US1] Tambah generator `templateSuratKuasa()` + `dokumenPks3Pihak()` (kop B terisi) di `src/utils/pencairanDocsGenerator.ts` (depends T008)
- [x] T014 [US1] Implementasikan `src/views/penyaluran-dana/BpdpPks3PihakView.vue`: antrean proposal SK_DIRUT_TERBIT → tombol "Proses Dokumen PKS 3 Pihak" → unduh dokumen → pantau status komparisi 3 pihak (isi A.2 via KomparisiPanel) → form penjadwalan TTD (notifikasi terkirim) → unggah hasil ttd (depends T010–T013)
- [x] T015 [US1] Implementasikan initial `src/views/penyaluran-dana/PemohonPencairanView.vue`: kartu PKS proposal KP (PksStatusCard + KomparisiPanel A.1 + unggah surat kuasa) — landing menu "Penyaluran Dana" KP (depends T011, T012)
- [x] T016 [US1] Implementasikan initial `src/views/penyaluran-dana/BankMitraView.vue`: KomparisiPanel A.3 (nomor rekening KP) + daftar notifikasi jadwal TTD (depends T011)
- [x] T017 [US1] Pass konstitusi US1: wording lengkap di `src/config/localization.ts`, toast `useToast()` (tanpa dialog native), skeleton loading, dark/light, mobile 375px, breadcrumb, alignment `mx-4 lg:mx-6`

**Checkpoint**: US1 berfungsi independen — jalankan S1 quickstart.

---

## Phase 4: User Story 2 - Wizard Pengajuan Pencairan (Priority: P1)

**Goal**: Wizard "Tambah Permohonan" 3-step dengan revisi FINAL nilai per divisi → total auto-generate, rekening & skema, unduh/unggah surat permohonan (PDF+Word), dokumen D, BA (US2; M1).

**Independent Test**: Quickstart **S2** — total read-only = Σ divisi; submit ditolak saat Σ > sisa saldo; surat permohonan ter-unduh PDF & Word; permohonan muncul di list bernomor `SRPR-KLPA/DANA/2026/NNN`.

### Implementation for User Story 2

- [x] T018 [P] [US2] Buat `src/components/penyaluran-dana/DivisiNilaiTable.vue`: pilih ≥1 dari 10 divisi (config), input nilai per divisi (>0, unik), baris total computed read-only (formatRupiah), indikator Σ vs sisa saldo (depends T003)
- [x] T019 [P] [US2] Tambah generator `suratPermohonan()` (output PDF via print + `.doc`) + `beritaAcara()` (`.doc`) di `src/utils/pencairanDocsGenerator.ts` (depends T008)
- [x] T020 [US2] Tambah aksi wizard di `src/stores/penyaluranDana.ts`: getter `eligibleProposals` (SK_DIRUT_TERBIT + PKS AKTIF, dengan sisa saldo masing-masing), `dataGeneratedA/B(proposalId)` dari profil, `createPermohonan` (nomor auto, status DRAFT→DIAJUKAN, snapshot total) (depends T006)
- [x] T021 [US2] Buat `src/views/penyaluran-dana/WizardStep1DataPembelian.vue`: pilih proposal → preview Data A & B + metrik proposal (pagu, sisa saldo, escrow) → jenis pembelian & peruntukan → DivisiNilaiTable → rekening tujuan + skema + alamat (vee-validate+zod schema T005)
- [x] T022 [US2] Buat `src/views/penyaluran-dana/WizardStep2Dokumen.vue`: unduh surat permohonan (PDF & Word, terisi data wizard) → unggah berttd basah → multi-upload dokumen D (5 kategori) → unduh & unggah BA
- [x] T023 [US2] Buat `src/views/penyaluran-dana/WizardStep3TahapChecklist.vue`: pratinjau lengkap + tombol "Cek" (hasil Sesuai/Tidak Sesuai per kelompok, blok lanjut bila tidak, tombol perbaiki ulang ke step terkait)
- [x] T024 [US2] Implementasikan `src/views/penyaluran-dana/PemohonWizardPermohonanView.vue`: orkestrasi 3 step (transisi in-page, stepper header, simpan draft ke store, tanpa nested modal), submit → toast + redirect ke list (depends T020–T023)
- [x] T025 [US2] Perluas `src/views/penyaluran-dana/PemohonPencairanView.vue`: 4 kartu statistik (Total, Dalam Proses, Perlu Perbaikan, Dana Masuk), tabel daftar permohonan (nomor, proposal, total, status, aksi detail), tombol "Tambah Permohonan"
- [x] T026 [US2] Pass konstitusi US2: wording, validasi inline real-time, toast, skeleton, dark/light, mobile, breadcrumb

**Checkpoint**: US1 + US2 berfungsi — jalankan S1–S2.

---

## Phase 5: User Story 3 - Penyaluran Tahap 1 (40%) + Escrow Mock (Priority: P1)

**Goal**: Checklist dokumen Tahap 1 (3 generated + 7 upload), ID Penyaluran `.T1`, nominal 40% oleh BPDP, penyaluran ke escrow mock (SPP sintetis, PENDING→PAID) (US3; M3).

**Independent Test**: Quickstart **S3** — ID `….T1` terbit setelah checklist lengkap; nominal default 40% + konfirmasi deviasi %; EscrowSaldoCard menampilkan SPP & status PAID; saldo 40% tercatat.

### Implementation for User Story 3

- [x] T027 [P] [US3] Buat `src/components/penyaluran-dana/DokumenChecklistTahap.vue`: render checklist dari template config per tahap (T1: 3 GENERATED + 7 UPLOAD), badge sumber, slot upload (validasi tipe/ukuran + progress), status per dokumen (depends T003)
- [x] T028 [P] [US3] Buat `src/components/penyaluran-dana/EscrowSaldoCard.vue`: no. SPP, status pembayaran (PENDING/PAID), nominal masuk, rekening & bank escrow, waktu (depends T003)
- [x] T029 [US3] Tambah aksi tahap 1 di `src/stores/penyaluranDana.ts`: `ajukanTahap1` (validasi checklist via zod → generate ID Penyaluran `.T1` unik, status DIAJUKAN), `inputNominalPenyaluran` (default 40% × total; bila deviasi → flag konfirmasi), `prosesPenyaluran` (TransferEscrow: `SPP-<yyyymmdd>-<seq>`, PENDING→PAID) + NotifikasiEvent DANA_MASUK_ESCROW (depends T006)
- [x] T030 [US3] Implementasikan initial `src/views/penyaluran-dana/PemohonDetailTrackingView.vue`: header permohonan (nomor, proposal, total, escrow info), tab Tahap 1 = DokumenChecklistTahap + tombol ajukan, panel BPDP nominal/proses (mock aksi role BPDP), EscrowSaldoCard (depends T027–T029)

**Checkpoint**: P1 lengkap (US1–US3) — jalankan S1–S3; ini scope demo M1+M3.

---

## Phase 6: User Story 4 - Rantai Verifikasi SCI & Approval BPDP + Transfer Bank (Priority: P2)

**Goal**: Verifikasi berjenjang Pendok→Verdok→QC→Pusat (VPD) → Staff→Kadiv → Surat Persetujuan → konfirmasi transfer Bank Mitra; loop perbaikan bercatatan (US4; M2).

**Independent Test**: Quickstart **S4** — tingkat berikut terkunci; tolak tanpa catatan ditolak sistem; KP melihat "Dikembalikan untuk Perbaikan" dan bisa resubmit; VPD ter-upload; Surat Persetujuan ter-generate; Bank konfirmasi → DITRANSFER.

### Implementation for User Story 4

- [x] T031 [P] [US4] Buat `src/components/penyaluran-dana/VerifikasiRantaiPanel.vue`: kartu berantai 6 tingkat (locked/aktif/selesai), form keputusan Sesuai/Tidak Sesuai + catatan (wajib saat tolak), unggah VPD untuk SCI_PUSAT (depends T003)
- [x] T032 [P] [US4] Buat `src/components/penyaluran-dana/RiwayatPerbaikanList.vue`: daftar kejadian "Dikembalikan untuk Perbaikan" + catatan + aktor + waktu
- [x] T033 [P] [US4] Tambah generator `suratPersetujuanPencairan()` (nomor `SPR-KLPA/DANA/YYYY/NNN`) di `src/utils/pencairanDocsGenerator.ts`
- [x] T034 [US4] Tambah aksi verifikasi di `src/stores/penyaluranDana.ts`: `verifikasi(tahapId, tingkat, hasil, catatan)` (urutan wajib, catatan wajib TIDAK_SESUAI), `perbaikanLoop` (status→DIAJUKAN + RiwayatPerbaikan + NotifikasiEvent CATATAN_PERBAIKAN), `uploadVpd`, `approvalBpdp` (STAFF review → KADIV Ya/Tidak; Tidak wajib alasan → DITOLAK terminal), `generateSuratPersetujuan` + `uploadSuratPersetujuan`, `konfirmasiTransferBank` (→DITRANSFER + notifikasi PERSETUJUAN) (depends T006)
- [x] T035 [US4] Implementasikan `src/views/penyaluran-dana/SciVerifikasiDokumenView.vue`: antrean per sub-peran (pendok/verdok/qc/pusat dari data seed), detail dokumen per checklist, VerifikasiRantaiPanel, push ke kantor pusat, unggah VPD (depends T031, T034)
- [x] T036 [US4] Implementasikan `src/views/penyaluran-dana/BpdpApprovalPencairanView.vue`: antrean tahap siap approval (roles BPDP_STAFF/BPDP_KADIV + fallback BPDP_APPROVAL), review dokumen + VPD, keputusan Kadiv, generate & unggah Surat Persetujuan (depends T033, T034)
- [x] T037 [US4] Perluas `src/views/penyaluran-dana/BankMitraView.vue`: notifikasi penerimaan Surat Persetujuan → tombol konfirmasi transfer → status DITRANSFER (depends T034)
- [x] T038 [US4] Perluas `src/views/penyaluran-dana/PemohonDetailTrackingView.vue`: tampilkan VerifikasiRantaiPanel (posisi tahap) + RiwayatPerbaikanList (depends T031, T032)

**Checkpoint**: US1–US4 — jalankan S1–S4.

---

## Phase 7: User Story 8 - Tracking, Notifikasi & Dashboard (Priority: P2)

**Goal**: Timeline gabungan lintas aktor, progres 40/30/30, notifikasi in-app di setiap milestone, stage dashboard "Pencairan Dana", konsistensi statistik (US8).

**Independent Test**: Quickstart **S8** — satu halaman tracking menampilkan seluruh kejadian (SC-007); milestone memicu notifikasi; kartu/stage dashboard muncul; statistik list konsisten.

### Implementation for User Story 8

- [x] T039 [P] [US8] Buat `src/components/penyaluran-dana/PencairanTimelineTracker.vue`: timeline gabungan KP→SCI→BPDP→Bank dari gabungan event (aksi store + RiwayatPerbaikan + NotifikasiEvent), ikon per aktor, urut waktu (pola PenyaluranTimelineTracker barang)
- [x] T040 [P] [US8] Buat `src/components/penyaluran-dana/TahapProgressBar.vue`: bar 40/30/30 per permohonan dengan status tiap segmen + slot indikator gate (dipakai juga US5)
- [x] T041 [US8] Integrasikan NotifikasiEvent ke UX notifikasi in-app existing (bell/toast): badge jumlah belum dibaca per peran + toast saat event baru terjadi pada sesi aktif
- [x] T042 [US8] Tambah kartu/stage "Pencairan Dana" pada dashboard existing (`src/components/dashboard/MetricCards.vue` dan/atau config pipeline terkait) secara non-invasif; pastikan 4 kartu statistik KP selalu konsisten dengan data store
- [x] T043 [US8] Polish tracking di `src/views/penyaluran-dana/PemohonDetailTrackingView.vue`: pasang PencairanTimelineTracker + TahapProgressBar + EscrowSaldoCard menyatu (satu halaman = satu sumber kebenaran status, SC-005/SC-007) (depends T039, T040)

**Checkpoint**: Jalankan S8.

---

## Phase 8: User Story 5 - Tahap 2/3 + Gate 70%/100% + Monitoring Lapangan (Priority: P3)

**Goal**: Gate lock ≥70% & 100%, permohonan tahap 2/3, surat tugas & laporan E/G, pratinjau PKS Tahap 1 (US5; M4).

**Independent Test**: Quickstart **S5** — tombol Tahap 2 terkunci + alasan sebelum laporan ≥70% terverifikasi; setelah laporan E (75% seed) & verifikasi Ya → dana 30% masuk; Tahap 3 dengan laporan G 100% → distribusi 100%.

### Implementation for User Story 5

- [x] T044 [US5] Tambah aksi gate & monitoring di `src/stores/penyaluranDana.ts`: `isTahapUnlocked` (progressMonitoring ≥ gateProgress 0.7/1.0 dari laporan E/G terverifikasi), `ajukanTahap2/3` (cek gate + checklist T2/T3: PKS pratinjau dari T1 + dokumen tahap), `uploadLaporanMonitoring` (E/G + progress + BA + dokumentasi), `verifikasiMonitoring` (Ya→proses penyaluran 30% / Tidak→alasan pengembalian) (depends T029)
- [x] T045 [US5] Implementasikan `src/views/penyaluran-dana/SciMonitoringLapanganView.vue`: daftar surat tugas, unggah Surat Tugas (BPDP/Surveyor), form laporan E (input progress ≥70%) / G (100%) + BA Monitoring + dokumentasi (depends T044)
- [x] T046 [US5] Perluas `src/views/penyaluran-dana/PemohonDetailTrackingView.vue`: tab Tahap 2/3 (checklist T2/T3 + tombol "Ajukan Tahap n" locked/disabled dengan tooltip alasan gate via TahapProgressBar), pratinjau PKS + opsi unggah ulang bila berubah (depends T040, T044)

**Checkpoint**: Distribusi 100% dana teruji — jalankan S5.

---

## Phase 9: User Story 6 - Pengembalian Dana (Priority: P4)

**Goal**: Permohonan pengembalian dana: upload → penelitian BPDP (loop) → Surat Pemberitahuan + SK Pembatalan (US6; M5).

**Independent Test**: Quickstart **S6** — loop perbaikan berfungsi; dokumen keluaran ter-generate setelah "Lengkap dan Sesuai".

### Implementation for User Story 6

- [x] T047 [P] [US6] Tambah generator `suratPemberitahuanPengembalian()` + `skPembatalanPenerimaDana()` di `src/utils/pencairanDocsGenerator.ts`
- [x] T048 [US6] Tambah aksi pengembalian di `src/stores/penyaluranDana.ts`: `ajukanPengembalian` (upload surat → DIAJUKAN), `telitiPengembalian` (DITELITI; Tidak Sesuai→DIKEMBALIKAN loop; Lengkap & Sesuai→SELESAI + dokumen keluaran) (depends T006, T047)
- [x] T049 [US6] Implementasikan UI pengembalian: section ajukan/track di `src/views/penyaluran-dana/PemohonDetailTrackingView.vue` + tab "Pengembalian Dana" (antrean penelitian) di `src/views/penyaluran-dana/BpdpApprovalPencairanView.vue` (depends T048)

**Checkpoint**: Jalankan S6.

---

## Phase 10: User Story 7 - Sisa Dana & Penutupan Rekening (Priority: P4)

**Goal**: Gerbang bukti pencairan sisa dana → form Penutupan Rekening → BPDP → Bank → SELESAI (US7; M5).

**Independent Test**: Quickstart **S7** — form terkunci sebelum bukti sisa dana; setelah gerbang, alur DIAJUKAN→DITERIMA_BPDP→DITERIMA_BANK→SELESAI.

### Implementation for User Story 7

- [x] T050 [US7] Tambah aksi penutupan di `src/stores/penyaluranDana.ts`: `uploadBuktiSisaDana` (gerbang `gerbangSisaDanaSelesai=true` → buka form), `ajukanPenutupan` (DIAJUKAN), `terimaBpdp` (DITERIMA_BPDP + notifikasi BANK), `prosesBank` (DITERIMA_BANK→SELESAI) (depends T006)
- [x] T051 [US7] Implementasikan UI penutupan: section gerbang + form surat penutupan (KP, locked sebelum gerbang) di `src/views/penyaluran-dana/PemohonDetailTrackingView.vue`, aksi terima/teruskan (BPDP) di `BpdpApprovalPencairanView.vue`, aksi proses penutupan di `src/views/penyaluran-dana/BankMitraView.vue` (depends T050)

**Checkpoint**: Seluruh US1–US8 selesai — jalankan S1–S8 penuh.

---

## Phase 11: Polish & Cross-Cutting Concerns

**Purpose**: Kualitas lintas story sebelum selesai.

- [x] T052 [P] Audit anti-redundansi (Konstitusi V): pastikan seluruh nominal memakai `formatRupiah`/`formatDate` dari `src/utils/exportProposal.ts` (nol implementasi inline), tidak ada komponen/typeduplikat, badge status mapper terpusat, tanpa dead code/sisa seed nyasar
- [x] T053 [P] Audit UI konstitusi: dark/light selaras (WCAG AA), mobile 375px tanpa overflow + target sentuh ≥44px, skeleton di semua fetch state, breadcrumb di semua halaman, alignment navbar `mx-4 lg:mx-6`/`mx-3`, tanpa `alert/confirm/prompt`, tanpa nested modal, seluruh wording berasal dari `src/config/localization.ts` (verifikasi `grep` tidak ada string Bahasa hardcode di template)
- [x] T054 Verifikasi penggantian stub lama: `/bpdp/penyaluran` redirect → `/penyaluran-dana/pks-3-pihak`, `src/views/bpdpks/PenyaluranDanaView.vue` terhapus, referensi `activeMenu` `PelaporanBASTView.vue` benar, tidak ada rute/menu mati
- [x] T055 Validasi akhir: `npm run build` (vue-tsc -b && vite build) hijau tanpa error; jalankan seluruh skenario `specs/074-penyaluran-pencairan-dana/quickstart.md` (S1–S8) dan konfirmasi tidak ada regresi modul lain (penyaluran barang, pengusulan, verifikasi)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Tanpa dependensi — mulai segera.
- **Foundational (Phase 2)**: Depends Setup — **MEMBLOKIR semua user story**.
- **User Stories (Phase 3–10)**: Semua depends Foundational. Urutan prioritas: US1→US2→US3 (P1) → US4→US8 (P2) → US5 (P3) → US6→US7 (P4).
- **Polish (Phase 11)**: Depends semua US selesai (T052/T053 [P] boleh mulai setelah US8 selesai).

### User Story Dependencies

- **US1 (PKS)**: Setelah Foundational — prasyarat data (PKS AKTIF) bagi US2+; secara UI independen-demonstrasi.
- **US2 (Wizard)**: Setelah US1 (memakai landing view & PKS aktif); independently testable via seed PKS AKTIF.
- **US3 (Tahap 1)**: Setelah US2 (memakai permohonan); seed menyediakan permohonan siap agar bisa diuji mandiri.
- **US4 (Verifikasi)**: Setelah US3; seed menyediakan tahap DIAJUKAN.
- **US8 (Tracking/Notif/Dashboard)**: Setelah US4 agar event timeline kaya; merender event apa pun yang ada.
- **US5 (Tahap 2/3)**: Setelah US4 + US8 (TahapProgressBar); memakai rantai verifikasi.
- **US6 (Pengembalian)**: Setelah Foundational + US3 (konteks dana); antrean mandiri.
- **US7 (Penutupan)**: Setelah US5 (tahap 3 selesai pada seed/demo).

### Konflik file lintas story (harus sekuensial antar story, aman dalam story)

- `src/stores/penyaluranDana.ts`: diperluas bertahap T010→T020→T029→T034→T044→T048→T050.
- `src/views/penyaluran-dana/PemohonPencairanView.vue`: T015 → T025.
- `src/views/penyaluran-dana/PemohonDetailTrackingView.vue`: T030 → T038 → T043 → T046 → T049 → T051.
- `src/views/penyaluran-dana/BankMitraView.vue`: T016 → T037 → T051.
- `src/utils/pencairanDocsGenerator.ts`: T013 → T019 → T033 → T047.
- `src/config/localization.ts`: tiap story mengisi bagianya sendiri (T017, T021–T026, dst. dalam task story).

### Parallel Opportunities

- Setup: T002 ∥ T001.
- Foundational: T003 ∥ T004 ∥ T008 ∥ T009 (file berbeda); T005→T006→T007 sekuensial (dependensi tipe/rute).
- Dalam US1: T011 ∥ T012 ∥ T013 setelah T010; US2: T018 ∥ T019; US3: T027 ∥ T028; US4: T031 ∥ T032 ∥ T033; US8: T039 ∥ T040; Polish: T052 ∥ T053.
- Antar story paralel hanya jika tidak menyentuh file konflik di atas (disarankan sekuensial sesuai prioritas).

---

## Parallel Example: User Story 1

```bash
# Setelah T010 (aksi store) selesai, jalankan paralel:
Task: "KomparisiPanel.vue di src/components/penyaluran-dana/"        (T011)
Task: "PksStatusCard.vue di src/components/penyaluran-dana/"          (T012)
Task: "Generator surat kuasa + dokumen PKS di src/utils/pencairanDocsGenerator.ts" (T013)

# Kemudian sekuensial: T014 (BpdpPks3PihakView) → T015 (Pemohon initial) → T016 (Bank initial) → T017 (pass konstitusi)
```

---

## Implementation Strategy

### MVP First

1. Selesaikan Phase 1–2 (Setup + Foundational).
2. Selesaikan Phase 3 (US1 PKS 3 Pihak) → **STOP & VALIDASI S1** → demo MVP gerbang proses.
3. Scope **demo P1 penuh** (rekomendasi rilis demo pertama): lanjut US2 + US3 → validasi S1–S3 (setara milestone M1+M3 inti).

### Incremental Delivery

1. Setup + Foundational → foundation ready (build hijau, rute stub).
2. +US1 → S1 ✓ → demo.
3. +US2 → S2 ✓ → demo.
4. +US3 → S3 ✓ → demo (P1 lengkap).
5. +US4 → S4 ✓; +US8 → S8 ✓ (P2 lengkap).
6. +US5 → S5 ✓ (distribusi 100%); +US6 → S6 ✓; +US7 → S7 ✓ (M5, siklus tertutup).
7. Polish T052–T055 → quickstart penuh + build hijau.

### Parallel Team Strategy

1. Tim bersama menuntaskan Setup + Foundational.
2. Setelahnya (dengan memperhatikan konflik file): Dev A → US1→US2→US3 (jalur KP); Dev B → US4 setelah US3 tersedia (jalur SCI/BPDP/Bank); Dev C → US8 (komponen tracking murni) paralel dengan Dev B.
3. US5–US7 sekuensial setelah jalur utama selesai.

---

## Notes

- [P] = file berbeda & tanpa dependensi task belum selesai; task store/view yang sama WAJIB sekuensial sesuai urutan ID.
- Label [US*] memetakan task ke user story spec.md untuk traceability.
- Semua data client-simulated: JANGAN membuat HTTP call/service palsu; label `CLIENT-SIMULATED` pada store (lihat contracts/backend-api.md).
- Validasi akhir per story = skenario quickstart.md terkait; validasi akhir modul = T055.
- Commit setelah task atau kelompok logis; jangan lanjut story berikut sebelum checkpoint story berjalan.
