# Implementation Plan: Breadcrumb Role Removal & Menu-Only Navigation

**Branch**: `018-remove-breadcrumb-roles` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/018-remove-breadcrumb-roles/spec.md`

## Summary

Modifikasi komponen navigasi breadcrumb (`Breadcrumb.vue`) agar secara dinamis menyembunyikan nama role/section (seperti `DINAS KABUPATEN / KOTA`, `DITJENBUN (VERIFIKATOR)`) dari hirarki navigasi. Selain itu, hilangkan prop breadcrumb hardcoded `:items` dari berbagai view page agar beralih sepenuhnya ke resolusi dinamis berbasis menu yang lebih bersih dan bebas dari penyebutan nama peran.

## Technical Context

**Language/Version**: Vue 3 (TypeScript strict mode)

**Primary Dependencies**: Vue 3, Vue Router, `lucide-vue-next` (icon: `ChevronRight`), project routing structure

**Storage**: None (reactive route/navigation state)

**Testing**: Manual routing navigation & build check

**Target Platform**: Web Browser (Mobile & Desktop)

**Project Type**: UI component navigation update

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Implementation Details / Compliance |
| :--- | :--- | :--- |
| **I. Vue 3 Setup** | `Passed` | Single-File Components with `<script setup>` and TypeScript. |
| **VI. Breadcrumb Navigation** | `Passed` | Fully complies and optimizes the Breadcrumb Navigation Standard by making it fully dynamic and menu-focused. |
| **XIV. Compact Scale** | `Passed` | Uses standard breadcrumb typography and layouts. |

## Project Structure

### Documentation (this feature)

```text
specs/018-remove-breadcrumb-roles/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
src/
├── components/
│   └── ui/
│       └── Breadcrumb.vue  # Component to modify (disable section title rendering)
└── views/
    ├── DashboardView.vue
    ├── ditjenbun/
    │   ├── AntreanRekomtekView.vue
    │   ├── CekiDitjenbunView.vue
    │   └── ApprovalDitjenbunView.vue
    ├── dinas/
    │   ├── KabVerifikasiView.vue
    │   └── ProvVerifikasiView.vue
    └── bpdp/
        ├── CekiBpdpView.vue
        └── ApprovalBpdpView.vue
```

**Structure Decision**: Shared UI component adjustment and page-level cleanup of hardcoded breadcrumb parameters.

## Complexity Tracking

*No violations detected. Standard implementation follows all principles.*
