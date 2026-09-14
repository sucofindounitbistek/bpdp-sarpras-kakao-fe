<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Users, AlertCircle, CheckCircle2, Info, FileText, ChevronDown, ChevronUp, Loader2, Save } from 'lucide-vue-next';
import { usePengusulanDraftStore } from '@/stores/pengusulanDraft';
import { useAuthStore } from '@/stores/auth';
import { usePekebunStore } from '@/stores/pekebun';
import { useRegionStore } from '@/stores/region';
import { useLahanStore } from '@/stores/lahan';
import { useToast } from '@/composables/useToast';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import { PAKET_PERSYARATAN_CONFIG } from '@/lib/pengusulan-persyaratan.config';
import { LOCALIZATION } from '@/config/localization';

const store = usePengusulanDraftStore();
const pekebunStore = usePekebunStore();
const regionStore = useRegionStore();
const lahanStore = useLahanStore();
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
  regionStore.loadProvinces().catch(() => {});
  const kelembagaanId =
    authStore.user?.kelembagaan_id
      ? Number(authStore.user.kelembagaan_id)
      : (authStore.user as any)?.kelembagaanId
      ? Number((authStore.user as any).kelembagaanId)
      : 1;
  try {
    await lahanStore.getPekebunLandsByKelembagaanId(kelembagaanId);
    cleanupInvalidSelections();
  } catch (err) {
    console.warn('Gagal memuat lahan kelembagaan:', err);
  }
});

function getMimeTypeFromUrl(url: string): string {
  if (!url) return 'application/pdf';
  if (url.startsWith('data:image/png') || url.endsWith('.png')) return 'image/png';
  if (url.startsWith('data:image/jpeg') || url.startsWith('data:image/jpg') || url.endsWith('.jpg') || url.endsWith('.jpeg')) return 'image/jpeg';
  return 'application/pdf';
}

function openLahanDocPreview(lahan: any) {
  if (!lahan.scanLegalitasUrl || lahan.scanLegalitasUrl === '#') {
    toast.error(LOCALIZATION.lahanPreview.missingDocToast);
    return;
  }
  const title = `${LOCALIZATION.lahanPreview.modalTitlePrefix} - ${lahan.jenisLegalitas || ''} ${lahan.nomorLegalitas ? '(' + lahan.nomorLegalitas + ')' : ''}`.trim();
  previewDoc.value = {
    dataUrl: lahan.scanLegalitasUrl,
    mimeType: getMimeTypeFromUrl(lahan.scanLegalitasUrl),
    title,
  };
  showDocPreview.value = true;
}

const docLabelMap = computed(() => {
  const map: Record<string, string> = {
    RAB_PROPOSAL: 'RAB Bertandatangan',
    SPTJM: 'RAB Bertandatangan (SPTJM)',
    RAB_SIGNED: 'RAB Bertandatangan',
    'rab-signed': 'RAB Bertandatangan',
  };
  if (!store.selectedPaket) return map;
  const persyaratan = PAKET_PERSYARATAN_CONFIG[store.selectedPaket] ?? [];
  persyaratan.forEach((p) => {
    map[p.id] = p.nama;
  });
  return map;
})

function getDocLabel(doc: { persyaratanId: string; namaFile: string }) {
  return docLabelMap.value[doc.persyaratanId] || doc.namaFile;
}

const showDocPreview = ref(false);
const previewDoc = ref<{ dataUrl: string; mimeType: string; title: string } | null>(null);

import { WilayahLevel, WilayahItem } from '@/types/pekebun';

const allPekebun = computed(() => {
  if (lahanStore.pekebunList.length > 0) return lahanStore.pekebunList;
  if (pekebunStore.listPekebun.length > 0) return pekebunStore.listPekebun;
  return [];
});

const searchQuery = ref('');
const filterProvinsi = ref('');
const filterKabupaten = ref('');
const sortOrder = ref<'asc' | 'desc'>('asc');

