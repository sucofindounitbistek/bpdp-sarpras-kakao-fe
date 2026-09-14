<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import {
  Eye,
  CheckCircle2,
  FileText,
  ArrowLeft,
  ArrowRight,
  Users,
  AlertCircle,
  MapPin,
  Layers,
  ChevronDown,
  ChevronUp,
  Download,
  Trash2,
  Check,
  ShieldCheck,
} from 'lucide-vue-next';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useVerifikasiKabDraftStore } from '@/stores/verifikasiKabDraft';
import { useToast } from '@/composables/useToast';
import { DokumenUpload } from '@/types/pengusulan';
import FileUpload from '@/components/ui/FileUpload.vue';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import { LOCALIZATION } from '@/config/localization';
import { formatUploadedAt } from '@/utils/formatUploadedAt';

const route = useRoute();
const pengusulanStore = usePengusulanStore();
const verifikasiStore = useVerifikasiKabDraftStore();
const toast = useToast();

const id = route.params.id as string;
const pengajuan = computed(() => {
  if (pengusulanStore.activePengajuan && String(pengusulanStore.activePengajuan.id) === String(id)) {
    return pengusulanStore.activePengajuan;
  }
  return pengusulanStore.listPengajuan.find((p) => String(p.id) === String(id)) || pengusulanStore.listPengajuan[0];
});

const canProceed = computed(() => !!activeSkCpcl.value);

function fileToUpload(file: File, persyaratanName: string): Promise<DokumenUpload> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        persyaratanId: persyaratanName,
        namaFile: file.name,
        mimeType: file.type,
        ukuranBytes: file.size,
        dataUrl: reader.result as string,
        uploadedAt: new Date().toISOString(),
      });
    };
    reader.readAsDataURL(file);
  });
}

async function handleSkCpclUpload(file: File) {
  const doc = await fileToUpload(file, 'sk-cpcl');
  verifikasiStore.setSkCpcl(doc);
  toast.success(LOCALIZATION.stepDataCpcl.skCpcl.toast.success);
}

function handleRemoveSkCpcl() {
  verifikasiStore.removeSkCpcl();
  toast.info(LOCALIZATION.stepDataCpcl.skCpcl.toast.removed);
}

async function handleBeritaAcaraDokumenUpload(file: File) {
  const doc = await fileToUpload(file, 'berita-acara-dokumen');
  verifikasiStore.setBeritaAcaraDokumen(doc);
  toast.success(LOCALIZATION.stepDataCpcl.beritaAcaraDokumen.toast.success);
}

function handleRemoveBeritaAcaraDokumen() {
  verifikasiStore.removeBeritaAcaraDokumen();
  toast.info(LOCALIZATION.stepDataCpcl.beritaAcaraDokumen.toast.removed);
}

async function handleBeritaAcaraLapanganUpload(file: File) {
  const doc = await fileToUpload(file, 'berita-acara-lapangan');
  verifikasiStore.setBeritaAcaraLapangan(doc);
  toast.success(LOCALIZATION.stepDataCpcl.beritaAcaraLapangan.toast.success);
}

function handleRemoveBeritaAcaraLapangan() {
  verifikasiStore.removeBeritaAcaraLapangan();
  toast.info(LOCALIZATION.stepDataCpcl.beritaAcaraLapangan.toast.removed);
}

function getExistingDoc(docType: string): DokumenUpload | null {
  if (!pengajuan.value) return null;
  const docs = (pengajuan.value as any).documents || (pengajuan.value as any).dokumen || [];
  const found = (Array.isArray(docs) ? docs : []).find((d: any) => {
    const t = String(d.document_type || d.documentType || d.tipeDokumen || d.persyaratanId || '').toUpperCase().trim();
    return t === docType.toUpperCase().trim();
  });
  if (!found) return null;
  return {
    persyaratanId: docType,
    namaFile: found.file_name || found.fileName || found.namaFile || `${docType}.pdf`,
    mimeType: found.mime_type || found.mimeType || 'application/pdf',
    ukuranBytes: Number(found.file_size || found.fileSize || found.ukuranBytes) || 0,
    dataUrl: found.file_url || found.fileUrl || found.urlFile || found.dataUrl || '',
    uploadedAt: found.created_at || found.uploadedAt || '',
    uploadedBy: found.updated_by_name || found.created_by_name || found.uploadedBy || '',
    uploaded_at_formatted: formatUploadedAt(found.uploaded_at_formatted || found.uploadedAtFormatted, found.updated_at || found.created_at || found.uploaded_at),
    uploadedAtFormatted: formatUploadedAt(found.uploaded_at_formatted || found.uploadedAtFormatted, found.updated_at || found.created_at || found.uploaded_at),
  };
}

