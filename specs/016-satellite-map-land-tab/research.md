# Phase 0 Research & Technical Decisions: Peta Satelit Leaflet pada Tab Lahan & Koordinat Usulan

**Feature Branch**: `016-satellite-map-land-tab`  
**Date**: 2026-08-05  

## Research & Decision Log

### Decision 1: Standardizing Tile Layer Provider to Esri World Imagery (Satellite)

- **Decision**: Replace default OpenStreetMap tile URL (`https://{s}.tile.openstreetmap.org/...`) across all Leaflet maps with Esri World Imagery tile URL:
  `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`
  Optionally paired with Esri Reference Overlay (`https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}`) for clear road and administrative boundaries.
- **Rationale**: 
  - High-resolution satellite imagery optimized for agricultural & land polygon inspection.
  - Publicly accessible without requiring proprietary API keys or access tokens.
  - Supported up to zoom level 19.

---

### Decision 2: Reusable Component Architecture (`SatelliteMapPreview.vue`)

- **Decision**: Create `src/components/ui/SatelliteMapPreview.vue` encapsulating Leaflet map initialization, satellite tile layer, polygon drawing, marker creation, and automatic `fitBounds`.
- **Rationale**:
  - Encapsulates Leaflet lifecycle (`onMounted`, `watch`, `onBeforeUnmount`, `invalidateSize`) in a clean Vue 3 SFC setup.
  - Handles dynamic tab switching: calls `map.invalidateSize()` whenever tab becomes active to ensure Leaflet container renders without gray space artifacts.

---

### Decision 3: Integration Targets

- **Decision**: Update the following components to use Satellite Tile Layer / `SatelliteMapPreview`:
  1. `src/components/master-data/DetailPekebunModal.vue` (Embed `SatelliteMapPreview` on Tab Lahan)
  2. `src/components/master-data/StepDataLahanPekebun.vue` (Update tile layer to Satellite)
  3. `src/views/pengusulan/StepDataCPCL.vue` (Update tile layer to Satellite)
