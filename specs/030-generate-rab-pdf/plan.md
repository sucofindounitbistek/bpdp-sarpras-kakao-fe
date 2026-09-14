# Implementation Plan: RAB PDF Generation

**Branch**: `030-generate-rab-pdf` | **Date**: 2026-08-10 | **Spec**: [spec.md](file:///c:/Users/hilma/Documents/Kerjaan/Post%20UTM/SCI/Kakao/bpdp-sarpras-kelapa-fe/specs/030-generate-rab-pdf/spec.md)

**Input**: Feature specification from `/specs/030-generate-rab-pdf/spec.md`

## Summary

This feature replaces the CSV spreadsheet download in Step 2 of the proposal wizard (`StepRAB.vue`) with a native PDF print/save generation. The PDF matches the layout requested in the user design image, featuring a centered header, institution name (Kelompok Tani/Koperasi), address, active package sub-header, a detailed cost table, and rounded bottom summary rows.

Technical Approach:
1. Extract dynamic Kelompok Tani profile name/address from the active draft store, falling back to `"Kelompok Tani Bukan Karyawan Baru"` and `"Sleman Semabda"` if they are blank or using default placeholder states.
2. Formulate styled print-safe HTML inside an iframe dynamically created on click of "Unduh RAB".
3. Trigger the browser print context on that iframe (`contentWindow.print()`), allowing the user to print or directly save the generated document as a PDF.
4. Align PDF columns dynamically depending on whether `store.isAgriOrUphPaket` is true or false.

## Technical Context

**Language/Version**: Vue 3 / TypeScript 5

**Primary Dependencies**: Lucide Vue Next, Pinia

**Storage**: Session-persisted Pinia stores

**Testing**: Manual validation, compiler build checks

**Target Platform**: Responsive Web (Print Layout Compatibility)

**Project Type**: Vue 3 Frontend Web App

**Performance Goals**: Instant HTML compilation and print spooling (<200ms)

**Constraints**: Dependency-free implementation (no external PDF rendering libraries, conforming to Core Principle V: YAGNI/Simplicity).

**Scale/Scope**: 1 View modification, 1 Localization update, 1 print layout styling

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Direct Implications / Validation Method |
|---|---|---|
| **I. Vue 3 & Component-Driven** | PASS | All changes are implemented using Vue 3 SFC setup. |
| **V. Simplicity (YAGNI)** | PASS | Avoids introducing heavy external PDF rendering libraries (like `jspdf` or `pdfmake`), relying instead on native browser printing styles. |
| **X. UI/UX Typography** | PASS | Custom print stylesheet matches Inter font structure, light backgrounds, and high contrast. |
| **XV. Localization** | PASS | Updated localization keys in `localization.ts` to reflect the shift from CSV/excel terminology to PDF format. |

## Project Structure

### Documentation (this feature)

```text
specs/030-generate-rab-pdf/
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
├── config/
│   └── localization.ts       # Updated success toaster message copy
└── views/
    └── pengusulan/
        └── StepRAB.vue       # Replaced downloadRAB function with print PDF spooling
```

**Structure Decision**: Single project layout, modifications scoped to `StepRAB.vue` and `localization.ts`.

## Complexity Tracking

*No violations detected. Reusing native browser printing guarantees a YAGNI-compliant design.*
