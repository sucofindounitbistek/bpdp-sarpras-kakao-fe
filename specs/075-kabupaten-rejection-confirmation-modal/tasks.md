# Tasks: Modal Konfirmasi Penolakan & Revisi Verifikasi Dinas Kabupaten Berformat Tabel Terkelompok (PKD/CAR Style)

**Input**: Design documents from `/specs/075-kabupaten-rejection-confirmation-modal/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/KabupatenRevisiConfirmationModal.md`, `quickstart.md`

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Dapat dikerjakan secara paralel (file terpisah, tanpa dependensi yang saling mengunci)
- **[Story]**: Menunjukkan user story pemilik task (misal: [US1])
- Menggunakan path file eksplisit di setiap tugas

---

## Phase 1: Setup & Foundational Types

**Purpose**: Menyiapkan tipe data TypeScript dan lokalisasi untuk modal konfirmasi tabel terkelompok

- [X] T001 [P] Definisikan interface data penolakan terkelompok (`RejectedProposalDocItem`, `RejectedPekebunDetailItem`, `GroupedPekebunRejection`) di `src/types/approval.ts` atau komponen terkait
- [X] T002 [P] Tambahkan entri teks lokalisasi konfirmasi pengembalian berkas Kabupaten di `src/config/localization.ts` jika diperlukan

---

## Phase 2: User Story 1 - Tinjauan Tabel Penolakan Terkelompok Saat Pengembalian Usulan oleh Dinas Kabupaten (Priority: P1) 🎯 MVP

**Goal**: Menyajikan modal konfirmasi pengembalian revisi dengan format tabel terstruktur (Dokumen Usulan & Kelembagaan serta Data & Dokumen Pekebun/Lahan yang dikelompokkan per pekebun) tanpa format birokrasi berlebihan sebelum verifikator mengembalikan berkas proposal ke pemohon.

**Independent Test**: Login sebagai Dinas Kabupaten, buka halaman verifikasi proposal, tolak satu dokumen proposal (misal: RAB) dan tolak data pekebun (misal: KTP dan SHM Lahan), klik "Kembalikan ke Pemohon (Revisi)", pastikan modal menampilkan dua tabel terkelompok dengan benar, lalu konfirmasi pengembalian hingga status proposal berubah menjadi `REV_FROM_KAB`.

### Implementation for User Story 1

- [X] T003 [P] [US1] Buat komponen modal konfirmasi `KabupatenRevisiConfirmationModal.vue` di `src/components/approval/KabupatenRevisiConfirmationModal.vue` yang memuat:
  - Header info nomor proposal dan nama kelembagaan
  - Alert pemberitahuan pengembalian berkas
  - Tabel Bagian A: Data dan Dokumen Usulan & Kelembagaan (`No`, `Nama Dokumen`, `Keterangan Penolakan`)
  - Tabel Bagian B: Data dan Dokumen Pekebun & Lahan (`No`, `Nama Pekebun`, `Jenis Dokumen / Objek`, `Keterangan Penolakan`) dengan pengelompokan baris per-pekebun (row-span / group rows)
  - Footer tombol aksi "Batal" (`variant="outline"`) dan "Kembalikan ke Pemohon" (`variant="danger"`, loading state)
- [X] T004 [US1] Buat computed properties ekstraksi data penolakan (`rejectedProposalDocs` dan `groupedPekebunRejections`) di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue` yang mengagregasikan status `REJECTED` dari `verifikasiStore.verifications` secara reaktif
- [X] T005 [US1] Integrasikan `KabupatenRevisiConfirmationModal` menggantikan `ApprovalConfirmationModal` pada alur penolakan `submitRejection()` di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue` dengan binding props dan event `@confirm`

**Checkpoint**: User Story 1 berfungsi penuh — Modal konfirmasi penolakan menyajikan tabel terkelompok rapi dan terhubung ke alur submit penolakan yang sudah ada.

---

## Phase 3: Polish & Verification

**Purpose**: Memastikan integritas tipe data TypeScript, build lulus, dan pengujian skenario lengkap

- [X] T006 [P] Jalankan validasi tipe TypeScript `npx vue-tsc -b` pada `bpdp-sarpras-kelapa-fe` dan pastikan tidak ada error kompilasi
- [X] T007 [P] Jalankan build frontend `npm run build` pada `bpdp-sarpras-kelapa-fe` untuk memverifikasi bundle lulus
- [X] T008 Uji seluruh skenario manual verifikasi penolakan (proposal saja, pekebun saja, campuran) sesuai `specs/075-kabupaten-rejection-confirmation-modal/quickstart.md`

---

## Dependencies & Execution Order

- **Phase 1 (Setup)**: Baseline types
- **Phase 2 (User Story 1)**: Bergantung pada Phase 1 — Membangun komponen modal dan mengintegrasikan ke Step 1 Verifikasi Kabupaten
- **Phase 3 (Polish & Verification)**: Bergantung pada Phase 2 — Type-checking dan validasi pengujian

---

## Parallel Execution Opportunities

- T001 dan T002 dapat dikerjakan secara paralel.
- T003 (Pembuatan komponen modal) dapat dikerjakan secara paralel bersamaan dengan persiapan template dan types.
- T006 dan T007 dapat dijalankan berdampingan saat verifikasi akhir.
