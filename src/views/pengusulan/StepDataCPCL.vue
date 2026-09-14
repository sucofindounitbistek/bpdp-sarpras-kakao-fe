<script setup lang="ts">
import { computed, ref, watch, onMounted, onUnmounted } from 'vue';
import Card from '@/components/ui/Card.vue';
import Input from '@/components/ui/Input.vue';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import { CoordinatePoint, DataCPCL } from '@/types/pengusulan';
import { emptyCoordinatePoint, parseCoordinatePolygon, validateCoordinatePolygon } from '@/lib/coordinatePolygon';
import { ArrowDown, ArrowUp, MapPin, Trash2, FileSpreadsheet, ClipboardCheck, Sparkles } from 'lucide-vue-next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const props = defineProps<{
  modelValue: DataCPCL[];
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: DataCPCL[]): void;
}>();

const mapContainer = ref<HTMLElement | null>(null);
let mapInstance: L.Map | null = null;
let polygonLayer: L.Polygon | null = null;
let markersGroup: L.LayerGroup | null = null;

// Excel Paste Panel State
const showExcelPasteBox = ref(false);
const excelRawText = ref('');
const pasteSuccessMsg = ref('');

const normalizePoints = (points: CoordinatePoint[] | { lat: number | null; lng: number | null }[]): CoordinatePoint[] =>
  points.map((point, index) => ({ order: index + 1, lat: point.lat, lng: point.lng }));

const initialRows = (value = ''): CoordinatePoint[] => {
  const parsed = parseCoordinatePolygon(value);
  if (parsed.length > 0) return normalizePoints(parsed);
  return [
    { order: 1, lat: -2.5831, lng: 120.3121 },
    { order: 2, lat: -2.584, lng: 120.315 },
    { order: 3, lat: -2.5865, lng: 120.3135 },
  ];
};

const listCPCL = ref<DataCPCL[]>([...props.modelValue]);

watch(
  () => props.modelValue,
  (value) => {
    listCPCL.value = [...value];
  },
);

const newForm = ref<DataCPCL>({
  id: '',
  namaPekebun: 'Ahmad Supardi',
  nik: '7301021105820002',
  nomorKK: '7301021105820000',
  luasLahanHektar: 2.5,
  jenisHakLahan: 'SHM',
  nomorSuratLahan: 'SHM-00123/LUWU/2024',
  coordinates: initialRows(),
});

const errorMsg = ref('');

const coordinateRows = computed({
  get: () => normalizePoints(newForm.value.coordinates || []),
  set: (value: CoordinatePoint[]) => {
    newForm.value.coordinates = normalizePoints(value);
  },
});

const polygonState = computed(() => validateCoordinatePolygon(coordinateRows.value));

const polygonLatLngs = computed<[number, number][]>(() => polygonState.value.points.map((point) => [point.lat!, point.lng!]));

// Map render function using direct Leaflet API
const renderMap = () => {
  if (!mapInstance || !polygonLatLngs.value) return;

  if (markersGroup) {
    markersGroup.clearLayers();
  } else {
    markersGroup = L.layerGroup().addTo(mapInstance);
  }

  if (polygonLayer) {
    mapInstance.removeLayer(polygonLayer);
    polygonLayer = null;
  }

  if (polygonLatLngs.value.length > 0) {
    polygonLatLngs.value.forEach(([lat, lng], idx) => {
      if (markersGroup) {
        L.circleMarker([lat, lng], {
          radius: 6,
          fillColor: '#066C2A',
          color: '#ffffff',
          weight: 2,
          fillOpacity: 0.9,
        })
          .bindTooltip(`Titik #${idx + 1}`, { permanent: false })
          .addTo(markersGroup);
      }
    });

    if (polygonLatLngs.value.length >= 3 && polygonState.value.isValid) {
      polygonLayer = L.polygon(polygonLatLngs.value, {
        color: '#066C2A',
        fillColor: '#066C2A',
        fillOpacity: 0.3,
        weight: 3,
      }).addTo(mapInstance);

      mapInstance.fitBounds(polygonLayer.getBounds(), { padding: [30, 30] });
    } else {
      const bounds = L.latLngBounds(polygonLatLngs.value);
      mapInstance.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }
};

onMounted(() => {
  setTimeout(() => {
    if (mapContainer.value && !mapInstance) {
      mapInstance = L.map(mapContainer.value, {
        center: [-2.584, 120.3135],
        zoom: 15,
        zoomControl: true,
      });

      // Esri World Imagery Satellite Tile Layer
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: '&copy; Esri World Imagery',
      }).addTo(mapInstance);

      // Reference Labels Overlay
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        opacity: 0.75,
      }).addTo(mapInstance);

      renderMap();
    }
  }, 100);
});

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
});

