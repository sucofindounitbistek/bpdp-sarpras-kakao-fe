<script setup lang="ts">
import { ref, computed } from 'vue';
import { ArrowLeft, X, Eye, FileText, User, MapPin } from 'lucide-vue-next';
import { TipeDokumenPekebun } from '@/types/pekebun';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import SatelliteMapPreview from '@/components/ui/SatelliteMapPreview.vue';

const props = withDefaults(
  defineProps<{
    pekebun: any;
    lahans?: any[];
    proposalId?: string | number;
    showBackButton?: boolean;
    isModal?: boolean;
  }>(),
  {
    lahans: () => [],
    showBackButton: false,
    isModal: false,
  },
);

const emit = defineEmits<{
  (e: 'back'): void;
  (e: 'close'): void;
}>();

const statusLabels: Record<string, string> = {
  BELUM_MENIKAH: 'Belum Menikah',
  MENIKAH: 'Menikah',
  CERAI_HIDUP: 'Cerai Hidup',
  CERAI_MATI: 'Cerai Mati',
};

const dokumenLabels: Record<string, string> = {
  SCAN_KTP: 'Scan KTP',
  SCAN_KK: 'Scan KK',
  SWAFOTO: 'Swafoto',
  SURAT_KUASA: 'Surat Kuasa',
  SCAN_LEGALITAS: 'Scan Legalitas Lahan',
  SURAT_KETERANGAN_KEPALA_DESA: 'Surat Keterangan Kepala Desa',
  SURAT_KETERANGAN_BEDA_NAMA: 'Surat Keterangan Kepala Desa',
  SURAT_BEDA_NAMA: 'Surat Keterangan Kepala Desa',
  FOTO_UDARA: 'Foto Udara Lahan',
};

function isSuratKeteranganKades(docType: string): boolean {
  const t = String(docType || '').toUpperCase().trim();
  return (
    t === 'SURAT_KETERANGAN_KEPALA_DESA' ||
    t === 'SURAT_KETERANGAN_BEDA_NAMA' ||
    t === 'SURAT_BEDA_NAMA' ||
    t === 'SURAT_KET_KADES' ||
    t.includes('BEDA_NAMA') ||
    t.includes('KEPALA_DESA') ||
    t.includes('KADES')
  );
}

function isScanLegalitas(docType: string): boolean {
  const t = String(docType || '').toUpperCase().trim();
  return t === 'SCAN_LEGALITAS' || t.includes('LEGALITAS');
}

function formatDate(val: any): string {
  if (!val) return '-';
  try {
    const d = new Date(val);
    if (isNaN(d.getTime())) return String(val);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  } catch {
    return String(val);
  }
}

// Normalized pekebun identity
const farmerName = computed(() => props.pekebun?.name || props.pekebun?.nama || props.pekebun?.namaPekebun || '-');
const farmerNik = computed(() => props.pekebun?.nik || '-');
const farmerKk = computed(() => props.pekebun?.nomor_kk || props.pekebun?.nomorKK || '-');
const farmerStatus = computed(() => {
  const st = props.pekebun?.marriage_status || props.pekebun?.statusPernikahan || '';
  return statusLabels[st] || st || '-';
});
const farmerBirth = computed(() => {
  const place = props.pekebun?.place_of_birth || props.pekebun?.tempatLahir || '';
  const date = props.pekebun?.date_of_birth || props.pekebun?.tanggalLahir || '';
  if (place && date) return `${place}, ${formatDate(date)}`;
  if (place) return place;
  if (date) return formatDate(date);
  return '-';
});
const farmerPhone = computed(() => props.pekebun?.phone_number || props.pekebun?.nomorHP || '-');
const farmerAddress = computed(() => {
  const addr = props.pekebun?.address || props.pekebun?.alamat || '-';
  const post = props.pekebun?.postcode || props.pekebun?.kodepos || '';
  return post ? `${addr}, ${post}` : addr;
});

