# Data Model & Interfaces: Peta Satelit Leaflet pada Tab Lahan & Koordinat Usulan

**Feature Branch**: `016-satellite-map-land-tab`  
**Date**: 2026-08-05  

## Component Interface (`SatelliteMapPreview.vue`)

### Component Location
`src/components/ui/SatelliteMapPreview.vue`

### Component Props
```typescript
export interface SatelliteMapPreviewProps {
  coordinates?: string | Array<[number, number]> | Array<{ latitude?: number; longitude?: number }>;
  luasLahan?: number | string;
  height?: string; // e.g. '320px' or '100%'
  interactive?: boolean;
}
```

### Tile Layer Constants

```typescript
export const SATELLITE_TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
export const SATELLITE_TILE_ATTRIBUTION = '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';

export const LABELS_TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}';
```
