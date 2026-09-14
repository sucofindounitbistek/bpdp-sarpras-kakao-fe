# Implementation Plan: Modul Penyaluran Barang (Ekstensifikasi & Intensifikasi)

**Branch**: `045-penyaluran-barang-ekstensifikasi-intensifikasi` | **Date**: 2026-08-27 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/045-penyaluran-barang-ekstensifikasi-intensifikasi/spec.md`

---

## Summary

Mengimplementasikan modul mockup interaktif baru **Penyaluran Barang Khusus Ekstensifikasi & Intensifikasi** yang menghubungkan siklus permohonan pekebun, verifikasi teknis BPDP, disposisi PPK, tender ULP, kontrak Dokumen "A", dan penugasan surveyor. Seluruh implementasi dibuat terisolasi dan non-destruktif dengan state persistensi Pinia + LocalStorage serta generator PDF permohonan.

---

## Technical Context

**Language/Version**: TypeScript 5.3+ / Vue 3.4+ (SFC `<script setup>`)
**Primary Dependencies**: Vue Router 4, Pinia (dengan Pinia Plugin Persistedstate), Tailwind CSS, Lucide Vue Next, jsPDF (atau browser print stylesheet generation)
**Storage**: Client-side LocalStorage via Pinia Persist Plugin
**Testing**: TypeScript strict-mode (`vue-tsc -b`) & Vite build validation
**Target Platform**: Responsive Web (Mobile 375px+ to Desktop 1440px+)
**Project Type**: Web Application (Frontend Vue 3 SPA)
**Performance Goals**: Instant multi-role reactivity (<100ms role switch & queue hydration)
**Constraints**: Zero regression on existing proposal features (`0% broken existing code`), WCAG AA contrast, Forest Green theme harmony

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Vue 3 & Component-Driven Architecture**: Modular SFCs in `src/components/penyaluran-barang/` and views in `src/views/penyaluran-barang/`.
- [x] **II. Strict TypeScript & Schema Validation**: Explicit types in `src/types/penyaluranBarang.ts`.
- [x] **III. Mandatory Pinia State Management**: Centralized store `usePenyaluranBarangStore` in `src/stores/penyaluranBarang.ts`.
- [x] **IV. Modern UI/UX & Visual Intentionality**: Forest Green `#066C2A` palette, clean bento grid cards, status badges, micro-animations.
- [x] **V. Simplicity & Modular Maintainability (YAGNI)**: Clean self-contained mockup without bloated dependencies.
- [x] **VI. Breadcrumb Navigation Standard**: Integrated breadcrumbs on all sub-routes.
- [x] **VII. Mandatory Mobile-First & Responsive Design**: Tested for mobile 375px viewports upwards.
- [x] **VIII. Mandatory Form Field Validation**: Form validation with contextual error states.
- [x] **XI. Mandatory Vue Toaster Notification Standard**: Reusable toast notifications for action confirmations.
- [x] **XIV. Compact Information Density**: Restrained font hierarchy (`13px`-`18px`) and compact `h-9`/`h-10` controls.
- [x] **XV. Non-Destructive Guardrail**: Existing views, stores, and router routes remain undisturbed.

---

## Project Structure

### Documentation (this feature)

```text
specs/045-penyaluran-barang-ekstensifikasi-intensifikasi/
├── spec.md              # Feature specification
├── plan.md              # This implementation plan
├── research.md          # Architecture & technical decisions
├── data-model.md        # Type definitions & state machine
├── quickstart.md        # End-to-end testing walkthrough
├── contracts/           # Store & future API contracts
│   └── penyaluran-barang-api.md
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code Planned Structure

```text
src/
├── types/
│   └── penyaluranBarang.ts                       # [NEW] Data types & interfaces
├── stores/
│   ├── auth.ts                                   # [EXTEND] Add BPDP_PPK & BPDP_ULP roles
│   └── penyaluranBarang.ts                       # [NEW] Multi-role reactive mock store
├── composables/
│   └── useNavigation.ts                          # [EXTEND] Add Penyaluran Barang nav sections
├── components/
│   ├── ui/
│   │   └── RoleSwitcher.vue                      # [EXTEND] Add BPDP_PPK & BPDP_ULP options
│   └── penyaluran-barang/                        # [NEW] Reusable UI components
│       ├── ItemRabFormTable.vue                  # Table & form input preferensi RAB barang
│       ├── PenyaluranTimelineTracker.vue         # Status visual workflow tracker
│       ├── DokumenKontrakModal.vue               # Form modal Dokumen Kontrak "A"
│       ├── SuratTugasSurveyorModal.vue           # Modal surat tugas sampling surveyor
│       ├── DisposisiPpkModal.vue                 # Modal disposisi PPK (ULP vs Pejabat Pengadaan)
│       └── TenderUlpModal.vue                    # Modal eksekusi tender & pemenang vendor
├── utils/
│   └── permohonanPdfGenerator.ts                 # [NEW] Client-side PDF surat generator
└── views/
    └── penyaluran-barang/                        # [NEW] Feature views per role
        ├── PekebunPermohonanBarangView.vue       # View permohonan Pekebun
        ├── BpdpVerifikatorBarangView.vue         # View verifikasi & kontrak BPDP Teknis
        ├── BpdpPpkBarangView.vue                 # View antrean disposisi BPDP PPK
        └── BpdpUlpBarangView.vue                 # View tender e-catalog BPDP ULP
```

---

## Complexity Tracking

| Aspect | Justification |
| :--- | :--- |
| Role Extension in `auth.ts` | Necessary so the evaluator can switch between BPDP PPK and BPDP ULP on the fly. |
| Pinia Persistent Store | Enables reactive, seamless data flow across role switches without backend dependencies. |
