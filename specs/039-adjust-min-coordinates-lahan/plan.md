# Implementation Plan: Adjust Minimum Land Coordinates

**Branch**: `039-adjust-min-coordinates-lahan` | **Date**: 2026-08-25 | **Spec**: [spec.md](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/specs/039-adjust-min-coordinates-lahan/spec.md)

**Input**: Feature specification from `/specs/039-adjust-min-coordinates-lahan/spec.md`

## Summary

This feature validates that land boundaries can be successfully defined with a minimum of 3 coordinate points (triangular boundary) in `StepDataLahanPekebun.vue`. The codebase already supports a minimum of 3 coordinates in schemas and helpers. We will audit, test, and refactor any hardcoded UI labels to use central localization configuration (`src/config/localization.ts`) to comply with project rules.

## Technical Context

**Language/Version**: Vue 3, TypeScript, Vite
**Primary Dependencies**: Vue, Zod, VeeValidate, Leaflet
**Storage**: Client-side state managed by Pinia store, backend API payload structure
**Testing**: Manual testing via browser dev server
**Target Platform**: Desktop and Mobile web browsers
**Project Type**: frontend web application
**Performance Goals**: Instant validation response (<50ms), Leaflet map re-rendering within 100ms
**Constraints**: None
**Scale/Scope**: 1 Vue component (`StepDataLahanPekebun.vue`), 1 localization file (`src/config/localization.ts`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Vue 3 SFCs**: Yes, using Vue 3 script setup.
- **Strict TypeScript & Zod Validation**: Yes, coordinate validations are defined in `src/schemas/pekebun.schema.ts` and validated via Zod.
- **Pinia State**: Yes, form uses Pinia store for state syncing.
- **Localization (Principle XV)**: Yes! The hardcoded string "Pratinjau poligon akan terbentuk setelah minimal 3 titik koordinat dimasukkan." in `StepDataLahanPekebun.vue` will be externalized to `src/config/localization.ts`.

## Project Structure

### Documentation (this feature)

```text
specs/039-adjust-min-coordinates-lahan/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
    └── ui-contract.md
```

### Source Code (repository root)

```text
src/
├── components/
│   └── master-data/
│       └── StepDataLahanPekebun.vue
├── config/
│   └── localization.ts
└── schemas/
    └── pekebun.schema.ts
```

**Structure Decision**: Single project structure, updating files in `src/components/`, `src/config/`, and `src/schemas/`.

## Complexity Tracking

No violations. PASS.
