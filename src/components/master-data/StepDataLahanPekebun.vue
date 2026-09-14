<script setup lang="ts">
import { ref, watch, computed, nextTick, onMounted, onUnmounted } from 'vue';
import Input from '@/components/ui/Input.vue';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import FileUpload from '@/components/ui/FileUpload.vue';
import Badge from '@/components/ui/Badge.vue';
import YearPicker from '@/components/ui/YearPicker.vue';
import { LahanFormData, DokumenPekebun } from '@/types/pekebun';
import { CoordinatePoint } from '@/types/pengusulan';
import { useRegionStore } from '@/stores/region';
import { useToast } from '@/composables/useToast';
import { Download, MapPin, Trash2, RotateCcw, Plus, GripVertical, Edit2, Check, X, AlertTriangle, ChevronRight, ChevronLeft, FileUp } from 'lucide-vue-next';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { validateCoordinatePolygon, emptyCoordinatePoint } from '@/lib/coordinatePolygon';
import { parseShapefileUpload } from '@/lib/shapefileImport';
import { LOCALIZATION } from '@/config/localization';

const props = defineProps<{
  modelValue: LahanFormData[];
  errors?: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: LahanFormData[]): void;
  (e: 'update:isEditing', val: boolean): void;
}>();

const regionStore = useRegionStore();
const toast = useToast();

// List of lands in wizard state
const lahanList = ref<LahanFormData[]>([...props.modelValue]);

watch(
  () => props.modelValue,
  (val) => {
    lahanList.value = [...val];
  },
  { deep: true },
);

// Staging state for editing/adding single land
const editingIndex = ref<number | null>(null);
const isAddingNew = ref(false);
const activeTab = ref<'legalitas' | 'alamat' | 'peta'>('legalitas');

const activeForm = ref<LahanFormData>(emptyLahanForm());
const isFormActive = computed(() => isAddingNew.value || editingIndex.value !== null);

watch(
  isFormActive,
  (active) => {
    emit('update:isEditing', active);
  },
  { immediate: true },
);

onUnmounted(() => {
  emit('update:isEditing', false);
});

const requiresNomorLegalitas = computed(() => Boolean(activeForm.value.jenisLegalitas) && activeForm.value.jenisLegalitas !== 'NON_SHM');

// Region list states & loading computed from IAM region store
const provinsiList = computed(() => regionStore.provinces);
const kabupatenList = computed(() => {
  if (!activeForm.value.provinsiKode) return [];
  return regionStore.regenciesByProvince[String(activeForm.value.provinsiKode)] || [];
});
const isLoadingProvinces = computed(() => regionStore.isLoadingProvinces);
const isLoadingKabupaten = computed(() => {
  if (!activeForm.value.provinsiKode) return false;
  return Boolean(regionStore.loadingRegencies[String(activeForm.value.provinsiKode)]);
});

// Leaflet Map states
const mapContainer = ref<HTMLElement | null>(null);
let mapInstance: L.Map | null = null;
let polygonLayer: L.Polygon | null = null;
let markersGroup: L.LayerGroup | null = null;

const pasteSuccessMsg = ref('');
const dragIndex = ref<number | null>(null);

// SHP (STDB) import state — one bidang per polygon; re-upload replaces the list
const shpInputRef = ref<HTMLInputElement | null>(null);
const isImporting = ref(false);

function emptyLahanForm(): LahanFormData {
  return {
    jenisLegalitas: '',
    nomorLegalitas: '',
    tanggalPenerbitanLegalitas: '',
    luasLahan: '',
    provinsiKode: '',
    kabupatenKode: '',
    kecamatanKode: '',
    desaKode: '',
    alamatKebun: '',
    tahunTanam: '',
    jenisBibit: '',
    scanLegalitas: null,
    scanBedaNamaLahan: null,
    nomorSuratBedaNama: '',
    coordinates: [],
  };
}

const triggerShpImport = () => {
  shpInputRef.value?.click();
};

const handleShpImportChange = async (e: Event) => {
  const input = e.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  input.value = '';
  if (files.length === 0) return;

  if (lahanList.value.length > 0) {
    const confirmed = window.confirm(`Mengimpor SHP akan menggantikan ${lahanList.value.length} data lahan yang sudah ada di list. Lanjutkan?`);
    if (!confirmed) return;
  }

  isImporting.value = true;
  try {
    const bidangs = await parseShapefileUpload(files);
    lahanList.value = bidangs.map((bidang) => ({
      ...emptyLahanForm(),
      luasLahan: bidang.luasHa,
      coordinates: bidang.coordinates,
    }));
    emit('update:modelValue', lahanList.value);
    toast.success(
      `${bidangs.length} bidang lahan berhasil diimpor dari SHP. Lengkapi legalitas, wilayah, dan berkas untuk tiap lahan.`,
      'Impor SHP Berhasil',
    );
  } catch (err: any) {
    toast.error(err?.message || 'Gagal membaca file shapefile.', 'Impor SHP Gagal');
  } finally {
    isImporting.value = false;
  }
};

// Initialize region choices from IAM API
const loadWilayah = async () => {
  try {
    await regionStore.loadProvinces();
    if (activeForm.value.provinsiKode) {
      await regionStore.loadRegencies(activeForm.value.provinsiKode);
    }
  } catch (err: any) {
    toast.error(err?.message || 'Gagal memuat master wilayah dari IAM.', 'Gagal Muat Wilayah');
  }
};