watch(
  polygonLatLngs,
  () => {
    renderMap();
  },
  { deep: true },
);

// Excel Bulk Paste Parser
const parseAndApplyExcelText = (rawText: string) => {
  if (!rawText.trim()) return;

  const lines = rawText.trim().split(/\r?\n/);
  const parsedPoints: CoordinatePoint[] = [];

  lines.forEach((line) => {
    // Split by tab, comma, semicolon, or space
    const parts = line
      .split(/[\t,;\s]+/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      const latStr = parts[0].replace(',', '.');
      const lngStr = parts[1].replace(',', '.');
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);

      if (!isNaN(lat) && !isNaN(lng)) {
        parsedPoints.push({
          order: parsedPoints.length + 1,
          lat: lat,
          lng: lng,
        });
      }
    }
  });

  if (parsedPoints.length > 0) {
    coordinateRows.value = normalizePoints(parsedPoints);
    pasteSuccessMsg.value = `Berhasil mengimpor ${parsedPoints.length} titik koordinat dari Excel!`;
    setTimeout(() => {
      pasteSuccessMsg.value = '';
    }, 4000);
  }
};

const handleImportFromExcelText = () => {
  parseAndApplyExcelText(excelRawText.value);
  excelRawText.value = '';
  showExcelPasteBox.value = false;
};

// Paste event directly on input
const handleInputPaste = (e: ClipboardEvent) => {
  const clipboardData = e.clipboardData?.getData('text');
  if (clipboardData && (clipboardData.includes('\n') || clipboardData.includes('\t'))) {
    e.preventDefault();
    parseAndApplyExcelText(clipboardData);
  }
};

const rowMessages = (row: CoordinatePoint) => polygonState.value.validationMessages.filter((message) => message.startsWith(`Titik ${row.order}:`));

const generalMessages = computed(() => polygonState.value.validationMessages.filter((message) => !message.startsWith('Titik ')));

const addCoordinateRow = () => {
  coordinateRows.value = [...coordinateRows.value, emptyCoordinatePoint(coordinateRows.value.length + 1)];
};

const removeCoordinateRow = (index: number) => {
  coordinateRows.value = coordinateRows.value.filter((_, rowIndex) => rowIndex !== index);
};

const moveCoordinateRow = (index: number, direction: -1 | 1) => {
  const targetIndex = index + direction;
  if (targetIndex < 0 || targetIndex >= coordinateRows.value.length) return;

  const nextRows = [...coordinateRows.value];
  [nextRows[index], nextRows[targetIndex]] = [nextRows[targetIndex], nextRows[index]];
  coordinateRows.value = nextRows;
};

const resetForm = () => {
  newForm.value = {
    id: '',
    namaPekebun: '',
    nik: '',
    nomorKK: '',
    luasLahanHektar: 1,
    jenisHakLahan: 'SHM',
    nomorSuratLahan: '',
    coordinates: initialRows(),
  };
};

const addCPCL = () => {
  if (!newForm.value.namaPekebun || !newForm.value.nik || !newForm.value.nomorSuratLahan) {
    errorMsg.value = 'Mohon lengkapi Nama Pekebun, NIK, dan Nomor Surat Lahan!';
    return;
  }

  if (!polygonState.value.isValid) {
    errorMsg.value = 'Poligon lahan belum valid. Mohon periksa kembali koordinat titik!';
    return;
  }

  const cpclItem: DataCPCL = {
    ...newForm.value,
    id: `CPCL-${Date.now()}`,
    coordinates: coordinateRows.value,
  };

  listCPCL.value.push(cpclItem);
  emit('update:modelValue', listCPCL.value);
  errorMsg.value = '';
  resetForm();
};

const removeCPCL = (id: string) => {
  listCPCL.value = listCPCL.value.filter((item) => item.id !== id);
  emit('update:modelValue', listCPCL.value);
};
</script>

