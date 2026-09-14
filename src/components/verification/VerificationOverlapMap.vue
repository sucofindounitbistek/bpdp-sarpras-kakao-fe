<script setup lang="ts">
import { ref, watch, onUnmounted, computed } from 'vue';
import L from 'leaflet';
import { intersect, area } from '@turf/turf';
import { polygon } from '@turf/helpers';
import { AlertTriangle, CheckCircle2 } from 'lucide-vue-next';
import { LOCALIZATION } from '@/config/localization';

interface PolygonData {
  coordinates: Array<[number, number]>;
  label?: string;
}

interface OtherProposalData {
  proposalId: string;
  proposalNumber: string;
  proposalName: string;
  polygons: PolygonData[];
  distance?: number;
}

interface OverlapInfo {
  proposalId: string;
  proposalNumber: string;
  proposalName: string;
  overlapArea: number;
  overlapPercentage: number;
}

const props = withDefaults(
  defineProps<{
    activeProposalId: string;
    activeProposalName: string;
    activeProposalNumber: string;
    activePolygons: PolygonData[];
    otherProposals?: OtherProposalData[];
    showProposalList?: boolean;
  }>(),
  {
    otherProposals: () => [],
    showProposalList: false,
  },
);

const computedOverlaps = computed((): OverlapInfo[] => {
  if (props.activePolygons.length === 0 || (props.otherProposals || []).length === 0) return [];
  const results: OverlapInfo[] = [];

  for (const activePoly of props.activePolygons) {
    if (activePoly.coordinates.length < 3) continue;
    try {
      const closedActive = [...activePoly.coordinates, activePoly.coordinates[0]];
      const activeTurf = polygon([closedActive.map(([lat, lng]) => [lng, lat])]);
      const activeArea = area(activeTurf);

      for (const other of props.otherProposals) {
        for (const otherPoly of other.polygons) {
          if (otherPoly.coordinates.length < 3) continue;
          try {
            const closedOther = [...otherPoly.coordinates, otherPoly.coordinates[0]];
            const otherTurf = polygon([closedOther.map(([lat, lng]) => [lng, lat])]);
            const intersection = intersect(activeTurf as any, otherTurf as any);
            if (intersection) {
              const overlapArea = area(intersection) / 10000;
              const overlapPct = activeArea > 0 ? (overlapArea / (activeArea / 10000)) * 100 : 0;
              const existing = results.find((r) => r.proposalId === other.proposalId);
              if (existing) {
                existing.overlapArea += overlapArea;
                existing.overlapPercentage = Math.max(existing.overlapPercentage, overlapPct);
              } else {
                results.push({
                  proposalId: other.proposalId,
                  proposalNumber: other.proposalNumber,
                  proposalName: other.proposalName,
                  overlapArea,
                  overlapPercentage: overlapPct,
                });
              }
            }
          } catch {
            // skip invalid polygon
          }
        }
      }
    } catch {
      // skip invalid active polygon
    }
  }
  return results;
});

const isExpanded = ref(true);
const mapContainer = ref<HTMLElement | null>(null);
let mapInstance: L.Map | null = null;
let activePolygonLayers: L.Polygon[] = [];
let otherPolygonLayers: L.Polygon[] = [];
let legendControl: L.Control | null = null;

const hasOverlap = computed(() => computedOverlaps.value.length > 0);

function getOverlapForProposal(proposalId: string): OverlapInfo | undefined {
  return computedOverlaps.value.find((o) => String(o.proposalId) === String(proposalId));
}

function hasActivePolygons(): boolean {
  return props.activePolygons.length > 0 && props.activePolygons.some((p) => p.coordinates.length >= 3);
}

function initMap() {
  if (!mapContainer.value || mapInstance) return;

  mapInstance = L.map(mapContainer.value, {
    zoomControl: true,
    attributionControl: false,
  }).setView([-2.584, 120.3135], 15);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
  }).addTo(mapInstance);

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19,
    opacity: 0.75,
  }).addTo(mapInstance);

  renderPolygons();
  addLegend();
}

function renderPolygons() {
  if (!mapInstance) return;

  activePolygonLayers.forEach((l) => mapInstance!.removeLayer(l));
  otherPolygonLayers.forEach((l) => mapInstance!.removeLayer(l));
  activePolygonLayers = [];
  otherPolygonLayers = [];

  let allBounds = L.latLngBounds([]);

  props.activePolygons.forEach((poly) => {
    if (poly.coordinates.length < 3) return;
    const latlngs = poly.coordinates.map(([lat, lng]) => [lat, lng] as [number, number]);
    const layer = L.polygon(latlngs, {
      color: '#2563EB',
      fillColor: '#2563EB',
      fillOpacity: 0.3,
      weight: 3,
    }).addTo(mapInstance!);
    if (poly.label) {
      layer.bindTooltip(`Proposal Ini: ${poly.label}`, { permanent: false, direction: 'center' });
    }
    activePolygonLayers.push(layer);
    allBounds.extend(layer.getBounds());
  });

  props.otherProposals.forEach((proposal) => {
    proposal.polygons.forEach((poly) => {
      if (poly.coordinates.length < 3) return;
      const latlngs = poly.coordinates.map(([lat, lng]) => [lat, lng] as [number, number]);
      const layer = L.polygon(latlngs, {
        color: '#DC2626',
        fillColor: '#DC2626',
        fillOpacity: 0.25,
        weight: 2,
      }).addTo(mapInstance!);
      layer.bindPopup(`
        <div class="text-xs p-1">
          <p class="font-bold text-slate-800">${proposal.proposalNumber}</p>
          <p class="text-slate-600">${proposal.proposalName}</p>
          <p class="text-slate-400 text-[10px] mt-1">Lahan: ${poly.label || 'Bidang Pekebun'}</p>
          <span class="inline-block mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">Radius &le; 50 km</span>
        </div>
      `);
      otherPolygonLayers.push(layer);
      allBounds.extend(layer.getBounds());
    });
  });

  if (allBounds.isValid()) {
    mapInstance.fitBounds(allBounds, { padding: [40, 40] });
  }
}

