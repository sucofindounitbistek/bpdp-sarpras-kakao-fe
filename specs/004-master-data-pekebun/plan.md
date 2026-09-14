# Implementation Plan: Master Data Pekebun

**Branch**: `004-master-data-pekebun` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-master-data-pekebun/spec.md`

## Summary

Rename "Form Usulan Baru" to "Pekebun" under a new "Master Data" sidebar section. Build a 3-step registration form (Identitas + Dukcapil lookup, Upload Dokumen, Data Lahan with cascading wilayah) and a list page with search/filter/detail modal. All data is client-simulated (mockup) with Pinia stores per Constitution XIII.

## Technical Context

**Language/Version**: TypeScript 5.x (Vue 3 `<script setup>` SFC)

**Primary Dependencies**: Vue 3, Vue Router, Pinia (with persist), Tailwind CSS, Zod, VeeValidate, Lucide Vue Next

**Storage**: Pinia store with `persist: true` (localStorage). No backend database.

**Testing**: Build validation only (`vue-tsc -b && vite build`). No automated unit tests per Constitution.

**Target Platform**: Web browser (desktop & mobile responsive)

**Project Type**: Single-page web application (frontend only)

**Performance Goals**: Standard web app expectations. Simulated Dukcapil lookup ≤ 500ms.

**Constraints**: All backend integrations simulated. Mockup data per Constitution XIII.

**Scale/Scope**: ~3 new page views, ~5 new components, 1 new store, 1 new type file, 1 new schema file, 2 route additions, sidebar menu update.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Vue 3 & Component-Driven | ✅ Pass | All new files use `<script setup>` SFCs |
| II. Strict TypeScript & Schema Validation | ✅ Pass | Zod schemas defined for each form step |
| III. Mandatory Pinia State Management | ✅ Pass | New `usePekebunStore` for all domain state; no direct API calls in components |
| IV. Modern UI/UX & Visual Intentionality | ✅ Pass | Reuses existing Tailwind design tokens, dark/light theme support |
| V. Simplicity & YAGNI | ✅ Pass | Reuses existing `useFormWizard`, `StepIndicator`, `FileUpload` components |
| VI. Breadcrumb Navigation | ✅ Pass | Breadcrumb included on both list and form pages |
| VII. Mobile-First Responsive | ✅ Pass | Grid layouts use `sm:`/`md:`/`lg:` breakpoints |
| VIII. Form Validation Standard | ✅ Pass | Real-time Zod validation on every step |
| IX. Backend API Error Fidelity | ✅ Pass | No real backend calls; mockup patterns documented |
| X. UI/UX Pro Max Design System | ✅ Pass | Uses `#066C2A` brand color, emerald accents, slate neutrals |
| XI. Vue Toaster Notifications | ✅ Pass | All feedback via `useToast()` — no native dialogs |
| XII. Lazy Loading & Skeleton | ✅ Pass | Route-level lazy imports (`() => import(...)`) |
| XIII. Backend Contract Verification | ✅ Pass | No backend exists; mockup pattern per established convention |
| XIV. Compact Information Density | ✅ Pass | Base text 13-14px, inputs h-9 to h-10, cards p-5 md:p-6, `px-4 lg:px-6` alignment |

**Post-design re-check**: All gates still pass ✅

## Project Structure

### Documentation (this feature)

```text
specs/004-master-data-pekebun/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0: research decisions
├── data-model.md        # Phase 1: entity definitions
├── quickstart.md        # Phase 1: validation scenarios
├── contracts/
│   └── ui-contract.md   # Phase 1: component/store interfaces
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (new/modified files)

```text
src/
├── types/
│   └── pekebun.ts                          # [NEW] Type definitions
├── schemas/
│   └── pekebun.schema.ts                   # [NEW] Zod validation schemas
├── stores/
│   └── pekebun.ts                          # [NEW] Pinia store (mock data, Dukcapil, wilayah)
├── views/
│   └── master-data/
│       ├── PekebunListView.vue             # [NEW] List page with table/search/filter
│       └── FormPekebunView.vue             # [NEW] Multi-step registration form
├── components/
│   └── master-data/
│       ├── StepIdentitasPekebun.vue        # [NEW] Step 1: Identity + Dukcapil
│       ├── StepUploadDokumenPekebun.vue    # [NEW] Step 2: 4 document uploads
│       ├── StepDataLahanPekebun.vue        # [NEW] Step 3: Land data + cascading
│       └── DetailPekebunModal.vue          # [NEW] Read-only detail modal
├── router/
│   └── index.ts                            # [MODIFY] Add 2 new routes
└── components/ui/
    └── Sidebar.vue                         # [MODIFY] Add "Master Data" section

public/
└── templates/
    ├── format-sporadik.docx                # [NEW] Placeholder template
    ├── format-surat-beda-nama.docx         # [NEW] Placeholder template
    └── format-surat-penguasaan-fisik.docx  # [NEW] Placeholder template
```

**Structure Decision**: Single frontend project. New views placed in `src/views/master-data/` following existing pattern (`src/views/pengusulan/`, `src/views/dinas/`, etc.). New reusable components in `src/components/master-data/` to keep feature-specific components organized.

## Complexity Tracking

No Constitution violations. No complexity justification needed.
