# Implementation Plan: Pekebun & Lahan Store Integration

**Branch**: `001-pekebun-lahan-store-integration` | **Date**: 2026-08-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-pekebun-lahan-store-integration/spec.md`

## Summary

Replace mock data in pekebun store with real API calls. Create a new lahan store with full CRUD. Orchestrate synchronous pekebun + lahan submission in the form wizard. Add draft tab filtering to the pekebun list page.

## Technical Context

**Language/Version**: TypeScript 5.7, Vue 3.5, Vite 6

**Primary Dependencies**: Pinia 3 (state management), Axios 1.18 (HTTP client), Zod 3.24 (validation), vee-validate 4.15 (form validation), Vue Router 4

**Storage**: API backend (postgres via Go backend at `http://localhost:8080/api/v1`), Pinia persistedstate for auth token only

**Testing**: Vitest 3 (unit), Vue Test Utils 2.4 (component)

**Target Platform**: Browser (web app, desktop)

**Project Type**: Web application (SPA frontend)

**Performance Goals**: List load <3s, create w/ 1 lahan <5s, update w/ 3 lahan <5s

**Constraints**: All pekebun/lahan API calls use multipart/form-data for create/update. File uploads max 5MB per file. Sequential API calls for lahan after pekebun.

**Scale/Scope**: 2 stores (pekebun adjust, lahan new), 1 new service file, 2 views updated (PekebunListView, FormPekebunView). ~10 API endpoints total.

## Constitution Check

*GATE: No constitution file found at `.specify/memory/constitution.md`. Skipping gate check.*

## Project Structure

### Documentation (this feature)

```text
specs/001-pekebun-lahan-store-integration/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── services/
│   ├── api.ts                    # Existing axios instance (adjust interceptor)
│   ├── pekebun.service.ts        # NEW: Pekebun API calls
│   ├── lahan.service.ts          # NEW: Lahan API calls
│   └── pengusulan.service.ts     # Existing (unchanged)
├── stores/
│   ├── pekebun.ts                # Adjust: replace mock data with API calls
│   └── lahan.ts                  # NEW: Lahan store with CRUD
├── types/
│   ├── pekebun.ts                # Adjust: match API snake_case response shapes
│   └── lahan.ts                  # NEW: Lahan types matching API contract
├── views/
│   └── master-data/
│       ├── PekebunListView.vue    # Adjust: use API store, add draft tabs
│       └── FormPekebunView.vue    # Adjust: orchestrate API calls
└── components/
    └── master-data/
        └── StepDataLahanPekebun.vue  # Adjust: use lahan store for wilayah data
```

**Structure Decision**: Follow existing project layout. Services in `src/services/`, stores in `src/stores/`, types in `src/types/`. New files: `pekebun.service.ts`, `lahan.service.ts`, `src/types/lahan.ts`, `src/stores/lahan.ts`.

## Complexity Tracking

> No violations to justify. All changes follow existing patterns.