function addLegend() {
  if (!mapInstance) return;
  if (legendControl) {
    mapInstance.removeControl(legendControl as any);
  }

  legendControl = new (L.Control as any)({ position: 'bottomright' });
  (legendControl as any).onAdd = () => {
    const div = L.DomUtil.create('div', 'legend bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-lg p-2.5 text-xs shadow-sm border border-slate-200 dark:border-slate-700');
    div.innerHTML = `
      <div class="flex items-center gap-2 mb-1.5">
        <span class="w-3.5 h-3.5 rounded-sm inline-block" style="background: rgba(37, 99, 235, 0.5); border: 2px solid #2563EB;"></span>
        <span class="text-slate-700 dark:text-slate-300 font-medium">${LOCALIZATION.verificationMap.legendActive}</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="w-3.5 h-3.5 rounded-sm inline-block" style="background: rgba(220, 38, 38, 0.4); border: 2px solid #DC2626;"></span>
        <span class="text-slate-700 dark:text-slate-300 font-medium">Usulan Lain (Radius &le; 50 km)</span>
      </div>
    `;
    return div;
  };
  (legendControl as any).addTo(mapInstance);
}

function destroyMap() {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
  activePolygonLayers = [];
  otherPolygonLayers = [];
  legendControl = null;
}

watch(
  isExpanded,
  (expanded) => {
    if (expanded) {
      setTimeout(() => {
        if (!mapInstance) {
          initMap();
        } else {
          mapInstance.invalidateSize();
          renderPolygons();
        }
      }, 150);
    } else {
      destroyMap();
    }
  },
  { immediate: true },
);

watch(
  () => [props.activePolygons, props.otherProposals] as const,
  () => {
    if (isExpanded.value) {
      if (!mapInstance) {
        initMap();
      } else {
        mapInstance.invalidateSize();
        renderPolygons();
      }
    }
  },
  { deep: true },
);

onUnmounted(() => {
  destroyMap();
});
</script>

<template>
  <div class="flex flex-col gap-3">
    <!-- Peringatan HANYA JIKA Terdeteksi Tumpang Tindih (Overlap) -->
    <div
      v-if="hasOverlap"
      class="flex items-start gap-3 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900"
    >
      <AlertTriangle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
      <div class="flex-1 flex flex-col gap-0.5 min-w-0">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <span class="text-xs font-bold text-rose-800">
            Peringatan Konflik Spasial (Radius Maks. 50 km)
          </span>
          <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-800">
            {{ computedOverlaps.length }} Proposal Beririsan
          </span>
        </div>
        <p class="text-[11px] text-rose-700 leading-relaxed">
          Sistem mendeteksi irisan batas poligon lahan dengan <strong>{{ computedOverlaps.length }} proposal lain</strong> dalam radius 50 km. Periksa batas patok lahan calon pekebun untuk menghindari klaim ganda.
        </p>
      </div>
    </div>

    <!-- Peta Leaflet Container Bersih -->
    <div class="rounded-xl overflow-hidden border border-slate-200 shadow-2xs relative z-0 isolate">
      <div ref="mapContainer" class="h-[380px] sm:h-[450px] w-full z-0" />

      <div
        v-if="!hasActivePolygons()"
        class="absolute inset-0 bg-slate-50/90 backdrop-blur-xs flex items-center justify-center text-xs text-slate-500 font-medium z-10"
      >
        {{ LOCALIZATION.verificationMap.noPolygon }}
      </div>
    </div>

    <!-- Rincian Proposal Sekitar HANYA Tampil Jika showProposalList diaktifkan -->
    <div v-if="props.showProposalList && props.otherProposals && props.otherProposals.length > 0" class="flex flex-col gap-2.5 pt-1">
      <div class="flex items-center justify-between">
        <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Proposal Sekitar Terdeteksi (Radius &le; 50 km)
        </span>
        <span class="text-[11px] text-slate-400">
          {{ props.otherProposals.length }} usulan terdeteksi
        </span>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div
          v-for="prop in props.otherProposals"
          :key="prop.proposalId"
          :class="[
            'p-3 rounded-xl border flex flex-col gap-1.5 transition-all text-xs',
            getOverlapForProposal(prop.proposalId)
              ? 'bg-rose-50/80 border-rose-200 text-rose-950'
              : 'bg-slate-50/70 border-slate-200 text-slate-700',
          ]"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="flex flex-col min-w-0">
              <span class="font-bold truncate">{{ prop.proposalNumber }}</span>
              <span class="text-[11px] text-slate-500 truncate">{{ prop.proposalName }}</span>
            </div>
            <span
              v-if="getOverlapForProposal(prop.proposalId)"
              class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-600 text-white shrink-0"
            >
              <AlertTriangle class="w-3 h-3" />
              Irisan {{ getOverlapForProposal(prop.proposalId)?.overlapArea.toFixed(2) }} Ha
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-[#066C2A] shrink-0"
            >
              <CheckCircle2 class="w-3 h-3" />
              Aman
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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
