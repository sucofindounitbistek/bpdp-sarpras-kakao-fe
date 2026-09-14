<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Download, Eye, Trash2, CheckCircle2, AlertCircle, MapPin, Camera, Warehouse, UploadCloud, Save } from 'lucide-vue-next';

import { usePengusulanDraftStore } from '@/stores/pengusulanDraft';
import { useMasterSarprasStore } from '@/stores/masterSarpras';
import { useToast } from '@/composables/useToast';
import { PAKET_PERSYARATAN_CONFIG } from '@/lib/pengusulan-persyaratan.config';
import type { DokumenPersyaratanItem } from '@/types/masterSarpras';
import { JenisSarpras, DokumenUpload } from '@/types/pengusulan';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import CascadingPaketSelect from '@/components/ui/CascadingPaketSelect.vue';
import FileUpload from '@/components/ui/FileUpload.vue';
import { LOCALIZATION } from '@/config/localization'; // <-- Import LOCALIZATION
import { useAuthStore } from '@/stores/auth';
import { formatStandardFileName } from '@/utils/fileNaming';

const store = usePengusulanDraftStore();
const masterStore = useMasterSarprasStore();
const authStore = useAuthStore();
const toast = useToast();

async function handleSaveDraft() {
  try {
    const res = await store.saveDraft();
    toast.success(`Draft berhasil disimpan (${res.nomor_proposal})`);
  } catch (err: any) {
    toast.error(err?.response?.data?.error?.message || err?.message || 'Gagal menyimpan draft');
  }
}

onMounted(async () => {
  await masterStore.fetchMasterData(true);
  const kId =
    authStore.user?.kelembagaan_id ||
    authStore.user?.kelembagaanId;
  if (kId) {
    await store.fetchAndAttachIamDocuments(Number(kId));
  }
  if (store.selectedPaket) {
    await masterStore.fetchPersyaratan(store.selectedPaket, true);
  }
});

// Watch selected package to immediately fetch backend requirements
watch(
  () => store.selectedPaket,
  async (newPaket) => {
    if (newPaket) {
      await masterStore.fetchPersyaratan(newPaket, true);
      const kId =
        authStore.user?.kelembagaan_id ||
        authStore.user?.kelembagaanId;
      if (kId) {
        await store.fetchAndAttachIamDocuments(Number(kId));
      }
    }
  },
  { immediate: true }
);

// ─── Localization Helper ──────────────────────────────────────────────────────
function t(key: string, params?: Record<string, string | number>) {
  const keys = key.split('.');
  let result: any = LOCALIZATION;

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = result[k];
    } else {
      return key;
    }
  }

  if (typeof result === 'string' && params) {
    return result.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() ?? match;
    });
  }

  return result || key;
}

// ─── Paket Switch Confirmation ─────────────────────────────────────────────────
const tempSelectedPaket = ref<JenisSarpras | null>(store.selectedPaket);
const pendingPaket = ref<JenisSarpras | null>(null);
const showSwitchConfirm = ref(false);

function selectPaket(paketId: JenisSarpras) {
  tempSelectedPaket.value = paketId;
  masterStore.fetchPersyaratan(paketId, true);

  // If first time selecting (no previous selection), immediately set in store
  if (!store.selectedPaket) {
    store.setPaket(paketId);
  }
}

function confirmSelectedPaket() {
  if (!tempSelectedPaket.value) return;
  if (tempSelectedPaket.value === store.selectedPaket) return;

  const wasEkstInten = store.selectedPaket === JenisSarpras.EKSTENSIFIKASI || store.selectedPaket === JenisSarpras.INTENSIFIKASI;
  const gudangFilled = !!store.gudangSerahTerima?.alamat || !!store.gudangSerahTerima?.fotoTampakDepan;

  if (wasEkstInten && gudangFilled) {
    pendingPaket.value = tempSelectedPaket.value;
    showSwitchConfirm.value = true;
  } else {
    store.setPaket(tempSelectedPaket.value);
  }
}