<template>
  <div class="flex flex-col gap-6">
    <Card title="Tahap 2: Input Data CPCL & Poligon Spasial Lahan" subtitle="Masukkan data anggota petani calon lokasi (CPCL) dan pemetaan koordinat poligon batas lahan.">
      <div class="flex flex-col gap-6 mt-4">
        <!-- Form Input Pekebun -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <Input id="namaPekebun" label="Nama Lengkap Pekebun" v-model="newForm.namaPekebun" placeholder="Ahmad Supardi" required />

          <Input id="nikPekebun" only-digits maxlength="16" label="NIK Pekebun (16 Digit)" v-model="newForm.nik" placeholder="730102xxxxxxxxxx" required />

          <Input id="kkPekebun" only-digits maxlength="16" label="Nomor Kartu Keluarga (KK)" v-model="newForm.nomorKK" placeholder="730102xxxxxxxxxx" />

          <Input id="luasLahan" label="Luas Lahan (Hektar)" type="number" step="0.1" v-model.number="newForm.luasLahanHektar" placeholder="2.5" required />

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-700">Jenis Hak / Legalitas Lahan</label>
            <select v-model="newForm.jenisHakLahan" class="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:border-[#066C2A]">
              <option value="SHM">SHM (Sertifikat Hak Milik)</option>
              <option value="SKT">SKT (Surat Keterangan Tanah)</option>
              <option value="STDB">STDB (Surat Tanda Daftar Budidaya)</option>
            </select>
          </div>

          <Input id="nomorSuratLahan" label="Nomor Dokumen Lahan" v-model="newForm.nomorSuratLahan" placeholder="SHM-00123/2024" required />
        </div>

        <!-- Input Koordinat & Map Preview -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <!-- Column Left: Coordinate Rows -->
          <div class="flex flex-col gap-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h5 class="text-sm font-bold text-slate-800">Koordinat Poligon Batas Lahan</h5>
                <p class="text-xs text-slate-500">Masukkan minimal 4 titik koordinat latitude & longitude.</p>
              </div>
              <div class="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" class="flex items-center gap-1 text-[#066C2A] border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100" @click="showExcelPasteBox = !showExcelPasteBox">
                  <FileSpreadsheet class="w-4 h-4 text-[#066C2A]" /> Copy-Paste Excel
                </Button>
                <Button type="button" variant="outline" size="sm" @click="addCoordinateRow">+ Titik</Button>
              </div>
            </div>

            <!-- Paste Alert Success -->
            <div v-if="pasteSuccessMsg" class="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <ClipboardCheck class="w-4 h-4 text-[#066C2A]" /> {{ pasteSuccessMsg }}
            </div>

            <!-- Paste Excel Box (Expandable Panel) -->
            <div v-if="showExcelPasteBox" class="p-4 bg-emerald-900/5 border border-emerald-300 rounded-2xl flex flex-col gap-3 transition-all duration-200">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2 text-xs font-bold text-[#066C2A]"><Sparkles class="w-4 h-4" /> Copy-Paste Langsung dari Microsoft Excel</div>
                <span class="text-[10px] text-slate-500">Format: Lat [TAB] Long per baris</span>
              </div>
              <textarea
                v-model="excelRawText"
                rows="4"
                placeholder="Salin sel dari Excel lalu paste di sini:&#10;-2.583100&#9;120.312100&#10;-2.584000&#9;120.315000&#10;-2.586500&#9;120.313500"
                class="w-full p-3 text-xs font-mono rounded-xl border border-slate-300 bg-white focus:outline-none focus:border-[#066C2A]"
              />
              <div class="flex items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" @click="showExcelPasteBox = false">Batal</Button>
                <Button type="button" variant="primary" size="sm" @click="handleImportFromExcelText"> Impor Koordinat Excel </Button>
              </div>
            </div>

            <!-- Responsive Neat Grid Rows -->
            <div class="flex flex-col gap-2.5">
              <div v-for="(row, index) in coordinateRows" :key="row.order" class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center rounded-xl border border-slate-200 bg-white p-3 shadow-xs">
                <div class="sm:col-span-1 flex items-center font-bold text-xs text-slate-500">#{{ row.order }}</div>

                <div class="sm:col-span-4 flex flex-col gap-1">
                  <label :for="`latitude-${row.order}`" class="text-[11px] font-semibold text-slate-600">Latitude</label>
                  <input
                    :id="`latitude-${row.order}`"
                    v-model.number="row.lat"
                    type="number"
                    step="0.000001"
                    placeholder="-2.583100"
                    @paste="handleInputPaste"
                    class="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono focus:outline-none focus:border-[#066C2A] w-full"
                  />
                </div>

                <div class="sm:col-span-4 flex flex-col gap-1">
                  <label :for="`longitude-${row.order}`" class="text-[11px] font-semibold text-slate-600">Longitude</label>
                  <input
                    :id="`longitude-${row.order}`"
                    v-model.number="row.lng"
                    type="number"
                    step="0.000001"
                    placeholder="120.312100"
                    @paste="handleInputPaste"
                    class="h-9 px-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white text-xs font-mono focus:outline-none focus:border-[#066C2A] w-full"
                  />
                </div>

                <div class="sm:col-span-3 flex items-center justify-end gap-1 pt-2 sm:pt-4">
                  <button type="button" class="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition-colors" :disabled="index === 0" @click="moveCoordinateRow(index, -1)" title="Naikkan">
                    <ArrowUp class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    class="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 disabled:opacity-30 transition-colors"
                    :disabled="index === coordinateRows.length - 1"
                    @click="moveCoordinateRow(index, 1)"
                    title="Turunkan"
                  >
                    <ArrowDown class="w-3.5 h-3.5" />
                  </button>
                  <button type="button" class="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors" @click="removeCoordinateRow(index)" title="Hapus">
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>

                <p v-for="message in rowMessages(row)" :key="message" class="sm:col-span-12 text-[11px] text-rose-600 font-medium mt-1">
                  {{ message.replace(`Titik ${row.order}: `, '') }}
                </p>
              </div>
            </div>

            <div v-if="generalMessages.length" class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 font-medium space-y-1">
              <p v-for="message in generalMessages" :key="message">{{ message }}</p>
            </div>
          </div>

          <!-- Column Right: Leaflet Map Container -->
          <div class="flex flex-col gap-2">
            <div class="h-[260px] w-full overflow-hidden rounded-xl border border-slate-300 bg-slate-100 relative shadow-inner">
              <div ref="mapContainer" class="h-full w-full z-0"></div>
            </div>
            <p v-if="polygonState.isValid" class="text-xs font-semibold text-emerald-700 flex items-center gap-1.5"><MapPin class="w-4 h-4 text-[#066C2A]" /> Poligon valid dengan {{ polygonState.points.length }} titik koordinat spasial.</p>
            <p v-else class="text-xs text-slate-500">Pratinjau poligon akan terbentuk setelah minimal 4 titik koordinat dimasukkan.</p>
          </div>
        </div>

        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-t border-slate-100 pt-4">
          <p v-if="errorMsg" class="text-xs text-rose-600 font-medium">{{ errorMsg }}</p>
          <div class="flex md:ml-auto">
            <Button type="button" variant="primary" size="md" custom-class="w-full md:w-auto" @click="addCPCL"> + Tambah Pekebun Ke Daftar CPCL </Button>
          </div>
        </div>
      </div>

      <!-- Table Daftar CPCL -->
      <div class="mt-6 border-t border-slate-200 pt-6">
        <h4 class="text-sm font-semibold text-slate-800 mb-3 font-apple-body-strong flex items-center justify-between">
          <span>Daftar CPCL Terdaftar (Total: {{ listCPCL.length }} Pekebun)</span>
          <Badge variant="success"> Total Luas: {{ listCPCL.reduce((acc, curr) => acc + (curr.luasLahanHektar || 0), 0).toFixed(1) }} Ha </Badge>
        </h4>

        <div class="overflow-x-auto border border-slate-200 rounded-xl bg-white">
          <table class="w-full text-left text-xs text-slate-700">
            <thead class="bg-slate-100 text-slate-800 uppercase font-semibold border-b border-slate-200">
              <tr>
                <th class="p-3">No</th>
                <th class="p-3">Nama Pekebun</th>
                <th class="p-3">NIK / KK</th>
                <th class="p-3">Luas Lahan</th>
                <th class="p-3">Dokumen Lahan</th>
                <th class="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="(item, idx) in listCPCL" :key="item.id" class="hover:bg-slate-50">
                <td class="p-3 font-mono text-slate-400">{{ idx + 1 }}</td>
                <td class="p-3 font-bold text-slate-900">{{ item.namaPekebun }}</td>
                <td class="p-3 font-mono">
                  {{ item.nik }} <br /><span class="text-slate-400">KK: {{ item.nomorKK }}</span>
                </td>
                <td class="p-3 font-semibold text-[#066C2A]">{{ item.luasLahanHektar }} Ha</td>
                <td class="p-3">
                  <Badge variant="info">{{ item.jenisHakLahan }}</Badge> <span class="font-mono text-[10px] text-slate-500 ml-1">{{ item.nomorSuratLahan }}</span>
                </td>
                <td class="p-3 text-center">
                  <button type="button" @click="removeCPCL(item.id)" class="p-1 text-rose-600 hover:bg-rose-50 rounded-lg">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
              <tr v-if="listCPCL.length === 0">
                <td colspan="6" class="p-6 text-center text-slate-400 italic">Belum ada data CPCL. Silakan isi formulir di atas dan klik "+ Tambah Pekebun Ke Daftar CPCL".</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  </div>
</template>

<style scoped>
:deep(.leaflet-container) {
  height: 100% !important;
  width: 100% !important;
  border-radius: 1rem;
}
</style>
