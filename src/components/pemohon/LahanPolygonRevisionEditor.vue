<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Trash2,
  RotateCcw,
  Plus,
  GripVertical,
  AlertTriangle,
  CheckCircle2,
  FileUp,
  Info,
} from 'lucide-vue-next';
import type { CoordinatePoint } from '@/types/pengusulan';
import {
  validateCoordinatePolygon,
  emptyCoordinatePoint,
  parseCoordinatePolygon,
  serializeCoordinatePolygon,
} from '@/lib/coordinatePolygon';
import { parseShapefileUpload } from '@/lib/shapefileImport';
import { useToast } from '@/composables/useToast';

const props = withDefaults(
  defineProps<{
    lahanId: number | string;
    modelValue?: any;
    rejectedCoordinates?: any;
    verifierNotes?: string;
    lahanLabel?: string;
  }>(),
  {
    modelValue: '',
    rejectedCoordinates: '',
    verifierNotes: '',
    lahanLabel: 'Lahan',
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (
    e: 'update:coordinates',
    payload: { rawString: string; points: CoordinatePoint[]; isValid: boolean; areaHa: number },
  ): void;
  (e: 'change', isValid: boolean): void;
}>();

const toast = useToast();

// Map states
const mapContainer = ref<HTMLElement | null>(null);
let mapInstance: L.Map | null = null;
let activePolygonLayer: L.Polygon | null = null;
let rejectedPolygonLayer: L.Polygon | null = null;
let markersGroup: L.LayerGroup | null = null;

// Normalize points to ensure 1-based order
const normalizePoints = (points: CoordinatePoint[]) =>
  points.map((p, idx) => ({ ...p, order: idx + 1 }));

// Extract initial points from raw input
function extractPoints(val: any): CoordinatePoint[] {
  if (!val) return [];
  if (Array.isArray(val) && val.length > 0) {
    if (typeof val[0] === 'object' && ('lat' in val[0] || 'latitude' in val[0])) {
      return normalizePoints(
        val.map((p: any, idx: number) => ({
          order: idx + 1,
          lat: Number(p.lat ?? p.latitude ?? 0),
          lng: Number(p.lng ?? p.longitude ?? 0),
        })),
      );
    }
  }
  const str = typeof val === 'string' ? val : JSON.stringify(val);
  return normalizePoints(parseCoordinatePolygon(str));
}

// Initial points setup:
// Default coordinateRows to modelValue, or fallback to rejectedCoordinates (original coordinates)
const initialCoords = extractPoints(props.modelValue);
const rejectedCoords = extractPoints(props.rejectedCoordinates || props.modelValue);

const coordinateRows = ref<CoordinatePoint[]>(
  initialCoords.length > 0
    ? initialCoords
    : (rejectedCoords.length > 0 ? JSON.parse(JSON.stringify(rejectedCoords)) : []),
);

const rejectedPoints = ref<CoordinatePoint[]>(rejectedCoords);

// Watch for asynchronous updates from parent
watch(
  () => props.modelValue,
  (val) => {
    const pts = extractPoints(val);
    if (pts.length > 0 && JSON.stringify(pts) !== JSON.stringify(coordinateRows.value)) {
      coordinateRows.value = pts;
    } else if (pts.length === 0 && coordinateRows.value.length === 0 && rejectedPoints.value.length > 0) {
      coordinateRows.value = JSON.parse(JSON.stringify(rejectedPoints.value));
    }
  },
);

watch(
  () => props.rejectedCoordinates,
  (val) => {
    const pts = extractPoints(val);
    if (pts.length > 0 && JSON.stringify(pts) !== JSON.stringify(rejectedPoints.value)) {
      rejectedPoints.value = pts;
      if (coordinateRows.value.length === 0) {
        coordinateRows.value = JSON.parse(JSON.stringify(pts));
      }
      renderMap();
    }
  },
);

// Drag & Drop
const dragIndex = ref<number | null>(null);
const pasteSuccessMsg = ref('');

// Shapefile import
const fileInputRef = ref<HTMLInputElement | null>(null);
const isImporting = ref(false);

// Geometry validation
const polygonState = computed(() => validateCoordinatePolygon(coordinateRows.value));
const isValid = computed(() => polygonState.value.isValid);
const validationMessages = computed(() => polygonState.value.validationMessages);

// Calculate geodesic polygon area in hectares
const calculatedAreaHa = computed(() => {
  const pts = coordinateRows.value.filter((p) => p.lat !== null && p.lng !== null);
  if (pts.length < 3) return 0;

  // Spherical excess / shoelace approximation in m²
  const R = 6378137; // Earth radius in meters
  let area = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    const p1 = pts[i];
    const p2 = pts[j];
    const lat1 = (p1.lat! * Math.PI) / 180;
    const lat2 = (p2.lat! * Math.PI) / 180;
    const dLng = ((p2.lng! - p1.lng!) * Math.PI) / 180;
    area += (dLng) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }
  area = Math.abs((area * R * R) / 2);
  const ha = area / 10000;
  return Number.isFinite(ha) ? Number(ha.toFixed(4)) : 0;
});

