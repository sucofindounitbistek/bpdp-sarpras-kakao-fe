# Implementation Plan: Adjust Gudang Storage Area API Response Alignment

**Branch**: `050-adjust-gudang-storage-area` | **Date**: 2026-08-28 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/050-adjust-gudang-storage-area/spec.md`

## Summary

The backend API payload returns `storage_area` containing coordinates, address, and files (exterior/interior URLs and IDs). The frontend UI components currently expect `gudangSerahTerima` to be populated with structured frontend compatibility fields like `fotoTampakDepan` and `fotoTampakDalam`. This implementation plan introduces a mapping utility in `src/stores/pengusulan.ts` to map backend `storage_area` fields to both `storage_area` and `gudangSerahTerima` frontend models.

## Technical Context

**Language/Version**: TypeScript / Vue 3

**Primary Dependencies**: Pinia, Vue Router

**Storage**: Local component state & Pinia store (`pengusulan` store)

**Testing**: Manual validation in local dev environment

**Target Platform**: Web (Vite dev server)

**Project Type**: Frontend web application

**Performance Goals**: Instant component rendering (no CLS)

**Constraints**: WCAG AA contrast compliance, responsive designs

**Scale/Scope**: Impacts Dinas Kabupaten detail view, Dinas Provinsi detail view, proposal preview modal, and summary components

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- Vue 3 & SFC: YES (Only modifying stores/composables)
- Strict TypeScript: YES (Correct interface typing on StorageArea mapping)
- State Management: YES (Encapsulating mapper logic inside Pinia store)
- Accessibility/Compact Density: YES (No UI layout size changes)

## Project Structure

### Documentation (this feature)

```text
specs/050-adjust-gudang-storage-area/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── contracts/           # Phase 1 output
    └── api.md
```

### Source Code (repository root)

```text
src/
├── stores/
│   └── pengusulan.ts    # Modify to map storage_area properties
```

**Structure Decision**: Single project layout, modifying `src/stores/pengusulan.ts`.

## Complexity Tracking

*No violations identified.*
