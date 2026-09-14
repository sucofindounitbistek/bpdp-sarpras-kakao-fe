# Implementation Plan: Modal Konfirmasi Penolakan & Revisi Verifikasi Dinas Kabupaten Berformat Tabel Terkelompok (PKD/CAR Style)

**Branch**: `075-kabupaten-rejection-confirmation-modal` | **Date**: 2026-09-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/075-kabupaten-rejection-confirmation-modal/spec.md`

## Summary

Mengganti modal konfirmasi pengembalian usulan/revisi di tingkat verifikasi Dinas Kabupaten (`ApprovalConfirmationModal`) dengan komponen modal khusus (`KabupatenRevisiConfirmationModal`) yang menyajikan rekapitulasi data penolakan secara terkelompok dalam format tabel terstruktur (gaya PKD/CAR):
1. **Bagian A: Dokumen Usulan & Kelembagaan**: Tabel daftar dokumen usulan (Persyaratan, RAB, dan Gudang) yang ditolak beserta keterangan alasannya.
2. **Bagian B: Data & Dokumen Pekebun & Lahan (CPCL)**: Tabel daftar data/dokumen pekebun dan lahan yang ditolak, dikelompokkan berdasarkan nama pekebun (menggunakan row-span / pengelompokan baris pekebun).
3. **Trigger & Flow Integrasi**: Menjaga 100% integrasi trigger `submitRejection()` dan eksekusi payload mutasi yang sudah berjalan di `StepVerifikasiPekebunDanDokumenProposal.vue`.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Vue 3.4+ (`bpdp-sarpras-kelapa-fe`)

**Primary Dependencies**:
- Frontend: Vue 3 `<script setup>`, Pinia (`verifikasiKabDraftStore`, `pengusulanStore`, `pekebunStore`), Tailwind CSS, Lucide Icons.

**Storage / State**:
- Pinia Store: `useVerifikasiKabDraftStore` (status dan notes verifikasi per-key), `usePengusulanStore` (proposal detail & bulk validation APIs).

**Testing**: TypeScript strict compilation (`npx vue-tsc -b`), build validation (`npm run build`), Manual End-to-End browser validation.

**Target Platform**: Web (Desktop & Tablet responsive).

**Project Type**: Vue 3 SPA Frontend Component & View Refactoring.

**Performance Goals**: Render modal < 50ms, responsif tanpa freeze saat mengagregasikan ratusan pekebun.

**Constraints**:
- Clean component separation: Modal baru ditempatkan di `src/components/approval/KabupatenRevisiConfirmationModal.vue` atau `src/components/dinas/KabupatenRevisiConfirmationModal.vue`.
- Zero backend API breaking change: Tetap memanggil `bulkFarmerValidations`, `bulkLandValidations`, `bulkProposalDocumentValidations`, dan `updateProposal`.

---

## Constitution Check

| Principle | Assessment | Status |
|---|---|---|
| **I. Vue 3 & Component-Driven Architecture** | Membuat reusable component `<KabupatenRevisiConfirmationModal>` yang mewarisi base `Modal.vue` dan `Button.vue`. | **PASS** |
| **II. Strict TypeScript** | Mendefinisikan interface props, emitted events, dan data structures untuk grouped rejections. | **PASS** |
| **III. Pinia State Management** | Data penolakan diekstrak secara reactive dari `verifikasiKabDraftStore` dan `pengusulanStore`. | **PASS** |
| **IV. Modern UI/UX & Feedback** | Menyajikan tabel bersih, kontras tinggi, scrollbar internal jika data panjang, serta badge status dan icon yang jelas. | **PASS** |
| **V. Anti-Redundancy & DRY** | Logika agregasi data penolakan dibuat terpusat dan mudah diuji. | **PASS** |
| **VII. Responsive Layout** | Modal memiliki `max-w-4xl`, `max-h-[85vh]`, dan *overflow scroll* horizontal/vertikal untuk tabel. | **PASS** |
| **XI. Vue Toaster Standard** | Menggunakan `useToast()` yang sudah terintegrasi pada view verifikasi. | **PASS** |

---

## Project Structure

### Documentation (this feature)

```text
specs/075-kabupaten-rejection-confirmation-modal/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Phase 0 findings & architectural decisions
├── data-model.md        # Phase 1 data models & component interfaces
├── contracts/
│   └── KabupatenRevisiConfirmationModal.md # Component contract & props
├── quickstart.md        # Phase 1 verification & testing guide
└── checklists/
    └── requirements.md  # Specification validation checklist
```

### Source Code Changes

#### Frontend (`bpdp-sarpras-kelapa-fe`)
1. **[NEW] Component**: `src/components/approval/KabupatenRevisiConfirmationModal.vue`
   - Menyediakan tampilan modal konfirmasi tabel terkelompok dengan Header Proposal, Tabel Dokumen Usulan, Tabel Data Pekebun & Lahan, dan Footer Aksi.
2. **[MODIFY] View**: `src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`
   - Menghitung computed list penolakan terstruktur (`rejectedProposalDocs`, `groupedPekebunRejections`).
   - Mengganti pemanggilan `ApprovalConfirmationModal` pada penolakan dengan `KabupatenRevisiConfirmationModal`.

---

## Complexity Tracking

*No constitution violations or unjustified architectural complexity detected.*

---

## Verification Plan

### Automated / Build Checks
- Frontend type safety: `npx vue-tsc -b`
- Frontend build: `npm run build`

### Manual Verification Scenarios
1. **Buka Verifikasi Proposal Kabupaten** yang memuat dokumen proposal dan daftar pekebun/lahan.
2. **Set Tolak pada Dokumen Proposal** (misal: RAB) dan isi catatan.
3. **Set Tolak pada Data Pekebun** (misal: KTP, NIK) dan Lahan (SHM) untuk beberapa pekebun dan isi catatan.
4. **Klik "Kembalikan ke Pemohon (Revisi)"** dan pastikan modal tabel terkelompok muncul:
   - Tabel Dokumen Proposal menampilkan item yang ditolak.
   - Tabel Pekebun mengelompokkan baris per-nama pekebun.
5. **Klik "Kembalikan ke Pemohon"** dan verifikasi data tersimpan ke backend serta redirect ke daftar antrean.
