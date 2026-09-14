# Implementation Plan: Pekebun Timeline Step View & Wording Refinement

**Branch**: `017-timeline-progress-steps` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/017-timeline-progress-steps/spec.md`

## Summary

Desain ulang alur posisi pengajuan (workflow timeline) pada halaman detail usulan (`TrackingPengusulanView.vue`) dari bentuk grid kotak sederhana menjadi komponen **stepper progress terhubung** yang modern dan responsif. Penamaan langkah-langkah diselaraskan dengan kebutuhan terbaru pengguna dan menggunakan warna/ikon yang membedakan status selesai, aktif, dan pending.

## Technical Context

**Language/Version**: Vue 3 (SFC `<script setup>` with TypeScript strict mode)

**Primary Dependencies**: Vue 3, Vite, Tailwind CSS, `lucide-vue-next` (icons: `Check`, `Clock`, `AlertTriangle`), Pinia store (`src/stores/pengusulan`)

**Storage**: Local state computed from `selectedProposal.currentStatus`

**Testing**: Manual visual check & TypeScript compile check (`vue-tsc -b`)

**Target Platform**: Web Browser (Mobile 375px+ up to Desktop)

**Project Type**: Frontend Web Application component update

**Performance Goals**: Zero Cumulative Layout Shift (CLS) on state change, standard CSS animations

**Constraints**: Compact information density, matching brand color `#066C2A` (Forest Green), mobile-first responsive scaling

**Scale/Scope**: Refactor in `TrackingPengusulanView.vue`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Implementation Details / Compliance |
| :--- | :--- | :--- |
| **I. Vue 3 Setup** | `Passed` | Single-File Component with `<script setup>` and TypeScript. |
| **II. TypeScript** | `Passed` | Relying on strict type checks and existing `PengajuanStatus` enum. |
| **III. Pinia State** | `Passed` | State sourced directly from `usePengusulanStore` using computed properties. |
| **IV & X. UI/UX & Brand**| `Passed` | Using `#066C2A` (Forest Green) for completed steps, compliant contrast, soft transition animations. |
| **V. Simplicity** | `Passed` | Minimal HTML/CSS layout within Tailwind. No external stepper packages. |
| **VII. Mobile-First** | `Passed` | Stepper defaults to vertical stacked list on mobile, horizontal flow on md (768px)+ screens. |
| **XIV. Compact Scale** | `Passed` | Typography limited to `text-xs`/`text-sm`, h-9/w-9 step circles, flush paddings. |

## Project Structure

### Documentation (this feature)

```text
specs/017-timeline-progress-steps/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── checklists/
    └── requirements.md  # Checklist file
```

### Source Code (repository root)

```text
src/
├── views/
│   └── pengusulan/
│       └── TrackingPengusulanView.vue  # Main view file to edit
├── types/
│   └── pengusulan.ts                   # Types and status definitions (referenced)
└── stores/
    └── pengusulan.ts                   # Pinia store containing data (referenced)
```

**Structure Decision**: Monolith component update. The timeline changes are localized within `TrackingPengusulanView.vue` inside the workspace card detail section.

## Complexity Tracking

*No violations detected. Standard implementation follows all principles.*