// Sync changes to parent
function emitChanges() {
  const validPoints = coordinateRows.value.filter((p) => p.lat !== null && p.lng !== null);
  const rawString = serializeCoordinatePolygon(validPoints);
  emit('update:modelValue', rawString);
  emit('update:coordinates', {
    rawString,
    points: validPoints,
    isValid: isValid.value,
    areaHa: calculatedAreaHa.value,
  });
  emit('change', isValid.value);
}

watch(
  coordinateRows,
  () => {
    emitChanges();
    renderMap();
  },
  { deep: true },
);

// Map rendering
function renderMap() {
  if (!mapInstance) return;

  // Clear previous layers
  if (markersGroup) {
    markersGroup.clearLayers();
  } else {
    markersGroup = L.layerGroup().addTo(mapInstance);
  }

  if (activePolygonLayer) {
    activePolygonLayer.remove();
    activePolygonLayer = null;
  }
  if (rejectedPolygonLayer) {
    rejectedPolygonLayer.remove();
    rejectedPolygonLayer = null;
  }

  const bounds = L.latLngBounds([]);

  // 1. Render rejected reference outline (RED dashed)
  if (rejectedPoints.value.length >= 3) {
    const rejLatLngs: [number, number][] = rejectedPoints.value
      .filter((p) => p.lat !== null && p.lng !== null)
      .map((p) => [p.lat!, p.lng!]);

    if (rejLatLngs.length >= 3) {
      rejectedPolygonLayer = L.polygon(rejLatLngs, {
        color: '#e11d48',
        weight: 2,
        dashArray: '6, 6',
        fillColor: '#f43f5e',
        fillOpacity: 0.08,
      }).addTo(mapInstance);
      rejectedPolygonLayer.bindTooltip('Poligon Sebelumnya (Ditolak)', {
        permanent: false,
        direction: 'center',
      });
      bounds.extend(rejectedPolygonLayer.getBounds());
    }
  }

  // 2. Render active points & editable polygon (GREEN)
  const activeLatLngs: [number, number][] = [];
  coordinateRows.value.forEach((point) => {
    if (point.lat !== null && point.lng !== null && !isNaN(point.lat) && !isNaN(point.lng)) {
      const latlng: [number, number] = [point.lat, point.lng];
      activeLatLngs.push(latlng);
      bounds.extend(latlng);

      const marker = L.circleMarker(latlng, {
        radius: 6,
        fillColor: '#066C2A',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
      });
      marker.bindTooltip(`Titik ${point.order}: [${point.lat.toFixed(6)}, ${point.lng.toFixed(6)}]`, {
        permanent: false,
        direction: 'top',
      });
      markersGroup?.addLayer(marker);
    }
  });

  if (isValid.value && activeLatLngs.length >= 3) {
    activePolygonLayer = L.polygon(activeLatLngs, {
      color: '#066C2A',
      weight: 3,
      fillColor: '#10b981',
      fillOpacity: 0.25,
    }).addTo(mapInstance);
    activePolygonLayer.bindTooltip(`Batas Lahan Perbaikan (${calculatedAreaHa.value} Ha)`, {
      permanent: false,
      direction: 'center',
    });
    mapInstance.fitBounds(activePolygonLayer.getBounds(), { padding: [25, 25] });
  } else if (bounds.isValid()) {
    mapInstance.fitBounds(bounds, { maxZoom: 16, padding: [25, 25] });
  }
}