// Normalized Lahans
const pekebunLahans = computed(() => {
  if (props.lahans && props.lahans.length > 0) {
    return props.lahans;
  }
  if (props.pekebun?.lahans && Array.isArray(props.pekebun.lahans) && props.pekebun.lahans.length > 0) {
    return props.pekebun.lahans;
  }
  if (props.pekebun?.lahan) {
    return [props.pekebun.lahan];
  }
  return [];
});

const activeLahanIndex = ref(0);

const activeLahan = computed(() => {
  if (pekebunLahans.value.length === 0) return null;
  return pekebunLahans.value[activeLahanIndex.value] || pekebunLahans.value[0];
});

// Farmer identity docs
const farmerDocs = computed(() => {
  const rawDocs = props.pekebun?.documents || props.pekebun?.dokumen || [];
  return rawDocs.map((d: any, idx: number) => ({
    id: String(d.id || `fdoc-${idx}`),
    documentType: String(d.document_type || d.documentType || d.tipeDokumen || '').toUpperCase().trim(),
    fileName: d.file_name || d.fileName || d.namaFile || 'Dokumen Pekebun',
    fileUrl: d.file_url || d.fileUrl || d.urlFile || '',
    mimeType: d.mime_type || d.mimeType || 'application/pdf',
    fileExtension: d.file_extension || d.fileExtension || 'pdf',
    isLahanDoc: false,
  }));
});

// Lahan docs grouped
const lahanDocs = computed(() => {
  const docs: any[] = [];
  const lahansToScan = pekebunLahans.value;
  for (let idx = 0; idx < lahansToScan.length; idx++) {
    const l = lahansToScan[idx];
    const lahanNum = idx + 1;
    const lDocs = l.documents || l.dokumen || l.dokumen_lahan || [];
    for (const d of lDocs) {
      const rawType = String(d.document_type || d.documentType || d.tipeDokumen || '').toUpperCase().trim();
      let docType = rawType;
      let label = 'Dokumen Lahan';
      if (isScanLegalitas(rawType)) {
        docType = 'SCAN_LEGALITAS';
        label = 'Scan Legalitas Lahan';
      } else if (isSuratKeteranganKades(rawType)) {
        docType = 'SURAT_KETERANGAN_KEPALA_DESA';
        label = 'Surat Keterangan Kepala Desa';
      } else if (rawType === 'FOTO_UDARA' || rawType.includes('FOTO_UDARA')) {
        docType = 'FOTO_UDARA';
        label = 'Foto Udara Lahan';
      }

      docs.push({
        id: String(d.id || `ldoc-${lahanNum}-${docs.length}`),
        documentType: docType,
        fileName: d.file_name || d.fileName || d.namaFile || label,
        fileUrl: d.file_url || d.fileUrl || d.urlFile || '',
        mimeType: d.mime_type || d.mimeType || 'application/pdf',
        fileExtension: d.file_extension || d.fileExtension || 'pdf',
        lahan: l,
        lahanIndex: lahanNum,
        lahanLabel: `Lahan ${lahanNum}`,
        isLahanDoc: true,
      });
    }

    // Fallback for standalone legalitas URL
    const hasLegalitas = docs.some((d) => String(d.lahan?.id) === String(l.id) && isScanLegalitas(d.documentType));
    if (!hasLegalitas && (l.scanLegalitasUrl || l.scan_legalitas_url)) {
      docs.push({
        id: `lahan-${l.id || idx}-legalitas`,
        documentType: 'SCAN_LEGALITAS',
        fileName: 'Scan Legalitas Lahan',
        fileUrl: l.scanLegalitasUrl || l.scan_legalitas_url,
        mimeType: 'application/pdf',
        fileExtension: 'pdf',
        lahan: l,
        lahanIndex: lahanNum,
        lahanLabel: `Lahan ${lahanNum}`,
        isLahanDoc: true,
      });
    }

    // Fallback for surat keterangan beda nama
    const hasKades = docs.some((d) => String(d.lahan?.id) === String(l.id) && isSuratKeteranganKades(d.documentType));
    if (!hasKades && (l.scanBedaNamaLahan || l.suratKeteranganBedaNamaUrl || l.scanBedaNamaUrl)) {
      const url = l.scanBedaNamaLahan?.fileUrl || l.suratKeteranganBedaNamaUrl || l.scanBedaNamaUrl;
      docs.push({
        id: `lahan-${l.id || idx}-kades`,
        documentType: 'SURAT_KETERANGAN_KEPALA_DESA',
        fileName: 'Surat Keterangan Kepala Desa',
        fileUrl: url,
        mimeType: 'application/pdf',
        fileExtension: 'pdf',
        lahan: l,
        lahanIndex: lahanNum,
        lahanLabel: `Lahan ${lahanNum}`,
        isLahanDoc: true,
      });
    }
  }
  return docs;
});

