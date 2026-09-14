# Implementation Plan: Step 3 Pengajuan Sarpras — Pekebun & Lahan, Dokumen Kepemilikan, Validasi Minimum Paket

**Branch**: `007-sarpras-step3-pekebun-lahan` | **Date**: 2026-07-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/007-sarpras-step3-pekebun-lahan/spec.md`

## Summary

Enhance Step 3 of the 3-step pengusulan wizard (`StepPilihPekebunLahan.vue`) to: (1) display pekebun with their lahan in a combined tree hierarchy instead of separate selection panels, (2) add document ownership type selection (SHM / Dokumen Lainnya) per selected lahan, and (3) implement real-time validation of selected pekebun count and total land area against the minimum requirements of the paket sarpras chosen in Step 1.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Vue 3.4+ with `<script setup>` SFCs

**Primary Dependencies**: Vue 3, Pinia, Tailwind CSS, Zod, VeeValidate, Lucide Vue Next

**Storage**: Pinia store (session-only, non-persisted via `usePengusulanDraftStore`); pekebun/lahan data from `usePekebunStore` (persisted mock data)

**Testing**: Manual verification against running application (no automated tests per Constitution Principle)

**Target Platform**: Web browser (desktop + mobile, responsive 360px-1920px)

**Project Type**: Vue 3 SPA frontend (monolithic frontend with sibling `bpdp-iam-be` backend)

**Performance Goals**: Validation status update < 1 second after selection change; total Step 3 completion < 5 minutes for 50 pekebun

**Constraints**: Zero new backend endpoints required; all new logic is client-side validation and UI. No new npm dependencies.

**Scale/Scope**: Single component rewrite + store extension + config additions. Touches ~5 files.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Vue 3 & Component-Driven Architecture | PASS | Component stays `<script setup>` SFC; inline document fields for lahan document selection per YAGNI |
| II. Strict TypeScript & Schema Validation | PASS | New types (`LahanDokumenPemilik`, `PaketMinimumRule`) in `src/types/`; Zod validation for document fields |
| III. Mandatory Pinia State Management | PASS | All state in `usePengusulanDraftStore`; no local state for persistent data |
| IV. Modern UI/UX & Accessible Design | PASS | Tailwind CSS, dark/light theme harmony, toast notifications for validation |
| V. Simplicity (YAGNI) | PASS | No new composables or services; extend existing store, component, config |
| VI. Breadcrumb Navigation | PASS | Already in `FormPengusulanView.vue`, unchanged |
| VII. Mobile-First Responsive | PASS | Existing responsive patterns preserved; tree hierarchy uses responsive flex layout |
| VIII. Form Field Validation | PASS | Dokumen kepemilikan fields validated with VeeValidate or inline validation |
| IX. Backend API Error Fidelity | PASS | Submit unchanged; no new API calls; toast displays backend errors |
| X. UI/UX Pro Max | PASS | `#066C2A` brand color, `font-medium/semibold`, `transition-all`, `rounded-xl` |
| XI. Vue Toaster Notification | PASS | Toast for validation errors and submit success |
| XII. Lazy Loading & Skeleton | PASS | `StepPilihPekebunLahan` already lazy-loaded in `FormPengusulanView` |
| XIII. Backend Contract Verification | PASS | No new backend endpoints needed; submit endpoint unchanged |
| XIV. Compact Information Density | PASS | `text-xs`/`text-sm` base, `h-9`/`h-10` form controls, `rounded-lg`/`rounded-xl` corners |

**Gate Result**: ALL PASS. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/007-sarpras-step3-pekebun-lahan/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── views/pengusulan/
│   ├── FormPengusulanView.vue       # Wizard shell (unchanged)
│   ├── StepPilihPekebunLahan.vue    # ★ REWRITE: combined view + doc selection + validation
│   ├── StepPaketSarpras.vue         # Step 1 (unchanged)
│   └── StepRAB.vue                  # Step 2 (unchanged)
├── components/pengusulan/
│   └── ProposalPreviewModal.vue     # ★ PATCH: add lahan doc info to preview
├── stores/
│   └── pengusulanDraft.ts           # ★ EXTEND: new state + validation logic
├── types/
│   └── pengusulan.ts                # ★ EXTEND: new types for lahan doc, minimum rules
└── lib/
    └── pengusulan-persyaratan.config.ts  # ★ EXTEND: PAKET_MINIMUM_REQUIREMENTS config
```

**Structure Decision**: Existing single-project Vue 3 SPA. All changes confined to the `pengusulan` feature module. New sub-component `LahanDocumentSelect.vue` may be extracted to `src/components/pengusulan/` if the inline template grows too large.

## Complexity Tracking

> No violations to justify. All constitution gates pass.