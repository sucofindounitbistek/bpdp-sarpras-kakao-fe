# Implementation Plan: Tolak Dokumen RAB Dinas Kabupaten & Alur Revisi Dokumen RAB Kelembagaan Pekebun

**Branch**: `068-tolak-dokumen-rab-revisi` | **Date**: 2026-09-02 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/068-tolak-dokumen-rab-revisi/spec.md`

## Summary

Menyempurnakan alur kerja verifikasi penolakan Dokumen Fisik RAB oleh Verifikator Dinas Kabupaten/Kota dan penyajian tinjauan (overview read-only) serta pengunggahan ulang berkas Dokumen RAB Bertandatangan oleh Kelembagaan Pekebun pada Halaman Revisi Usulan:
1. **Dinas Kabupaten**: Memeriksa dan menolak Dokumen Fisik RAB Bertandatangan dengan catatan penolakan wajib; proposal beralih status ke `REV_FROM_KAB`.
2. **Kelembagaan Pekebun**: Tab RAB di halaman revisi menyajikan catatan penolakan, rincian tabel RAB sebagai overview read-only (tanpa modifikasi item), tombol unduh PDF resmi, dan form unggah berkas baru Dokumen RAB Bertandatangan yang tersinkronisasi dengan Tab Dokumen Proposal.
3. **Backend (`bpdp-sarpras-kelapa-be`)**: Memetakan penolakan dokumen tipe RAB ke kategori `RAB` pada response `revisi-detail` dan memproses penggantian `file_id` dokumen proposal saat `resubmit` tanpa mengubah struktur `rab_items`.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Vue 3.4+ (`bpdp-sarpras-kelapa-fe`), Go 1.22+ (`bpdp-sarpras-kelapa-be`)

**Primary Dependencies**:
- Frontend: Vue 3 `<script setup>`, Pinia, Tailwind CSS, Lucide Icons, VeeValidate/Zod.
- Backend: Echo v4 Framework, GORM, PostgreSQL.

**Storage**: PostgreSQL (`proposals`, `dokumen_proposals`, `validasi_dokumen_proposals`, `rab_proposals`, `rab_items`), S3/MinIO File Storage.

**Testing**: TypeScript strict compilation (`vue-tsc -b`), Go compile/tests (`go test ./...`), Manual End-to-End browser validation.

**Target Platform**: Web (Desktop & Mobile-first responsive, 375px - 1440px).

**Project Type**: Full-stack Web Application (Modular Echo API + Vue 3 SPA).

**Performance Goals**: Waktu respon API < 200ms, transisi halaman < 100ms, upload file dokumen < 2s.

**Constraints**:
- Single Source of Truth: Status Dokumen RAB di Tab RAB dan Tab Dokumen Proposal tersinkronisasi.
- Zero Mutation on RAB Items: Data kuantitas dan nominal anggaran `total_anggaran` tetap konsisten selama revisi dokumen.

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Status |
|---|---|---|
| **I. Vue 3 & Component-Driven Architecture** | Menggunakan `<script setup>` SFCs dan reusable presentation components (`RabTable.vue`, `RejectedDocumentAlert.vue`). | **PASS** |
| **II. Strict TypeScript** | Tipe data DTO, request/response, dan state store didefinisikan secara eksplisit tanpa `any`. | **PASS** |
| **III. Pinia State Management** | Seluruh data revisi, penolakan, dan dokumen terpusat di `proposalRevisionStore.ts` dan `pengusulan.ts`. | **PASS** |
| **IV. Modern UI/UX & Feedback** | Memberikan feedback banner penolakan yang jelas, alert contextual, dan toaster notifications. | **PASS** |
| **V. Anti-Redundancy & DRY (Single Source of Truth)** | Dokumen RAB di Tab RAB dan Tab Dokumen Proposal berbagi referensi `file_id` yang sama, menghapus redundansi payload baris RAB yang tidak diperlukan. | **PASS** |
| **VII. Mobile-First Responsive** | Form upload dan tabel overview RAB responsif terhadap semua ukuran layar. | **PASS** |
| **XI. Vue Toaster Standard** | Menggunakan `useToast()` untuk semua pesan konfirmasi dan validasi. | **PASS** |
| **XIII. Backend Contract Verification** | Endpoint `GET /revisi-detail`, `POST /validations/bulk`, dan `POST /resubmit` diverifikasi langsung pada `bpdp-sarpras-kelapa-be`. | **PASS** |
| **XIV. Compact Information Density** | Menata tabel ringkasan RAB dan banner penolakan secara kompak tanpa whitespace berlebih. | **PASS** |
| **XV. Localization Externalization** | Label status dan pesan feedback didaftarkan di `src/config/localization.ts`. | **PASS** |

---

## Project Structure

### Documentation (this feature)

```text
specs/068-tolak-dokumen-rab-revisi/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Phase 0 findings & architectural decisions
├── data-model.md        # Phase 1 data models and state transitions
├── contracts/
│   └── revisi-api.md    # Phase 1 API request/response contracts
├── quickstart.md        # Phase 1 verification and testing guide
└── checklists/
    └── requirements.md  # Specification validation checklist
