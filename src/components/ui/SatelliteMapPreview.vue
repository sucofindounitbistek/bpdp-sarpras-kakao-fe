<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LOCALIZATION } from '@/config/localization';

const props = withDefaults(
  defineProps<{
    coordinates?: Array<{ lat: number | null; lng: number | null }>;
    luasLahan?: number | string;
    height?: string;
  }>(),
  {
    height: '320px',
  },
);

const mapContainer = ref<HTMLElement | null>(null);
let mapInstance: L.Map | null = null;
let polygonLayer: L.Polygon | null = null;
let markerLayers: L.LayerGroup | null = null;

const parseLatLngs = (): [number, number][] => {
  if (!props.coordinates) return [];
  let raw: any = props.coordinates;
  if (typeof raw === 'string') {
    try {
      raw = JSON.parse(raw);
    } catch {
      // Fallback: parse custom string format (newline or semicolon separated)
      const lines = raw.split(/[\n;]/);
      const results: [number, number][] = [];
      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split(',');
        if (parts.length >= 2) {
          const lat = Number(parts[0].trim());
          const lng = Number(parts[1].trim());
          if (!isNaN(lat) && !isNaN(lng)) {
            results.push([lat, lng]);
          }
        }
      }
      return results;
    }
  }
  if (!Array.isArray(raw)) return [];

  const results: [number, number][] = [];
  for (const item of raw) {
    if (Array.isArray(item) && item.length >= 2) {
      const lat = Number(item[0]);
      const lng = Number(item[1]);
      if (!isNaN(lat) && !isNaN(lng)) results.push([lat, lng]);
    } else if (item && typeof item === 'object') {
      const lat = Number(item.latitude ?? item.lat);
      const lng = Number(item.longitude ?? item.lng);
      if (!isNaN(lat) && !isNaN(lng)) results.push([lat, lng]);
    }
  }
  return results;
};

const renderMapContent = () => {
  if (!mapInstance) return;

  // Clear existing layers
  if (polygonLayer) {
    mapInstance.removeLayer(polygonLayer);
    polygonLayer = null;
  }
  if (markerLayers) {
    mapInstance.removeLayer(markerLayers);
    markerLayers = null;
  }

  const points = parseLatLngs();

  // We perform map rendering and bounds fitting asynchronously,
  // ensuring the container dimensions are fully resolved.
  setTimeout(() => {
    if (!mapInstance) return;

    // First update the Leaflet layout dimensions
    mapInstance.invalidateSize();

    if (points.length === 0) {
      mapInstance.setView([-2.5489, 118.0149], 5); // Default Indonesia view
      return;
    }

    markerLayers = L.layerGroup().addTo(mapInstance);

    points.forEach((pt, idx) => {
      L.circleMarker(pt, {
        radius: 5,
        color: '#066C2A',
        fillColor: '#FFFFFF',
        fillOpacity: 1,
        weight: 2,
      })
        .bindTooltip(
          LOCALIZATION.satelliteMapPreview.pointTooltip
            .replace('{index}', String(idx + 1))
            .replace('{lat}', pt[0].toFixed(5))
            .replace('{lng}', pt[1].toFixed(5)),
          { direction: 'top' }
        )
        .addTo(markerLayers!);
    });

    if (points.length >= 3) {
      polygonLayer = L.polygon(points, {
        color: '#066C2A',
        weight: 3,
        fillColor: '#066C2A',
        fillOpacity: 0.25,
      }).addTo(mapInstance);

      mapInstance.fitBounds(polygonLayer.getBounds(), { padding: [35, 35], maxZoom: 18 });
    } else if (points.length > 0) {
      mapInstance.setView(points[0], 16);
    }
  }, 250);
};

onMounted(() => {
  nextTick(() => {
    if (!mapContainer.value) return;

    mapInstance = L.map(mapContainer.value, {
      zoomControl: true,
      attributionControl: false,
    }).setView([-2.5489, 118.0149], 5);

    // Esri World Imagery Satellite Tile Layer
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: `&copy; ${LOCALIZATION.satelliteMapPreview.attribution}`,
    }).addTo(mapInstance);

    // Reference Labels Overlay
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      opacity: 0.75,
    }).addTo(mapInstance);

    renderMapContent();
  });
});

watch(
  () => props.coordinates,
  () => {
    renderMapContent();
  },
  { deep: true },
);

onBeforeUnmount(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>

<template>
  <div class="relative z-0 isolate w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs bg-slate-900">
    <!-- Map Container -->
    <div ref="mapContainer" :style="{ height: height }" class="w-full z-0" />

    <!-- Info Overlay Badge -->
    <div class="absolute top-3 right-3 z-10 flex items-center gap-2">
      <!-- <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-semibold border border-white/20 shadow-md">
        <Layers class="w-3.5 h-3.5 text-emerald-400" />
        <span>{{ LOCALIZATION.satelliteMapPreview.layerControl }}</span>
      </span> -->
      <span v-if="luasLahan" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#066C2A]/90 backdrop-blur-md text-white text-[11px] font-bold border border-emerald-400/30 shadow-md">
        <span>Luas: {{ luasLahan }} Ha</span>
      </span>
    </div>
  </div>
</template>

<style scoped>
:deep(.leaflet-container) {
  font-family: inherit;
  background: #0f172a;
}
:deep(.leaflet-pane) {
  z-index: 10 !important;
}
:deep(.leaflet-top),
:deep(.leaflet-bottom) {
  z-index: 20 !important;
}
:deep(.leaflet-control) {
  z-index: 20 !important;
}
</style>