const lahansWithDocs = computed(() => {
  return pekebunLahans.value.map((l: any, idx: number) => {
    const docs = lahanDocs.value.filter((d: any) => String(d.lahan?.id) === String(l.id) || d.lahanIndex === idx + 1);
    return {
      lahan: l,
      index: idx + 1,
      label: `Lahan ${idx + 1}`,
      docs,
    };
  });
});

const allDocs = computed(() => [...farmerDocs.value, ...lahanDocs.value]);

const selectedDocId = ref<string | null>(null);

function selectDoc(docId: string) {
  selectedDocId.value = selectedDocId.value === docId ? null : docId;
  const doc = allDocs.value.find((d) => d.id === docId);
  if (doc?.isLahanDoc && doc.lahanIndex) {
    activeLahanIndex.value = doc.lahanIndex - 1;
  }
}

const selectedDoc = computed(() => allDocs.value.find((d) => d.id === selectedDocId.value) || null);

// Document preview modal
const previewDoc = ref<{ dataUrl: string; mimeType: string; title: string } | null>(null);
const showPreviewModal = ref(false);

function openPreview(doc: any) {
  if (!doc) return;
  previewDoc.value = {
    dataUrl: doc.fileUrl || doc.file_url || doc.urlFile || '',
    mimeType: doc.mimeType || doc.mime_type || doc.fileExtension || 'application/pdf',
    title: doc.fileName || doc.file_name || doc.namaFile || 'Dokumen',
  };
  showPreviewModal.value = true;
}

// Auto-select first doc on mounted if available
if (allDocs.value.length > 0 && !selectedDocId.value) {
  selectedDocId.value = allDocs.value[0].id;
}
</script>