watch(filterProvinsi, (newProv) => {
  if (newProv) {
    regionStore.loadRegencies(newProv).catch(() => {});
  }
});

const provinsiList = computed(() => {
  const defaultList = pekebunStore.getWilayahByParent(null, WilayahLevel.PROVINSI);
  const knownKodes = new Set(defaultList.map((w) => w.kode));
  const dynamicList: WilayahItem[] = [];

  for (const p of allPekebun.value) {
    const lands = lahanStore.getPekebunLands(p);
    for (const l of lands) {
      if (l.provinsiKode && !knownKodes.has(l.provinsiKode)) {
        knownKodes.add(l.provinsiKode);
        dynamicList.push({
          kode: l.provinsiKode,
          nama: l.provinsiNama || `Provinsi (${l.provinsiKode})`,
          parentKode: null,
          level: WilayahLevel.PROVINSI,
        });
      }
    }
  }

  return [...defaultList, ...dynamicList];
});

const kabupatenList = computed(() => {
  if (!filterProvinsi.value) return [];
  const defaultList = pekebunStore.getWilayahByParent(filterProvinsi.value, WilayahLevel.KABUPATEN);
  const knownKodes = new Set(defaultList.map((w) => w.kode));
  const dynamicList: WilayahItem[] = [];

  for (const p of allPekebun.value) {
    const lands = lahanStore.getPekebunLands(p);
    for (const l of lands) {
      if (l.provinsiKode === filterProvinsi.value && l.kabupatenKode && !knownKodes.has(l.kabupatenKode)) {
        knownKodes.add(l.kabupatenKode);
        dynamicList.push({
          kode: l.kabupatenKode,
          nama: l.kabupatenNama || `Kabupaten (${l.kabupatenKode})`,
          parentKode: filterProvinsi.value,
          level: WilayahLevel.KABUPATEN,
        });
      }
    }
  }

  return [...defaultList, ...dynamicList];
});

function onProvinsiChange() {
  filterKabupaten.value = '';
}

const filteredPekebun = computed(() => {
  const filtered = allPekebun.value.filter((p) => {
    const name = p.nama || (p as any).name || '';
    const nik = p.nik || '';
    const query = searchQuery.value.toLowerCase().trim();
    const matchSearch = !query || name.toLowerCase().includes(query) || nik.includes(query);

    const lands = lahanStore.getPekebunLands(p);
    const matchProv = !filterProvinsi.value || p.lahan?.provinsiKode === filterProvinsi.value || lands.some((l) => l.provinsiKode === filterProvinsi.value);
    const matchKab = !filterKabupaten.value || p.lahan?.kabupatenKode === filterKabupaten.value || lands.some((l) => l.kabupatenKode === filterKabupaten.value);

    return matchSearch && matchProv && matchKab;
  });

  return [...filtered].sort((a, b) => {
    const nameA = (a.nama || (a as any).name || '').trim();
    const nameB = (b.nama || (b as any).name || '').trim();

    // Push empty or missing names to the end in both directions
    if (!nameA && !nameB) return 0;
    if (!nameA) return 1;
    if (!nameB) return -1;

    // Primary sort: case-insensitive Indonesian locale comparison
    const cmp = nameA.localeCompare(nameB, 'id', { sensitivity: 'base' });
    if (cmp !== 0) {
      return sortOrder.value === 'asc' ? cmp : -cmp;
    }

    // Secondary deterministic tie-breaker: NIK
    const nikA = (a.nik || '').trim();
    const nikB = (b.nik || '').trim();
    return sortOrder.value === 'asc' ? nikA.localeCompare(nikB) : -nikA.localeCompare(nikB);
  });
});

const DEFAULT_PEKEBUN_LIMIT = 10;
const PEKEBUN_PAGE_STEP = 5;
const visiblePekebunCount = ref(DEFAULT_PEKEBUN_LIMIT);

const displayedPekebun = computed(() => {
  return filteredPekebun.value.slice(0, visiblePekebunCount.value);
});

