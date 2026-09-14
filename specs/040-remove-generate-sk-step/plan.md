# Implementation Plan: Remove Generate SK Step

**Branch**: `040-remove-generate-sk-step` | **Date**: 2026-08-25 | **Spec**: [spec.md](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/specs/040-remove-generate-sk-step/spec.md)

**Input**: Feature specification from `/specs/040-remove-generate-sk-step/spec.md`

## Summary

This feature simplifies the SK Publication view `FinalisasiSkDirutView.vue` for `BPDP_VERIFIKATOR`. It removes the manual "Generate SK" step, auto-initializes the `draftUrl` (if not present) on mount, and renders the document download and upload form directly on load.

## Technical Context

**Language/Version**: Vue 3, TypeScript, Vite
**Primary Dependencies**: Vue Router, Pinia
**Storage**: Client-side state managed by Rekomtek Pinia store
**Testing**: Manual validation via browser
**Target Platform**: Desktop and Mobile browsers
**Project Type**: frontend web application
**Performance Goals**: Form rendered on load (<100ms)
**Constraints**: None
**Scale/Scope**: 1 Vue view component (`FinalisasiSkDirutView.vue`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Vue 3 SFCs**: Yes.
- **Strict TypeScript**: Yes.
- **Localization (Principle XV)**: All user-facing strings are correctly externalized or preserved.
- **Simplicity (Principle V)**: The modification removes unused steps, simplifying component logic.

## Project Structure

### Documentation (this feature)

```text
specs/040-remove-generate-sk-step/
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
└── views/
    └── bpdp/
        └── FinalisasiSkDirutView.vue
```

**Structure Decision**: Single project structure, modifying `src/views/bpdp/FinalisasiSkDirutView.vue`.

## Complexity Tracking

No violations. PASS.
