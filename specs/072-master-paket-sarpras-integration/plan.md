# Implementation Plan: Frontend Master Data Paket Sarpras Integration

**Branch**: `072-master-paket-sarpras-integration` | **Date**: 2026-09-03 | **Spec**: [specs/072-master-paket-sarpras-integration/spec.md](spec.md)

**Input**: Feature specification from `specs/072-master-paket-sarpras-integration/spec.md`

## Summary

Integrate `bpdp-sarpras-kelapa-fe` with the backend Master Data APIs (`/api/v1/master/*`), providing dynamic package cards, cascading dropdowns, document requirement checklists, and quota/hectare validations with Pinia state caching and resilient fallback.

## Technical Context

**Language/Version**: TypeScript 5+, Vue 3 Composition API
**Primary Dependencies**: Pinia, Axios, Lucide Vue Next, Tailwind CSS / Vanilla CSS
**Storage**: In-memory Pinia store state + session storage
**Testing**: Vitest (`npm run test`)
**Target Platform**: Web Browser (Chrome, Firefox, Safari, Edge)
**Project Type**: Vue 3 SPA
**Performance Goals**: Instant cached switching (< 50ms), initial load < 300ms
**Constraints**: Zero regression to existing proposal creation and verifier review screens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Separation of concerns: Service (`masterSarpras.service.ts`) -> Store (`masterSarpras.ts`) -> View/Component
- [x] Graceful fallback to static configuration on network failure
- [x] Reactive TypeScript types matching backend OpenAPI contracts

## Project Structure

### Documentation (this feature)

```text
specs/072-master-paket-sarpras-integration/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan
├── research.md          # Technical research & decisions
├── data-model.md        # TypeScript interfaces
├── quickstart.md        # Run & test guide
├── contracts/
│   └── master-sarpras-fe-contract.md
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code Layout

```text
bpdp-sarpras-kelapa-fe/
├── src/
│   ├── types/
│   │   └── masterSarpras.ts                 # Master data TypeScript interfaces
│   ├── services/
│   │   └── masterSarpras.service.ts         # Axios API client for master endpoints
│   ├── stores/
│   │   ├── masterSarpras.ts                 # Pinia store with caching & fallback
│   │   └── pengusulanDraft.ts               # Integrated dynamic rule checking
│   ├── components/
│   │   └── ui/
│   │       └── CascadingPaketSelect.vue     # Dynamic category & package grouping
│   └── views/
│       └── pengusulan/
│           └── StepPaketSarpras.vue         # Dynamic package selection cards
```

## Complexity Tracking

No violations to justify.