function loadMorePekebun() {
  visiblePekebunCount.value += PEKEBUN_PAGE_STEP;
}

watch([searchQuery, filterProvinsi, filterKabupaten, sortOrder], () => {
  visiblePekebunCount.value = DEFAULT_PEKEBUN_LIMIT;
});

function isPekebunSelected(id: string | number) {
  return store.selectedPekebunIds.includes(String(id));
}

const expandedPekebunIds = ref<string[]>([]);

function isPekebunExpanded(id: string | number): boolean {
  const strId = String(id);
  return isPekebunSelected(strId) || expandedPekebunIds.value.includes(strId);
}

function toggleExpandPekebun(id: string | number) {
  const strId = String(id);
  if (expandedPekebunIds.value.includes(strId)) {
    expandedPekebunIds.value = expandedPekebunIds.value.filter((x) => x !== strId);
  } else {
    expandedPekebunIds.value.push(strId);
  }
}

function normalizePaket(val: string | null | undefined): string {
  if (!val) return '';
  return val.toLowerCase().replace(/[\s_-]+/g, '');
}

function getPekebunLands(pekebun: any) {
  return lahanStore.getPekebunLands(pekebun);
}

function isPekebunDisabled(pekebun: any): boolean {
  const lands = getPekebunLands(pekebun);
  if (lands.length === 0) return true;

  // Condition 1: IF a lahan already in proposal with all proposal status except "SK_DIRUT_PUBLISHED" THEN disabled
  const hasOngoing = lands.some((l) => {
    const inProp = Boolean(l.isInProposal ?? (l as any).is_in_proposal);
    const status = l.proposalStatus ?? (l as any).proposal_status;
    return inProp && status !== 'SK_DIRUT_PUBLISHED';
  });
  if (hasOngoing) return true;

  // Condition 2: IF a lahan already in proposal but with proposal status "SK_DIRUT_PUBLISHED"
  // AND the proposal paket in form is the same "paket_proposal" as the user choose -> disabled
  const currentPaket = normalizePaket(store.selectedPaket);
  const hasSamePaketPublished = lands.some((l) => {
    const inProp = Boolean(l.isInProposal ?? (l as any).is_in_proposal);
    const status = l.proposalStatus ?? (l as any).proposal_status;
    const paket = normalizePaket(l.paketProposal ?? (l as any).paket_proposal);
    return inProp && status === 'SK_DIRUT_PUBLISHED' && paket === currentPaket;
  });
  if (hasSamePaketPublished) return true;

  // Must have at least one selectable (unused) lahan
  const hasSelectable = lands.some((l) => !Boolean(l.isInProposal ?? (l as any).is_in_proposal));
  if (!hasSelectable) return true;

  return false;
}

function isLahanDisabled(lahan: any, pekebun?: any): boolean {
  if (!lahan) return true;
  const inProp = Boolean(lahan.isInProposal ?? (lahan as any).is_in_proposal);
  if (inProp) return true;
  if (pekebun && isPekebunDisabled(pekebun)) return true;
  return false;
}

function getPekebunDisabledReason(pekebun: any): string | null {
  const lands = getPekebunLands(pekebun);
  if (lands.length === 0) return 'Belum ada lahan';

  const ongoingLahan = lands.find((l) => {
    const inProp = Boolean(l.isInProposal ?? (l as any).is_in_proposal);
    const status = l.proposalStatus ?? (l as any).proposal_status;
    return inProp && status !== 'SK_DIRUT_PUBLISHED';
  });
  if (ongoingLahan) {
    const st = ongoingLahan.proposalStatus ?? (ongoingLahan as any).proposal_status ?? 'Aktif';
    return `Dalam Usulan (${st})`;
  }

  const currentPaket = normalizePaket(store.selectedPaket);
  const samePaketLahan = lands.find((l) => {
    const inProp = Boolean(l.isInProposal ?? (l as any).is_in_proposal);
    const status = l.proposalStatus ?? (l as any).proposal_status;
    const paket = normalizePaket(l.paketProposal ?? (l as any).paket_proposal);
    return inProp && status === 'SK_DIRUT_PUBLISHED' && paket === currentPaket;
  });
  if (samePaketLahan) {
    const pk = samePaketLahan.paketProposal ?? (samePaketLahan as any).paket_proposal ?? 'Paket Sama';
    return `Sudah terbit SK Dirut (${pk})`;
  }

  const hasSelectable = lands.some((l) => !Boolean(l.isInProposal ?? (l as any).is_in_proposal));
  if (!hasSelectable) {
    return 'Semua lahan sudah dalam proposal';
  }

  return null;
}

