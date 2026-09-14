# Implementation Plan: Revamp Pengusulan Baru — Multi-Step Wizard

**Branch**: `006-pengusulan-baru-revamp` | **Date**: 2026-07-31 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-pengusulan-baru-revamp/spec.md`

---

## Summary

Revamp the existing Pengusulan Baru form (`FormPengusulanView.vue`) from the current 5-step flow (Profil Lembaga → Data CPCL → Paket Sarpras → Upload Dokumen → Review) into a focused 3-step wizard:

1. **Step 1 — Paket Sarpras & Dokumen**: Select from 9 paket jenis, display per-paket requirements, download format templates, upload + preview documents, and conditionally show a Gudang Serah Terima section for Ekstensifikasi / Intensifikasi packages.
2. **Step 2 — RAB**: Interactive RAB table (Tahap / Uraian / Volume / Satuan / Harga Satuan / Sub-total) with auto-calculation, add/delete rows, download blank RAB, upload signed RAB + preview.
3. **Step 3 — Pekebun, Lahan & Submit**: Select Pekebun from existing master data, select Lahan, Preview full proposal (with in-modal document preview), Submit with success toast + registration number.

The implementation is client-simulated (no confirmed backend endpoint). All data is managed via Pinia store extension, consistent with the existing `pengusulan.ts` pattern and constitution principle XIII.

---

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enforced)

**Primary Dependencies**: Vue 3 (`<script setup>` SFCs), Pinia (state management), Tailwind CSS (styling), VeeValidate + Zod (form validation), Lucide-Vue-Next (icons), Vue Router 4

**Storage**: Pinia store with `persist: true` (session-scoped draft state); localStorage via pinia-plugin-persistedstate

**Testing**: TypeScript strict (`vue-tsc -b`) + `vite build` — no automated unit tests per constitution

**Target Platform**: Modern browser (desktop-first, mobile-responsive, minimum 360px viewport)

**Project Type**: Web application — Vue 3 SPA (Single Page Application)

**Performance Goals**: All step transitions < 100ms perceived; document preview renders within 2s

**Constraints**: No new external dependencies to be introduced (per YAGNI — Constitution V). Reuse existing `FileUpload.vue`, `Modal.vue`, `Card.vue`, `Button.vue`, `Input.vue`, `Badge.vue` UI primitives. No backend calls until real endpoints are confirmed.

**Scale/Scope**: Single feature module (~6 Vue SFC files), 1 Pinia store extension, 1 TypeScript types extension

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Vue 3 `<script setup>` SFCs | ✅ PASS | All new components use `<script setup lang="ts">` |
| II | TypeScript strict + Zod validation | ✅ PASS | New types extend `pengusulan.ts`; Zod schemas for step validation |
| III | Pinia state management — no direct API in components | ✅ PASS | New `usePengusulanDraftStore` handles all step data |
| IV | Modern UI/UX, dark/light theme harmony | ✅ PASS | Reuses existing Tailwind design tokens (`#066C2A`, emerald, slate) |
| V | YAGNI — no unnecessary deps | ✅ PASS | No new npm packages; reuses existing UI components |
| VI | Breadcrumb navigation | ✅ PASS | `Breadcrumb.vue` included in `FormPengusulanView.vue` header |
| VII | Mobile-first responsive | ✅ PASS | Responsive table for RAB (horizontal scroll on mobile), stacked layouts |
| VIII | Mandatory form field validation | ✅ PASS | Per-step validation gate prevents advancement without completion |
| IX | Backend error fidelity | ✅ PASS | Client-simulated with explicit comment; no mock fallbacks silencing real errors |
| X | UI/UX Pro Max design system | ✅ PASS | WCAG AA contrast, `font-medium`/`font-semibold`, micro-animations |
| XI | Toast notifications (no `alert()`) | ✅ PASS | `useToast()` used for all feedback |
| XII | Lazy loading + Skeleton | ✅ PASS | Step components `defineAsyncComponent`; Skeleton shown during async load |
| XIII | Backend contract verification | ✅ PASS | No confirmed endpoint → client-simulated with explicit comment + contract doc |
| XIV | Compact density + restrained typography | ✅ PASS | Base 13-14px, section headers ≤18px, inputs h-9/h-10, rounded-lg |

**Post-Design Re-check**: All gates pass. No complexity violations.

---

## Project Structure

### Documentation (this feature)

```text
specs/006-pengusulan-baru-revamp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── pengusulan-baru-ui-contract.md   # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── pengusulan.ts           [MODIFY] — extend JenisSarpras enum (9 values), add RabItem, GudangSerahTerima, PengusulanDraftState interfaces
├── stores/
│   └── pengusulanDraft.ts      [NEW] — multi-step draft state store (step data, validation flags, reset)
├── views/
│   └── pengusulan/
│       ├── FormPengusulanView.vue    [MODIFY] — replace 5-step wizard with new 3-step wizard shell
│       ├── StepPaketSarpras.vue      [MODIFY] — complete rewrite: 9 options, persyaratan, upload, gudang
│       ├── StepRAB.vue               [NEW] — RAB table, auto-subtotal, download, upload signed RAB
│       └── StepPilihPekebunLahan.vue [NEW] — select pekebun + lahan, preview proposal, submit
└── components/
    └── pengusulan/
        ├── ProposalPreviewModal.vue  [NEW] — full proposal preview modal with doc viewer
        └── RabTable.vue              [NEW] — RAB editable table component
```

**Structure Decision**: Single-project Vue SPA. New step components live alongside existing ones in `src/views/pengusulan/`. Reusable sub-components (RabTable, ProposalPreviewModal) placed in `src/components/pengusulan/`. No new route needed — existing `/pengusulan/baru` route continues to render `FormPengusulanView.vue`.

---

## Complexity Tracking

> No constitution violations requiring justification.
