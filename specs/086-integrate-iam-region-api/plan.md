# Implementation Plan: Integrasi API Master Wilayah IAM pada Pengisian Lahan Pekebun

**Branch**: `086-integrate-iam-region-api` | **Date**: 2026-09-14 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/086-integrate-iam-region-api/spec.md`

---

## Summary

Integrate real Indonesian master administrative region data from BPDP IAM (`bpdp-iam-be` public region APIs) into the BPDP Sarpras Frontend (`bpdp-sarpras-kelapa-fe`). This replaces the hardcoded 3-province mock array `MOCK_WILAYAH` on the Pekebun Land Data Form (`StepDataLahanPekebun.vue`) for Kelembagaan Pekebun (KP) operators.

The implementation introduces:
1. An HTTP service `src/services/region.service.ts` targeting public endpoints `GET /public/regions/provinces` (38 provinces) and `GET /public/regions/regencies?province_id={id}` (514 regencies/cities).
2. A dedicated Pinia store `useRegionStore` in `src/stores/region.ts` providing in-memory caching to eliminate redundant API calls across land plot creation/editing.
3. Updated UI in `src/components/master-data/StepDataLahanPekebun.vue` with dynamic province & regency dropdowns, loading/error states, and free-text inputs for Kecamatan and Desa.
4. Backward-compatible integration with `usePekebunStore` and region helpers.

---

## Technical Context

**Language/Version**: TypeScript 5.x / Vue 3.4+ (Composition API with `<script setup>`)  
**Primary Dependencies**: Vue 3, Pinia 2.x, Axios, Lucide Vue Next, Leaflet  
**Storage**: In-memory Pinia cache for master region data; persistent state handled via Sarpras backend API  
**Testing**: Manual validation, strict TypeScript check (`vue-tsc -b`), and Vite production build (`vite build`) per Constitution Development & Quality Workflow  
**Target Platform**: Web (Desktop & Mobile viewports, responsive from 375px+)  
**Project Type**: Single-Page Web Application (SPA)  
**Performance Goals**: Initial provinces loaded < 1s; regencies loaded < 500ms; 0 duplicate network calls for cached regions during a user session  
**Constraints**: Zero changes to backend database schemas; no native browser popups (`alert/confirm`); no external styling frameworks beyond Tailwind CSS tokens  
**Scale/Scope**: 38 provinces, 514 regencies/cities; impacts `StepDataLahanPekebun.vue`, `src/stores/region.ts`, `src/services/region.service.ts`, and `src/stores/pekebun.ts`  

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I (Vue 3 & Component Architecture)**: Components use `<script setup lang="ts">`, modular design, clean presentation separation.
- [x] **Principle II (Strict TypeScript)**: Explicit interfaces (`Province`, `Regency`, `RegionOption`, `LahanFormData`), strict types, no `any` leaks.
- [x] **Principle III (Mandatory Pinia State Management)**: Region API calls and caching are encapsulated entirely within Pinia (`useRegionStore`), not directly inside UI components.
- [x] **Principle IV (Modern UI/UX & Visual Polish)**: Uses Tailwind CSS, emerald/forest green brand tokens (`#066C2A`), subtle transitions, and accessible contrast.
- [x] **Principle V (Strict Anti-Redundancy & DRY)**: Single source of truth for region caching; 0 redundant API calls; elimination of obsolete mock array `MOCK_WILAYAH` for provinces/regencies.
- [x] **Principle VII (Mobile-First & Responsive)**: Text inputs and select controls designed mobile-first (standard `h-10`, responsive grid layout).
- [x] **Principle VIII (Form Field Validation)**: Validation for required province, regency, kecamatan, and desa with clear error messages.
- [x] **Principle IX (Backend Error Response Fidelity)**: Propagate API errors from IAM gracefully with retry feedback via Vue Toast.
- [x] **Principle X (UI/UX Pro Max Standard)**: Typography restrained to standard sizes; high contrast; WCAG AA compliant.
- [x] **Principle XI (Mandatory Vue Toaster Standard)**: Native dialogs prohibited; all user feedback handled via `useToast()`.
- [x] **Principle XII (Lazy Loading & Skeleton Standard)**: Dropdown loading indicators and spinners to prevent blank states.
- [x] **Principle XIII (Backend Contract Verification)**: Direct inspection of `bpdp-iam-be` source code (`internal/region/handler.go`) verified public endpoints and payload shape before implementation. Documented in `contracts/iam-region-api.contract.md`.
- [x] **Principle XIV (Compact Information Density)**: Standard control heights (`h-10`), balanced paddings (`p-4`), restrained typography.
- [x] **Principle XVI (No Nested Modals)**: In-modal step drawer and accordion flow preserved without introducing modal stacks.

---

## Project Structure

### Documentation (this feature)

```text
specs/086-integrate-iam-region-api/
├── spec.md              # Feature specification with clarifications
├── plan.md              # This file (/speckit-plan output)
├── research.md          # Phase 0: Research decisions & backend inspection
├── data-model.md        # Phase 1: Entities, schemas, state transitions
├── quickstart.md        # Phase 1: Verification scenarios & manual testing guide
├── contracts/           # Phase 1: Verified backend contract
│   └── iam-region-api.contract.md
└── tasks.md             # Phase 2: Actionable tasks (/speckit-tasks output)
```

### Source Code (repository root)

```text
src/
├── services/
│   ├── api.ts                   # Core Sarpras Axios instance
│   └── region.service.ts        # [NEW] IAM Region API client (public endpoints)
├── stores/
│   ├── region.ts                # [NEW] Pinia store with in-memory caching for provinces & regencies
│   └── pekebun.ts               # [MODIFY] Delegate getWilayah methods to useRegionStore
├── types/
│   ├── region.ts                # [NEW] Region domain types (Province, Regency, RegionOption)
│   └── pekebun.ts               # [MODIFY] Re-export/align LahanFormData with region types
├── components/
│   └── master-data/
│       └── StepDataLahanPekebun.vue # [MODIFY] Bind Provinsi/Kabupaten to API, convert Kec/Desa to text inputs
└── utils/
    └── regionHelper.ts          # [MODIFY] Ensure fallback compatibility with numeric IAM codes
```

**Structure Decision**: Standard Vue 3 / Pinia application architecture. All network calls reside in `src/services/`, state and caching in `src/stores/`, and UI bindings in `src/components/master-data/`.

---

## Complexity Tracking

> **Zero violations**. All changes strictly follow Constitution principles.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|---|---|---|
| *None* | *N/A* | *N/A* |
