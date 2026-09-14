# UI Contract: Peta Satelit Leaflet pada Tab Lahan & Koordinat Usulan

**Feature Branch**: `016-satellite-map-land-tab`  
**Date**: 2026-08-05  

## Satellite Map Visual Styling Contract

- **Tile Provider**: Esri World Imagery (Satellite).
- **Polygon Stroke**: `#066C2A` (Forest Green), `weight: 3`, `opacity: 0.9`.
- **Polygon Fill**: `#066C2A`, `fillOpacity: 0.25`.
- **Marker Icon**: Standard Leaflet Marker or custom SVG dot with popup info ("Titik 1: Lat, Lng").
- **Overlay Badge**: Top-right overlay badge showing "🛰️ Mode Satelit" and "Luas Lahan: X.XX Ha".