const activeBeritaAcaraDokumen = computed(() =>
  verifikasiStore.beritaAcaraDokumenRemoved
    ? null
    : (verifikasiStore.beritaAcaraDokumen || getExistingDoc('BERITA_ACARA_DOKUMEN'))
);
const activeBeritaAcaraLapangan = computed(() =>
  verifikasiStore.beritaAcaraLapanganRemoved
    ? null
    : (verifikasiStore.beritaAcaraLapangan || getExistingDoc('BERITA_ACARA_LAPANGAN'))
);
const activeSkCpcl = computed(() =>
  verifikasiStore.skCpclRemoved
    ? null
    : (verifikasiStore.skCpcl || getExistingDoc('SK_CPCL'))
);

function getDocVerification(key: string) {
  const v = verifikasiStore.getVerification(key);
  if (v && (v.status === 'REJECTED' || v.notes)) return v;
  const uppercaseKey = key.toUpperCase().replace(/-/g, '_');
  const v2 = verifikasiStore.getVerification(uppercaseKey);
  if (v2 && (v2.status === 'REJECTED' || v2.notes)) return v2;
  return v || v2;
}

function getRejectionOriginLabel(key: string): string {
  const v = getDocVerification(key);
  const role = String(v?.validatedByRole || '').toUpperCase();
  if (role.includes('BPDP_APPROVAL')) {
    return 'Catatan Revisi / Penolakan (BPDP Approval):';
  }
  if (role.includes('BPDP_VERIFIKATOR') || role.includes('BPDP')) {
    return 'Catatan Revisi / Penolakan (BPDP Verifikator):';
  }
  if (role.includes('DITJEN') || role.includes('PUSAT')) {
    return 'Catatan Revisi / Penolakan (Ditjen Perkebunan):';
  }
  if (role.includes('PROV')) {
    return 'Catatan Revisi / Penolakan (Dinas Provinsi):';
  }
  return 'Catatan Revisi / Penolakan:';
}

const previewDoc = ref<{ dataUrl: string; mimeType: string; title: string } | null>(null);
const showPreview = ref(false);

function openPreview(persyaratanName: string) {
  let doc: DokumenUpload | null = null;

  switch (persyaratanName) {
    case 'sk-cpcl':
      doc = activeSkCpcl.value;
      break;
    case 'berita-acara-dokumen':
      doc = activeBeritaAcaraDokumen.value;
      break;
    case 'berita-acara-lapangan':
      doc = activeBeritaAcaraLapangan.value;
      break;
    default:
      return;
  }

  if (!doc) return;

  previewDoc.value = {
    dataUrl: doc.dataUrl,
    mimeType: doc.mimeType,
    title: doc.namaFile,
  };

  showPreview.value = true;
}

function goToNextStep() {
  if (!activeSkCpcl.value) {
    toast.error('Dokumen SK CPCL wajib diunggah sebelum melanjutkan.');
    return;
  }
  verifikasiStore.currentStep = 4;
}

// --- CPCL Grouped & KPI Summary Logic ---
interface GroupedLahan {
  id: string;
  luasLahanHektar: number;
  jenisHakLahan: string;
  nomorSuratLahan: string;
  coordinates?: any[];
}

interface GroupedCpcl {
  key: string;
  namaPekebun: string;
  nik: string;
  lahans: GroupedLahan[];
  totalLuas: number;
}

const showCpclDetails = ref(false);