function initMap() {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  nextTick(() => {
    if (!mapContainer.value) return;

    // Center on first coordinate or regional default (Indonesia)
    const firstValid =
      coordinateRows.value.find((p) => p.lat !== null && p.lng !== null) ||
      rejectedPoints.value.find((p) => p.lat !== null && p.lng !== null);
    const initialCenter: [number, number] = firstValid ? [firstValid.lat!, firstValid.lng!] : [-2.5489, 118.0149];

    mapInstance = L.map(mapContainer.value).setView(initialCenter, 15);

    // Google Satellite / Hybrid layer with OSM fallback
    L.tileLayer('https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      attribution: '&copy; Google Satellite Maps',
    }).addTo(mapInstance);

    renderMap();
  });
}

// Table row management
function addCoordinateRow() {
  coordinateRows.value = [
    ...coordinateRows.value,
    emptyCoordinatePoint(coordinateRows.value.length + 1),
  ];
}

function removeCoordinateRow(index: number) {
  if (coordinateRows.value.length <= 3) {
    toast.warning('Poligon minimal membutuhkan 3 titik koordinat.');
    return;
  }
  coordinateRows.value = coordinateRows.value.filter((_, i) => i !== index);
  coordinateRows.value = normalizePoints(coordinateRows.value);
}

function resetCoordinates() {
  if (rejectedPoints.value.length > 0) {
    coordinateRows.value = normalizePoints(JSON.parse(JSON.stringify(rejectedPoints.value)));
    toast.info('Koordinat dikembalikan ke bentuk poligon sebelumnya.');
  } else {
    coordinateRows.value = [
      emptyCoordinatePoint(1),
      emptyCoordinatePoint(2),
      emptyCoordinatePoint(3),
    ];
  }
}

// Drag and drop reordering
function onDragStart(index: number) {
  dragIndex.value = index;
}

function onDragOver(e: DragEvent) {
  e.preventDefault();
}

function onDrop(targetIndex: number) {
  if (dragIndex.value === null || dragIndex.value === targetIndex) return;
  const nextRows = [...coordinateRows.value];
  const dragged = nextRows[dragIndex.value];
  nextRows.splice(dragIndex.value, 1);
  nextRows.splice(targetIndex, 0, dragged);
  coordinateRows.value = normalizePoints(nextRows);
  dragIndex.value = null;
}

// Clipboard Excel/CSV pasting
function handleInputPaste(index: number, e: ClipboardEvent) {
  const text = e.clipboardData?.getData('text');
  if (!text) return;

  if (text.includes('\n') || text.includes('\t') || text.includes(';') || text.includes(',')) {
    e.preventDefault();
    const lines = text.trim().split(/\r?\n/);
    const nextRows = [...coordinateRows.value];
    let addedCount = 0;

    lines.forEach((line, lIdx) => {
      const parts = line
        .split(/[\t,; ]+/)
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length >= 2) {
        const lat = parseFloat(parts[0].replace(',', '.'));
        const lng = parseFloat(parts[1].replace(',', '.'));
        if (!isNaN(lat) && !isNaN(lng)) {
          const targetIdx = index + lIdx;
          if (targetIdx < nextRows.length) {
            nextRows[targetIdx] = { ...nextRows[targetIdx], lat, lng };
          } else {
            nextRows.push({ order: nextRows.length + 1, lat, lng });
          }
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      coordinateRows.value = normalizePoints(nextRows);
      pasteSuccessMsg.value = `${addedCount} titik koordinat berhasil ditempel dari clipboard.`;
      setTimeout(() => {
        pasteSuccessMsg.value = '';
      }, 4000);
      toast.success(`${addedCount} titik koordinat berhasil ditempel.`);
    }
  }
}

// Spatial file import (Shapefile/GeoJSON)
function triggerFileImport() {
  fileInputRef.value?.click();
}

async function handleFileImportChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  input.value = '';
  if (files.length === 0) return;

  const confirmed = window.confirm(
    'Mengimpor berkas spasial akan menggantikan daftar koordinat saat ini. Lanjutkan?',
  );
  if (!confirmed) return;

  isImporting.value = true;
  try {
    const isGeoJson = files.some(
      (f) => f.name.endsWith('.geojson') || f.name.endsWith('.json'),
    );

    if (isGeoJson) {
      const text = await files[0].text();
      const parsed = JSON.parse(text);
      let coords: [number, number][] = [];

      if (parsed.type === 'FeatureCollection' && parsed.features?.[0]?.geometry?.coordinates) {
        coords = parsed.features[0].geometry.coordinates[0];
      } else if (parsed.type === 'Feature' && parsed.geometry?.coordinates) {
        coords = parsed.geometry.coordinates[0];
      } else if (parsed.type === 'Polygon' && parsed.coordinates) {
        coords = parsed.coordinates[0];
      } else if (Array.isArray(parsed)) {
        coords = parsed;
      }

      if (coords.length < 3) {
        throw new Error('GeoJSON harus memuat minimal 3 titik koordinat poligon.');
      }

      coordinateRows.value = normalizePoints(
        coords.map((c) => ({
          order: 0,
          lat: Number(c[1]), // GeoJSON is [lng, lat]
          lng: Number(c[0]),
        })),
      );
      toast.success('Koordinat poligon berhasil diimpor dari GeoJSON.');
    } else {
      // Shapefile parser
      const bidangs = await parseShapefileUpload(files);
      if (bidangs.length === 0 || !bidangs[0].coordinates?.length) {
        throw new Error('Tidak ditemukan poligon yang valid dalam berkas Shapefile.');
      }
      coordinateRows.value = normalizePoints(
        bidangs[0].coordinates.map((c: any, idx: number) => ({
          order: idx + 1,
          lat: Number(c.lat),
          lng: Number(c.lng),
        }))
      );
      toast.success(
        `Poligon berhasil diimpor dari Shapefile (${coordinateRows.value.length} titik).`,
      );
    }
  } catch (err: any) {
    toast.error(err?.message || 'Gagal membaca berkas spasial.');
  } finally {
    isImporting.value = false;
  }
}

onMounted(() => {
  initMap();
  if (coordinateRows.value.length >= 3 && isValid.value) {
    emitChanges();
  }
});

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});
</script>

