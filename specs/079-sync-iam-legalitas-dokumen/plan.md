# Implementation Plan: Sinkronisasi Dua Arah Dokumen Legalitas KP dan Surat Penunjukan Ketua (IAM ⇄ Sarpras)

**Branch**: `079-sync-iam-legalitas-dokumen` | **Date**: 2026-09-09 | **Spec**: [specs/079-sync-iam-legalitas-dokumen/spec.md](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kelapa-fe/specs/079-sync-iam-legalitas-dokumen/spec.md)

---

## Summary

Mengimplementasikan sinkronisasi berkas dua arah antara **IAM (`bpdp-iam-be`)** sebagai master profil kelembagaan dan **Sarpras (`bpdp-sarpras-kelapa-be` & `bpdp-sarpras-kelapa-fe`)** sebagai domain transaksional pengusulan sarana dan prasarana. 

Solusi ini memanfaatkan **shared object storage engine** (MinIO/S3 via `SERVICES_URL`) dengan berbagi `object_key` tanpa menduplikasi data biner fisik (0 MB storage bloat). Dokumen Akta Legalitas (`legalitas_kp` ➔ `AKTA_LEMBAGA`) dan Surat Penunjukan Ketua (`penunjukan_ketua` ➔ `PENUNJUKAN_KETUA`) otomatis terpasang saat pengusulan baru, mendukung penanganan revisi serentak untuk kedua dokumen, menerapkan *document versioning* dan *snapshot immutability*, serta melakukan *reverse-sync* otomatis ke master IAM saat berkas direvisi di Sarpras.

---

## Technical Context

- **Language/Version**: TypeScript 5.x (Frontend) / Go 1.22+ (Backend Sarpras & Backend IAM)
- **Primary Dependencies**:
  - Frontend: Vue 3 (Composition API `<script setup>`), Pinia, Tailwind CSS, Lucide Icons, Axios, VeeValidate / Zod
  - Backend: Echo v4 Framework, GORM, PostgreSQL, MinIO/S3 Go SDK via `internal/file`
- **Storage**:
  - Shared MinIO/S3 compatible storage service (`SERVICES_URL`)
  - PostgreSQL Database (`dokumen_proposals`, `file_uploads`, `sync_outbox_queues` di Sarpras; `kelembagaan_pekebun_uploads`, `file_uploads` di IAM)
- **Testing**: Manual workflow verification per `quickstart.md` and strict TypeScript compilation (`vue-tsc -b && vite build`) per Constitution governance
- **Target Platform**: Responsive Web Application (Mobile 375px+ up to Desktop 1920px)
- **Project Type**: Multi-service Web Application (IAM Backend, Sarpras Backend, Sarpras Frontend)
- **Performance Goals**: Waktu pemuatan pratinjau dokumen <100ms, waktu auto-attach dokumen saat pembukaan form draf <500ms, waktu eksekusi reverse-sync ke IAM <2s
- **Constraints**: 0 MB duplikasi berkas fisik biner di storage, pencegahan *infinite sync loop*, proteksi usulan historis terhadap perubahan data masa depan (*snapshot locked*)
- **Scale/Scope**: ~10.000 kelembagaan pekebun, ratusan ribu dokumen proposal legalitas

---

## Constitution Check

*GATE: Evaluasi prinsip konstitusi BPDP Sarpras Kelapa:*

| Prinsip Konstitusi | Status | Evaluasi Kepatuhan |
| :--- | :---: | :--- |
| **I. Vue 3 `<script setup>`** | **PASS** | Semua komponen UI (`StepUploadDokumen.vue`, `RevisiProposalView.vue`, modal riwayat versi) menggunakan Composition API `<script setup>`. |
| **II. Strict TypeScript & Zod** | **PASS** | Tipe data didefinisikan secara ketat di `src/types/dokumenSync.ts` tanpa penggunaan tipe `any`. |
| **III. Pinia State Management** | **PASS** | Panggilan API ke backend Sarpras dikelola terpusat di `usePengusulanStore` dan `usePengusulanDraftStore`. |
| **IV. Modern UI/UX & Tailwind** | **PASS** | Menggunakan palet Forest Green `#066C2A`, badge status yang harmonis, dan tombol aksi yang jelas. |
| **V. Strict Anti-Redundancy (DRY)** | **PASS** | 0 MB duplikasi file fisik di storage; logika pembentukan nama standar memanfaatkan utilitas terpusat `src/utils/fileNaming.ts`. |
| **VI. Breadcrumb Navigation** | **PASS** | Seluruh tampilan pengusulan dan revisi mempertahankan komponen `Breadcrumb.vue` aktif. |
| **VII. Mobile-First (375px+)** | **PASS** | Tabel perbandingan dan slot kartu dokumen mendukung *responsive wrap* dan *text-truncation* untuk mencegah *horizontal overflow*. |
| **VIII. Form Validation Standard** | **PASS** | Validasi status kelengkapan dokumen dijalankan secara reaktif sebelum pemohon diizinkan melanjutkan langkah pengusulan. |
| **IX. Error Response Fidelity** | **PASS** | Error dari API IAM/Sarpras dipropagasi dan ditampilkan melalui sistem Toaster (`useToast()`). |
| **X. UI/UX Pro Max System** | **PASS** | Kontras warna teks memenuhi standar WCAG AA, transisi halus, dan hierarki tipografi terkontrol (`font-medium` / `font-semibold`). |
| **XI. Mandatory Vue Toaster** | **PASS** | Tidak menggunakan `window.alert()` atau `confirm()`; semua notifikasi menggunakan `useToast()`. |
| **XII. Skeleton Loader** | **PASS** | Komponen dokumen menampilkan `Skeleton.vue` saat status sinkronisasi sedang diambil dari backend. |
| **XIII. Backend Contract Verification** | **PASS** | Seluruh route dan DTO diverifikasi langsung terhadap kode backend di kedua repositori (`bpdp-iam-be` & `bpdp-sarpras-kelapa-be`) dan didokumentasikan di `contracts/`. |
| **XIV. Compact Density** | **PASS** | Ukuran tombol, kartu dokumen, dan teks tetap kompak (`h-9` hingga `h-10`, `p-4` hingga `p-5`). |
| **XV. Localization Externalization** | **PASS** | Label, pesan status, dan notifikasi dieksternalisasi dalam konfigurasi lokalisasi. |
| **XVI. No Nested Modals** | **PASS** | Dialog riwayat versi dokumen menggunakan modal tunggal sekuensial tanpa tumpukan modal ganda. |
| **XVII. Horizontal Navbar Alignment** | **PASS** | Kontainer form dan kartu revisi sejajar presisi dengan margin navbar (`mx-4 lg:mx-6`). |

