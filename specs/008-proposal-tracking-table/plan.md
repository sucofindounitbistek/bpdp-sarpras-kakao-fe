# Implementation Plan: Proposal Tracking Table & Detail View

**Branch**: `008-proposal-tracking-table` | **Date**: 2026-08-04 | **Spec**: [spec.md](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/specs/008-proposal-tracking-table/spec.md)

## Summary

The goal of this feature is to refactor the Proposal Tracking page (`/pengusulan/pengajuan-proposal`) from displaying a list of large proposal cards to displaying a compact data table of proposals by default. When the user clicks the "Lihat Detail" action button on any proposal in the table, the view will transition (in-place) to show the detailed layout (budget, CPCL list, document attachments, and workflow timeline) for that proposal. A "Kembali ke Daftar" button will allow returning to the table.

## Technical Context

**Language/Version**: TypeScript / Vue 3 (Composition API with `<script setup>`)

**Primary Dependencies**: Tailwind CSS, lucide-vue-next, Pinia

**Storage**: Local Pinia store (`src/stores/pengusulan.ts`)

**Testing**: Manual verification against running Vue app (no unit tests per Constitution standard)

**Target Platform**: Web (Desktop & Mobile viewports)

**Project Type**: Frontend SPA (Vue 3 / Vite)

**Performance Goals**: Page/view transitions and filter responses resolve instantly (< 100ms)

**Constraints**: Responsive mobile-first (375px+), Compact typography, Forest Green `#066C2A` branding.

**Scale/Scope**: Refactoring `TrackingPengusulanView.vue` and styling elements to follow compactness.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate / Principle | Standard | Status | Justification |
|---|---|---|---|
| I. Vue 3 Setup | Single-File Component using `<script setup>` | **PASSED** | Modified `TrackingPengusulanView.vue` uses `<script setup>` |
| III. Pinia State | No direct API calls, use stores | **PASSED** | Proposal data is sourced from existing `usePengusulanStore()` |
| V. Simplicity (YAGNI) | Minimize complexity, prefer standard features | **PASSED** | In-place reactive state (`selectedProposalId`) is used instead of complex sub-routes |
| VII. Mobile-First | Start layout from 375px upward | **PASSED** | Table uses responsive horizontal scrolling (`overflow-x-auto`) to prevent breaking layouts |
| X. UI/UX Pro Max | Curated green `#066C2A` theme and accessibility | **PASSED** | Follows system tokens for badges, table backgrounds, and smooth transitions |
| XIV. Compact Density | Restrained font sizing and heights | **PASSED** | Inputs h-10, small text (`text-xs`), and flush card containers |

## Project Structure

### Documentation (this feature)

```text
specs/008-proposal-tracking-table/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code

```text
src/
└── views/
    └── pengusulan/
        └── TrackingPengusulanView.vue   # Table + Detail in-place toggle
```

**Structure Decision**: Refactoring the single existing page view `src/views/pengusulan/TrackingPengusulanView.vue`.

## Complexity Tracking

> **No violations identified. Design conforms completely to the Constitution.**