<template>
  <div :class="['flex flex-col gap-6', isModal ? 'p-1' : 'p-4 md:p-8 min-h-screen bg-transparent mx-auto']">
    <!-- Top Header -->
    <div class="flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <button
          v-if="showBackButton"
          type="button"
          @click="emit('back')"
          class="w-9 h-9 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors cursor-pointer"
          title="Kembali"
        >
          <ArrowLeft class="w-4 h-4 text-slate-600" />
        </button>
        <div class="flex flex-col gap-0.5">
          <h2 class="text-lg font-bold text-slate-900">Pratinjau Pekebun</h2>
          <p class="text-xs text-slate-500">
            {{ farmerName }} &mdash; NIK: {{ farmerNik }}
          </p>
        </div>
      </div>

      <button
        v-if="isModal"
        type="button"
        @click="emit('close')"
        class="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
        title="Tutup"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!pekebun" class="p-8 text-center text-slate-400 text-sm bg-white rounded-xl border border-slate-200">
      Data pekebun tidak ditemukan.
    </div>

    <template v-else>
      <!-- Documents Section -->
      <div v-if="allDocs.length > 0" class="flex flex-col gap-4">
        <div>
          <h3 class="text-sm font-bold text-slate-800">Dokumen Pekebun & Lahan</h3>
          <p class="text-xs text-slate-400 mt-0.5">Pilih dokumen untuk melihat pratinjau berkas dan kesesuaian data.</p>
        </div>

        <!-- Section 1: Dokumen Identitas Pekebun -->
        <div v-if="farmerDocs.length > 0" class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Dokumen Identitas Pekebun</span>
            <span class="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">{{ farmerDocs.length }} Dokumen</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              v-for="doc in farmerDocs"
              :key="doc.id"
              type="button"
              @click="selectDoc(doc.id)"
              :class="[
                'flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer',
                selectedDocId === doc.id
                  ? 'border-[#066C2A] bg-emerald-50/40 shadow-xs ring-1 ring-[#066C2A]'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              ]"
            >
              <div class="flex flex-col gap-0.5 min-w-0 flex-1">
                <span class="text-xs font-semibold text-slate-800 truncate">{{ dokumenLabels[doc.documentType] || doc.documentType }}</span>
                <span class="text-[10px] text-slate-400 truncate">{{ doc.fileName }}</span>
              </div>
              <Eye class="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>
          </div>
        </div>

        <!-- Section 2: Dokumen Lahan -->
        <div v-if="lahanDocs.length > 0" class="flex flex-col gap-3">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-600 uppercase tracking-wider">Dokumen Lahan</span>
              <span class="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                {{ pekebunLahans.length }} Lahan Terdaftar (Total {{ lahanDocs.length }} Dokumen)
              </span>
            </div>
          </div>

          <!-- Grouped by Lahan Cards -->
          <div class="flex flex-col gap-3">
            <div
              v-for="lItem in lahansWithDocs"
              :key="lItem.lahan.id || lItem.index"
              class="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex flex-col gap-2.5"
            >
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                    {{ lItem.label }}
                  </span>
                  <span class="text-xs font-semibold text-slate-700">
                    {{ lItem.lahan.jenis_legalitas || lItem.lahan.jenisLegalitas || 'SHM' }} &mdash; {{ lItem.lahan.nomor_legalitas || lItem.lahan.nomorLegalitas || '-' }}
                  </span>
                  <span class="text-xs text-slate-500">({{ lItem.lahan.luas_lahan || lItem.lahan.luasLahan || 0 }} Ha)</span>
                </div>
                <div v-if="lItem.lahan.nomor_surat_beda_nama || lItem.lahan.nomorSuratBedaNama" class="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                  SBN: {{ lItem.lahan.nomor_surat_beda_nama || lItem.lahan.nomorSuratBedaNama }}
                </div>
              </div>

              <!-- Cards for this Lahan -->
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                <button
                  v-for="doc in lItem.docs"
                  :key="doc.id"
                  type="button"
                  @click="selectDoc(doc.id)"
                  :class="[
                    'flex items-center gap-3 p-3 rounded-xl border text-left transition-all cursor-pointer',
                    selectedDocId === doc.id
                      ? 'border-[#066C2A] bg-white shadow-xs ring-1 ring-[#066C2A]'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  ]"
                >
                  <div class="flex flex-col gap-0.5 min-w-0 flex-1">
                    <span class="text-xs font-semibold text-slate-800 truncate">
                      {{ dokumenLabels[doc.documentType] || doc.documentType }}
                    </span>
                    <span class="text-[10px] text-slate-400 truncate">{{ doc.fileName }}</span>
                    <span v-if="isSuratKeteranganKades(doc.documentType) && (lItem.lahan.nomor_surat_beda_nama || lItem.lahan.nomorSuratBedaNama)" class="text-[9px] text-amber-700 font-mono truncate">
                      No: {{ lItem.lahan.nomor_surat_beda_nama || lItem.lahan.nomorSuratBedaNama }}
                    </span>
                  </div>
                  <Eye class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Document Preview Panel (Without Validation Buttons) -->
      <template v-if="selectedDoc">
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div class="flex flex-col md:flex-row">
            <!-- Left: Document Preview Box -->
            <div class="md:w-1/2 bg-slate-100 flex items-center justify-center p-4 min-h-[280px] cursor-pointer relative" @click="openPreview(selectedDoc)">
              <img
                v-if="selectedDoc.mimeType?.startsWith('image/') || selectedDoc.fileUrl?.match(/\.(jpeg|jpg|png|webp)$/i)"
                :src="selectedDoc.fileUrl"
                :alt="selectedDoc.fileName"
                class="max-w-full max-h-[380px] object-contain rounded-lg shadow-xs"
              />
              <div v-else class="flex flex-col items-center justify-center gap-2 p-6 text-center text-slate-500">
                <FileText class="w-12 h-12 text-slate-400" />
                <span class="text-xs font-semibold text-slate-700">{{ selectedDoc.fileName }}</span>
                <span class="text-[10px] text-slate-400">Klik untuk melihat berkas secara penuh</span>
              </div>
              <div class="absolute top-3 right-3">
                <button
                  type="button"
                  @click.stop="openPreview(selectedDoc)"
                  class="bg-black/60 text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-black/80 transition-colors cursor-pointer"
                >
                  <Eye class="w-3 h-3" /> Perbesar
                </button>
              </div>
            </div>

            <!-- Right: Document Associated Data -->
            <div class="md:w-1/2 p-5 flex flex-col gap-4">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {{ dokumenLabels[selectedDoc.documentType] || selectedDoc.documentType }}
                </span>
                <span v-if="selectedDoc.lahanLabel" class="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                  {{ selectedDoc.lahanLabel }}
                </span>
                <span class="text-[10px] text-slate-400">{{ selectedDoc.fileName }}</span>
              </div>

              <!-- KTP fields -->
              <template v-if="selectedDoc.documentType === 'SCAN_KTP' || selectedDoc.documentType === TipeDokumenPekebun.SCAN_KTP">
                <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span class="text-[10px] text-slate-400 uppercase tracking-wider">Nama Lengkap</span>
                  <p class="text-sm font-semibold text-slate-800">{{ farmerName }}</p>
                </div>
                <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span class="text-[10px] text-slate-400 uppercase tracking-wider">NIK</span>
                  <p class="text-sm font-mono text-slate-800">{{ farmerNik }}</p>
                </div>
              </template>

              <!-- KK fields -->
              <template v-else-if="selectedDoc.documentType === 'SCAN_KK' || selectedDoc.documentType === TipeDokumenPekebun.SCAN_KK">
                <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span class="text-[10px] text-slate-400 uppercase tracking-wider">Nomor KK</span>
                  <p class="text-sm font-mono text-slate-800">{{ farmerKk }}</p>
                </div>
              </template>

              <!-- Swafoto / Surat Kuasa -->
              <template v-else-if="['SWAFOTO', 'SURAT_KUASA'].includes(selectedDoc.documentType)">
                <div class="p-3 bg-slate-50 rounded-lg border border-slate-100 flex flex-col gap-1">
                  <span class="text-[10px] text-slate-400 uppercase tracking-wider">Keterangan Dokumen</span>
                  <p class="text-xs text-slate-700">Berkas telah diunggah dan terverifikasi dalam pengajuan usulan.</p>
                </div>
              </template>

              <!-- Scan Legalitas Lahan fields -->
              <template v-else-if="selectedDoc.documentType === 'SCAN_LEGALITAS'">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span class="text-[10px] text-slate-400 uppercase tracking-wider">Jenis Legalitas</span>
                    <p class="text-sm font-semibold text-slate-800">
                      {{ selectedDoc.lahan?.jenis_legalitas || selectedDoc.lahan?.jenisLegalitas || '-' }}
                    </p>
                  </div>
                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span class="text-[10px] text-slate-400 uppercase tracking-wider">Nomor Legalitas</span>
                    <p class="text-sm font-mono text-slate-800">
                      {{ selectedDoc.lahan?.nomor_legalitas || selectedDoc.lahan?.nomorLegalitas || '-' }}
                    </p>
                  </div>
                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span class="text-[10px] text-slate-400 uppercase tracking-wider">Tanggal Penerbitan</span>
                    <p class="text-sm font-semibold text-slate-800">
                      {{ formatDate(selectedDoc.lahan?.tanggal_penerbitan_legalitas || selectedDoc.lahan?.tanggalPenerbitanLegalitas) }}
                    </p>
                  </div>
                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span class="text-[10px] text-slate-400 uppercase tracking-wider">Luas Lahan</span>
                    <p class="text-sm font-semibold text-slate-800">
                      {{ selectedDoc.lahan?.luas_lahan ?? selectedDoc.lahan?.luasLahan ?? 0 }} Ha
                    </p>
                  </div>
                </div>
              </template>

              <!-- Surat Keterangan Kades fields -->
              <template v-else-if="isSuratKeteranganKades(selectedDoc.documentType)">
                <div class="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <span class="text-[10px] text-slate-400 uppercase tracking-wider">Nomor Surat Beda Nama</span>
                  <p class="text-sm font-mono font-semibold text-slate-800">
                    {{ selectedDoc.lahan?.nomor_surat_beda_nama || selectedDoc.lahan?.nomorSuratBedaNama || '-' }}
                  </p>
                </div>
              </template>
            </div>
          </div>
        </div>
      </template>

      <!-- Identitas Card -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div class="flex items-center gap-2 mb-3">
          <User class="w-4 h-4 text-slate-500" />
          <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Identitas Pekebun</h3>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Nama Lengkap</span>
            <p class="font-semibold text-slate-800 mt-0.5">{{ farmerName }}</p>
          </div>
          <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-400 text-[10px] uppercase font-bold">NIK</span>
            <p class="font-mono text-slate-800 mt-0.5">{{ farmerNik }}</p>
          </div>
          <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-400 text-[10px] uppercase font-bold">No. KK</span>
            <p class="font-mono text-slate-800 mt-0.5">{{ farmerKk }}</p>
          </div>
          <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Status Pernikahan</span>
            <p class="font-semibold text-slate-800 mt-0.5">{{ farmerStatus }}</p>
          </div>
          <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Tempat, Tgl Lahir</span>
            <p class="text-slate-800 mt-0.5">{{ farmerBirth }}</p>
          </div>
          <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-400 text-[10px] uppercase font-bold">No. Handphone</span>
            <p class="text-slate-800 mt-0.5">{{ farmerPhone }}</p>
          </div>
          <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100 col-span-2 md:col-span-3">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Alamat Lengkap</span>
            <p class="text-slate-800 mt-0.5">{{ farmerAddress }}</p>
          </div>
        </div>
      </div>

      <!-- Lahan Section (With Multi-Lahan Tabs) -->
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div class="flex items-center gap-2">
            <MapPin class="w-4 h-4 text-slate-500" />
            <h3 class="text-xs font-bold text-slate-700 uppercase tracking-wider">Data Lahan Kebun</h3>
          </div>

          <!-- Lahan selector tabs if > 1 lahan -->
          <div v-if="pekebunLahans.length > 1" class="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              v-for="(l, idx) in pekebunLahans"
              :key="l.id || idx"
              type="button"
              @click="activeLahanIndex = idx"
              :class="[
                'px-3 py-1 text-xs rounded-md font-semibold transition-all cursor-pointer',
                activeLahanIndex === idx
                  ? 'bg-[#066C2A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              ]"
            >
              Lahan {{ idx + 1 }}
            </button>
          </div>
        </div>

        <div v-if="!activeLahan" class="p-6 text-center text-slate-400 text-xs">
          Data lahan tidak tersedia untuk pekebun ini.
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
          <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Luas Lahan</span>
            <p class="font-semibold text-slate-800 mt-0.5">{{ activeLahan.luas_lahan ?? activeLahan.luasLahan ?? 0 }} Ha</p>
          </div>
          <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Jenis Hak / Legalitas</span>
            <p class="text-slate-800 mt-0.5">{{ activeLahan.jenis_legalitas || activeLahan.jenisLegalitas || 'SHM' }}</p>
          </div>
          <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-400 text-[10px] uppercase font-bold">No. Surat Lahan</span>
            <p class="font-mono text-slate-800 mt-0.5">{{ activeLahan.nomor_legalitas || activeLahan.nomorLegalitas || '-' }}</p>
          </div>

          <div v-if="activeLahan.nomor_surat_beda_nama || activeLahan.nomorSuratBedaNama" class="p-2.5 bg-slate-50 rounded-lg border border-slate-100 col-span-2 md:col-span-3">
            <span class="text-slate-400 text-[10px] uppercase font-bold">No. Surat Keterangan Kepala Desa (Beda Nama)</span>
            <p class="font-mono text-slate-800 mt-0.5">{{ activeLahan.nomor_surat_beda_nama || activeLahan.nomorSuratBedaNama }}</p>
          </div>

          <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-100 col-span-2 md:col-span-3">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Koordinat</span>
            <p class="font-mono text-slate-800 break-all mt-0.5">
              {{ activeLahan.coordinates?.map((c: any) => `${c.lat}, ${c.lng}`).join('; ') || '-' }}
            </p>
          </div>

          <div v-if="activeLahan.provinsiNama || activeLahan.provinsi" class="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Provinsi</span>
            <p class="text-slate-800 mt-0.5">{{ activeLahan.provinsiNama || activeLahan.provinsi }}</p>
          </div>
          <div v-if="activeLahan.kabupatenNama || activeLahan.kabupaten" class="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Kabupaten</span>
            <p class="text-slate-800 mt-0.5">{{ activeLahan.kabupatenNama || activeLahan.kabupaten }}</p>
          </div>
          <div v-if="activeLahan.kecamatanNama || activeLahan.kecamatan" class="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Kecamatan</span>
            <p class="text-slate-800 mt-0.5">{{ activeLahan.kecamatanNama || activeLahan.kecamatan }}</p>
          </div>
          <div v-if="activeLahan.desaNama || activeLahan.desa" class="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Desa</span>
            <p class="text-slate-800 mt-0.5">{{ activeLahan.desaNama || activeLahan.desa }}</p>
          </div>
          <div v-if="activeLahan.alamat_kebun || activeLahan.alamatKebun" class="p-2.5 bg-slate-50 rounded-lg border border-slate-100 col-span-2 md:col-span-3">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Alamat Kebun</span>
            <p class="text-slate-800 mt-0.5">{{ activeLahan.alamat_kebun || activeLahan.alamatKebun }}</p>
          </div>
          <div v-if="activeLahan.tahun_tanam || activeLahan.tahunTanam" class="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Tahun Tanam</span>
            <p class="text-slate-800 mt-0.5">{{ activeLahan.tahun_tanam || activeLahan.tahunTanam }}</p>
          </div>
          <div v-if="activeLahan.jenis_bibit || activeLahan.jenisBibit" class="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
            <span class="text-slate-400 text-[10px] uppercase font-bold">Jenis Bibit</span>
            <p class="text-slate-800 mt-0.5">{{ activeLahan.jenis_bibit || activeLahan.jenisBibit }}</p>
          </div>

          <!-- Satellite Polygon Map View -->
          <div class="col-span-2 md:col-span-3 flex flex-col gap-1.5 p-3 bg-slate-50 rounded-xl border border-slate-200 mt-2">
            <span class="text-[10px] uppercase font-bold text-slate-400">Peta Poligon Lahan Kebun (Mode Satelit)</span>
            <SatelliteMapPreview
              :coordinates="activeLahan.coordinates"
              :luas-lahan="activeLahan.luas_lahan || activeLahan.luasLahan"
              height="280px"
            />
          </div>
        </div>
      </div>
    </template>

    <DocumentPreviewModal
      :isOpen="showPreviewModal"
      :title="previewDoc?.title || ''"
      :dataUrl="previewDoc?.dataUrl || ''"
      :mimeType="previewDoc?.mimeType || ''"
      @close="showPreviewModal = false"
    />
  </div>
</template>
