# Implementation Plan: Modal Konfirmasi Pengiriman Approval

**Branch**: `022-approval-confirmation-modal` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/022-approval-confirmation-modal/spec.md`

## Summary

Fitur ini menyisipkan modal konfirmasi sebelum setiap aksi approval (setujui/teruskan atau tolak/kembalikan) dieksekusi. Pendekatan teknis: membuat komponen `ApprovalConfirmationModal` yang reusable menggunakan base `Modal.vue`, diintegrasikan ke setiap halaman approval (ApprovalDitjenbun, ApprovalBpdp, CekiBpdp, CekiDitjenbun) melalui interception pada handler aksi yang sudah ada. Tidak ada endpoint API baru — fitur ini murni UI layer.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Vue 3.4+ with `<script setup>` SFCs

**Primary Dependencies**: Vue 3, Vue Router, Pinia, Tailwind CSS 3, lucide-vue-next, VeeValidate + Zod

**Storage**: N/A (fitur UI-only, tidak ada persistensi baru)

**Testing**: Manual verification via running app (sesuai Konstitusi: unit testing tidak diwajibkan)

**Target Platform**: Web browser (desktop + mobile, viewport min 375px)

**Project Type**: Web application (frontend SPA)

**Performance Goals**: Modal muncul < 100ms setelah tombol aksi ditekan

**Constraints**: Responsive mobile-first, dark mode support, WCAG AA, wording externalized ke localization.ts

**Scale/Scope**: 4 halaman approval yang perlu diintegrasikan (ApprovalDitjenbunView, ApprovalBpdpView, CekiBpdpView, CekiDitjenbunView)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Vue 3 & Component-Driven | PASS | `ApprovalConfirmationModal` sebagai SFC `<script setup>` yang reusable di seluruh halaman approval |
| II. Strict TypeScript | PASS | Props didefinisikan dengan TypeScript interface; tidak ada `any` |
| III. Mandatory Pinia Store | PASS | Modal bersifat presentasional; aksi approval tetap melalui `useRekomtekStore()` yang sudah ada |
| IV. Modern UI/UX & Accessibility | PASS | Tailwind CSS, dark/light harmony, responsive via base `Modal.vue`, toast notifications |
| V. Simplicity (YAGNI) | PASS | Satu komponen modal yang reusable, tidak ada abstraksi berlebih |
| VI. Breadcrumb Navigation | N/A | Tidak relevan — fitur tidak menambah halaman baru |
| VII. Mobile-First Responsive | PASS | Base `Modal.vue` sudah responsif; modal baru mengikuti pola yang sama |
| VIII. Form Field Validation | N/A | Tidak ada form input baru |
| IX. Backend API Error Fidelity | PASS | Modal menampilkan error dari backend di dalam modal (modal tetap terbuka); tidak menelan error |
| X. UI/UX Pro Max Design System | PASS | Menggunakan warna primary `#066C2A`, `font-medium`/`font-semibold`, transisi Tailwind |
| XI. Vue Toaster Notification | PASS | Konfirmasi sukses/error via `useToast()`, tidak ada `alert()`/`confirm()` |
| XII. Lazy Loading & Skeleton | N/A | Modal dapat di-load langsung karena ringan; tidak perlu skeleton |
| XIII. Backend Contract Verification | N/A | Tidak ada endpoint API baru |
| XIV. Compact Information Density | PASS | Modal kecil dengan informasi minimal (jenis tindakan + tahap tujuan) |
| XV. Localization & Wording | PASS | Semua teks modal dieksternalisasi ke `src/config/localization.ts` |

**Gate Result (Pre-Design)**: ALL PASS. No violations.

**Re-check (Post-Design Phase 1)**: ALL PASS. Design artifacts (research.md, data-model.md, contracts/, quickstart.md) confirm all principles remain satisfied. No violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/022-approval-confirmation-modal/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (component interface)
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/
│   │   └── Modal.vue                    # [EXISTING] Base modal component
│   └── approval/
│       └── ApprovalConfirmationModal.vue # [NEW] Modal konfirmasi approval
├── config/
│   └── localization.ts                  # [MODIFY] Tambah wording modal
├── views/
│   ├── ditjenbun/
│   │   ├── ApprovalDitjenbunView.vue    # [MODIFY] Integrasi modal
│   │   └── CekiDitjenbunView.vue        # [MODIFY] Integrasi modal
│   └── bpdp/
│       ├── ApprovalBpdpView.vue         # [MODIFY] Integrasi modal
│       └── CekiBpdpView.vue             # [MODIFY] Integrasi modal
```

**Structure Decision**: Single-project frontend SPA. Komponen modal baru di `src/components/approval/` mengikuti konvensi organisasi komponen per modul yang sudah ada (seperti `src/components/rekomtek/`, `src/components/dinas/`).

## Complexity Tracking

> No violations to justify.