function confirmSwitch() {
  if (pendingPaket.value) {
    store.setPaket(pendingPaket.value);
    tempSelectedPaket.value = pendingPaket.value;
    masterStore.fetchPersyaratan(pendingPaket.value, true);
  }
  pendingPaket.value = null;
  showSwitchConfirm.value = false;
}


function cancelSwitch() {
  pendingPaket.value = null;
  showSwitchConfirm.value = false;
  tempSelectedPaket.value = store.selectedPaket;
}

// ─── Persyaratan Computed ──────────────────────────────────────────────────────
const activePaketCode = computed(() => store.selectedPaket || tempSelectedPaket.value);

const currentPersyaratan = computed(() => {
  const code = activePaketCode.value;
  if (!code) return [];
  const dynamicList = masterStore.persyaratanMap[code];
  if (dynamicList && dynamicList.length > 0) {
    return dynamicList.map((d) => ({
      id: d.dokumen_code,
      nama: d.nama,
      formatDownloadUrl: d.format_download_url,
      wajib: d.is_wajib,
    }));
  }
  return PAKET_PERSYARATAN_CONFIG[code as JenisSarpras] ?? [];
});


const DOCUMENT_INPUT_ACCEPT = '.pdf,.jpg,.jpeg,.png,.xlsx';

function isAllowedDocumentFile(file: File, requirement?: DokumenPersyaratanItem): boolean {
  if (requirement?.allowed_mime_types) {
    const allowedMimeTypes = requirement.allowed_mime_types
      .split(',')
      .map((mimeType) => mimeType.trim().toLowerCase())
      .filter(Boolean);

    if (allowedMimeTypes.length > 0) {
      return allowedMimeTypes.includes(file.type.toLowerCase());
    }
  }

  return ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'].includes(file.type);
}

function isLegalitasDoc(id: string, nama?: string): boolean {
  const normId = (id || '').toUpperCase();
  const normName = (nama || '').toUpperCase();
  return (
    normId === 'LEGALITAS_KP' ||
    normId === 'AKTA_LEMBAGA' ||
    normId.includes('LEGALITAS') ||
    normId.includes('AKTA') ||
    normName.includes('LEGALITAS') ||
    normName.includes('AKTA')
  );
}


function isPenunjukanKetuaDoc(id: string, nama?: string): boolean {
  const normId = (id || '').toUpperCase();
  const normName = (nama || '').toUpperCase();
  return (
    normId === 'SIMLUHTAN' ||
    normId === 'PENUNJUKAN_KETUA' ||
    normId.includes('KETUA') ||
    normId.includes('SIMLUHTAN') ||
    normName.includes('PENUNJUKAN KETUA') ||
    normName.includes('KETUA') ||
    normName.includes('SIMLUHTAN')
  );
}

function getUpload(persyaratanId: string, nama?: string): DokumenUpload | undefined {
  return store.dokumenUploads.find((d) => {
    if (d.persyaratanId === persyaratanId) return true;
    if (isLegalitasDoc(persyaratanId, nama) && isLegalitasDoc(d.persyaratanId)) {
      return true;
    }
    if (isPenunjukanKetuaDoc(persyaratanId, nama) && isPenunjukanKetuaDoc(d.persyaratanId)) {
      return true;
    }
    return false;
  });
}

// ─── Document Upload Handler ────────────────────────────────────────────────────
const MAX_DOC_SIZE = 10 * 1024 * 1024;
const MAX_FOTO_SIZE = 5 * 1024 * 1024;

const fileInputRef = ref<HTMLInputElement | null>(null);
const currentUploadId = ref<string | null>(null);

function triggerUpload(persyaratanId: string) {
  currentUploadId.value = persyaratanId;
  fileInputRef.value?.click();
}

function onFileInputChange(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  const id = currentUploadId.value;
  if (file && id) {
    handleDokumenUpload(file, id);
    target.value = '';
  }
  currentUploadId.value = null;
}

