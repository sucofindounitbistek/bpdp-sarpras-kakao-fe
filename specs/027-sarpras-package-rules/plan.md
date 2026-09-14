# Implementation Plan: sarpras-package-rules

**Branch**: `027-sarpras-package-rules` | **Date**: 2026-08-07 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/027-sarpras-package-rules/spec.md`

## Summary
The goal is to align the Sarpras package selection and document checklist rules from the farmer (Pemohon) to the final verification (BPDP) based on `ceklis_dokumen_persyaratan.md`. This involves updating package definitions, configuring document requirements and templates, establishing new minimum validation parameters, adding new package variants (Pikap and UPH 1-Jenis vs. Multi-Jenis), and externalizing all new labels into the central localization system.

## Technical Context

**Language/Version**: Vue 3 + TypeScript 5+ (Strict Mode)

**Primary Dependencies**: Pinia, Vue Router, Tailwind CSS, Lucide Icons, Vite

**Storage**: Session state in Pinia store (`pengusulanDraft`), mock persistence in `pengusulan` store.

**Testing**: Manual testing of multi-step form wizard and role-specific verifications (No automated tests as per Constitution).

**Target Platform**: Mobile-first responsive web viewports (375px+) and desktop screens.

**Project Type**: Single-page frontend application mockup.

**Performance Goals**: Reactive UI state validation on step change (< 100ms lag) and instantaneous dynamic checklists.

**Constraints**: Standard Tailwind styling, WCAG AA contrast compliance, compact information density, externalized wording (no hardcoded Indonesian strings in views/components).

**Scale/Scope**: 12 selectable packages, ~20+ potential document types, 12 sets of validation rules.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Component-driven SFC**: UI logic isolated in computed getters inside stores or page views.
- [x] **Strict TypeScript**: Type models strictly mapped in `types/pengusulan.ts`.
- [x] **No Direct API calls**: Handled purely in Pinia store actions.
- [x] **Mobile-first**: Views designed starting from 375px without horizontal overflow.
- [x] **Toaster usage**: System notifications use `useToast()` instead of browser native alert.
- [x] **Wording externalization**: All package names, descriptions, and validations are externalized in `src/config/localization.ts` as per Constitution XV.

## Project Structure

### Documentation (this feature)

```text
specs/027-sarpras-package-rules/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Technical research & resolutions
├── data-model.md        # Data models and validation criteria
├── quickstart.md        # Scenario testing and verification guide
└── contracts/
    └── proposal-api.md  # Client-simulated API contract schema
```

### Source Code (repository root)

```text
src/
├── components/
│   └── pengusulan/
│       ├── ProposalPreviewModal.vue
│       └── RabTable.vue
├── config/
│   └── localization.ts       # Central Indonesian Indonesian wording/labels
├── lib/
│   └── pengusulan-persyaratan.config.ts  # Rules & requirements mapping
├── stores/
│   ├── pengusulan.ts         # Mock database store
│   └── pengusulanDraft.ts    # Draft proposal wizard store
├── types/
│   └── pengusulan.ts         # Type interfaces & JenisSarpras enum
└── views/
    ├── pengusulan/
    │   ├── StepPaketSarpras.vue
    │   ├── StepPilihPekebunLahan.vue
    │   └── StepRAB.vue
    └── dinas/
        └── kabupaten/
            ├── StepVerifikasiPekebunDanDokumenProposal.vue
            └── StepSummaryDanSubmit.vue
```

**Structure Decision**: Single project layout using standard directories under `src/`.

## Complexity Tracking

*No Constitution Check violations detected. Simple configuration mapping and store validation extensions.*
