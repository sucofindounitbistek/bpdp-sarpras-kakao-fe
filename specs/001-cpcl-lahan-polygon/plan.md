# Implementation Plan: CPCL Lahan Polygon Capture

**Branch**: `[001-cpcl-lahan-polygon]` | **Date**: 2026-07-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-cpcl-lahan-polygon/spec.md`

## Summary

Add coordinate-driven land polygon capture to the Pengusulan Sarpras BPDP Data CPCL & Lahan step. Users enter ordered latitude/longitude points, see a closed map polygon preview, receive validation feedback for invalid geometry, and submit saved polygon data with the existing CPCL form data.

## Technical Context

**Language/Version**: TypeScript 5.7, Vue 3.5, Vite 6

**Primary Dependencies**: Vue Router, Pinia, Zod, vee-validate, Axios, existing UI components, map rendering dependency to be added for interactive polygon preview

**Storage**: Existing Pengusulan payload field `daftarCPCL[].koordinatPoligon`; client state in current form wizard/store

**Testing**: Vitest, Vue Test Utils, vue-tsc build validation

**Target Platform**: Browser-based web application

**Project Type**: Single frontend application

**Performance Goals**: Polygon preview updates within 500 ms for typical land-boundary input; form remains responsive for at least 50 coordinate points per CPCL entry

**Constraints**: Preserve existing Pengusulan form flow; retain valid coordinate input during validation failures; avoid submitting invalid or incomplete polygon data

**Scale/Scope**: One existing form step (`src/views/pengusulan/StepDataCPCL.vue`) plus shared schema/type updates as needed

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

No constitution file found at `.specify/memory/constitution.md`; no project-specific gates apply. Default gate: keep implementation minimal, testable, and aligned with existing project structure. PASS.

## Project Structure

### Documentation (this feature)

```text
specs/001-cpcl-lahan-polygon/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   └── ui-contract.md
└── tasks.md
```

### Source Code (repository root)

```text
src/
├── views/
│   └── pengusulan/
│       └── StepDataCPCL.vue
├── types/
│   └── pengusulan.ts
├── schemas/
│   └── pengusulan.schema.ts
├── stores/
│   └── pengusulan.ts
└── services/
    └── pengusulan.service.ts
```

**Structure Decision**: Use the existing single frontend app layout. Implement the feature in the current Data CPCL step, with only focused type/schema changes needed for stronger coordinate validation and payload consistency.

## Complexity Tracking

No constitution violations or added architectural complexity.

## Phase 0 Research Summary

See [research.md](./research.md). All planning unknowns resolved.

## Phase 1 Design Summary

See [data-model.md](./data-model.md), [contracts/ui-contract.md](./contracts/ui-contract.md), and [quickstart.md](./quickstart.md). Post-design constitution check remains PASS.