// Coordinate rows editing state
const coordinateRows = ref<CoordinatePoint[]>([]);

const normalizePoints = (points: CoordinatePoint[]) => points.map((point, index) => ({ ...point, order: index + 1 }));

const initialRows = () => {
  const coords = activeForm.value.coordinates || [];
  if (coords.length > 0) {
    return normalizePoints(
      coords.map((c, i) => ({
        order: i + 1,
        lat: Number(c.lat),
        lng: Number(c.lng),
      })),
    );
  }
  return [
    { order: 1, lat: -2.5831, lng: 120.3121 },
    { order: 2, lat: -2.584, lng: 120.315 },
    { order: 3, lat: -2.5865, lng: 120.3135 },
    { order: 4, lat: -2.585, lng: 120.314 },
  ];
};

// Sync coordinates to activeForm coordinates field
watch(
  coordinateRows,
  (newRows) => {
    activeForm.value.coordinates = newRows.map((row) => ({
      lat: row.lat,
      lng: row.lng,
    }));
    if (activeTab.value === 'peta') {
      renderMap();
    }
  },
  { deep: true },
);

// HTML5 Drag & Drop handlers for coordinate table
const onDragStart = (index: number) => {
  dragIndex.value = index;
};

const onDragOver = (e: DragEvent) => {
  e.preventDefault();
};

const onDrop = (targetIndex: number) => {
  if (dragIndex.value === null || dragIndex.value === targetIndex) return;
  const nextRows = [...coordinateRows.value];
  const draggedRow = nextRows[dragIndex.value];

  nextRows.splice(dragIndex.value, 1);
  nextRows.splice(targetIndex, 0, draggedRow);

  coordinateRows.value = normalizePoints(nextRows);
  dragIndex.value = null;
};

const handleInputPaste = (index: number, e: ClipboardEvent) => {
  const clipboardData = e.clipboardData?.getData('text');
  if (!clipboardData) return;

  if (clipboardData.includes('\n') || clipboardData.includes('\t') || clipboardData.includes(',') || clipboardData.includes(' ')) {
    e.preventDefault();

    const lines = clipboardData.trim().split(/\r?\n/);
    const nextRows = [...coordinateRows.value];
    let addedCount = 0;

    lines.forEach((line, lineIdx) => {
      const parts = line
        .split(/[\t,; ]+/)
        .map((p) => p.trim())
        .filter(Boolean);
      if (parts.length >= 2) {
        const lat = parseFloat(parts[0].replace(',', '.'));
        const lng = parseFloat(parts[1].replace(',', '.'));

        if (!isNaN(lat) && !isNaN(lng)) {
          const targetRowIdx = index + lineIdx;
          if (targetRowIdx < nextRows.length) {
            nextRows[targetRowIdx] = {
              ...nextRows[targetRowIdx],
              lat: lat,
              lng: lng,
            };
          } else {
            nextRows.push({
              order: nextRows.length + 1,
              lat: lat,
              lng: lng,
            });
          }
          addedCount++;
        }
      }
    });

    if (addedCount > 0) {
      coordinateRows.value = normalizePoints(nextRows);
      pasteSuccessMsg.value = LOCALIZATION.cpclForm.koordinat.clipboardSuccess.replace('{count}', addedCount.toString());
      setTimeout(() => {
        pasteSuccessMsg.value = '';
      }, 4000);
    }
  }
};

const addCoordinateRow = () => {
  coordinateRows.value = [...coordinateRows.value, emptyCoordinatePoint(coordinateRows.value.length + 1)];
};

const removeCoordinateRow = (index: number) => {
  coordinateRows.value = coordinateRows.value.filter((_, rowIndex) => rowIndex !== index);
  coordinateRows.value = normalizePoints(coordinateRows.value);
};

const resetCoordinates = () => {
  coordinateRows.value = [];
};

// Leaflet Draw and Center logic
const polygonState = computed(() => validateCoordinatePolygon(coordinateRows.value));

const polygonLatLngs = computed<[number, number][]>(() => polygonState.value.points.map((point) => [point.lat!, point.lng!]));

const generalMessages = computed(() => polygonState.value.validationMessages.filter((message) => !message.startsWith('Titik ')));

const renderMap = () => {
  if (!mapInstance || !polygonLatLngs.value) return;

  if (markersGroup) {
    markersGroup.clearLayers();
  } else {
    markersGroup = L.layerGroup().addTo(mapInstance);
  }

  if (polygonLayer) {
    polygonLayer.remove();
    polygonLayer = null;
  }

  const bounds = L.latLngBounds([]);

  // Draw points
  polygonState.value.points.forEach((point) => {
    if (point.lat && point.lng) {
      const latlng: [number, number] = [point.lat, point.lng];
      bounds.extend(latlng);

      const marker = L.circleMarker(latlng, {
        radius: 6,
        fillColor: '#066C2A',
        color: '#ffffff',
        weight: 2,
        fillOpacity: 1,
      });

      marker.bindTooltip(`Titik ${point.order}`, { permanent: false, direction: 'top' });
      markersGroup?.addLayer(marker);
    }
  });

  // Draw polygon path
  if (polygonState.value.isValid && polygonLatLngs.value.length >= 3) {
    polygonLayer = L.polygon(polygonLatLngs.value, {
      color: '#066C2A',
      fillColor: '#066C2A',
      fillOpacity: 0.2,
      weight: 3,
    }).addTo(mapInstance);

    mapInstance.fitBounds(polygonLayer.getBounds(), { padding: [20, 20] });
  } else if (bounds.isValid()) {
    mapInstance.fitBounds(bounds, { maxZoom: 16, padding: [20, 20] });
  }
};

