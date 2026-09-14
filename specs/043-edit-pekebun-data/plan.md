# Implementation Plan: Edit Data Pekebun

**Branch**: `043-edit-pekebun-data` | **Date**: 2026-08-25 | **Spec**: [spec.md](file:///home/hilman/Documents/Kerjaan/KakaoKelapa/bpdp-sarpras-kelapa-fe/specs/043-edit-pekebun-data/spec.md)

**Input**: Feature specification from `/specs/043-edit-pekebun-data/spec.md`

## Summary

Implement edit functionality for registered (non-draft) pekebuns in `FormPekebunView.vue` and expose it via `/master-data/pekebun/edit/:id` route, displaying edit action buttons in `PekebunListView.vue` and `DetailPekebunModal.vue`.

## Technical Context

**Language/Version**: TypeScript / Vue 3

**Primary Dependencies**: Vue Router, Pinia

**Storage**: Pinia Store state (`src/stores/pekebun.ts`)

**Testing**: Manual validation scenarios

**Target Platform**: Web browser

**Project Type**: Web application

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Vue 3 SFCs**: Yes, script setup Single-File Components are used.
- **TypeScript Strict Mode**: Yes, strict typing is preserved.
- **Pinia Stores**: Yes, uses existing store methods `resumeDraft` and `updatePekebunWithLahan` encapsulated inside Pinia stores.
- **Localization**: Yes, using `LOCALIZATION.pekebunDraft` and wording externalization.

## Project Structure

### Documentation (this feature)

```text
specs/043-edit-pekebun-data/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/
    └── ui-contract.md   # Phase 1 output
```

### Source Code (repository root)

```text
src/
├── router/
│   └── index.ts
├── components/
│   └── master-data/
│       └── DetailPekebunModal.vue
└── views/
    └── master-data/
        ├── FormPekebunView.vue
        └── PekebunListView.vue
```

**Structure Decision**: Clean updates to the existing master-data views and router configuration.

## Complexity Tracking

*No violations identified.*
