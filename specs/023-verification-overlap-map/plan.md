# Implementation Plan: Peta Global Verifikasi & Deteksi Tumpang Tindih Lahan

**Branch**: `023-verification-overlap-map` | **Date**: 2026-08-06 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/023-verification-overlap-map/spec.md`

## Summary

Fitur ini menambahkan peta global satelit (Leaflet) pada seluruh halaman verifikasi pekebun dan dokumen untuk mendeteksi tumpang tindih lahan antar proposal. Peta menampilkan poligon biru (proposal yang sedang diverifikasi) dan poligon merah (proposal lain dalam radius relevan). Fitur dibangun di atas komponen `SatelliteMapPreview.vue` yang sudah ada, dengan komponen baru `VerificationOverlapMap.vue` yang menangani rendering multi-poligon, legend, popup, dan daftar overlap.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Vue 3.4+ with `<script setup>` SFCs

**Primary Dependencies**: Vue 3, Vue Router, Pinia, Tailwind CSS 3, Leaflet 1.9.4, lucide-vue-next, `@vue-leaflet/vue-leaflet` (available but not used; project uses direct Leaflet API)

**Storage**: N/A (fitur UI-only, data poligon dari existing stores)

**Testing**: Manual verification via running app

**Target Platform**: Web browser (desktop + mobile, viewport min 375px)

**Project Type**: Web application (frontend SPA)

**Performance Goals**: Peta render < 3 detik, overlap detection client-side < 500ms

**Constraints**: Responsive mobile-first, dark mode, satellite tile layer (Esri World Imagery), collapsible section

**Scale/Scope**: 6-8 halaman verifikasi yang perlu diintegrasikan (CekiDitjenbun, CekiBpdp, StepVerifikasiPekebunDanDokumenProposal, StepVerifikasiPekebun, DetailVerifikasiKabView, DetailVerifikasiProvinsiView)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Vue 3 & Component-Driven | PASS | `VerificationOverlapMap.vue` sebagai SFC `<script setup>` reusable |
| II. Strict TypeScript | PASS | Props didefinisikan dengan TypeScript interface |
| III. Mandatory Pinia Store | PASS | Data poligon dari `useRekomtekStore()` dan `usePekebunStore()` yang sudah ada |
| IV. Modern UI/UX & Accessibility | PASS | Tailwind CSS, dark/light, satellite tiles, collapsible card |
| V. Simplicity (YAGNI) | PASS | Satu komponen, extend existing `SatelliteMapPreview` pattern |
| VI. Breadcrumb Navigation | N/A | Tidak menambah halaman baru |
| VII. Mobile-First Responsive | PASS | Peta Leaflet responsif by default, collapsible card adapts to viewport |
| VIII. Form Field Validation | N/A | Tidak ada form input baru |
| IX. Backend API Error Fidelity | PASS | Polygon data dari existing stores; error handling untuk data invalid |
| X. UI/UX Pro Max Design System | PASS | Warna `#066C2A` untuk poligon, font-medium/semibold, transisi |
| XI. Vue Toaster Notification | PASS | Tidak ada alert/confirm; info overlap via UI list |
| XII. Lazy Loading & Skeleton | PASS | Map component di-load dengan `defineAsyncComponent`, skeleton placeholder |
| XIII. Backend Contract Verification | N/A | Tidak ada endpoint baru; data dari existing mock stores |
| XIV. Compact Information Density | PASS | Map sebagai collapsible section, tidak memenuhi layar |
| XV. Localization & Wording | PASS | Legend labels, overlap list wording di `localization.ts` |

**Gate Result (Pre-Design)**: ALL PASS. No violations.

**Re-check (Post-Design Phase 1)**: ALL PASS. Design artifacts confirm: `VerificationOverlapMap` as SFC (I), TypeScript interfaces (II), existing Pinia stores (III), Tailwind + Leaflet (IV), single component (V), lazy loading via `defineAsyncComponent` (XII), localization for all labels (XV). No violations introduced.

## Project Structure

### Documentation (this feature)

```text
specs/023-verification-overlap-map/
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
│   │   └── SatelliteMapPreview.vue        # [EXISTING] Read-only satellite map
│   └── verification/
│       └── VerificationOverlapMap.vue     # [NEW] Multi-polygon overlap map
├── config/
│   └── localization.ts                    # [MODIFY] Tambah wording map legend
├── views/
│   ├── ditjenbun/
│   │   └── CekiDitjenbunView.vue          # [MODIFY] Tambah collapsible map section
│   ├── bpdp/
│   │   └── CekiBpdpView.vue               # [MODIFY] Tambah collapsible map section
│   └── dinas/
│       ├── kabupaten/
│       │   ├── DetailVerifikasiKabView.vue # [MODIFY] Tambah collapsible map section
│       │   └── StepVerifikasiPekebunDanDokumenProposal.vue # [MODIFY] Tambah map
│       └── provinsi/
│           ├── DetailVerifikasiProvinsiView.vue # [MODIFY] Tambah collapsible map section
│           └── StepVerifikasiPekebun.vue   # [MODIFY] Tambah map
```

## Complexity Tracking

> No violations to justify.