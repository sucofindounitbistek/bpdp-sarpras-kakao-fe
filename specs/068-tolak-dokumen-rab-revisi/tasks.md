# Tasks: Tolak Dokumen RAB Dinas Kabupaten & Alur Revisi Dokumen RAB Kelembagaan Pekebun

**Input**: Design documents from `/specs/068-tolak-dokumen-rab-revisi/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/revisi-api.md`, `quickstart.md`

## Format: `- [ ] [TaskID] [P?] [Story?] Description with file path`

- **[P]**: Dapat dikerjakan secara paralel (file terpisah, tanpa dependensi yang saling mengunci)
- **[Story]**: Menunjukkan user story pemilik task (misal: [US1], [US2], [US3])
- Menggunakan path file eksplisit di setiap tugas

---

## Phase 1: Setup & Environment Baseline

**Purpose**: Verifikasi kesiapan baseline kode backend & frontend sebelum implementasi fitur

- [X] T001 Pastikan environment backend `bpdp-sarpras-kelapa-be` dan frontend `bpdp-sarpras-kelapa-fe` siap dan dapat dikompilasi dengan baik
- [X] T002 [P] Daftarkan label dan pesan lokalisasi revisi RAB di `src/config/localization.ts`

---

## Phase 2: Foundational (Backend Mapping & State Baseline)

**Purpose**: Infrastruktur pemetaan penolakan dan tipe data yang memblokir User Story

- [X] T003 Pemetaan Dokumen RAB yang Ditolak ke Kategori `RAB`: Perbarui `GetRevisionDetail` pada `internal/proposal/service.go` di `bpdp-sarpras-kelapa-be` agar dokumen bertipe `RAB_PROPOSAL`, `RAB_RK`, `RAB` yang ditolak masuk ke `categorized_rejections` dengan `category: "RAB"` dan `target_key: "rab-signed"`
- [X] T004 [P] Penyelarasan Resubmit Proposal di Backend: Perbarui `ResubmitProposalRevision` pada `internal/proposal/service.go` di `bpdp-sarpras-kelapa-be` agar memproses penggantian `file_id` dokumen proposal (termasuk Dokumen RAB) dan me-reset status proposal kembali ke `SUBMITTED`
- [X] T005 [P] Sinkronisasi State Penolakan di Frontend Store: Perbarui `proposalRevisionStore.ts` di `src/stores/proposalRevisionStore.ts` untuk menangani kategori rejection `RAB` dan menyediakan sinkronisasi dua arah penggantian dokumen fisik

**Checkpoint**: Foundation ready — Backend revisi detail & resubmit siap mendukung alur revisi dokumen RAB.

---

## Phase 3: User Story 1 - Penolakan Dokumen RAB oleh Verifikator Dinas Kabupaten (Priority: P1) 🎯 MVP

**Goal**: Memungkinkan Verifikator Dinas Kabupaten memeriksa, menolak Dokumen Fisik RAB Bertandatangan dengan catatan wajib, dan mengembalikan usulan proposal ke pemohon (`REV_FROM_KAB`).

**Independent Test**: Login sebagai Dinas Kabupaten, buka detail verifikasi proposal, tolak "Dokumen RAB Ditandatangani" dengan catatan penolakan, lalu klik "Kembalikan (Revisi)". Proposal berpindah status ke `REV_FROM_KAB` dan catatan validasi tersimpan.

### Implementation for User Story 1

- [X] T006 [US1] Sinkronisasi Key Validasi Dokumen RAB: Perbarui `syncBulkProposalDocumentValidations` di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue` untuk memastikan validasi `rabDocument` terhubung secara akurat ke ID dokumen proposal bertipe `RAB_PROPOSAL` / `RAB_RK`
- [X] T007 [US1] Validasi Kewajiban Catatan Penolakan: Pastikan tombol verifikasi tolak pada dokumen RAB di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue` mewajibkan pengisian catatan sebelum pengembalian revisi dapat dikonfirmasi
- [X] T008 [US1] Tampilan Riwayat Catatan Penolakan Sebelumnya: Tambahkan visualisasi riwayat catatan revisi sebelumnya pada bagian Pemeriksaan RAB di `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue` saat verifikator memeriksa usulan yang telah diperbaiki

**Checkpoint**: User Story 1 berfungsi penuh secara mandiri — Dinas Kabupaten dapat menolak berkas RAB dan mengembalikan proposal dengan catatan yang tersimpan rapi.

---

## Phase 4: User Story 2 - Peninjauan Overview RAB & Upload Ulang Dokumen RAB oleh Kelembagaan Pekebun (Priority: P1)

**Goal**: Memungkinkan Kelembagaan Pekebun melihat catatan penolakan di Tab RAB, meninjau tabel rincian item RAB dalam mode read-only (overview), mencetak ulang format RAB (PDF), dan mengunggah berkas Dokumen RAB Bertandatangan baru.

**Independent Test**: Login sebagai Kelembagaan Pekebun, buka proposal berstatus `REV_FROM_KAB`, buka Tab RAB di halaman revisi, verifikasi tabel rincian RAB bersifat read-only, unduh format PDF, lalu unggah berkas baru Dokumen RAB hingga status menjadi "Telah Diperbarui".

### Implementation for User Story 2

