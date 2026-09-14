# Implementation Plan: Change StepDataCPCL Inputs

**Branch**: `041-change-stepdatacpcl-inputs` | **Date**: 2026-08-25 | **Spec**: [spec.md](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/specs/041-change-stepdatacpcl-inputs/spec.md)

**Input**: Feature specification from `/specs/041-change-stepdatacpcl-inputs/spec.md`

## Summary

This feature replaces the single `beritaAcara` upload with two separate uploads: `Berita Acara Verifikasi Dokumen` and `Berita Acara Verifikasi Lapangan`, alongside the existing `Dokumen SK CPCL Ditandatangani`. We will update the localization file, draft/submission stores, StepDataCPCL component, and StepSummaryDanSubmit component.

## Technical Context

**Language/Version**: Vue 3, TypeScript, Vite
**Primary Dependencies**: Vue Router, Pinia
**Storage**: Verifikasi Kab Pinia stores
**Testing**: Manual validation via browser
**Target Platform**: Desktop and Mobile browsers
**Project Type**: frontend web application
**Performance Goals**: Inputs render instantaneously (<100ms)
**Constraints**: None
**Scale/Scope**: 3 Vue views/stores

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Vue 3 SFCs**: Yes.
- **Strict TypeScript**: Yes.
- **Localization (Principle XV)**: All user-facing strings are correctly externalized under `LOCALIZATION.stepDataCpcl`.
- **Simplicity (Principle V)**: Clean state structure expansion.

## Project Structure

### Documentation (this feature)

```text
specs/041-change-stepdatacpcl-inputs/
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
├── config/
│   └── localization.ts
├── stores/
│   ├── verifikasiKabDraft.ts
│   └── verifikasiKab.ts
└── views/
    └── dinas/
        └── kabupaten/
            ├── StepDataCPCL.vue
            └── StepSummaryDanSubmit.vue
```

**Structure Decision**: Single project structure, modifying existing views, stores, and localization config.

## Complexity Tracking

No violations. PASS.