const initMap = () => {
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  nextTick(() => {
    if (!mapContainer.value) return;

    // Use Luwu center as default view
    mapInstance = L.map(mapContainer.value).setView([-2.5831, 120.3121], 15);

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

    markersGroup = L.layerGroup().addTo(mapInstance);
    renderMap();
  });
};

// Tab Switch and Trigger Map Invalidation
watch(activeTab, (newTab) => {
  if (newTab === 'peta') {
    initMap();
  } else {
    if (mapInstance) {
      mapInstance.remove();
      mapInstance = null;
    }
  }
});

// Staging action handlers
const startAddLahan = async () => {
  editingIndex.value = lahanList.value.length;
  isAddingNew.value = true;
  activeTab.value = 'legalitas';
  activeForm.value = emptyLahanForm();
  coordinateRows.value = initialRows();
  await loadWilayah();
};

const startEditLahan = async (index: number) => {
  editingIndex.value = index;
  isAddingNew.value = false;
  activeTab.value = 'legalitas';
  activeForm.value = { ...lahanList.value[index] };
  coordinateRows.value = initialRows();
  await loadWilayah();
};

const cancelEdit = () => {
  editingIndex.value = null;
  isAddingNew.value = false;
  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }
};

const saveLahan = () => {
  // Perform basic local validation
  if (!activeForm.value.jenisLegalitas || (requiresNomorLegalitas.value && !activeForm.value.nomorLegalitas.trim()) || !activeForm.value.luasLahan) {
    toast.error('Mohon lengkapi data legalitas utama (jenis, nomor jika bukan Non SHM, luas) sebelum menyimpan.', 'Validasi Form');
    return;
  }

  const updatedLahan = { ...activeForm.value };

  if (isAddingNew.value) {
    lahanList.value.push(updatedLahan);
  } else if (editingIndex.value !== null) {
    lahanList.value[editingIndex.value] = updatedLahan;
  }

  editingIndex.value = null;
  isAddingNew.value = false;

  if (mapInstance) {
    mapInstance.remove();
    mapInstance = null;
  }

  // Emit updates to parent wizard
  emit('update:modelValue', lahanList.value);
  toast.success('Data Lahan berhasil ditambahkan ke list draft.', 'Lahan Disimpan');
};

const deleteLahan = (index: number) => {
  lahanList.value.splice(index, 1);
  emit('update:modelValue', lahanList.value);
  toast.success('Lahan berhasil dihapus dari list.', 'Lahan Dihapus');
};

// Wilayah selectors with IAM integration
const handleProvinsiChange = async () => {
  activeForm.value.kabupatenKode = '';
  activeForm.value.kecamatanKode = '';
  activeForm.value.desaKode = '';
  if (activeForm.value.provinsiKode) {
    try {
      await regionStore.loadRegencies(activeForm.value.provinsiKode);
    } catch (err: any) {
      toast.error(err?.message || 'Gagal memuat data kabupaten/kota.', 'Gagal Muat Wilayah');
    }
  }
};

const handleKabupatenChange = () => {
  activeForm.value.kecamatanKode = '';
  activeForm.value.desaKode = '';
};

function formatLokasiLahan(lahan: LahanFormData): string {
  const parts: string[] = [];
  if (lahan.desaKode) parts.push(lahan.desaKode);
  if (lahan.kecamatanKode) parts.push(lahan.kecamatanKode);
  if (lahan.kabupatenKode) parts.push(regionStore.getWilayahNama(lahan.kabupatenKode));
  if (lahan.provinsiKode) parts.push(regionStore.getWilayahNama(lahan.provinsiKode));
  return parts.length > 0 ? parts.join(', ') : '-';
}

onMounted(() => {
  // Pre-load provinces in background
  regionStore.loadProvinces().catch(() => {});
  // Pre-load regencies for existing lands so names resolve
  for (const l of lahanList.value) {
    if (l.provinsiKode) {
      regionStore.loadRegencies(l.provinsiKode).catch(() => {});
    }
  }
});

const handleFileSelected = (file: File) => {
  activeForm.value.scanLegalitas = file;
};

const truncateLuasLahan = (e: Event) => {
  const el = e.target as HTMLInputElement;
  const parts = el.value.split('.');
  if (parts[1] && parts[1].length > 4) {
    el.value = parts[0] + '.' + parts[1].slice(0, 4);
    activeForm.value.luasLahan = parseFloat(el.value);
  }
};

const handleBedaNamaSelected = (file: File) => {
  activeForm.value.scanBedaNamaLahan = file;
};

// Helper methods to read Zod errors from parent
const getLandErrorsCount = (index: number) => {
  if (!props.errors) return 0;
  return Object.keys(props.errors).filter((key) => key.startsWith(`${index}.`)).length;
};

const getFieldError = (index: number, field: string) => {
  if (!props.errors) return undefined;
  return props.errors[`${index}.${field}`];
};

