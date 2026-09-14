# Quickstart Validation Guide: Peta Satelit Leaflet pada Tab Lahan & Koordinat Usulan

**Feature Branch**: `016-satellite-map-land-tab`  
**Date**: 2026-08-05  

## Scenario 1: Detail Pekebun Modal (Tab Lahan Satellite Map Verification)

1. Navigate to Master Data Pekebun or CPCL list.
2. Click **Detail Pekebun** for any pekebun record.
3. Switch to **Tab Lahan**.
   - *Expected*: Leaflet map container loads with high-resolution satellite imagery.
   - *Expected*: Green polygon (`#066C2A`) automatically overlays the land area.
   - *Expected*: Map automatically centers & zooms (`fitBounds`) to fit the polygon coordinates.

---

## Scenario 2: CPCL & Lahan Registration Satellite Tile Check

1. Open `StepDataCPCL.vue` or `StepDataLahanPekebun.vue`.
2. Inspect the Leaflet map container.
   - *Expected*: Map renders Esri Satellite Imagery instead of standard OpenStreetMap road view.
   - *Expected*: Interactive drawing and point placement work smoothly over satellite imagery.
