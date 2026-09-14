# Implementation Plan: Multi-Lahan Pekebun Registration

**Branch**: `009-multi-lahan-pekebun` | **Date**: 2026-08-04 | **Spec**: [spec.md](file:///c:/Users/raiha/Documents/Kerja/IDSurvey/SCI/bpdp-sarpras-kakao-fe/specs/009-multi-lahan-pekebun/spec.md)

## Summary

This feature extends the Farmer Registration Wizard (specifically Step 3: Data Lahan) to support adding, editing, and deleting multiple land records per farmer. The user interface will be refactored into a compact "List-First Accordion Grid with Segmented Tabs" layout. Multiple land records are stored in the Pinia store under the farmer object and validated reactively using Zod.

## Technical Context

**Language/Version**: TypeScript / Vue 3 (Composition API `<script setup>`)

**Primary Dependencies**: Tailwind CSS, Leaflet, lucide-vue-next, Pinia, Zod

**Storage**: Local Pinia state (`src/stores/pekebun.ts`)

**Testing**: Manual validation against running Vue app (no unit tests per Constitution standard)

**Target Platform**: Web

**Project Type**: Frontend Web App (SPA)

**Constraints**: Compact information density, Responsive mobile-first (375px+), Forest Green brand color `#066C2A`.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate / Principle | Standard | Status | Justification |
|---|---|---|---|
| I. Vue 3 Setup | composition API `<script setup>` | **PASSED** | Modified components use `<script setup>`. |
| III. Pinia State | encapsulating state and actions | **PASSED** | Mapped multi-lahan creation inside `addPekebunMulti` store action. |
| V. Simplicity (YAGNI) | simplest native solution | **PASSED** | Inline accordion avoids adding new routes or complex views. |
| VII. Mobile-First | layout from 375px upward | **PASSED** | Grid maps and coordinate table scroll cleanly on small screens. |
| VIII. Form Validation | real-time input checks | **PASSED** | Individual forms validate on tabs switch and save actions. |
| XIV. Compact Density | restrained text and spacing | **PASSED** | Accordion tabs separate concerns so elements fit viewports cleanly. |

## Project Structure

### Documentation (this feature)

```text
specs/009-multi-lahan-pekebun/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code

```text
src/
├── types/
│   └── pekebun.ts              # Mapped array of lands in Pekebun model
├── schemas/
│   └── pekebun.schema.ts       # Mapped list validators in Zod
├── stores/
│   └── pekebun.ts              # addPekebunMulti action mapping list
├── components/
│   └── master-data/
│       └── StepDataLahanPekebun.vue   # Dynamic accordion panel logic
└── views/
    └── master-data/
        └── FormPekebunView.vue # Mapped wizard onSubmit handling
```

**Structure Decision**: Refactoring the single project files as structured above.

## Complexity Tracking

> **No violations identified. Design conforms completely to the Constitution.**