const groupedCpclList = computed<GroupedCpcl[]>(() => {
  const raw = pengajuan.value?.daftarCPCL || [];
  const map = new Map<string, GroupedCpcl>();

  for (const c of raw) {
    const key = (c.nik && String(c.nik).trim()) || (c.namaPekebun && String(c.namaPekebun).trim()) || String(c.id);
    if (!map.has(key)) {
      map.set(key, {
        key,
        namaPekebun: c.namaPekebun || 'Pekebun',
        nik: c.nik || '-',
        lahans: [],
        totalLuas: 0,
      });
    }

    const item = map.get(key)!;
    item.lahans.push({
      id: String(c.id),
      luasLahanHektar: Number(c.luasLahanHektar) || 0,
      jenisHakLahan: c.jenisHakLahan || 'Surat Lahan',
      nomorSuratLahan: c.nomorSuratLahan || '-',
      coordinates: c.coordinates,
    });
    item.totalLuas += Number(c.luasLahanHektar) || 0;
  }

  return Array.from(map.values());
});

const cpclSummary = computed(() => {
  const list = pengajuan.value?.daftarCPCL || [];
  const uniquePekebuns = groupedCpclList.value.length;
  const totalBidang = list.length;
  const totalLuas = list.reduce((sum: number, c: any) => sum + (Number(c.luasLahanHektar) || 0), 0);
  return {
    totalPekebun: uniquePekebuns,
    totalBidang,
    totalLuas: totalLuas.toFixed(2),
  };
});
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Top Header Banner -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-md bg-emerald-50 text-[#066C2A] text-[10px] font-bold tracking-wider uppercase border border-emerald-200/60">
            Tahap 2 Verifikasi
          </span>
          <span class="text-xs text-slate-400">&bull;</span>
          <span class="text-xs text-slate-500 font-medium">Asistensi &amp; Pengesahan Dokumen</span>
        </div>
        <h2 class="text-base sm:text-lg font-bold text-slate-900">Penerbitan &amp; Unggah Dokumen SK CPCL</h2>
        <p class="text-xs text-slate-500">
          Unggah Surat Keputusan (SK) CPCL yang telah ditandatangani Bupati/Kepala Dinas serta Berita Acara hasil verifikasi dokumen dan lapangan.
        </p>
      </div>

      <!-- Quick Status Pill -->
      <div class="flex items-center gap-2 shrink-0 self-start sm:self-center">
        <span
          v-if="canProceed"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-[#066C2A] border border-emerald-200 text-xs font-bold shadow-2xs"
        >
          <CheckCircle2 class="w-4 h-4 text-emerald-600" />
          <span>SK CPCL Siap Diajukan</span>
        </span>
        <span
          v-else
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold shadow-2xs"
        >
          <AlertCircle class="w-4 h-4 text-amber-600" />
          <span>Menunggu Unggah SK CPCL</span>
        </span>
      </div>
    </div>

    <!-- Section A: CPCL Summary KPI & Collapsible Reference Table -->
    <div class="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-emerald-50 text-[#066C2A] border border-emerald-100 flex items-center justify-center shrink-0">
            <Users class="w-4 h-4" />
          </div>
          <div class="flex flex-col">
            <span class="text-xs font-bold text-slate-800 uppercase tracking-wider">Ringkasan CPCL Terverifikasi</span>
            <span class="text-[11px] text-slate-500">Data calon pekebun dan calon lahan acuan pembuatan SK CPCL</span>
          </div>
        </div>

        <button
          type="button"
          @click="showCpclDetails = !showCpclDetails"
          class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all shadow-2xs cursor-pointer self-start sm:self-center"
        >
          <span>{{ showCpclDetails ? 'Sembunyikan Rincian CPCL' : 'Lihat Rincian Data CPCL' }}</span>
          <component :is="showCpclDetails ? ChevronUp : ChevronDown" class="w-3.5 h-3.5 text-slate-500" />
        </button>
      </div>

      <!-- 3 KPI Metric Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs shrink-0">
            <Users class="w-5 h-5 text-emerald-700" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Pekebun</span>
            <span class="text-base font-bold text-slate-900">{{ cpclSummary.totalPekebun }} Orang</span>
          </div>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs shrink-0">
            <MapPin class="w-5 h-5 text-emerald-700" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Luas Lahan</span>
            <span class="text-base font-bold text-emerald-800">{{ cpclSummary.totalLuas }} Hektar</span>
          </div>
        </div>

        <div class="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs shrink-0">
            <Layers class="w-5 h-5 text-emerald-700" />
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jumlah Bidang Kebun</span>
            <span class="text-base font-bold text-slate-900">{{ cpclSummary.totalBidang }} Bidang</span>
          </div>
        </div>
      </div>

      <!-- Collapsible Detailed CPCL Table -->
      <div v-show="showCpclDetails" class="overflow-x-auto border border-slate-200 rounded-xl mt-1">
        <table class="w-full text-left text-xs text-slate-700">
          <thead class="bg-slate-50 text-slate-800 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th class="p-3 w-12 text-center">No</th>
              <th class="p-3">Nama Pekebun &amp; NIK</th>
              <th class="p-3">Rincian Bidang Kebun</th>
              <th class="p-3 text-right">Total Luas</th>
              <th class="p-3 text-center">Status Lahan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="(p, idx) in groupedCpclList" :key="p.key" class="hover:bg-slate-50/70">
              <td class="p-3 text-center font-mono text-slate-400">{{ idx + 1 }}</td>
              <td class="p-3">
                <div class="flex flex-col min-w-0">
                  <span class="font-bold text-slate-900 text-xs">{{ p.namaPekebun }}</span>
                  <span class="font-mono text-[10px] text-slate-500">NIK: {{ p.nik }}</span>
                </div>
              </td>
              <td class="p-3">
                <div class="flex flex-col gap-1">
                  <div
                    v-for="(l, lIdx) in p.lahans"
                    :key="l.id"
                    class="inline-flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100"
                  >
                    <span class="font-bold text-slate-700">Bidang {{ lIdx + 1 }}:</span>
                    <span class="font-bold text-emerald-800 font-mono">{{ l.luasLahanHektar }} Ha</span>
                    <span class="text-slate-400">&bull;</span>
                    <span class="text-slate-500">{{ l.jenisHakLahan }} ({{ l.nomorSuratLahan }})</span>
                  </div>
                </div>
              </td>
              <td class="p-3 text-right font-bold text-emerald-800 font-mono text-xs">
                {{ p.totalLuas.toFixed(2) }} Ha
              </td>
              <td class="p-3 text-center">
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  <Check class="w-3 h-3" /> Terverifikasi
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Section B: 3 Document Cards (SK CPCL + 2 Berita Acara) -->
    <div class="flex flex-col gap-5">
      <!-- ========================================================= -->
      <!-- CARD 1: SK CPCL (MANDATORY / UTAMA)                        -->
      <!-- ========================================================= -->
      <div
        :class="[
          'bg-white rounded-2xl border shadow-xs overflow-hidden transition-all',
          activeSkCpcl ? 'border-emerald-300 ring-1 ring-emerald-200/60' : 'border-slate-200/90'
        ]"
      >
        <!-- Card Header -->
        <div class="p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-emerald-50 text-[#066C2A] border border-emerald-200/80 flex items-center justify-center shrink-0">
              <ShieldCheck class="w-5 h-5" />
            </div>
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-900">1. {{ LOCALIZATION.stepDataCpcl.skCpcl.title }}</h3>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Wajib Disahkan
                </span>
              </div>
              <p class="text-xs text-slate-500">
                Surat Keputusan penetapan Calon Pekebun &amp; Calon Lahan yang telah ditandatangani Bupati / Kepala Dinas.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <span
              v-if="activeSkCpcl"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"
            >
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" /> Sudah Diunggah
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
            >
              <AlertCircle class="w-3.5 h-3.5 text-rose-500" /> Belum Diunggah
            </span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-5 flex flex-col gap-4">
          <!-- Template Download Banner -->
          <div class="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <div class="flex items-center gap-2 min-w-0">
              <FileText class="w-4 h-4 text-[#066C2A] shrink-0" />
              <span class="text-xs font-semibold text-slate-700">{{ LOCALIZATION.stepDataCpcl.skCpcl.formatLabel }}</span>
            </div>
            <a
              href="/templates/sk-cpcl-template.docx"
              download
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-[#066C2A] text-xs font-bold hover:bg-emerald-50 hover:border-emerald-200 transition-colors shadow-2xs cursor-pointer"
            >
              <Download class="w-3.5 h-3.5" />
              <span>{{ LOCALIZATION.stepDataCpcl.skCpcl.generateButton }}</span>
            </a>
          </div>

          <!-- Upload Dropzone (When Empty) -->
          <div v-if="!activeSkCpcl" class="p-4 bg-white rounded-xl border border-slate-200">
            <FileUpload
              id="skCpclUpload"
              :label="LOCALIZATION.stepDataCpcl.skCpcl.upload.label"
              :accept="LOCALIZATION.stepDataCpcl.skCpcl.upload.accept"
              required
              :placeholder="LOCALIZATION.stepDataCpcl.skCpcl.upload.placeholder"
              @file-selected="handleSkCpclUpload"
            />
          </div>

          <!-- Uploaded Success File Card -->
          <div v-else class="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-white border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                <FileText class="w-5 h-5" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-bold text-slate-900 truncate max-w-md">{{ activeSkCpcl.namaFile }}</span>
                <div class="flex items-center gap-2 text-[11px] text-slate-500">
                  <span class="font-mono">{{ (activeSkCpcl.ukuranBytes / 1024).toFixed(0) }} KB</span>
                  <span>&bull;</span>
                  <span>PDF Bertandatangan</span>
                </div>
                <div v-if="activeSkCpcl.uploadedBy" class="text-[11px] text-slate-500">
                  Diunggah oleh {{ activeSkCpcl.uploadedBy }}<span v-if="activeSkCpcl.uploadedAtFormatted"> &bull; {{ activeSkCpcl.uploadedAtFormatted }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <button
                type="button"
                @click="openPreview('sk-cpcl')"
                class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                <Eye class="w-3.5 h-3.5 text-[#066C2A]" />
                <span>{{ LOCALIZATION.stepDataCpcl.skCpcl.uploaded.previewButton }}</span>
              </button>
              <button
                type="button"
                @click="handleRemoveSkCpcl"
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                <Trash2 class="w-3.5 h-3.5" />
                <span>{{ LOCALIZATION.stepDataCpcl.skCpcl.uploaded.deleteButton }}</span>
              </button>
            </div>
          </div>

          <!-- Catatan Penolakan / Revisi -->
          <div
            v-if="getDocVerification('sk-cpcl')?.notes"
            class="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs"
          >
            <AlertCircle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div class="flex flex-col gap-0.5">
              <span class="font-bold">{{ getRejectionOriginLabel('sk-cpcl') }}</span>
              <p class="leading-relaxed">{{ getDocVerification('sk-cpcl')?.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- CARD 2: BERITA ACARA VERIFIKASI DOKUMEN                   -->
      <!-- ========================================================= -->
      <div
        :class="[
          'bg-white rounded-2xl border shadow-xs overflow-hidden transition-all',
          activeBeritaAcaraDokumen ? 'border-emerald-300 ring-1 ring-emerald-200/60' : 'border-slate-200/90'
        ]"
      >
        <!-- Card Header -->
        <div class="p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 border border-blue-200/80 flex items-center justify-center shrink-0">
              <FileText class="w-5 h-5" />
            </div>
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-900">2. {{ LOCALIZATION.stepDataCpcl.beritaAcaraDokumen.title }}</h3>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                  Dokumen Pendukung
                </span>
              </div>
              <p class="text-xs text-slate-500">
                Berita acara hasil verifikasi berkas administrasi dan keabsahan dokumen usulan.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <span
              v-if="activeBeritaAcaraDokumen"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"
            >
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" /> Sudah Diunggah
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
            >
              Opsional
            </span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-5 flex flex-col gap-4">
          <!-- Template Download Banner -->
          <div class="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <div class="flex items-center gap-2 min-w-0">
              <FileText class="w-4 h-4 text-blue-700 shrink-0" />
              <span class="text-xs font-semibold text-slate-700">{{ LOCALIZATION.stepDataCpcl.beritaAcaraDokumen.formatLabel }}</span>
            </div>
            <a
              href="/templates/berita-acara-template.docx"
              download
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-blue-700 text-xs font-bold hover:bg-blue-50 hover:border-blue-200 transition-colors shadow-2xs cursor-pointer"
            >
              <Download class="w-3.5 h-3.5" />
              <span>{{ LOCALIZATION.stepDataCpcl.beritaAcaraDokumen.templateButton }}</span>
            </a>
          </div>

          <!-- Upload Dropzone (When Empty) -->
          <div v-if="!activeBeritaAcaraDokumen" class="p-4 bg-white rounded-xl border border-slate-200">
            <FileUpload
              id="baDokumenUpload"
              :label="LOCALIZATION.stepDataCpcl.beritaAcaraDokumen.upload.label"
              :accept="LOCALIZATION.stepDataCpcl.beritaAcaraDokumen.upload.accept"
              required
              :placeholder="LOCALIZATION.stepDataCpcl.beritaAcaraDokumen.upload.placeholder"
              @file-selected="handleBeritaAcaraDokumenUpload"
            />
          </div>

          <!-- Uploaded Success File Card -->
          <div v-else class="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-white border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                <FileText class="w-5 h-5" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-bold text-slate-900 truncate max-w-md">{{ activeBeritaAcaraDokumen.namaFile }}</span>
                <div class="flex items-center gap-2 text-[11px] text-slate-500">
                  <span class="font-mono">{{ (activeBeritaAcaraDokumen.ukuranBytes / 1024).toFixed(0) }} KB</span>
                  <span>&bull;</span>
                  <span>Berita Acara Dokumen</span>
                </div>
                <div v-if="activeBeritaAcaraDokumen.uploadedBy" class="text-[11px] text-slate-500">
                  Diunggah oleh {{ activeBeritaAcaraDokumen.uploadedBy }}<span v-if="activeBeritaAcaraDokumen.uploadedAtFormatted"> &bull; {{ activeBeritaAcaraDokumen.uploadedAtFormatted }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <button
                type="button"
                @click="openPreview('berita-acara-dokumen')"
                class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                <Eye class="w-3.5 h-3.5 text-[#066C2A]" />
                <span>{{ LOCALIZATION.stepDataCpcl.beritaAcaraDokumen.uploaded.previewButton }}</span>
              </button>
              <button
                type="button"
                @click="handleRemoveBeritaAcaraDokumen"
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                <Trash2 class="w-3.5 h-3.5" />
                <span>{{ LOCALIZATION.stepDataCpcl.beritaAcaraDokumen.uploaded.deleteButton }}</span>
              </button>
            </div>
          </div>

          <!-- Catatan Penolakan / Revisi -->
          <div
            v-if="getDocVerification('berita-acara-dokumen')?.notes"
            class="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs"
          >
            <AlertCircle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div class="flex flex-col gap-0.5">
              <span class="font-bold">{{ getRejectionOriginLabel('berita-acara-dokumen') }}</span>
              <p class="leading-relaxed">{{ getDocVerification('berita-acara-dokumen')?.notes }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ========================================================= -->
      <!-- CARD 3: BERITA ACARA VERIFIKASI LAPANGAN                  -->
      <!-- ========================================================= -->
      <div
        :class="[
          'bg-white rounded-2xl border shadow-xs overflow-hidden transition-all',
          activeBeritaAcaraLapangan ? 'border-emerald-300 ring-1 ring-emerald-200/60' : 'border-slate-200/90'
        ]"
      >
        <!-- Card Header -->
        <div class="p-5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/80 flex items-center justify-center shrink-0">
              <FileText class="w-5 h-5" />
            </div>
            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-bold text-slate-900">3. {{ LOCALIZATION.stepDataCpcl.beritaAcaraLapangan.title }}</h3>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wider">
                  Dokumen Pendukung
                </span>
              </div>
              <p class="text-xs text-slate-500">
                Berita acara hasil pemeriksaan fisik kebun, patok spasial, dan validasi lapangan.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0 self-start sm:self-center">
            <span
              v-if="activeBeritaAcaraLapangan"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800"
            >
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" /> Sudah Diunggah
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
            >
              Opsional
            </span>
          </div>
        </div>

        <!-- Card Body -->
        <div class="p-5 flex flex-col gap-4">
          <!-- Template Download Banner -->
          <div class="flex items-center justify-between p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
            <div class="flex items-center gap-2 min-w-0">
              <FileText class="w-4 h-4 text-purple-700 shrink-0" />
              <span class="text-xs font-semibold text-slate-700">{{ LOCALIZATION.stepDataCpcl.beritaAcaraLapangan.formatLabel }}</span>
            </div>
            <a
              href="/templates/berita-acara-template.docx"
              download
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-purple-700 text-xs font-bold hover:bg-purple-50 hover:border-purple-200 transition-colors shadow-2xs cursor-pointer"
            >
              <Download class="w-3.5 h-3.5" />
              <span>{{ LOCALIZATION.stepDataCpcl.beritaAcaraLapangan.templateButton }}</span>
            </a>
          </div>

          <!-- Upload Dropzone (When Empty) -->
          <div v-if="!activeBeritaAcaraLapangan" class="p-4 bg-white rounded-xl border border-slate-200">
            <FileUpload
              id="baLapanganUpload"
              :label="LOCALIZATION.stepDataCpcl.beritaAcaraLapangan.upload.label"
              :accept="LOCALIZATION.stepDataCpcl.beritaAcaraLapangan.upload.accept"
              required
              :placeholder="LOCALIZATION.stepDataCpcl.beritaAcaraLapangan.upload.placeholder"
              @file-selected="handleBeritaAcaraLapanganUpload"
            />
          </div>

          <!-- Uploaded Success File Card -->
          <div v-else class="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-3 min-w-0">
              <div class="w-10 h-10 rounded-xl bg-white border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                <FileText class="w-5 h-5" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-bold text-slate-900 truncate max-w-md">{{ activeBeritaAcaraLapangan.namaFile }}</span>
                <div class="flex items-center gap-2 text-[11px] text-slate-500">
                  <span class="font-mono">{{ (activeBeritaAcaraLapangan.ukuranBytes / 1024).toFixed(0) }} KB</span>
                  <span>&bull;</span>
                  <span>Berita Acara Lapangan</span>
                </div>
                <div v-if="activeBeritaAcaraLapangan.uploadedBy" class="text-[11px] text-slate-500">
                  Diunggah oleh {{ activeBeritaAcaraLapangan.uploadedBy }}<span v-if="activeBeritaAcaraLapangan.uploadedAtFormatted"> &bull; {{ activeBeritaAcaraLapangan.uploadedAtFormatted }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0 self-start sm:self-center">
              <button
                type="button"
                @click="openPreview('berita-acara-lapangan')"
                class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                <Eye class="w-3.5 h-3.5 text-[#066C2A]" />
                <span>{{ LOCALIZATION.stepDataCpcl.beritaAcaraLapangan.uploaded.previewButton }}</span>
              </button>
              <button
                type="button"
                @click="handleRemoveBeritaAcaraLapangan"
                class="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors shadow-2xs cursor-pointer"
              >
                <Trash2 class="w-3.5 h-3.5" />
                <span>{{ LOCALIZATION.stepDataCpcl.beritaAcaraLapangan.uploaded.deleteButton }}</span>
              </button>
            </div>
          </div>

          <!-- Catatan Penolakan / Revisi -->
          <div
            v-if="getDocVerification('berita-acara-lapangan')?.notes"
            class="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-rose-800 text-xs"
          >
            <AlertCircle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div class="flex flex-col gap-0.5">
              <span class="font-bold">{{ getRejectionOriginLabel('berita-acara-lapangan') }}</span>
              <p class="leading-relaxed">{{ getDocVerification('berita-acara-lapangan')?.notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky Bottom Navigation Bar -->
    <div class="sticky bottom-4 z-50 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
      <button
        type="button"
        @click="verifikasiStore.currentStep = 1"
        class="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
      >
        <ArrowLeft class="w-4 h-4" />
        <span>{{ LOCALIZATION.stepDataCpcl.navigation.backButton }}</span>
      </button>

      <div class="flex items-center gap-3">
        <span v-if="!canProceed" class="text-xs text-amber-700 font-medium hidden md:inline">
          Unggah SK CPCL bertandatangan untuk melanjutkan
        </span>
        <button
          type="button"
          :disabled="!canProceed"
          @click="goToNextStep"
          :class="[
            'inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-sm cursor-pointer',
            canProceed
              ? 'bg-[#066C2A] text-white hover:bg-emerald-800'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          ]"
        >
          <span>{{ LOCALIZATION.stepDataCpcl.navigation.nextButton }}</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Document Preview Modal (Fullscreen / Zoom) -->
    <DocumentPreviewModal
      :isOpen="showPreview"
      :title="previewDoc?.title || ''"
      :dataUrl="previewDoc?.dataUrl || ''"
      :mimeType="previewDoc?.mimeType || ''"
      @close="showPreview = false"
    />
  </div>
</template>