```

### Source Code Changes

#### 1. Backend (`bpdp-sarpras-kelapa-be`)
- [`internal/proposal/service.go`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-be/internal/proposal/service.go):
  - Memetakan dokumen yang ditolak dengan tipe `RAB_PROPOSAL` / `RAB_RK` / `RAB` ke `CategorizedRejectionItemResponse` dengan `category: "RAB"`.
  - Memperbarui `ResubmitProposalRevision` untuk memproses `UpdatedDocuments` penggantian dokumen fisik RAB dan me-reset status ke `SUBMITTED`.

#### 2. Frontend (`bpdp-sarpras-kelapa-fe`)
- [`src/views/pemohon/RevisiProposalView.vue`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/pemohon/RevisiProposalView.vue):
  - Mengubah `RabTable` pada Tab RAB menjadi mode `:readonly="true"` (Overview).
  - Menyederhanakan form Tab RAB menjadi fokus pada review catatan verifikator, overview item, unduh PDF, dan unggah ulang berkas fisik.
- [`src/stores/proposalRevisionStore.ts`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/stores/proposalRevisionStore.ts):
  - Menyelaraskan `setPendingRabSignedReplacement` agar otomatis memperbarui `updatedFilesMap` untuk dokumen proposal terkait (2-way sync).
  - Menyederhanakan payload `submitRevision` dengan fokus pada dokumen fisik proposal (`updated_documents`).
- [`src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue`](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/src/views/dinas/kabupaten/StepVerifikasiPekebunDanDokumenProposal.vue):
  - Memastikan verifikasi penolakan Dokumen RAB tersinkronisasi dengan ID dokumen `RAB_PROPOSAL` / `RAB_RK`.
  - Menampilkan riwayat catatan revisi sebelumnya saat verifikasi ulang.

---

## Complexity Tracking

*No constitution violations or unjustified architectural complexity detected.*

---

## Verification Plan

### Automated / Build Checks
- Frontend type safety: `npm run type-check` or `npx vue-tsc -b`
- Frontend build validation: `npm run build`
- Backend compilation: `go build ./cmd/api/main.go`

### Manual End-to-End Scenarios
- Melakukan verifikasi penolakan Dokumen RAB di Dinas Kabupaten (`REV_FROM_KAB`).
- Membuka Tab RAB di Kelembagaan Pekebun (memastikan tabel read-only overview, banner penolakan, dan unduh PDF berjalan).
- Mengunggah berkas Dokumen RAB baru dan memverifikasi status "Telah Diperbarui" di kedua tab.
- Mengirim ulang revisi usulan proposal dan memverifikasi status kembali ke `SUBMITTED`.