---

## Project Structure

### Documentation (this feature)

```text
specs/079-sync-iam-legalitas-dokumen/
├── spec.md              # Feature specification with clarifications
├── research.md          # Technical decisions & architecture research
├── data-model.md        # Database schema, entities & DTO models
├── contracts/           # API contract definitions
│   └── sync-documents-api.contract.md
├── quickstart.md        # Verification test scenarios
├── checklists/          # Quality validation checklists
│   └── requirements.md
└── plan.md              # This implementation plan
```

### Source Code Architecture

#### 1. Frontend Repository (`bpdp-sarpras-kelapa-fe`)
```text
src/
├── types/
│   └── dokumenSync.ts                       # [NEW] Types for synced IAM documents & versioned proposal docs
├── services/
│   └── dokumenSync.service.ts               # [NEW] API caller for document sync & version comparisons
├── stores/
│   ├── pengusulan.ts                        # [MODIFY] Store integration for auto-attached documents & versioning
│   └── pengusulanDraft.ts                   # [MODIFY] Auto-attach handling on new proposal draft
├── views/
│   ├── pengusulan/
│   │   └── StepUploadDokumen.vue            # [MODIFY] Slot 4 (Akta) & Slot 5 (SK Ketua) with IAM sync UI
│   ├── pemohon/
│   │   └── RevisiProposalView.vue           # [MODIFY] Dual-option revision UI for both documents
│   └── dinas/kabupaten/
│       └── StepVerifikasiPekebunDanDokumenProposal.vue # [MODIFY] Version comparison modal & audit badges
└── components/
    └── pengusulan/
        └── DocumentVersionHistoryModal.vue  # [NEW] Modal to inspect V1 vs V2 document revisions
```

#### 2. Sarpras Backend Repository (`bpdp-sarpras-kelapa-be`)
```text
internal/
├── iam_client/                              # [NEW] Internal HTTP client to query and patch IAM documents
│   ├── client.go
│   └── dto.go
├── proposal/
│   ├── handler.go                           # [MODIFY] Endpoints for initial-documents & re-sync
│   ├── service.go                           # [MODIFY] Logic for auto-attach, versioning & reverse sync
│   └── repository.go                        # [MODIFY] Versioning queries on dokumen_proposals
└── model/
    ├── proposal.go                          # [MODIFY] Extend DokumenProposal with version, source, is_active
    └── sync_outbox.go                       # [NEW] GORM model for sync_outbox_queues
migrations/
└── 00002X_add_document_versioning_and_outbox.up.sql # [NEW] Migration script
```

#### 3. IAM Backend Repository (`bpdp-iam-be`)
```text
internal/
├── kelembagaan/
│   ├── handler.go                           # [MODIFY] Add internal GET & PATCH endpoints
│   ├── service.go                           # [MODIFY] Logic to expose documents & update profile from Sarpras
│   └── repository.go                        # [MODIFY] Queries to update kelembagaan_pekebun_uploads
cmd/
└── api/
    └── main.go                              # [MODIFY] Register internal route group with X-Internal-Secret middleware
```

---

## Phases & Execution Plan

### Phase 1: Design & Contracts Complete ✅
- `research.md`, `data-model.md`, `contracts/sync-documents-api.contract.md`, `quickstart.md` selesai disusun dan divalidasi.

### Phase 2: Implementation (Scheduled via `/speckit-tasks`)
1. **Milestone 1 (IAM Backend)**: Expose internal endpoint `GET` dan `PATCH /api/v1/internal/kelembagaan/:id/documents` di `bpdp-iam-be`.
2. **Milestone 2 (Sarpras Backend)**: Implementasi `iam_client`, migrasi skema `dokumen_proposals` (*versioning*), dan logika pendaftaran `object_key` di `file_uploads`.
3. **Milestone 3 (Sarpras Frontend - MVP)**: Penyesuaian `StepUploadDokumen.vue` untuk slot 4 & slot 5 dengan deteksi auto-attach dan pratinjau Presigned URL.
4. **Milestone 4 (Sarpras Frontend - Revisi & Reverse-Sync)**: Penyesuaian `RevisiProposalView.vue` untuk revisi kedua dokumen, tombol sinkronisasi massal, dan pemicu reverse sync.
5. **Milestone 5 (Verifikator UI & Audit History)**: Penyesuaian tampilan verifikator dengan modal perbandingan versi berkas V1 vs V2.
6. **Milestone 6 (Verification & Hardening)**: Verifikasi end-to-end sesuai `quickstart.md` dan validasi build strict TypeScript.
