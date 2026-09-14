# Implementation Plan: Revisi Data dan Dokumen Pekebun pada Proposal Usulan

**Branch**: `069-revisi-data-dokumen-pekebun` | **Date**: 2026-09-03 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/069-revisi-data-dokumen-pekebun/spec.md`

---

## Summary

Mengimplementasikan alur perbaikan data dan dokumen pekebun yang ditolak oleh Verifikator Dinas Kabupaten/Kota pada halaman revisi usulan proposal:
1. **Backend (`bpdp-sarpras-kelapa-be`)**: Memperbarui `GetRevisionDetail` untuk menyertakan penolakan dari tabel `validasi_dokumen_pekebuns` dan `validasi_dokumen_lahans` ke `categorized_rejections` dengan `category: "PEKEBUN"`. Memperbarui `ResubmitProposalRevision` untuk menyinkronkan koreksi field teks dan berkas dokumen baru ke tabel master `pekebuns`, `dokumen_pekebuns`, `lahans`, dan `dokumen_lahans` dalam satu transaksi atomik.
2. **Frontend (`bpdp-sarpras-kelapa-fe`)**: Memperbarui `proposalRevisionStore.ts` untuk mengelompokkan penolakan per-pekebun dan mengelola form koreksi reaktif. Pada `RevisiProposalView.vue` Tab `PEKEBUN`, mengganti placeholder statis dengan kartu *Inline Accordion* yang **hanya menampilkan pekebun yang ditolak** dan **hanya memunculkan field teks atau berkas dokumen yang ditolak** dengan catatan verifikator yang jelas.

---

## Technical Context

**Language/Version**: Go 1.22+ (Backend), TypeScript 5.4+ / Vue 3.4+ (Frontend)

**Primary Dependencies**:
- Backend: Echo v4, GORM v1.25+, PostgreSQL driver
- Frontend: Pinia 2.1+, Vue Router 4.3+, Tailwind CSS 3.4+, Lucide Vue Next

**Storage**: PostgreSQL (`pekebuns`, `lahans`, `dokumen_pekebuns`, `dokumen_lahans`, `validasi_dokumen_pekebuns`, `validasi_dokumen_lahans`) & Remote File Storage (MinIO/S3 via `file_uploads`)

**Testing**: Type validation (`vue-tsc -b`), production build verification (`npm run build`), Go compilation (`go build ./cmd/api/main.go`), and manual end-to-end user flow verification against the running application. Automated unit tests are explicitly NOT required per Constitution.

**Target Platform**: Web (Responsive across mobile viewports 375px+ and desktop)

**Project Type**: Web Application (Go Echo Backend API + Vue 3 Frontend)

**Performance Goals**:
- Render Tab Pekebun & Lahan under 300ms.
- Fast, scannable UX: user directly sees rejected items without sorting through dozens of approved farmers.

**Constraints**:
- Single Source of Truth: All corrections must update the master tables (`pekebuns` & `lahans`).
- Zero Nested Modals (Constitution Principle XVI): Form fields and upload dropzones must be rendered inline in cards, never inside popups or modals.

---

## Constitution Check

*GATE: All principles evaluated and passed.*

| Principle | Assessment | Compliance Notes |
|---|---|---|
| **I. Vue 3 & Component-Driven Architecture** | PASS | Uses `<script setup>` with modular components in `RevisiProposalView.vue`. |
| **II. Strict TypeScript & Schema Validation** | PASS | All interfaces defined in `proposalRevisionStore.ts` and `types/pekebun.ts`. |
| **III. Mandatory Pinia State Management** | PASS | Rejection grouping and form states encapsulated in `proposalRevisionStore.ts`. |
| **IV. Modern UI/UX Pro Max Standard** | PASS | Curated Tailwind styling with `#066C2A` identity, clear contrast, and micro-interactions. |
| **V. Strict Anti-Redundancy & DRY** | PASS | Single source of truth: updates `pekebuns` & `lahans` master tables directly. |
| **VII. Mobile-First Standard** | PASS | Responsive accordion cards fluid from 375px upward. |
| **XI. Mandatory Vue Toaster Standard** | PASS | Feedback alerts delivered exclusively via `useToast()`. |
| **XVI. Strict Prohibition of Nested Modals** | PASS | Fully inline expandable card architecture. Zero modals. |
| **XVII. Component & Navbar Alignment** | PASS | Aligned flush with navbar horizontal grid (`mx-4 lg:mx-6`). |

---

## Project Structure

### Documentation (this feature)

```text
specs/069-revisi-data-dokumen-pekebun/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Research findings and decisions
├── data-model.md        # Entities, schemas, and DTOs
├── contracts/           # API contracts (api.yaml)
├── quickstart.md        # End-to-end validation guide
├── checklists/          # Requirements validation checklist
└── tasks.md             # Implementation tasks (/speckit-tasks output)
```

### Source Code

```text
# Backend (bpdp-sarpras-kelapa-be)
internal/
├── model/
│   ├── pekebun.go
│   ├── lahan.go
│   ├── farmer_document_validation.go
│   └── land_document_validation.go
└── proposal/
    ├── dto.go           # Extend CategorizedRejectionItemResponse & ResubmitProposalRevisionRequest
    └── service.go       # Extend GetRevisionDetail & ResubmitProposalRevision

# Frontend (bpdp-sarpras-kelapa-fe)
src/
├── config/
│   └── localization.ts  # Add labels for farmer revision & rejected items
├── stores/
│   └── proposalRevisionStore.ts # Add farmer rejection grouping & form state
└── views/
    └── pemohon/
        └── RevisiProposalView.vue # Update Tab PEKEBUN with inline accordion cards
```

---

## Complexity Tracking

*No constitutional violations. Zero unjustified complexity.*
