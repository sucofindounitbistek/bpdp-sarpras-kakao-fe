# Implementation Plan: Peta Satelit Leaflet pada Tab Lahan & Koordinat Usulan

**Branch**: `016-satellite-map-land-tab` | **Date**: 2026-08-05 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/016-satellite-map-land-tab/spec.md`

## Summary

Create a reusable Vue 3 component `SatelliteMapPreview.vue` utilizing Esri World Imagery Satellite Tile Layer to render interactive land polygon previews with auto-fitBounds. Embed this component on **Tab Lahan** in `DetailPekebunModal.vue`. Standardize all existing Leaflet map instances across `StepDataCPCL.vue` and `StepDataLahanPekebun.vue` to use Esri Satellite Imagery.

## Technical Context

**Language/Version**: TypeScript 5.x / Vue 3.4+ (`<script setup lang="ts">`)  
**Primary Dependencies**: Vue 3, Leaflet 1.9.x, Lucide Vue Next, Tailwind CSS 3.x  
**Storage**: Client-side state / Pinia store  
**Testing**: Manual verification against running app (`npm run dev`) per Constitution Quality Workflow  
**Target Platform**: Web application (Desktop & Mobile, modern browsers)  
**Project Type**: Single web application (`src/`)  
**Performance Goals**: Fast satellite tile loading, smooth fitBounds animation (<300ms)  
**Constraints**: Zero layout shift, full Dark Mode compatibility, responsive container  
**Scale/Scope**: 1 new component (`SatelliteMapPreview.vue`), 3 modified files (`DetailPekebunModal.vue`, `StepDataLahanPekebun.vue`, `StepDataCPCL.vue`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Principle I (Vue 3 Component-Driven)**: Reusable SFC `SatelliteMapPreview.vue`.
- [x] **Principle II (Strict TypeScript & Schema)**: Typed props & Leaflet LatLng tuples.
- [x] **Principle IV & X (UI/UX Pro Max & Modern Design)**: Satellite imagery with Forest Green (`#066C2A`) polygon overlays.
- [x] **Principle V (YAGNI & Simplicity)**: Public Esri tile layer, no complex paid map SDKs.
- [x] **Principle VII (Mobile-First & Responsive)**: Touch-enabled Leaflet controls.
- [x] **Principle XIV (Compact Information Density)**: Overlay badge with land size and satellite mode indicator.

## Project Structure

### Documentation (this feature)

```text
specs/016-satellite-map-land-tab/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Phase 0 decisions & rationale
├── data-model.md        # Phase 1 data interfaces & tile constants
├── quickstart.md        # Phase 1 quickstart validation guide
└── contracts/
    └── ui-contract.md   # Phase 1 map visual contract
```

### Source Code (repository root)

```text
src/
├── components/
│   ├── ui/
│   │   └── SatelliteMapPreview.vue     # [NEW] Reusable Leaflet satellite map preview
│   └── master-data/
│       ├── DetailPekebunModal.vue      # [MODIFY] Embed SatelliteMapPreview on Tab Lahan
│       └── StepDataLahanPekebun.vue    # [MODIFY] Update tile layer to Esri Satellite
└── views/
    └── pengusulan/
        └── StepDataCPCL.vue            # [MODIFY] Update tile layer to Esri Satellite
```

**Structure Decision**: Single Vue 3 web application (`src/`).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| *None* | *All principles respected without violations.* | N/A |