// ponytail: reused from StepUploadDokumenPekebun pattern
function isExistingDoc(val: any): val is DokumenPekebun {
  return val && typeof val === 'object' && 'fileUrl' in val;
}

function getDocName(val: any): string {
  console.log(val);
  if (val instanceof File) return val.name;
  if (isExistingDoc(val)) return val.fileName;
  return '';
}

onUnmounted(() => {
  if (mapInstance) {
    mapInstance.remove();
  }
});
</script>

<template>
  <Card title="Tahap 3: Data Lahan Pekebun" subtitle="Lengkapi legalitas lahan, lokasi kebun, dan data budidaya tanaman Kelapa">
    <div class="flex flex-col gap-6 mt-4">
      <!-- HEADER LIST INFORMASI LAHAN -->
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="text-xs font-bold uppercase text-slate-500 tracking-wider">Daftar Lahan Pekebun ({{ lahanList.length }} Lahan)</h3>
        <div v-if="editingIndex === null" class="flex items-center gap-2">
          <input ref="shpInputRef" type="file" accept=".zip,.shp,.shx,.dbf,.prj,.cpg" multiple class="hidden" @change="handleShpImportChange" />
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="flex items-center gap-1.5 font-semibold text-xs py-1.5"
            :loading="isImporting"
            title="Impor peta bidang dari file SHP STDB (.zip berisi .shp/.shx/.dbf/.prj, atau pilih file .shp beserta pendampingnya). Setiap bidang menjadi 1 lahan dan menggantikan list saat ini."
            @click="triggerShpImport"
          >
            <FileUp class="w-3.5 h-3.5" /> Impor SHP (STDB)
          </Button>
          <Button type="button" variant="primary" size="sm" class="flex items-center gap-1.5 font-semibold text-xs py-1.5" @click="startAddLahan"> <Plus class="w-3.5 h-3.5" /> Tambah Lahan Baru </Button>
        </div>
      </div>

      <!-- LIST OF REGISTERED LAND CARDS (COMPACT VIEW) -->
      <div v-if="editingIndex === null" class="grid grid-cols-1 gap-3.5">
        <div
          v-for="(lahan, index) in lahanList"
          :key="index"
          :class="[
            'p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white',
            getLandErrorsCount(index) > 0 ? 'border-rose-300 bg-rose-50/20 shadow-xs' : 'border-slate-200 hover:border-slate-300 shadow-xs',
          ]"
        >
          <div class="flex items-start gap-3">
            <div class="w-9 h-9 rounded-xl bg-emerald-50 text-[#066C2A] flex items-center justify-center font-bold text-sm shrink-0">
              {{ index + 1 }}
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span class="font-semibold text-slate-800 text-xs md:text-sm"> {{ lahan.jenisLegalitas || 'Tanpa Jenis' }} - {{ lahan.nomorLegalitas || '-' }} </span>
                <span class="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md"> {{ lahan.luasLahan || '0' }} Ha </span>
                <Badge v-if="getLandErrorsCount(index) > 0" variant="danger" class="text-[10px] py-0"> <AlertTriangle class="w-3 h-3 mr-0.5 inline" /> {{ getLandErrorsCount(index) }} Error </Badge>
              </div>
              <p class="text-xs text-slate-500 mt-1">Tahun Tanam: {{ lahan.tahunTanam || '-' }} &bull; Benih: {{ lahan.jenisBibit || '-' }}</p>
              <p v-if="lahan.provinsiKode || lahan.kabupatenKode" class="text-xs text-slate-500 mt-0.5">
                Lokasi: {{ formatLokasiLahan(lahan) }}
              </p>
            </div>
          </div>

          <!-- Actions for land card -->
          <div class="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-slate-100 pt-2 sm:pt-0 shrink-0">
            <Button type="button" variant="outline" size="sm" class="flex items-center gap-1 text-slate-600 text-xs py-1" @click="startEditLahan(index)"> <Edit2 class="w-3.5 h-3.5" /> Edit </Button>
            <Button type="button" variant="outline" size="sm" class="flex items-center gap-1 text-rose-600 hover:bg-rose-50 border-rose-200 hover:border-rose-300 text-xs py-1" @click="deleteLahan(index)">
              <Trash2 class="w-3.5 h-3.5" /> Hapus
            </Button>
          </div>
        </div>

        <!-- EMPTY STATE -->
        <div v-if="lahanList.length === 0" class="p-8 text-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
          <MapPin class="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 class="text-xs font-bold text-slate-600 uppercase">Belum Ada Lahan</h4>
          <p class="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Silakan tambahkan minimal 1 data lahan kebun untuk melanjutkan proses pendaftaran pekebun, atau impor peta bidang dari file SHP STDB.</p>
        </div>
      </div>

      <!-- ACTIVE EDITING ACCORDION FORM DRAWER -->
      <div v-if="editingIndex !== null" class="border border-slate-200 rounded-xl shadow-sm bg-white">
        <!-- Accordion Header -->
        <div class="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center justify-between rounded-t-xl">
          <div class="flex items-center gap-2">
            <span class="w-5 h-5 rounded-full bg-[#066C2A] text-white flex items-center justify-center font-bold text-[10px]">
              {{ editingIndex + 1 }}
            </span>
            <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wide">
              {{ isAddingNew ? 'Tambah Lahan Baru' : 'Edit Lahan #' + (editingIndex + 1) }}
            </h4>
          </div>
          <button type="button" @click="cancelEdit" class="text-slate-400 hover:text-slate-600 transition-colors">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Tab Buttons (Segmented Controls) -->
        <div class="flex border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1 select-none">
          <button
            type="button"
            @click="activeTab = 'legalitas'"
            :class="['flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all', activeTab === 'legalitas' ? 'bg-white text-[#066C2A] shadow-xs' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50']"
          >
            1. Legalitas
          </button>
          <button
            type="button"
            @click="activeTab = 'alamat'"
            :class="['flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all', activeTab === 'alamat' ? 'bg-white text-[#066C2A] shadow-xs' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50']"
          >
            2. Wilayah & Berkas
          </button>
          <button
            type="button"
            @click="activeTab = 'peta'"
            :class="['flex-1 text-center py-1.5 text-xs font-semibold rounded-lg transition-all', activeTab === 'peta' ? 'bg-white text-[#066C2A] shadow-xs' : 'text-slate-500 hover:text-slate-700 hover:bg-white/50']"
          >
            3. Poligon Lahan (Peta)
          </button>
        </div>

        <!-- Tab Content Body -->
        <div class="p-5">
          <!-- TAB 1: LEGALITAS & INFORMASI BUDIDAYA -->
          <div v-show="activeTab === 'legalitas'" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Jenis Legalitas Lahan -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs md:text-sm font-semibold text-slate-700 font-apple-caption"> Jenis Legalitas Lahan <span class="text-rose-500">*</span> </label>
              <div class="flex flex-col sm:flex-row gap-3">
                <select v-model="activeForm.jenisLegalitas" class="flex-1 h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs md:text-sm focus:outline-none focus:border-[#066C2A] focus:ring-2 focus:ring-[#066C2A]/20">
                  <option value="">Pilih Legalitas</option>
                  <option value="SHM">Sertifikat Hak Milik (SHM)</option>
                  <option value="NON_SHM">Lahan Non SHM (Sporadik/Surat Penguasaan Fisik Bidang Tanah)</option>
                </select>

                <a
                  v-if="activeForm.jenisLegalitas === 'NON_SHM'"
                  href="/templates/format-sporadik.docx"
                  download
                  class="h-10 px-4 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#066C2A] hover:bg-slate-50 flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-sm"
                >
                  <Download class="w-4 h-4" /> Format Sporadik
                </a>
              </div>
              <p v-if="getFieldError(editingIndex, 'jenisLegalitas')" class="text-xs text-rose-600 mt-0.5">
                {{ getFieldError(editingIndex, 'jenisLegalitas') }}
              </p>
            </div>

            <!-- Nomor Legalitas -->
            <Input id="nomorLegalitas" label="Nomor Legalitas Lahan" v-model="activeForm.nomorLegalitas" placeholder="Masukkan Nomor SHM / Surat Keterangan" :required="requiresNomorLegalitas" :error="getFieldError(editingIndex, 'nomorLegalitas')" />

            <!-- Tanggal Penerbitan -->
            <div class="flex flex-col gap-1.5">
              <label for="tanggalPenerbitan" class="text-xs md:text-sm font-semibold text-slate-700 flex items-center gap-1 font-apple-caption"> Tanggal Penerbitan Legalitas Lahan <span class="text-rose-500">*</span> </label>
              <input
                id="tanggalPenerbitan"
                type="date"
                v-model="activeForm.tanggalPenerbitanLegalitas"
                :max="new Date().toISOString().split('T')[0]"
                class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A]"
              />
              <p v-if="getFieldError(editingIndex, 'tanggalPenerbitanLegalitas')" class="text-xs text-rose-600 mt-0.5">
                {{ getFieldError(editingIndex, 'tanggalPenerbitanLegalitas') }}
              </p>
            </div>

            <!-- Luas Lahan -->
            <div class="flex flex-col gap-1.5">
              <label for="luasLahan" class="text-xs md:text-sm font-semibold text-slate-700 flex items-center gap-1 font-apple-caption"> Luas Lahan (Hektar) <span class="text-rose-500">*</span> </label>
              <div class="relative">
                <input
                  id="luasLahan"
                  type="number"
                  step="0.0001"
                  v-model.number="activeForm.luasLahan"
                  placeholder="Contoh: 1.5234"
                  @input="truncateLuasLahan"
                  class="w-full h-10 pl-3.5 pr-14 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A]"
                />
                <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">Hektar</span>
              </div>
              <p v-if="getFieldError(editingIndex, 'luasLahan')" class="text-xs text-rose-600 mt-0.5">
                {{ getFieldError(editingIndex, 'luasLahan') }}
              </p>
            </div>

            <!-- Tahun Tanam -->
            <YearPicker id="tahunTanam" label="Tahun Tanam" v-model="activeForm.tahunTanam" :min-year="1800" :max-year="new Date().getFullYear()" placeholder="Pilih Tahun Tanam" required :error="getFieldError(editingIndex, 'tahunTanam')" />

            <!-- Jenis Bibit -->
            <Input id="jenisBibit" label="Jenis Benih Tanaman Kelapa" v-model="activeForm.jenisBibit" placeholder="Contoh: Sulawesi 1 / MCC 02" required :error="getFieldError(editingIndex, 'jenisBibit')" />
          </div>

          <!-- TAB 2: ALAMAT & UNGGAH BERKAS -->
          <div v-show="activeTab === 'alamat'" class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Provinsi -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label class="text-xs md:text-sm font-semibold text-slate-700 font-apple-caption">Provinsi <span class="text-rose-500">*</span></label>
                <span v-if="isLoadingProvinces" class="text-[11px] text-emerald-600 animate-pulse font-medium">Memuat provinsi...</span>
                <button
                  v-else-if="provinsiList.length === 0"
                  type="button"
                  @click="loadWilayah"
                  class="text-[11px] text-rose-600 hover:underline flex items-center gap-0.5"
                >
                  <RotateCcw class="w-3 h-3" /> Coba Lagi
                </button>
              </div>
              <select
                v-model="activeForm.provinsiKode"
                :disabled="isLoadingProvinces"
                @change="handleProvinsiChange"
                class="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs md:text-sm focus:outline-none focus:border-[#066C2A] focus:ring-2 focus:ring-[#066C2A]/20 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">{{ isLoadingProvinces ? 'Memuat daftar provinsi...' : 'Pilih Provinsi' }}</option>
                <option v-for="prov in provinsiList" :key="prov.id" :value="String(prov.id)">{{ prov.name }}</option>
              </select>
              <p v-if="getFieldError(editingIndex, 'provinsiKode')" class="text-xs text-rose-600 mt-0.5">
                {{ getFieldError(editingIndex, 'provinsiKode') }}
              </p>
            </div>

            <!-- Kabupaten -->
            <div class="flex flex-col gap-1.5">
              <div class="flex items-center justify-between">
                <label class="text-xs md:text-sm font-semibold text-slate-700 font-apple-caption">Kabupaten / Kota <span class="text-rose-500">*</span></label>
                <span v-if="isLoadingKabupaten" class="text-[11px] text-emerald-600 animate-pulse font-medium">Memuat kabupaten...</span>
              </div>
              <select
                v-model="activeForm.kabupatenKode"
                :disabled="!activeForm.provinsiKode || isLoadingKabupaten"
                @change="handleKabupatenChange"
                class="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs md:text-sm focus:outline-none focus:border-[#066C2A] focus:ring-2 focus:ring-[#066C2A]/20 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value="">{{ !activeForm.provinsiKode ? 'Pilih Provinsi terlebih dahulu' : isLoadingKabupaten ? 'Memuat kabupaten/kota...' : 'Pilih Kabupaten / Kota' }}</option>
                <option v-for="kab in kabupatenList" :key="kab.id" :value="String(kab.id)">{{ kab.name }}</option>
              </select>
              <p v-if="getFieldError(editingIndex, 'kabupatenKode')" class="text-xs text-rose-600 mt-0.5">
                {{ getFieldError(editingIndex, 'kabupatenKode') }}
              </p>
            </div>

            <!-- Kecamatan -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs md:text-sm font-semibold text-slate-700 font-apple-caption">Kecamatan <span class="text-rose-500">*</span></label>
              <input
                type="text"
                v-model="activeForm.kecamatanKode"
                :disabled="!activeForm.kabupatenKode"
                placeholder="Contoh: Masamba"
                class="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs md:text-sm text-slate-900 focus:outline-none focus:border-[#066C2A] focus:ring-2 focus:ring-[#066C2A]/20 disabled:bg-slate-50 disabled:text-slate-400"
              />
              <p v-if="getFieldError(editingIndex, 'kecamatanKode')" class="text-xs text-rose-600 mt-0.5">
                {{ getFieldError(editingIndex, 'kecamatanKode') }}
              </p>
            </div>

            <!-- Desa -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs md:text-sm font-semibold text-slate-700 font-apple-caption">Desa <span class="text-rose-500">*</span></label>
              <input
                type="text"
                v-model="activeForm.desaKode"
                :disabled="!activeForm.kecamatanKode"
                placeholder="Contoh: Desa Bone"
                class="h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-xs md:text-sm text-slate-900 focus:outline-none focus:border-[#066C2A] focus:ring-2 focus:ring-[#066C2A]/20 disabled:bg-slate-50 disabled:text-slate-400"
              />
              <p v-if="getFieldError(editingIndex, 'desaKode')" class="text-xs text-rose-600 mt-0.5">
                {{ getFieldError(editingIndex, 'desaKode') }}
              </p>
            </div>

            <!-- Alamat Detail -->
            <div class="flex flex-col gap-1.5 sm:col-span-2">
              <label for="alamatKebun" class="text-xs md:text-sm font-semibold text-slate-700 flex items-center gap-1 font-apple-caption"> Alamat Lengkap / Blok Kebun <span class="text-rose-500">*</span> </label>
              <input
                id="alamatKebun"
                type="text"
                v-model="activeForm.alamatKebun"
                placeholder="Contoh: Dusun Makmur, Blok A1"
                class="w-full h-10 px-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A]"
              />
              <p v-if="getFieldError(editingIndex, 'alamatKebun')" class="text-xs text-rose-600 mt-0.5">
                {{ getFieldError(editingIndex, 'alamatKebun') }}
              </p>
            </div>

            <!-- FileUpload for scan legalitas -->
            <div class="flex flex-col gap-2 sm:col-span-2 mt-2">
              <div class="flex items-center justify-between">
                <span class="text-xs md:text-sm font-semibold text-slate-800">Scan Dokumen Legalitas Lahan (PDF/JPG maks 10MB) <span class="text-rose-500">*</span></span>
                <Badge v-slot v-if="isExistingDoc(activeForm.scanLegalitas)" variant="success">Sudah Diunggah</Badge>
                <Badge v-slot v-else-if="activeForm.scanLegalitas" variant="success">Sudah Dipilih</Badge>
                <Badge v-slot v-else variant="danger">Wajib</Badge>
              </div>
              <FileUpload
                id="scanLegalitas"
                accept=".pdf,.png,.jpg,.jpeg"
                placeholder="Unggah scan sertifikat/dokumen legalitas (PDF/JPG maks 10MB)"
                :initial-file-name="getDocName(activeForm.scanLegalitas)"
                @file-selected="handleFileSelected"
              />
              <!-- <button v-if="getDocUrl(activeForm.scanLegalitas)" type="button" class="text-xs font-semibold text-[#066C2A] hover:underline self-start" @click="window.open(getDocUrl(activeForm.scanLegalitas), '_blank')">Lihat Dokumen Legalitas</button> -->
              <p v-if="getFieldError(editingIndex, 'scanLegalitas')" class="text-xs text-rose-600">
                {{ getFieldError(editingIndex, 'scanLegalitas') }}
              </p>
            </div>

            <!-- FileUpload for scan beda nama lahan -->
            <div class="flex flex-col gap-2 sm:col-span-2 mt-2">
              <div class="flex items-center justify-between">
                <span class="text-xs md:text-sm font-semibold text-slate-800"> Scan Surat Keterangan Beda Nama Pada Legalitas Lahan </span>
                <div class="flex items-center gap-2">
                  <Badge v-if="isExistingDoc(activeForm.scanBedaNamaLahan)" variant="success">Sudah Diunggah</Badge>
                  <Badge v-else-if="activeForm.scanBedaNamaLahan" variant="success">Sudah Dipilih</Badge>
                  <button v-if="activeForm.scanBedaNamaLahan" type="button" class="p-1 rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-600 transition-colors" title="Hapus berkas" @click="activeForm.scanBedaNamaLahan = null">
                    <X class="w-3.5 h-3.5" />
                  </button>
                  <a v-if="!activeForm.scanBedaNamaLahan" href="/templates/format-surat-beda-nama.docx" download class="flex items-center gap-1 text-[10px] font-semibold text-[#066C2A] hover:underline shrink-0">
                    <Download class="w-3 h-3" /> Format
                  </a>
                </div>
              </div>
              <Input id="nomorSuratBedaNama" label="Nomor Surat Keterangan Beda Nama pada persyaratan Lahan" v-model="activeForm.nomorSuratBedaNama" placeholder="Masukkan nomor surat keterangan beda nama pada persyaratan Lahan" />
              <FileUpload
                id="scanBedaNamaLahan"
                accept=".pdf,.png,.jpg,.jpeg"
                placeholder="Unggah Scan Surat Keterangan Beda Nama pada persyaratan Lahan (PDF/JPG maks 10MB)"
                :initial-file-name="getDocName(activeForm.scanBedaNamaLahan)"
                @file-selected="handleBedaNamaSelected"
              />
              <!-- <button v-if="getDocUrl(activeForm.scanBedaNamaLahan)" type="button" class="text-xs font-semibold text-[#066C2A] hover:underline self-start" @click="window.open(getDocUrl(activeForm.scanBedaNamaLahan), '_blank')">
                Lihat Dokumen Beda Nama
              </button> -->
            </div>
          </div>

          <!-- TAB 3: SPASIAL & KOORDINAT POLIGON (PETA) -->
          <div v-show="activeTab === 'peta'" class="flex flex-col gap-4">
            <div class="flex flex-col">
              <p class="text-[11px] text-slate-500">
                Edit angka langsung pada sel input. Anda dapat menempelkan (<kbd class="px-1 py-0.5 bg-slate-100 border border-slate-300 rounded font-semibold text-[10px]">Ctrl+V</kbd>) kolom dari Excel ke sel mana pun, atau seret baris
                menggunakan grip <span class="inline-block align-middle font-bold text-slate-400">::</span> untuk mengurutkan.
              </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-1">
              <!-- Left: Coordinates Table -->
              <div class="flex flex-col gap-3">
                <p v-if="pasteSuccessMsg" class="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex items-center gap-1.5 shadow-xs">
                  <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> {{ pasteSuccessMsg }}
                </p>

                <div class="border border-slate-200 rounded-xl overflow-hidden shadow-xs bg-white">
                  <div class="overflow-x-auto max-h-[220px] scrollbar-thin">
                    <table class="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr class="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                          <th class="p-3 w-16 text-center">No</th>
                          <th class="p-3">Latitude</th>
                          <th class="p-3">Longitude</th>
                          <th class="p-3 w-16 text-center">Hapus</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr
                          v-for="(row, index) in coordinateRows"
                          :key="row.order"
                          @dragover="onDragOver"
                          @drop="onDrop(index)"
                          :class="['border-b border-slate-100 hover:bg-slate-50 transition-colors', dragIndex === index ? 'opacity-30 bg-slate-100' : '']"
                        >
                          <td class="p-2 text-center align-middle">
                            <div
                              draggable="true"
                              @dragstart="onDragStart(index)"
                              class="flex items-center justify-center gap-1.5 cursor-grab active:cursor-grabbing text-slate-400 hover:text-[#066C2A] select-none"
                              title="Seret untuk memindahkan urutan"
                            >
                              <GripVertical class="w-3.5 h-3.5 shrink-0" />
                              <span class="font-bold text-slate-500 font-mono">{{ index + 1 }}</span>
                            </div>
                          </td>
                          <td class="p-2">
                            <input
                              v-model.number="row.lat"
                              type="number"
                              step="0.000001"
                              placeholder="-2.583100"
                              @paste="handleInputPaste(index, $event)"
                              class="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-mono focus:outline-none focus:border-[#066C2A] focus:ring-1 focus:ring-[#066C2A] transition-all"
                            />
                          </td>
                          <td class="p-2">
                            <input
                              v-model.number="row.lng"
                              type="number"
                              step="0.000001"
                              placeholder="120.312100"
                              @paste="handleInputPaste(index, $event)"
                              class="w-full h-8 px-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:bg-white text-xs font-mono focus:outline-none focus:border-[#066C2A] focus:ring-1 focus:ring-[#066C2A] transition-all"
                            />
                          </td>
                          <td class="p-2 text-center align-middle">
                            <button type="button" class="p-1.5 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors" @click="removeCoordinateRow(index)">
                              <Trash2 class="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                        <tr v-if="coordinateRows.length === 0">
                          <td colspan="4" class="p-6 text-center text-slate-400">{{ LOCALIZATION.cpclForm.koordinat.emptyState }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div v-if="generalMessages.length" class="rounded-xl border border-amber-200 bg-amber-50/50 p-3 text-xs text-amber-800 space-y-1">
                  <p v-for="message in generalMessages" :key="message" class="font-medium">• {{ message }}</p>
                </div>

                <!-- Row controls -->
                <div class="flex items-center justify-between border-t border-slate-100 pt-3">
                  <span v-if="getFieldError(editingIndex, 'coordinates')" class="text-xs text-rose-600 font-semibold">
                    {{ getFieldError(editingIndex, 'coordinates') }}
                  </span>
                  <span v-else></span>

                  <div class="flex items-center gap-2">
                    <Button type="button" variant="outline" size="sm" class="flex items-center gap-1 text-slate-600" @click="resetCoordinates">
                      <RotateCcw class="w-3.5 h-3.5 text-slate-500" /> {{ LOCALIZATION.cpclForm.koordinat.resetButton }}
                    </Button>
                    <Button type="button" variant="primary" size="sm" class="flex items-center gap-1 font-semibold" @click="addCoordinateRow"> <Plus class="w-3.5 h-3.5" /> Tambah Baris </Button>
                  </div>
                </div>
              </div>

              <!-- Right: Map Preview -->
              <div class="flex flex-col gap-2">
                <label class="text-xs md:text-sm font-semibold text-slate-700 font-apple-caption">{{ LOCALIZATION.cpclForm.koordinat.map.preview }}</label>
                <div class="h-[220px] w-full overflow-hidden rounded-xl border border-slate-300 bg-slate-100 relative shadow-inner">
                  <div ref="mapContainer" class="h-full w-full z-0"></div>
                </div>
                <p v-if="polygonState.isValid" class="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                  <MapPin class="w-4 h-4 text-[#066C2A]" /> {{ LOCALIZATION.cpclForm.koordinat.map.valid.replace('{count}', polygonState.points.length.toString()) }}
                </p>
                <p v-else class="text-xs text-slate-500">{{ LOCALIZATION.cpclForm.koordinat.map.invalid }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Accordion Save/Cancel Footer Actions -->
        <div class="bg-slate-50 border-t border-slate-200 px-4 py-3 flex items-center justify-between rounded-b-xl">
          <Button type="button" variant="outline" size="sm" class="flex items-center gap-1 text-slate-600 font-semibold" @click="cancelEdit"> Batal </Button>

          <div class="flex items-center gap-2">
            <Button v-if="activeTab !== 'legalitas'" type="button" variant="outline" size="sm" class="flex items-center gap-1.5 text-slate-600 font-semibold" @click="activeTab = activeTab === 'peta' ? 'alamat' : 'legalitas'">
              <ChevronLeft class="w-4 h-4" /> Kembali
            </Button>

            <Button v-if="activeTab === 'legalitas'" type="button" variant="primary" size="sm" class="flex items-center gap-1.5 font-semibold" @click="activeTab = 'alamat'">
              Lanjut ke Wilayah & Berkas <ChevronRight class="w-4 h-4" />
            </Button>
            <Button v-else-if="activeTab === 'alamat'" type="button" variant="primary" size="sm" class="flex items-center gap-1.5 font-semibold" @click="activeTab = 'peta'"> Lanjut ke Poligon Lahan <ChevronRight class="w-4 h-4" /> </Button>
            <Button v-else-if="activeTab === 'peta'" type="button" variant="primary" size="sm" class="flex items-center gap-1.5 font-semibold bg-[#066C2A] text-white hover:bg-emerald-800" @click="saveLahan">
              <Check class="w-4 h-4" /> Simpan Lahan
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Card>
</template>