function getLahanProposalBadge(lahan: any): { text: string; colorClass: string } | null {
  if (!lahan) return null;
  const inProp = Boolean(lahan.isInProposal ?? (lahan as any).is_in_proposal);
  if (!inProp) return null;

  const status = lahan.proposalStatus ?? (lahan as any).proposal_status ?? '';
  const paket = lahan.paketProposal ?? (lahan as any).paket_proposal ?? '';

  if (status === 'SK_DIRUT_PUBLISHED') {
    return {
      text: `SK Dirut Terbit${paket ? ' (' + paket + ')' : ''}`,
      colorClass: 'bg-blue-50 text-blue-700 border-blue-200',
    };
  }

  return {
    text: `Dalam Usulan${status ? ' (' + status + ')' : ''}`,
    colorClass: 'bg-amber-50 text-amber-700 border-amber-200',
  };
}

function cleanupInvalidSelections() {
  const validPekebunIds = store.selectedPekebunIds.filter((pid) => {
    const p = allPekebun.value.find((item) => String(item.id) === String(pid));
    return p && !isPekebunDisabled(p);
  });
  if (validPekebunIds.length !== store.selectedPekebunIds.length) {
    store.setSelectedPekebun(validPekebunIds);
  }

  const validLahanIds = store.selectedLahanIds.filter((lid) => {
    let foundLahan: any = null;
    let parentPekebun: any = null;
    for (const p of allPekebun.value) {
      const lands = getPekebunLands(p);
      const l = lands.find((x) => String(x.id) === String(lid));
      if (l) {
        foundLahan = l;
        parentPekebun = p;
        break;
      }
    }
    return foundLahan && !isLahanDisabled(foundLahan, parentPekebun);
  });
  if (validLahanIds.length !== store.selectedLahanIds.length) {
    store.setSelectedLahan(validLahanIds);
  }
}

function togglePekebun(pekebun: any) {
  if (isPekebunDisabled(pekebun)) return;
  const strId = String(pekebun.id);
  if (isPekebunSelected(strId)) {
    const newIds = store.selectedPekebunIds.filter((pid) => pid !== strId);
    store.setSelectedPekebun(newIds);
  } else {
    store.setSelectedPekebun([...store.selectedPekebunIds, strId]);
    if (!expandedPekebunIds.value.includes(strId)) {
      expandedPekebunIds.value.push(strId);
    }
  }
}

function isLahanSelected(lahanId: string | number) {
  return store.selectedLahanIds.includes(String(lahanId));
}

function toggleLahan(lahan: any, pekebun: any) {
  if (isLahanDisabled(lahan, pekebun)) return;
  const strId = String(lahan.id);
  if (isLahanSelected(strId)) {
    const newIds = store.selectedLahanIds.filter((id) => id !== strId);
    store.setSelectedLahan(newIds);
  } else {
    store.setSelectedLahan([...store.selectedLahanIds, strId]);
  }
}

const selectedPekebunList = computed(() => allPekebun.value.filter((p) => store.selectedPekebunIds.includes(String(p.id))));

const validationResult = computed(() => store.step2ValidationResult);
const minimumRule = computed(() => store.step2MinimumRule);