- [X] T009 [US2] Banner Catatan Penolakan Tab RAB: Tampilkan banner alert catatan penolakan dari Verifikator Dinas Kabupaten pada Tab RAB di `src/views/pemohon/RevisiProposalView.vue`
- [X] T010 [US2] Tabel Rincian RAB Mode Overview (Read-Only): Ubah `RabTable` pada Tab RAB di `src/views/pemohon/RevisiProposalView.vue` menjadi mode `:readonly="true"` dan hapus handler mutasi baris item yang tidak diperlukan
- [X] T011 [US2] Pertahankan & Optimalkan Fungsi Unduh/Cetak PDF RAB: Pastikan fungsi `requestDownloadRAB` dan `confirmDownloadRAB` di `src/views/pemohon/RevisiProposalView.vue` men-generate format dokumen RAB lengkap dari overview item yang ada
- [X] T012 [US2] Unggah Ulang Dokumen RAB Bertandatangan: Implementasikan form upload berkas baru di Tab RAB `src/views/pemohon/RevisiProposalView.vue` dengan pemanggilan `handleFileUpload` yang menyimpan `file_id` baru ke store
- [X] T013 [US2] Sinkronisasi Dua Arah Status Dokumen RAB: Perbarui `setPendingReplacement` dan helper terkait di `src/stores/proposalRevisionStore.ts` agar berkas yang diunggah di Tab RAB otomatis menandai Dokumen RAB di Tab Dokumen Proposal menjadi "Telah Diperbarui" (dan sebaliknya)

**Checkpoint**: User Story 2 berfungsi penuh — Pemohon dapat meninjau rincian item RAB, mengunduh format cetak, dan mengunggah berkas baru pengganti dokumen yang ditolak.

---

## Phase 5: User Story 3 - Pengiriman Ulang Revisi Proposal ke Dinas Kabupaten (Priority: P2)

**Goal**: Memungkinkan Kelembagaan Pekebun mengirimkan kembali revisi proposal yang telah diperbaiki dokumennya sehingga kembali berstatus `SUBMITTED` dan siap diverifikasi ulang oleh Dinas Kabupaten.

**Independent Test**: Selesaikan pengunggahan berkas pengganti untuk seluruh dokumen yang ditolak (termasuk Dokumen RAB), lalu klik tombol "Kirim Ulang Usulan". Status usulan berubah menjadi `SUBMITTED` dan dialihkan ke halaman tracking.

### Implementation for User Story 3

- [X] T014 [US3] Validasi Kesiapan Tombol Resubmit: Pastikan tombol "Kirim Ulang Usulan Revisi" di `src/views/pemohon/RevisiProposalView.vue` hanya aktif apabila seluruh penolakan (termasuk Dokumen RAB) telah diselesaikan (`isAllRejectedResolved`)
- [X] T015 [US3] Eksekusi Pengiriman Ulang Revisi: Sesuaikan `submitRevision` di `src/stores/proposalRevisionStore.ts` untuk mengirim payload `updated_documents` (menggantikan `file_id` Dokumen RAB) ke endpoint `POST /api/v1/proposals/:id/resubmit`
- [X] T016 [US3] Navigasi & Notifikasi Sukses: Pastikan toast sukses ditampilkan dan pengguna dialihkan kembali ke `/pengusulan/tracking` setelah revisi berhasil dikirim

**Checkpoint**: Seluruh alur kerja dari penolakan, perbaikan, hingga pengiriman ulang usulan revisi telah tersambung secara end-to-end.

---

## Phase 6: Polish, Type Safety & Verification

**Purpose**: Verifikasi kualitas, integritas tipe data, dan pengujian skenario menyeluruh

- [X] T017 [P] Jalankan validasi tipe TypeScript `npm run type-check` atau `npx vue-tsc -b` pada `bpdp-sarpras-kelapa-fe` dan pastikan tidak ada error kompilasi
- [X] T018 [P] Jalankan kompilasi Go `go build ./cmd/api/main.go` pada `bpdp-sarpras-kelapa-be` dan pastikan tidak ada error
- [X] T019 Eksekusi seluruh skenario pengujian manual sesuai panduan `specs/068-tolak-dokumen-rab-revisi/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies
- **Setup (Phase 1)**: Tanpa dependensi — baseline environment.
- **Foundational (Phase 2)**: Bergantung pada Phase 1 — Membuka blokir seluruh User Stories.
- **User Story 1 (Phase 3)**: Bergantung pada Phase 2 — Menyelesaikan alur penolakan Dinas Kabupaten (MVP!).
- **User Story 2 (Phase 4)**: Bergantung pada Phase 2 & 3 — Menyelesaikan tinjauan overview dan upload ulang berkas oleh pemohon.
- **User Story 3 (Phase 5)**: Bergantung pada Phase 4 — Menuntaskan pengiriman ulang proposal.
- **Polish & Verification (Phase 6)**: Bergantung pada seluruh User Stories selesai.

---

## Implementation Strategy

### MVP First (User Story 1 & 2 Core)
1. Selesaikan Phase 1 & Phase 2 (Foundational Backend & Store).
2. Selesaikan Phase 3 (US1: Penolakan Dokumen RAB di Dinas Kab).
3. Selesaikan Phase 4 (US2: Overview & Upload Dokumen RAB di Halaman Revisi).
4. Selesaikan Phase 5 (US3: Kirim Ulang Revisi).
5. Validasi menyeluruh dengan Quickstart Guide.
