# Implementation Plan: NIK Lookup Updates Alamat and Kodepos

**Branch**: `031-pekebun-nik-lookup-address` | **Date**: 2026-08-10 | **Spec**: [spec.md](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/specs/031-pekebun-nik-lookup-address/spec.md)

**Input**: Feature specification from `/specs/031-pekebun-nik-lookup-address/spec.md`

## Summary

This plan describes how we will implement automatic filling of Alamat and Kodepos upon a successful NIK lookup verifier action inside the "Pendaftaran Pekebun Baru" form wizard. 

Technical Approach:
1. Update `DukcapilResult` type interface in `src/types/pekebun.ts` to support `alamat` and `kodepos` properties.
2. Extend `MOCK_DUKCAPIL` registry mapping in `src/stores/pekebun.ts` with matching mock address and postal code variables corresponding to the registered master pekebuns database.
3. Modify `handleLookupNik()` in `src/views/master-data/FormPekebunView.vue` to map Dukcapil lookup results into the form state model, resetting them on failure.

## Technical Context

**Language/Version**: Vue 3 / TypeScript 5

**Primary Dependencies**: Pinia, Vue Router

**Storage**: None (temporary UI state)

**Testing**: Manual validation, type-check build check

**Target Platform**: Responsive Web

**Project Type**: Vue 3 Frontend Web App

**Performance Goals**: N/A (local lookup mock delay of 500ms remains unchanged)

**Constraints**: Keep interfaces typed correctly and prevent undefined values.

**Scale/Scope**: 1 View modification, 1 Store modification, 1 Type definition modification

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Direct Implications / Validation Method |
|---|---|---|
| **I. Vue 3 & Component-Driven** | PASS | Form rendering and data flow are fully standard. |
| **V. Simplicity (YAGNI)** | PASS | Smallest change to update values locally. |
| **VIII. Type Safety** | PASS | Type safety is preserved by extending `DukcapilResult` in `pekebun.ts` correctly. |

## Project Structure

### Documentation (this feature)

```text
specs/031-pekebun-nik-lookup-address/
├── plan.md              # This file
├── research.md          # Research decisions & rationale
├── data-model.md        # State/Data description (purely UI here)
├── quickstart.md        # Scenario testing & validation steps
└── checklists/
    └── requirements.md  # Spec quality validation checklist
```

### Source Code (repository root)

```text
src/
├── types/
│   └── pekebun.ts            # Extend DukcapilResult interface
├── stores/
│   └── pekebun.ts            # Extend MOCK_DUKCAPIL entries
└── views/
    └── master-data/
        └── FormPekebunView.vue  # Map address & postal code on lookup success/reset
```

**Structure Decision**: Scoped correctly within types, stores, and views.

## Complexity Tracking

*No violations detected. Standard form bindings are maintained.*