function fileToUpload(file: File, persyaratanId: string): Promise<DokumenUpload> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) =>
      resolve({
        persyaratanId,
        namaFile: file.name,
        mimeType: file.type,
        ukuranBytes: file.size,
        dataUrl: e.target?.result as string,
        uploadedAt: new Date().toISOString(),
        file,
      });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function handleDokumenUpload(file: File, persyaratanId: string) {
  const requirement = masterStore.persyaratanMap[activePaketCode.value || '']?.find(
    (item) => item.dokumen_code === persyaratanId,
  );
  if (!isAllowedDocumentFile(file, requirement)) {
    toast.error(t('stepPemilihanPaket.toast.doc.uploadError.format'));
    return;
  }
  const maxSizeBytes = requirement?.max_size_bytes || MAX_DOC_SIZE;
  if (file.size > maxSizeBytes) {
    toast.error(t('stepPemilihanPaket.toast.doc.uploadError.size'));
    return;
  }

  const reqItem = currentPersyaratan.value.find((p) => p.id === persyaratanId);
  const docLabel = reqItem?.nama || 'Dokumen-Persyaratan';
  const renamed = formatStandardFileName(file, {
    documentLabel: docLabel,
    proposalNumber: (store as any).proposalNumber || 'DRAFT',
    institutionName: authStore.user?.kelembagaan_name || authStore.user?.name || 'Kelembagaan',
  }).file;

  const doc = await fileToUpload(renamed, persyaratanId);
  doc.file = renamed;
  store.addDokumenUpload(doc);
  toast.success(t('stepPemilihanPaket.toast.doc.uploadSuccess', { name: doc.namaFile }));
}

function handleRemoveUpload(persyaratanId: string) {
  store.removeDokumenUpload(persyaratanId);
}

// ─── Document Preview ──────────────────────────────────────────────────────────
const previewDoc = ref<{ dataUrl: string; mimeType: string; title: string } | null>(null);
const showPreview = ref(false);

function getPhotoName(doc: DokumenUpload | File | null | undefined): string {
  if (!doc) return '';
  if (doc instanceof File) return doc.name;
  if ('namaFile' in doc && doc.namaFile) return doc.namaFile;
  if ('name' in doc && (doc as any).name) return (doc as any).name;
  return 'Foto Terunggah';
}

function openPreview(doc: DokumenUpload | File | any) {
  if (!doc) return;
  if (doc instanceof File) {
    previewDoc.value = {
      dataUrl: URL.createObjectURL(doc),
      mimeType: doc.type || 'image/jpeg',
      title: doc.name,
    };
  } else {
    previewDoc.value = {
      dataUrl: doc.dataUrl || doc.fileUrl || (doc.file instanceof File ? URL.createObjectURL(doc.file) : ''),
      mimeType: doc.mimeType || (doc.file instanceof File ? doc.file.type : 'application/pdf'),
      title: doc.namaFile || doc.name || (doc.file instanceof File ? doc.file.name : 'Dokumen'),
    };
  }
  showPreview.value = true;
}

// ─── Gudang Serah Terima ───────────────────────────────────────────────────────
const gudangAlamat = computed({
  get: () => store.gudangSerahTerima?.alamat ?? '',
  set: (v: string) => store.setGudang({ alamat: v }),
});
const gudangKoordinat = computed({
  get: () => store.gudangSerahTerima?.koordinat ?? '',
  set: (v: string) => store.setGudang({ koordinat: v }),
});

async function handleFotoDepanUpload(file: File) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    toast.error(t('stepPemilihanPaket.gudangSerahTerima.foto.upload.error.format'));
    return;
  }
  if (file.size > MAX_FOTO_SIZE) {
    toast.error(t('stepPemilihanPaket.gudangSerahTerima.foto.upload.error.size'));
    return;
  }
  const doc = await fileToUpload(file, 'FOTO_DEPAN');
  (doc as any).file = file;
  store.setGudang({
    fotoTampakDepan: doc,
    exterior_photo_file: file,
  });
}

