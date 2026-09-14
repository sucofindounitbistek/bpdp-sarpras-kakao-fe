# Implementation Plan: Modul Pengusulan Sarpras BPDP

**Branch**: `001-pengusulan-sarpras` | **Date**: 2026-07-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-pengusulan-sarpras/spec.md`

## Summary

Mengimplementasikan modul pengusulan Sarpras BPDP end-to-end pada aplikasi Vue 3 + TypeScript. Modul mencakup Form Multi-Step Wizard bagi Pemohon, Verifikasi Administrasi & Lapangan (BAHV & Rekomtek) oleh Dinas Kab/Kota, Validasi Provinsi, Pleno & SK Penetapan Ditjenbun, serta Penyaluran & Pelaporan PKS/BAST/LPJ oleh BPDPKS.

## Technical Context

**Language/Version**: Vue 3.5 + TypeScript ~5.7

**Primary Dependencies**: Vue Router 4, Pinia 3, Tailwind CSS 3.4, VeeValidate + Zod, Axios, Lucide Icons

**Storage**: LocalStorage (pinia-plugin-persistedstate) + REST API Service

**Testing**: Vitest + Vue Test Utils

**Target Platform**: Web (Desktop & Mobile Responsive)

**Project Type**: Vue 3 Web Application

**Performance Goals**: Rendering wizard step < 100ms, validasi real-time

**Constraints**: Mobile-first responsive, WCAG AA contrast, no alert() dialogs

**Scale/Scope**: 5 Role Access Levels (PEMOHON, DINAS_KAB, DINAS_PROV, DITJENBUN, BPDPKS)

## Constitution Check

*GATE: All principles passed.*

- Multi-step wizard UI menggunakan komponen reusable (`src/components/ui/`).
- Validasi berbasis Zod schema per step.
- Single reactive state management di Pinia.

## Project Structure

### Documentation (this feature)

```text
specs/001-pengusulan-sarpras/
├── plan.md              # File ini
├── research.md          # Output Phase 0
├── data-model.md        # Output Phase 1
├── quickstart.md        # Output Phase 1
└── contracts/           # Output Phase 1
    └── submission-api.json
```

### Source Code (repository root)

```text
src/
├── components/
│   └── ui/
│       ├── Button.vue
│       ├── Card.vue
│       ├── Input.vue
│       ├── Badge.vue
│       ├── Modal.vue
│       ├── StepIndicator.vue
│       ├── FileUpload.vue
│       └── ToastContainer.vue
├── composables/
│   ├── useToast.ts
│   └── useFormWizard.ts
├── schemas/
│   └── pengusulan.schema.ts
├── services/
│   └── pengusulan.service.ts
├── stores/
│   └── pengusulan.ts
├── types/
│   └── pengusulan.ts
└── views/
    ├── pengusulan/
    │   ├── FormPengusulanView.vue
    │   ├── TrackingPengusulanView.vue
    │   ├── VerifikasiDinasView.vue
    │   └── PenetapanDitjenbunView.vue
```

**Structure Decision**: Single project layout Vue 3 frontend (`src/`).