<template>
  <div class="flex flex-col gap-3.5 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
    <!-- Header with Verifier Notes & Badges -->
    <div class="flex flex-col gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-[#066C2A] dark:text-emerald-400">
            <MapPin class="w-4 h-4" />
          </span>
          <h4 class="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-100">
            Editor Poligon / Koordinat {{ lahanLabel }}
          </h4>
        </div>

        <div class="flex items-center gap-2">
          <span
            v-if="calculatedAreaHa > 0"
            class="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#066C2A] dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center gap-1"
          >
            Luas Spasial: <strong>{{ calculatedAreaHa }} Ha</strong>
          </span>
          <span
            :class="[
              'text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1',
              isValid
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300',
            ]"
          >
            <CheckCircle2 v-if="isValid" class="w-3.5 h-3.5" />
            <AlertTriangle v-else class="w-3.5 h-3.5" />
            {{ isValid ? 'Poligon Valid' : 'Poligon Belum Valid' }}
          </span>
        </div>
      </div>

      <!-- Verifier Note Banner -->
      <div v-if="verifierNotes" class="p-2.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 flex items-start gap-2">
        <AlertTriangle class="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
        <div class="flex flex-col text-xs text-rose-900 dark:text-rose-200">
          <span class="font-bold">Catatan Penolakan Verifikator:</span>
          <span>"{{ verifierNotes }}"</span>
        </div>
      </div>
    </div>

    <!-- Map & Legend -->
    <div class="flex flex-col gap-1.5">
      <div class="relative w-full rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
        <div ref="mapContainer" class="w-full h-72 md:h-80 z-0 bg-slate-100 dark:bg-slate-800" />

        <!-- Legend Overlay -->
        <div class="absolute bottom-2 left-2 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 text-[10px] flex items-center gap-3 shadow-sm">
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-1.5 rounded-sm bg-rose-500 border border-rose-600 border-dashed inline-block" />
            <span class="text-slate-600 dark:text-slate-300">Ditolak</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-3 h-1.5 rounded-sm bg-emerald-500 border border-emerald-600 inline-block" />
            <span class="text-slate-600 dark:text-slate-300">Perbaikan</span>
          </div>
        </div>
      </div>
      <p class="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
        <Info class="w-3 h-3 text-slate-400" />
        Garis putus-putus merah menunjukkan bentuk yang ditolak. Garis hijau menunjukkan batas perbaikan aktif.
      </p>
    </div>

    <!-- Coordinate Table & Toolbar -->
    <div class="flex flex-col gap-2.5 mt-1">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Tabel Titik Koordinat (Latitude / Longitude)
        </span>

        <div class="flex items-center gap-2">
          <!-- Hidden Spatial File Input -->
          <input
            ref="fileInputRef"
            type="file"
            accept=".zip,.shp,.geojson,.json"
            class="hidden"
            @change="handleFileImportChange"
          />
          <button
            type="button"
            @click="triggerFileImport"
            :disabled="isImporting"
            class="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Impor dari berkas Shapefile (.zip, .shp) atau GeoJSON"
          >
            <FileUp class="w-3.5 h-3.5 text-[#066C2A]" />
            <span>{{ isImporting ? 'Mengimpor...' : 'Impor Spasial (SHP/GeoJSON)' }}</span>
          </button>

          <button
            type="button"
            @click="resetCoordinates"
            class="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Kembalikan koordinat ke bentuk awal"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <button
            type="button"
            @click="addCoordinateRow"
            class="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#066C2A] hover:bg-emerald-800 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus class="w-3.5 h-3.5" />
            <span>Tambah Titik</span>
          </button>
        </div>
      </div>

      <!-- Paste notification -->
      <div v-if="pasteSuccessMsg" class="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1.5">
        <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
        {{ pasteSuccessMsg }}
      </div>

      <!-- Table Container -->
      <div class="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs bg-white dark:bg-slate-900">
        <div class="overflow-x-auto max-h-56 scrollbar-thin">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
                <th class="p-2.5 w-12 text-center">No</th>
                <th class="p-2.5">Latitude (Lintang)</th>
                <th class="p-2.5">Longitude (Bujur)</th>
                <th class="p-2.5 w-14 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, index) in coordinateRows"
                :key="row.order"
                draggable="true"
                @dragstart="onDragStart(index)"
                @dragover="onDragOver"
                @drop="onDrop(index)"
                :class="[
                  'border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors',
                  dragIndex === index ? 'opacity-30 bg-slate-100' : '',
                ]"
              >
                <td class="p-2 text-center">
                  <div class="flex items-center justify-center gap-1 cursor-grab">
                    <GripVertical class="w-3 h-3 text-slate-300 hover:text-slate-600" />
                    <span class="font-bold text-slate-700 dark:text-slate-300">{{ row.order }}</span>
                  </div>
                </td>
                <td class="p-2">
                  <input
                    type="number"
                    step="0.00000001"
                    v-model.number="row.lat"
                    @paste="(e) => handleInputPaste(index, e)"
                    placeholder="Contoh: -6.2088"
                    class="w-full h-8 px-2.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#066C2A] text-slate-800 dark:text-slate-100"
                  />
                </td>
                <td class="p-2">
                  <input
                    type="number"
                    step="0.00000001"
                    v-model.number="row.lng"
                    @paste="(e) => handleInputPaste(index, e)"
                    placeholder="Contoh: 106.8456"
                    class="w-full h-8 px-2.5 text-xs font-mono rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#066C2A] text-slate-800 dark:text-slate-100"
                  />
                </td>
                <td class="p-2 text-center">
                  <button
                    type="button"
                    @click="removeCoordinateRow(index)"
                    :disabled="coordinateRows.length <= 3"
                    class="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Hapus titik koordinat"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Helper tip -->
      <p class="text-[10px] text-slate-500 dark:text-slate-400">
        Tip: Anda dapat menyalin dua kolom koordinat dari Excel / spreadsheet dan menempelkannya langsung (<kbd class="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded font-semibold text-[9px]">Ctrl+V</kbd>) ke sel input manapun.
      </p>

      <!-- Geometry Validation Feedback -->
      <div v-if="validationMessages.length > 0" class="flex flex-col gap-1 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-amber-800 dark:text-amber-300 text-xs">
        <span class="font-bold flex items-center gap-1">
          <AlertTriangle class="w-3.5 h-3.5 text-amber-600" /> Periksa Poligon:
        </span>
        <ul class="list-disc list-inside text-[11px] pl-1">
          <li v-for="(msg, mIdx) in validationMessages" :key="mIdx">{{ msg }}</li>
        </ul>
      </div>
    </div>
  </div>
</template>