async function handleFotoDalamUpload(file: File) {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.type)) {
    toast.error(t('stepPemilihanPaket.gudangSerahTerima.foto.upload.error.format'));
    return;
  }
  if (file.size > MAX_FOTO_SIZE) {
    toast.error(t('stepPemilihanPaket.gudangSerahTerima.foto.upload.error.size'));
    return;
  }
  const doc = await fileToUpload(file, 'FOTO_DALAM');
  (doc as any).file = file;
  store.setGudang({
    fotoTampakDalam: doc,
    interior_photo_file: file,
    interiro_photo_file: file,
  });
}

// ─── Validation Gate ────────────────────────────────────────────────────────────
function validateAndProceed() {
  if (!store.selectedPaket) {
    toast.error(t('stepPemilihanPaket.toast.validation.noPaket'));
    return;
  }
  if (store.selectedPaket === JenisSarpras.JALAN_KEBUN) {
    if (!store.namaBank.trim()) {
      toast.error(t('stepPemilihanPaket.toast.validation.noBank'));
      return;
    }
  }
  store.currentStep = 2;
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Step Header -->
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-bold text-slate-900">{{ t('stepPemilihanPaket.header.title') }}</h2>
      <p class="text-xs text-slate-500">{{ t('stepPemilihanPaket.header.subtitle') }}</p>
    </div>

    <!-- Inline Switch Confirmation Banner -->
    <Transition name="fade">
      <div v-if="showSwitchConfirm" class="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-amber-50 border border-amber-300 rounded-xl">
        <AlertCircle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div class="flex-1 text-xs text-amber-800">
          <span class="font-semibold">{{ t('stepPemilihanPaket.switchConfirm.title') }}:</span>
          {{ t('stepPemilihanPaket.switchConfirm.message') }}
        </div>
        <div class="flex gap-2 shrink-0">
          <button @click="confirmSwitch" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors">
            {{ t('stepPemilihanPaket.switchConfirm.confirm') }}
          </button>
          <button @click="cancelSwitch" class="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-amber-300 text-amber-800 hover:bg-amber-100 transition-colors">
            {{ t('stepPemilihanPaket.switchConfirm.cancel') }}
          </button>
        </div>
      </div>
    </Transition>

    <!-- Paket Selection -->
    <div class="flex flex-col gap-3">
      <div>
        <label class="block text-xs font-semibold text-slate-600 mb-1.5">
          {{ t('stepPemilihanPaket.paketSelection.label') }}
        </label>
        <CascadingPaketSelect
          v-model="tempSelectedPaket"
          :placeholder="t('stepPemilihanPaket.paketSelection.placeholder')"
          @change="
            (val) => {
              if (val) selectPaket(val as JenisSarpras);
            }
          "
        />
      </div>

      <Transition name="fade">
        <div v-if="tempSelectedPaket && tempSelectedPaket !== store.selectedPaket" class="flex justify-end mt-2">
          <button
            type="button"
            @click="confirmSelectedPaket"
            class="px-6 py-2.5 rounded-xl font-bold text-sm bg-[#066C2A] text-white hover:bg-emerald-800 transition-all duration-300 shadow-sm active:scale-95 flex items-center gap-1.5 shrink-0"
          >
            <CheckCircle2 class="w-4 h-4" />
            {{ t('stepPemilihanPaket.paketSelection.confirmButton') }}
          </button>
        </div>
      </Transition>
    </div>

    <!-- Persyaratan Dokumen Section -->
    <Transition name="fade">
      <div v-if="store.selectedPaket" class="flex flex-col gap-4">
        <!-- Nama Bank (conditional — JALAN_KEBUN only) -->
        <Transition name="fade">
          <div v-if="store.selectedPaket === JenisSarpras.JALAN_KEBUN" class="flex flex-col gap-4">
            <div class="flex items-center gap-2">
              <div class="h-px flex-1 bg-slate-200" />
              <div class="flex items-center gap-1.5">
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {{ t('stepPemilihanPaket.rekening.title') }}
                </span>
              </div>
              <div class="h-px flex-1 bg-slate-200" />
            </div>

            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-4">
              <p class="text-xs text-slate-500">
                {{ t('stepPemilihanPaket.rekening.subtitle') }}
              </p>

              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-slate-700">
                  {{ t('stepPemilihanPaket.rekening.label') }}
                  <span class="text-rose-500">{{ t('stepPemilihanPaket.rekening.required') }}</span>
                </label>
                <input v-model="store.namaBank" type="text" :placeholder="t('stepPemilihanPaket.rekening.placeholder')" class="h-9 w-full text-xs px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#066C2A]" />
              </div>
            </div>
          </div>
        </Transition>

        <div class="flex items-center gap-2">
          <div class="h-px flex-1 bg-slate-200" />
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {{ t('stepPemilihanPaket.persyaratanDokumen.title') }}
          </span>
          <div class="h-px flex-1 bg-slate-200" />
        </div>

        <!-- Persyaratan Dokumen Table -->
        <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table class="w-full">
            <thead class="bg-slate-50 border-b border-slate-200">
              <tr>
                <th class="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-2.5">
                  {{ t('stepPemilihanPaket.persyaratanDokumen.table.headers.nama') }}
                </th>
                <th class="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-2.5 w-32">
                  {{ t('stepPemilihanPaket.persyaratanDokumen.table.headers.format') }}
                </th>
                <th class="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-4 py-2.5 w-40">
                  {{ t('stepPemilihanPaket.persyaratanDokumen.table.headers.aksi') }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="p in currentPersyaratan" :key="p.id" class="hover:bg-slate-50/50 transition-colors">
                <td class="px-4 py-3">
                  <div class="flex flex-col gap-0.5">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span class="text-xs font-semibold text-slate-800">{{ p.nama }}</span>
                      <span v-if="getUpload(p.id, p.nama)?.isVerifiedFromIam" class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                        ✓ Terverifikasi dari IAM
                      </span>
                      <span v-if="p.wajib" class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-600">
                        {{ t('stepPemilihanPaket.persyaratanDokumen.table.badges.wajib') }}
                      </span>
                      <span v-else class="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500">
                        {{ t('stepPemilihanPaket.persyaratanDokumen.table.badges.opsional') }}
                      </span>
                    </div>
                    <span v-if="getUpload(p.id, p.nama)" class="text-[11px] text-emerald-700 font-medium truncate max-w-sm">
                      📄 {{ getUpload(p.id, p.nama)?.namaFile }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <a v-if="p.formatDownloadUrl" :href="p.formatDownloadUrl" download class="flex items-center gap-1 text-[10px] font-semibold text-[#066C2A] hover:underline">
                    <Download class="w-3 h-3" />
                    {{ t('stepPemilihanPaket.persyaratanDokumen.table.formatDownload') }}
                  </a>
                  <span v-else-if="getUpload(p.id, p.nama)" class="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded uppercase">
                    {{ getUpload(p.id, p.nama)?.namaFile?.split('.').pop() || 'PDF' }}
                  </span>
                  <span v-else class="text-[10px] text-slate-400">—</span>
                </td>
                <td class="px-4 py-3">
                  <div v-if="!getUpload(p.id, p.nama)">
                    <button type="button" @click="triggerUpload(p.id)" class="flex items-center gap-1 text-[10px] font-semibold text-[#066C2A] px-2 py-1 rounded-lg border border-[#066C2A]/30 hover:bg-emerald-50 transition-colors">
                      <UploadCloud class="w-3 h-3" />
                      {{ t('stepPemilihanPaket.persyaratanDokumen.table.upload') }}
                    </button>
                  </div>
                  <div v-else class="flex items-center gap-1">
                    <button type="button" @click="openPreview(getUpload(p.id, p.nama)!)" class="flex items-center gap-1 text-[10px] font-semibold text-[#066C2A] px-2 py-1 rounded-lg hover:bg-emerald-100 transition-colors">
                      <Eye class="w-3 h-3" />
                      {{ t('stepPemilihanPaket.persyaratanDokumen.table.preview') }}
                    </button>
                    <button type="button" @click="handleRemoveUpload(p.id)" class="flex items-center gap-1 text-[10px] font-semibold text-rose-500 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors">
                      <Trash2 class="w-3 h-3" />
                      {{ t('stepPemilihanPaket.persyaratanDokumen.table.delete') }}
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Gudang Serah Terima -->
        <Transition name="fade">
          <div v-if="store.isPupukPaket" class="flex flex-col gap-4 mt-2">
            <div class="flex items-center gap-2">
              <div class="h-px flex-1 bg-slate-200" />
              <div class="flex items-center gap-1.5">
                <Warehouse class="w-3.5 h-3.5 text-slate-500" />
                <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {{ t('stepPemilihanPaket.gudangSerahTerima.title') }}
                </span>
              </div>
              <div class="h-px flex-1 bg-slate-200" />
            </div>

            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-4">
              <p class="text-xs text-slate-500">
                {{ t('stepPemilihanPaket.gudangSerahTerima.subtitle') }}
              </p>

              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-slate-700">
                  {{ t('stepPemilihanPaket.gudangSerahTerima.alamat.label') }}
                  <span class="text-rose-500">{{ t('stepPemilihanPaket.gudangSerahTerima.alamat.required') }}</span>
                </label>
                <textarea
                  v-model="gudangAlamat"
                  rows="2"
                  :placeholder="t('stepPemilihanPaket.gudangSerahTerima.alamat.placeholder')"
                  class="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#066C2A] resize-none"
                />
              </div>

              <div class="flex flex-col gap-1">
                <label class="text-xs font-semibold text-slate-700">
                  <MapPin class="w-3 h-3 inline mr-0.5" />
                  {{ t('stepPemilihanPaket.gudangSerahTerima.koordinat.label') }}
                  <span class="text-rose-500">{{ t('stepPemilihanPaket.gudangSerahTerima.koordinat.required') }}</span>
                </label>
                <input
                  v-model="gudangKoordinat"
                  type="text"
                  :placeholder="t('stepPemilihanPaket.gudangSerahTerima.koordinat.placeholder')"
                  class="h-9 w-full text-xs px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-[#066C2A]"
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Camera class="w-3 h-3" />
                    {{ t('stepPemilihanPaket.gudangSerahTerima.foto.tampakDepan.label') }}
                    <span class="text-rose-500">{{ t('stepPemilihanPaket.gudangSerahTerima.foto.tampakDepan.required') }}</span>
                  </label>
                  <div v-if="!store.gudangSerahTerima?.fotoTampakDepan">
                    <FileUpload
                      id="foto-depan"
                      accept=".jpg,.jpeg,.png,.webp"
                      document-label="Foto-Gudang"
                      sub-label="Depan"
                      :proposal-number="(store as any).proposalNumber || 'DRAFT'"
                      :institution-name="authStore.user?.kelembagaan_name || authStore.user?.name || 'Kelembagaan'"
                      :placeholder="t('stepPemilihanPaket.gudangSerahTerima.foto.upload.placeholder')"
                      :required="true"
                      @file-selected="handleFotoDepanUpload"
                    />
                  </div>
                  <div v-else class="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div class="flex items-center gap-2 min-w-0">
                      <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span class="text-xs font-semibold text-slate-800 truncate">
                        {{ getPhotoName(store.gudangSerahTerima.fotoTampakDepan) }}
                      </span>
                    </div>
                    <div class="flex gap-1 shrink-0">
                      <button type="button" @click="openPreview(store.gudangSerahTerima.fotoTampakDepan)" class="text-[10px] text-[#066C2A] font-semibold px-2 py-1 hover:bg-emerald-100 rounded-lg">
                        <Eye class="w-3 h-3 inline" />
                      </button>
                      <button type="button" @click="store.setGudang({ fotoTampakDepan: null, exterior_photo_file: null })" class="text-[10px] text-rose-500 font-semibold px-2 py-1 hover:bg-rose-50 rounded-lg">
                        <Trash2 class="w-3 h-3 inline" />
                      </button>
                    </div>
                  </div>
                </div>

                <div class="flex flex-col gap-2">
                  <label class="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Camera class="w-3 h-3" />
                    {{ t('stepPemilihanPaket.gudangSerahTerima.foto.tampakDalam.label') }}
                    <span class="text-rose-500">{{ t('stepPemilihanPaket.gudangSerahTerima.foto.tampakDalam.required') }}</span>
                  </label>
                  <div v-if="!store.gudangSerahTerima?.fotoTampakDalam">
                    <FileUpload
                      id="foto-dalam"
                      accept=".jpg,.jpeg,.png,.webp"
                      document-label="Foto-Gudang"
                      sub-label="Dalam"
                      :proposal-number="(store as any).proposalNumber || 'DRAFT'"
                      :institution-name="authStore.user?.kelembagaan_name || authStore.user?.name || 'Kelembagaan'"
                      :placeholder="t('stepPemilihanPaket.gudangSerahTerima.foto.upload.placeholder')"
                      :required="true"
                      @file-selected="handleFotoDalamUpload"
                    />
                  </div>
                  <div v-else class="flex items-center justify-between p-2.5 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div class="flex items-center gap-2 min-w-0">
                      <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span class="text-xs font-semibold text-slate-800 truncate">
                        {{ getPhotoName(store.gudangSerahTerima.fotoTampakDalam) }}
                      </span>
                    </div>
                    <div class="flex gap-1 shrink-0">
                      <button type="button" @click="openPreview(store.gudangSerahTerima.fotoTampakDalam)" class="text-[10px] text-[#066C2A] font-semibold px-2 py-1 hover:bg-emerald-100 rounded-lg">
                        <Eye class="w-3 h-3 inline" />
                      </button>
                      <button type="button" @click="store.setGudang({ fotoTampakDalam: null, interior_photo_file: null, interiro_photo_file: null })" class="text-[10px] text-rose-500 font-semibold px-2 py-1 hover:bg-rose-50 rounded-lg">
                        <Trash2 class="w-3 h-3 inline" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>

    <!-- Navigation -->
    <div class="flex items-center justify-between pt-2">
      <button
        type="button"
        @click="handleSaveDraft"
        :disabled="store.isSavingDraft || !store.selectedPaket"
        class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
      >
        <Save class="w-4 h-4 text-slate-500" />
        <span>{{ store.isSavingDraft ? 'Menyimpan...' : 'Simpan Draft' }}</span>
      </button>

      <button
        type="button"
        @click="validateAndProceed"
        class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#066C2A] text-white hover:bg-emerald-800 transition-colors shadow-sm disabled:opacity-50"
        :disabled="!store.selectedPaket || tempSelectedPaket !== store.selectedPaket"
      >
        {{ t('stepPemilihanPaket.navigation.nextButton') }}
        <span class="text-lg leading-none">&rarr;</span>
      </button>
    </div>

    <!-- Document Preview Modal -->
    <DocumentPreviewModal :isOpen="showPreview" :title="previewDoc?.title || ''" :dataUrl="previewDoc?.dataUrl || ''" :mimeType="previewDoc?.mimeType || ''" @close="showPreview = false" />

    <!-- Hidden file input -->
    <input ref="fileInputRef" type="file" :accept="DOCUMENT_INPUT_ACCEPT" class="hidden" @change="onFileInputChange" />
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