function validateAndProceed() {
  if (store.selectedPekebunIds.length === 0) {
    toast.error('Pilih minimal 1 pekebun terlebih dahulu.');
    return;
  }
  if (store.selectedLahanIds.length === 0) {
    toast.error('Pilih minimal 1 lahan terlebih dahulu.');
    return;
  }
  if (!validationResult.value.isValid) {
    toast.error(validationResult.value.message || 'Syarat minimum pekebun & lahan belum terpenuhi.');
    return;
  }
  store.currentStep = 3;
}

function formatLuas(luas: number) {
  return `${luas.toLocaleString('id-ID')} ha`;
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Step Header -->
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-semibold text-slate-900">Step 2: Pekebun &amp; Lahan</h2>
      <p class="text-xs text-slate-500">Pilih pekebun yang akan diajukan dalam proposal, lengkapi dokumen kepemilikan lahan, dan pastikan memenuhi persyaratan minimum paket.</p>
    </div>

    <!-- Dokumen Persyaratan Terunggah -->
    <div v-if="store.dokumenUploads.length > 0" class="flex flex-col gap-2">
      <div class="flex items-center gap-2">
        <FileText class="w-3.5 h-3.5 text-slate-500" />
        <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Dokumen Persyaratan Terunggah</span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div v-for="doc in store.dokumenUploads" :key="doc.persyaratanId" class="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
          <span class="text-xs text-slate-700 truncate">{{ getDocLabel(doc) }}</span>
          <button
            @click="
              () => {
                previewDoc = { dataUrl: doc.dataUrl, mimeType: doc.mimeType, title: getDocLabel(doc) };
                showDocPreview = true;
              }
            "
            class="text-xs text-[#066C2A] font-semibold hover:underline ml-2 shrink-0"
          >
            Pratinjau
          </button>
        </div>
      </div>
    </div>

    <!-- Validation Status Bar -->
    <div
      v-if="selectedPekebunList.length > 0"
      :class="['flex items-start gap-3 p-3 rounded-xl border text-xs transition-all duration-200', validationResult.isValid ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-amber-50 border-amber-200 text-amber-800']"
    >
      <CheckCircle2 v-if="validationResult.isValid" class="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
      <AlertCircle v-else class="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
      <div class="flex flex-col gap-0.5 min-w-0">
        <p class="font-semibold">Pekebun: {{ validationResult.totalPekebun }} | Total Luas: {{ validationResult.totalLuasHa.toFixed(1) }} Ha</p>
        <p v-if="validationResult.minimalPekebun !== null && validationResult.minimalLuasHa !== null">Minimum: {{ validationResult.minimalPekebun }} pekebun atau {{ validationResult.minimalLuasHa }} Ha</p>
        <p class="font-medium">{{ validationResult.message }}</p>
        <p v-if="minimumRule?.jarakAntarKebunKm !== null" class="flex items-center gap-1 text-amber-700">
          <Info class="w-3 h-3 shrink-0" />
          Catatan: {{ minimumRule?.keterangan }} (diverifikasi petugas lapangan)
        </p>
      </div>
    </div>

    <!-- Summary Bar -->
    <div v-if="store.selectedPekebunIds.length > 0" class="flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-xl text-xs font-medium text-slate-600">
      <Users class="w-3.5 h-3.5" />
      <span
        >Pekebun terpilih: <strong>{{ store.step3TotalPekebun }}</strong></span
      >
      <span class="text-slate-300">|</span>
      <span
        >Total luas: <strong>{{ store.step3TotalLuasHa.toFixed(1) }} Ha</strong></span
      >
    </div>

    <!-- Pekebun List -->
    <div class="flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <div class="h-px flex-1 bg-slate-200" />
        <div class="flex items-center gap-1.5">
          <Users class="w-3.5 h-3.5 text-slate-500" />
          <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daftar Pekebun</span>
        </div>
        <div class="h-px flex-1 bg-slate-200" />
      </div>

      <!-- Search & Double Dropdown Filter Controls + Sort Order -->
      <div v-if="allPekebun.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
        <!-- Search Input -->
        <div class="relative">
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Cari nama atau NIK..."
            class="w-full h-9 pl-3 pr-8 rounded-lg border border-slate-200 bg-white text-xs placeholder-slate-400 focus:outline-none focus:border-[#066C2A] focus:ring-1 focus:ring-[#066C2A]"
          />
        </div>

        <!-- Double Dropdown 1: Provinsi -->
        <div>
          <select v-model="filterProvinsi" @change="onProvinsiChange" class="w-full h-9 px-2 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:border-[#066C2A] focus:ring-1 focus:ring-[#066C2A]">
            <option value="">Semua Provinsi</option>
            <option v-for="prov in provinsiList" :key="prov.kode" :value="prov.kode">
              {{ prov.nama }}
            </option>
          </select>
        </div>

        <!-- Double Dropdown 2: Kabupaten / Kota -->
        <div>
          <select
            v-model="filterKabupaten"
            :disabled="!filterProvinsi"
            class="w-full h-9 px-2 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:border-[#066C2A] focus:ring-1 focus:ring-[#066C2A] disabled:bg-slate-100 disabled:opacity-60"
          >
            <option value="">{{ filterProvinsi ? 'Semua Kabupaten/Kota' : 'Pilih Provinsi Dahulu' }}</option>
            <option v-for="kab in kabupatenList" :key="kab.kode" :value="kab.kode">
              {{ kab.nama }}
            </option>
          </select>
        </div>

        <!-- Sort Dropdown: Nama (A–Z) / Nama (Z–A) -->
        <div>
          <select
            v-model="sortOrder"
            class="w-full h-9 px-2 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:border-[#066C2A] focus:ring-1 focus:ring-[#066C2A]"
          >
            <option value="asc">{{ LOCALIZATION.stepPilihPekebun.sortNameAsc }}</option>
            <option value="desc">{{ LOCALIZATION.stepPilihPekebun.sortNameDesc }}</option>
          </select>
        </div>
      </div>

      <!-- Loading state -->
      <div v-if="lahanStore.isLoading" class="flex flex-col items-center justify-center gap-3 py-12 px-4 bg-slate-50 rounded-xl border border-slate-200">
        <Loader2 class="w-8 h-8 text-[#066C2A] animate-spin" />
        <div class="text-center">
          <p class="text-sm font-semibold text-slate-600">Memuat data pekebun dan lahan...</p>
          <p class="text-xs text-slate-400 mt-0.5">Mohon tunggu sebentar</p>
        </div>
      </div>

      <!-- Empty state when no pekebun registered at all -->
      <div v-else-if="allPekebun.length === 0" class="flex flex-col items-center justify-center gap-3 py-12 px-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <Users class="w-8 h-8 text-slate-300" />
        <div class="text-center">
          <p class="text-sm font-semibold text-slate-500">Belum ada pekebun terdaftar</p>
          <p class="text-xs text-slate-400 mt-0.5">Daftarkan pekebun terlebih dahulu di modul Master Data Pekebun.</p>
        </div>
      </div>

      <!-- Empty state when search filters produce no results -->
      <div v-else-if="filteredPekebun.length === 0" class="flex flex-col items-center justify-center gap-3 py-12 px-4 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
        <Users class="w-8 h-8 text-slate-300" />
        <div class="text-center">
          <p class="text-sm font-semibold text-slate-500">Tidak ada pekebun yang cocok</p>
          <p class="text-xs text-slate-400 mt-0.5">Ubah kata kunci pencarian atau filter wilayah Anda.</p>
        </div>
      </div>

      <!-- Pekebun Cards with inline lahan -->
      <div v-else class="flex flex-col gap-2">
        <div
          v-for="pekebun in displayedPekebun"
          :key="pekebun.id"
          :class="[
            'flex flex-col rounded-xl border-2 transition-all duration-200',
            isPekebunDisabled(pekebun)
              ? 'border-slate-200 bg-slate-50/70 opacity-80'
              : isPekebunSelected(pekebun.id)
                ? 'border-[#066C2A] bg-emerald-50/50'
                : 'border-slate-200 bg-white'
          ]"
        >
          <!-- Pekebun header -->
          <div class="flex items-center justify-between p-3 gap-3">
            <button
              type="button"
              @click="togglePekebun(pekebun)"
              :disabled="isPekebunDisabled(pekebun)"
              class="flex items-center gap-3 text-left flex-1 min-w-0 transition-colors"
              :class="isPekebunDisabled(pekebun) ? 'cursor-not-allowed' : 'hover:opacity-90 cursor-pointer'"
            >
              <div
                :class="[
                  'w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-colors',
                  isPekebunDisabled(pekebun)
                    ? 'border-slate-300 bg-slate-200'
                    : isPekebunSelected(pekebun.id)
                      ? 'border-[#066C2A] bg-[#066C2A]'
                      : 'border-slate-300 bg-white'
                ]"
              >
                <svg v-if="isPekebunSelected(pekebun.id)" class="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div class="flex flex-col gap-0.5 flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <p
                    class="text-xs font-semibold truncate"
                    :class="isPekebunDisabled(pekebun) ? 'text-slate-500' : 'text-slate-800'"
                  >
                    {{ pekebun.nama }}
                  </p>
                  <!-- Disabled reason badge -->
                  <span
                    v-if="isPekebunDisabled(pekebun) && getPekebunDisabledReason(pekebun)"
                    class="text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full shrink-0"
                  >
                    {{ getPekebunDisabledReason(pekebun) }}
                  </span>
                  <!-- Dipilih badge -->
                  <span
                    v-else-if="isPekebunSelected(pekebun.id)"
                    class="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full shrink-0"
                  >
                    Dipilih
                  </span>
                </div>
                <p class="text-[10px] text-slate-500">
                  NIK: {{ pekebun.nik }} &bull; {{ getPekebunLands(pekebun).length }} Lahan
                </p>
              </div>
            </button>

            <!-- Expand / collapse chevron button -->
            <button
              v-if="getPekebunLands(pekebun).length > 0"
              type="button"
              @click.stop="toggleExpandPekebun(pekebun.id)"
              class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors shrink-0"
              :title="isPekebunExpanded(pekebun.id) ? 'Sembunyikan lahan' : 'Lihat daftar lahan'"
            >
              <ChevronUp v-if="isPekebunExpanded(pekebun.id)" class="w-4 h-4" />
              <ChevronDown v-else class="w-4 h-4" />
            </button>
          </div>

          <!-- List of lands with checkable select (visible when pekebun is selected or expanded) -->
          <div v-if="isPekebunExpanded(pekebun.id) && getPekebunLands(pekebun).length > 0" class="border-t border-slate-100 divide-y divide-slate-100 bg-slate-50/20">
            <div
              v-for="lahan in getPekebunLands(pekebun)"
              :key="lahan.id"
              :class="[
                'p-3 pl-8 flex flex-col gap-2 transition-colors',
                isLahanDisabled(lahan, pekebun) ? 'bg-slate-50/60 opacity-85' : 'hover:bg-slate-50/50'
              ]"
            >
              <!-- Checkbox selection & action row -->
              <div class="flex items-center justify-between gap-2">
                <button
                  type="button"
                  @click="toggleLahan(lahan, pekebun)"
                  :disabled="isLahanDisabled(lahan, pekebun)"
                  class="flex items-start gap-2 text-left flex-1 min-w-0"
                  :class="isLahanDisabled(lahan, pekebun) ? 'cursor-not-allowed' : 'cursor-pointer'"
                >
                  <div
                    :class="[
                      'w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors mt-0.5',
                      isLahanDisabled(lahan, pekebun)
                        ? 'border-slate-300 bg-slate-200'
                        : isLahanSelected(lahan.id)
                          ? 'border-[#066C2A] bg-[#066C2A]'
                          : 'border-slate-300 bg-white'
                    ]"
                  >
                    <svg v-if="isLahanSelected(lahan.id)" class="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div class="flex flex-col gap-0.5 min-w-0">
                    <div class="flex items-center gap-2 flex-wrap">
                      <p
                        class="text-[11px] font-semibold truncate"
                        :class="isLahanDisabled(lahan, pekebun) ? 'text-slate-500' : 'text-slate-700'"
                      >
                        {{ lahan.jenisLegalitas }} - {{ lahan.nomorLegalitas }}
                      </p>
                      <!-- Lahan proposal status badge -->
                      <span
                        v-if="getLahanProposalBadge(lahan)"
                        :class="[
                          'text-[10px] font-medium border px-1.5 py-0.5 rounded-md shrink-0',
                          getLahanProposalBadge(lahan)?.colorClass
                        ]"
                      >
                        {{ getLahanProposalBadge(lahan)?.text }}
                      </span>
                    </div>
                    <p class="text-[10px] text-slate-500">
                      Luas Lahan: <strong class="text-emerald-700 font-semibold">{{ formatLuas(lahan.luasLahan) }}</strong> &bull; Lokasi: {{ lahan.desaNama || lahan.desaKode || lahan.alamatKebun || '-'
                      }}{{ lahan.kecamatanNama ? ', ' + lahan.kecamatanNama : '' }}
                    </p>
                  </div>
                </button>

                <div class="shrink-0 ml-2">
                  <button
                    v-if="lahan.scanLegalitasUrl && lahan.scanLegalitasUrl !== '#'"
                    type="button"
                    @click.stop="openLahanDocPreview(lahan)"
                    class="flex items-center gap-1 text-[10px] font-semibold text-[#066C2A] hover:bg-emerald-50 active:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200 transition-colors"
                    :title="LOCALIZATION.lahanPreview.previewButton"
                  >
                    <FileText class="w-3 h-3" /> {{ LOCALIZATION.lahanPreview.previewButton }}
                  </button>
                  <span v-else class="text-[10px] text-slate-400 bg-slate-100 px-2 py-1 rounded-md italic">
                    {{ LOCALIZATION.lahanPreview.noDocument }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- No lahan indicator -->
          <div v-if="getPekebunLands(pekebun).length === 0" class="border-t border-slate-100 px-3 py-2 text-[10px] text-slate-400">Belum ada lahan</div>
        </div>

        <!-- Pagination: Lihat lebih banyak pekebun -->
        <div v-if="displayedPekebun.length < filteredPekebun.length" class="flex justify-center pt-2">
          <button
            type="button"
            @click="loadMorePekebun"
            class="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-[#066C2A] bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors shadow-sm cursor-pointer"
          >
            <span>Lihat lebih banyak pekebun</span>
            <ChevronDown class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Navigation -->
    <div class="flex justify-between pt-2">
      <button type="button" @click="store.currentStep = 1" class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors">
        <span class="text-lg leading-none">&larr;</span> Kembali
      </button>

      <div class="flex items-center gap-3">
        <button
          type="button"
          @click="handleSaveDraft"
          :disabled="store.isSavingDraft"
          class="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm disabled:opacity-50"
        >
          <Save class="w-4 h-4 text-slate-500" />
          <span>{{ store.isSavingDraft ? 'Menyimpan...' : 'Simpan Draft' }}</span>
        </button>

        <button
          type="button"
          @click="validateAndProceed"
          class="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-[#066C2A] text-white hover:bg-emerald-800 transition-colors shadow-sm"
        >
          Lanjut ke Step 3 <span class="text-lg leading-none">&rarr;</span>
        </button>
      </div>
    </div>

    <DocumentPreviewModal :isOpen="showDocPreview" :title="previewDoc?.title || ''" :dataUrl="previewDoc?.dataUrl || ''" :mimeType="previewDoc?.mimeType || ''" @close="showDocPreview = false" />
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
</style>
