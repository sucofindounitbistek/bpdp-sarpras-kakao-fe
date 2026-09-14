<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useMasterSarprasStore } from '@/stores/masterSarpras';
import { masterSarprasService } from '@/services/masterSarpras.service';
import { useToast } from '@/composables/useToast';
import type { MasterPaketSarpras, DokumenPersyaratanItem } from '@/types/masterSarpras';
import {
  Package,
  FileText,
  Download,
  Search,
  ChevronRight,
  Scale,
  Users,
  X,
  Plus,
  Edit2,
  Trash2,
  Check,
  Loader2,
} from 'lucide-vue-next';

const masterStore = useMasterSarprasStore();
const toast = useToast();

const searchQuery = ref('');
const selectedKategori = ref<string>('ALL');

// Modal Detail View State
const selectedPaketDetail = ref<MasterPaketSarpras | null>(null);
const detailDocuments = ref<DokumenPersyaratanItem[]>([]);
const isLoadingDetail = ref(false);
const showDetailModal = ref(false);

// Modal Form (Create / Edit) State
const showFormModal = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);

interface FormState {
  kategori_code: string;
  code: string;
  name: string;
  label?: string;
  description: string;
  icon: string;
  is_pupuk: boolean;
  jumlah_tahap: number;
  kode_penomoran: string;
  minimal_pekebun: number | null;
  minimal_luas_ha: number | null;
  keterangan: string;
  dokumen_codes: string[];
}

const formState = ref<FormState>({
  kategori_code: '',
  code: '',
  name: '',
  label: '',
  description: '',
  icon: '📦',
  is_pupuk: false,
  jumlah_tahap: 1,
  kode_penomoran: '1',
  minimal_pekebun: null,
  minimal_luas_ha: null,
  keterangan: '',
  dokumen_codes: [],
});

// Delete Confirmation Modal State
const showDeleteModal = ref(false);
const deleteTargetPaket = ref<MasterPaketSarpras | null>(null);
const isDeleting = ref(false);

onMounted(async () => {
  await masterStore.fetchMasterData();
});

const filteredPakets = computed(() => {
  let list = masterStore.paketList;
  if (selectedKategori.value !== 'ALL') {
    list = list.filter((p) => p.kategori_code === selectedKategori.value);
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase();
    list = list.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.label && p.label.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q))
    );
  }
  return list;
});

// ─── Detail Modal ─────────────────────────────────────────────────────────────
async function openPaketDetail(paket: MasterPaketSarpras) {
  selectedPaketDetail.value = paket;
  showDetailModal.value = true;
  isLoadingDetail.value = true;
  try {
    const docs = await masterStore.fetchPersyaratan(paket.code, true);
    detailDocuments.value = docs;
  } catch (err) {
    console.error('Failed to load documents for paket:', err);
  } finally {
    isLoadingDetail.value = false;
  }
}

function closeDetailModal() {
  showDetailModal.value = false;
  selectedPaketDetail.value = null;
  detailDocuments.value = [];
}

// ─── Create & Edit Modal ──────────────────────────────────────────────────────
async function openCreateModal() {
  isEditing.value = false;
  if (masterStore.kategoriList.length === 0 || masterStore.dokumenCatalog.length === 0) {
    await masterStore.fetchMasterData(true);
  }
  const defaultKategori = masterStore.kategoriList[0]?.code || 'EKSTENSIFIKASI';
  formState.value = {
    kategori_code: defaultKategori,
    code: '',
    name: '',
    label: '',
    description: '',
    icon: '📦',
    is_pupuk: false,
    jumlah_tahap: 1,
    kode_penomoran: '1',
    minimal_pekebun: null,
    minimal_luas_ha: null,
    keterangan: '',
    dokumen_codes: [
      'LEGALITAS_KP',
      'SIMLUHTAN',
      'GAMBAR_LAHAN',
      'RAB_RK',
      'PERNYATAAN_LUAS',
      'REFERENSI_HARGA',
      'PERNYATAAN_TANPA_BAKAR',
      'DETAIL_PEKEBUN',
    ],
  };
  showFormModal.value = true;
}

async function openEditModal(paket: MasterPaketSarpras) {
  isEditing.value = true;
  isLoadingDetail.value = true;
  showFormModal.value = true;

  const resolvedName = (paket.name || '').trim() || (paket.label || '').trim() || '';

  // Initial fast setup from card
  formState.value = {
    kategori_code: paket.kategori_code || masterStore.kategoriList[0]?.code || 'EKSTENSIFIKASI',
    code: paket.code,
    name: resolvedName,
    label: resolvedName,
    description: paket.description || '',
    icon: paket.icon || '📦',
    is_pupuk: !!paket.is_pupuk,
    jumlah_tahap: paket.jumlah_tahap || 1,
    kode_penomoran: paket.kode_penomoran || '1',
    minimal_pekebun: paket.syarat_minimum?.minimal_pekebun ?? null,
    minimal_luas_ha: paket.syarat_minimum?.minimal_luas_ha ?? null,
    keterangan: paket.syarat_minimum?.keterangan ?? '',
    dokumen_codes: [],
  };

  if (masterStore.kategoriList.length === 0 || masterStore.dokumenCatalog.length === 0) {
    await masterStore.fetchMasterData(true);
  }

  try {
    const [detailRes, docs] = await Promise.all([
      masterSarprasService.getPaketDetail(paket.code).catch(() => null),
      masterStore.fetchPersyaratan(paket.code, true).catch(() => []),
    ]);

    const selectedDocCodes = (docs || []).map((d) => d.dokumen_code);
    const freshName = (detailRes?.name || '').trim() || (detailRes?.label || '').trim() || resolvedName;

    formState.value = {
      kategori_code: detailRes?.kategori_code || paket.kategori_code || masterStore.kategoriList[0]?.code || 'EKSTENSIFIKASI',
      code: paket.code,
      name: freshName,
      label: freshName,
      description: detailRes?.description ?? paket.description ?? '',
      icon: detailRes?.icon || paket.icon || '📦',
      is_pupuk: detailRes ? !!detailRes.is_pupuk : !!paket.is_pupuk,
      jumlah_tahap: detailRes?.jumlah_tahap || paket.jumlah_tahap || 1,
      kode_penomoran: detailRes?.kode_penomoran || paket.kode_penomoran || '1',
      minimal_pekebun: (detailRes?.syarat_minimum?.minimal_pekebun ?? paket.syarat_minimum?.minimal_pekebun) ?? null,
      minimal_luas_ha: (detailRes?.syarat_minimum?.minimal_luas_ha ?? paket.syarat_minimum?.minimal_luas_ha) ?? null,
      keterangan: (detailRes?.syarat_minimum?.keterangan ?? paket.syarat_minimum?.keterangan) ?? '',
      dokumen_codes: selectedDocCodes,
    };
  } catch (err) {
    console.error('Failed to prepare edit modal:', err);
  } finally {
    isLoadingDetail.value = false;
  }
}

function toggleDocSelection(docCode: string) {
  const idx = formState.value.dokumen_codes.indexOf(docCode);
  if (idx >= 0) {
    formState.value.dokumen_codes.splice(idx, 1);
  } else {
    formState.value.dokumen_codes.push(docCode);
  }
}

async function handleSavePaket() {
  const trimmedCode = formState.value.code.trim();
  const trimmedName = formState.value.name.trim();

  if (!trimmedCode) {
    toast.error('Kode paket wajib diisi');
    return;
  }
  if (!trimmedName) {
    toast.error('Nama paket wajib diisi');
    return;
  }
  if (!formState.value.kategori_code) {
    toast.error('Kategori wajib dipilih');
    return;
  }

  isSubmitting.value = true;
  try {
    if (isEditing.value) {
      await masterStore.updatePaket(trimmedCode, {
        kategori_code: formState.value.kategori_code,
        name: trimmedName,
        label: trimmedName,
        description: formState.value.description,
        icon: formState.value.icon,
        is_pupuk: formState.value.is_pupuk,
        jumlah_tahap: Number(formState.value.jumlah_tahap) || 1,
        kode_penomoran: formState.value.kode_penomoran?.trim() || '1',
        minimal_pekebun: formState.value.minimal_pekebun,
        minimal_luas_ha: formState.value.minimal_luas_ha,
        keterangan: formState.value.keterangan,
        dokumen_codes: formState.value.dokumen_codes,
      });
      toast.success(`Paket ${trimmedName} berhasil diperbarui`);
    } else {
      await masterStore.createPaket({
        kategori_code: formState.value.kategori_code,
        code: trimmedCode.toUpperCase(),
        name: trimmedName,
        label: trimmedName,
        description: formState.value.description,
        icon: formState.value.icon,
        is_pupuk: formState.value.is_pupuk,
        jumlah_tahap: Number(formState.value.jumlah_tahap) || 1,
        kode_penomoran: formState.value.kode_penomoran?.trim() || '1',
        minimal_pekebun: formState.value.minimal_pekebun,
        minimal_luas_ha: formState.value.minimal_luas_ha,
        keterangan: formState.value.keterangan,
        dokumen_codes: formState.value.dokumen_codes,
      });
      toast.success(`Paket baru ${trimmedName} berhasil ditambahkan`);
    }
    showFormModal.value = false;
  } catch (err: any) {
    toast.error(err?.response?.data?.error?.message || err?.message || 'Gagal menyimpan paket');
  } finally {
    isSubmitting.value = false;
  }
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────
function confirmDeletePaket(paket: MasterPaketSarpras) {
  deleteTargetPaket.value = paket;
  showDeleteModal.value = true;
}

async function handleDeletePaket() {
  if (!deleteTargetPaket.value) return;
  isDeleting.value = true;
  try {
    await masterStore.deletePaket(deleteTargetPaket.value.code);
    toast.success(`Paket ${deleteTargetPaket.value.name} berhasil dihapus`);
    showDeleteModal.value = false;
    deleteTargetPaket.value = null;
  } catch (err: any) {
    toast.error(err?.response?.data?.error?.message || err?.message || 'Gagal menghapus paket');
  } finally {
    isDeleting.value = false;
  }
}
</script>

<template>
  <div class="p-6 max-w-7xl mx-auto space-y-6">
    <!-- Header Page -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <div class="p-2 bg-emerald-50 rounded-xl text-emerald-600">
            <Package class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-xl font-bold text-slate-900">Master Data Paket Sarpras</h1>
            <p class="text-xs text-slate-500">
              Kelola katalog paket sarpras kelapa, batas kuota pekebun & lahan, serta checklist persyaratan dokumen
            </p>
          </div>
        </div>
      </div>

      <!-- Action & Metrics -->
      <div class="flex flex-wrap items-center gap-3">
        <button
          @click="openCreateModal"
          class="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-sm transition-all duration-200 active:scale-95"
        >
          <Plus class="w-4 h-4" />
          Tambah Paket Baru
        </button>

        <div class="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
          <span class="block text-[10px] text-slate-500 font-medium">Kategori</span>
          <span class="text-base font-bold text-slate-900">{{ masterStore.kategoriList.length || 9 }}</span>
        </div>
        <div class="px-3.5 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
          <span class="block text-[10px] text-emerald-600 font-medium">Paket Aktif</span>
          <span class="text-base font-bold text-emerald-700">{{ masterStore.paketList.length || 13 }}</span>
        </div>
      </div>
    </div>

    <!-- Filters & Search Bar -->
    <div class="flex flex-col md:flex-row items-center justify-between gap-4">
      <!-- Search Input -->
      <div class="relative w-full md:w-80">
        <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari kode atau nama paket..."
          class="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
        />
      </div>

      <!-- Category Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1">
        <button
          @click="selectedKategori = 'ALL'"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all',
            selectedKategori === 'ALL'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200',
          ]"
        >
          Semua Kategori
        </button>
        <button
          v-for="kat in masterStore.kategoriList"
          :key="kat.code"
          @click="selectedKategori = kat.code"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5',
            selectedKategori === kat.code
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200',
          ]"
        >
          <span>{{ kat.icon || '📦' }}</span>
          <span>{{ kat.name }}</span>
        </button>
      </div>
    </div>

    <!-- Package Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="paket in filteredPakets"
        :key="paket.code"
        class="bg-white rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
      >
        <div class="p-5 space-y-4">
          <!-- Top Row: Icon + Badges + Edit/Delete Menu -->
          <div class="flex items-start justify-between gap-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                {{ paket.icon || '📦' }}
              </div>
              <div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 uppercase tracking-wider">
                  {{ paket.code }}
                </span>
                <h3 class="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                  {{ paket.label || paket.name }}
                </h3>
              </div>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <button
                @click="openEditModal(paket)"
                title="Edit Paket"
                class="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <Edit2 class="w-4 h-4" />
              </button>
              <button
                @click="confirmDeletePaket(paket)"
                title="Hapus Paket"
                class="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Description -->
          <p class="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {{ paket.description || paket.name }}
          </p>

          <!-- Minimum Rules Box -->
          <div class="p-3 bg-slate-50/80 rounded-xl border border-slate-100 space-y-2 text-xs">
            <div class="flex items-center justify-between text-slate-700 font-medium">
              <span class="flex items-center gap-1.5 text-slate-500">
                <Users class="w-3.5 h-3.5 text-slate-400" />
                Min. Pekebun:
              </span>
              <span class="font-bold text-slate-900">
                {{ paket.syarat_minimum?.minimal_pekebun ? `${paket.syarat_minimum.minimal_pekebun} Pekebun` : '-' }}
              </span>
            </div>

            <div class="flex items-center justify-between text-slate-700 font-medium">
              <span class="flex items-center gap-1.5 text-slate-500">
                <Scale class="w-3.5 h-3.5 text-slate-400" />
                Min. Luas Lahan:
              </span>
              <span class="font-bold text-slate-900">
                {{ paket.syarat_minimum?.minimal_luas_ha ? `${paket.syarat_minimum.minimal_luas_ha} Ha` : '-' }}
              </span>
            </div>

            <div v-if="paket.syarat_minimum?.keterangan" class="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60">
              *{{ paket.syarat_minimum.keterangan }}
            </div>
          </div>
        </div>

        <!-- Footer Action -->
        <div class="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span
              v-if="paket.is_pupuk"
              class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200"
            >
              🌱 Pupuk
            </span>
            <span
              :class="[
                'text-[10px] font-bold px-2 py-0.5 rounded-full border',
                (paket.jumlah_tahap || 1) > 1
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200',
              ]"
            >
              {{ paket.jumlah_tahap || 1 }} Tahap RAB
            </span>
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200 font-mono"
              :title="`Kode nomor usulan: SPKA${paket.kode_penomoran || '1'}...`"
            >
              Kode: {{ paket.kode_penomoran || '1' }}
            </span>
          </div>

          <button
            @click="openPaketDetail(paket)"
            class="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            Persyaratan Dokumen
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredPakets.length === 0" class="p-12 text-center bg-white rounded-2xl border border-slate-200">
      <Package class="w-12 h-12 text-slate-300 mx-auto mb-3" />
      <h4 class="text-sm font-bold text-slate-700">Tidak ada paket sarpras yang sesuai</h4>
      <p class="text-xs text-slate-500 mt-1">Coba sesuaikan kata kunci pencarian atau filter kategori.</p>
    </div>

    <!-- ─── DETAIL MODAL ──────────────────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDetailModal" class="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div class="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shrink-0">
                  {{ selectedPaketDetail?.icon || '📦' }}
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <h3 class="text-base font-bold text-slate-900">
                      {{ selectedPaketDetail?.label || selectedPaketDetail?.name }}
                    </h3>
                    <span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {{ selectedPaketDetail?.code }}
                    </span>
                  </div>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Daftar kelengkapan berkas & persyaratan teknis proposal
                  </p>
                </div>
              </div>
              <button @click="closeDetailModal" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <X class="w-5 h-5" />
              </button>
            </div>

            <div class="p-5 overflow-y-auto space-y-5">
              <div class="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 grid grid-cols-3 gap-4 text-xs">
                <div>
                  <span class="text-slate-500 block">Batas Minimum Pekebun:</span>
                  <span class="font-bold text-slate-900 text-sm">
                    {{ selectedPaketDetail?.syarat_minimum?.minimal_pekebun ? `${selectedPaketDetail.syarat_minimum.minimal_pekebun} Orang` : 'Tidak Dibatasi' }}
                  </span>
                </div>
                <div>
                  <span class="text-slate-500 block">Batas Minimum Luas Lahan:</span>
                  <span class="font-bold text-slate-900 text-sm">
                    {{ selectedPaketDetail?.syarat_minimum?.minimal_luas_ha ? `${selectedPaketDetail.syarat_minimum.minimal_luas_ha} Hektar` : 'Tidak Dibatasi' }}
                  </span>
                </div>
                <div>
                  <span class="text-slate-500 block">Kode Penomoran Usulan:</span>
                  <span class="font-bold text-emerald-800 text-sm font-mono">
                    SPKA{{ selectedPaketDetail?.kode_penomoran || '1' }}...
                  </span>
                </div>
              </div>

              <div class="space-y-2">
                <div class="flex items-center justify-between">
                  <h4 class="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Dokumen Persyaratan ({{ detailDocuments.length }})
                  </h4>
                  <span class="text-[11px] text-slate-500">Maks. berkas 5MB (PDF/Gambar)</span>
                </div>

                <div v-if="isLoadingDetail" class="py-12 text-center text-xs text-slate-500">
                  Memuat checklist dokumen...
                </div>

                <div v-else class="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                  <div
                    v-for="(doc, idx) in detailDocuments"
                    :key="doc.dokumen_code"
                    class="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors text-xs"
                  >
                    <div class="flex items-start gap-2.5 min-w-0">
                      <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        {{ idx + 1 }}
                      </span>
                      <div class="min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-slate-900">{{ doc.nama }}</span>
                          <span
                            :class="[
                              'text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                              doc.is_wajib ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600',
                            ]"
                          >
                            {{ doc.is_wajib ? 'WAJIB' : 'OPSIONAL' }}
                          </span>
                        </div>
                        <span class="text-[11px] text-slate-500 block truncate font-mono mt-0.5">
                          {{ doc.dokumen_code }}
                        </span>
                      </div>
                    </div>

                    <div class="shrink-0">
                      <a
                        v-if="doc.format_download_url"
                        :href="doc.format_download_url"
                        target="_blank"
                        download
                        class="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 flex items-center gap-1 transition-colors"
                      >
                        <Download class="w-3.5 h-3.5" />
                        Format
                      </a>
                      <span v-else class="text-[11px] text-slate-400 italic">Tanpa Format</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                @click="closeDetailModal"
                class="px-5 py-2 text-xs font-bold rounded-xl bg-slate-800 text-white hover:bg-slate-900 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── FORM MODAL (TAMBAH / EDIT PAKET) ─────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showFormModal" class="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <!-- Form Header -->
            <div class="p-5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <h3 class="text-base font-bold text-slate-900">
                  {{ isEditing ? 'Edit Paket Sarpras' : 'Tambah Paket Sarpras Baru' }}
                </h3>
                <p class="text-xs text-slate-500 mt-0.5">
                  {{ isEditing ? 'Perbarui informasi paket, batas minimum dan daftar dokumen' : 'Isi formulir untuk menambahkan paket sarpras baru ke master data' }}
                </p>
              </div>
              <button @click="showFormModal = false" class="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                <X class="w-5 h-5" />
              </button>
            </div>

            <!-- Form Body -->
            <div class="p-6 overflow-y-auto space-y-6 text-xs">
              <!-- Basic Information -->
              <div class="space-y-4">
                <h4 class="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Package class="w-4 h-4 text-emerald-600" />
                  Informasi Utama
                </h4>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <!-- Kategori -->
                  <div>
                    <label class="block font-semibold text-slate-700 mb-1">
                      Kategori Sarpras <span class="text-rose-500">*</span>
                    </label>
                    <select
                      v-model="formState.kategori_code"
                      class="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option v-for="kat in masterStore.kategoriList" :key="kat.code" :value="kat.code">
                        {{ kat.icon || '📦' }} {{ kat.name }}
                      </option>
                    </select>
                  </div>

                  <!-- Kode Paket -->
                  <div>
                    <label class="block font-semibold text-slate-700 mb-1">
                      Kode Paket (Unik) <span class="text-rose-500">*</span>
                    </label>
                    <input
                      v-model="formState.code"
                      :disabled="isEditing"
                      type="text"
                      placeholder="Contoh: UPH_MULTI_JENIS"
                      class="w-full h-10 px-3 uppercase bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 disabled:bg-slate-100 disabled:text-slate-500 font-mono"
                    />
                  </div>

                  <!-- Nama Paket & Ikon -->
                  <div class="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div class="md:col-span-3">
                      <label class="block font-semibold text-slate-700 mb-1">
                        Nama Paket <span class="text-rose-500">*</span>
                      </label>
                      <input
                        v-model="formState.name"
                        type="text"
                        placeholder="Contoh: Unit Pengolahan Hasil Multi Produk"
                        class="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label class="block font-semibold text-slate-700 mb-1">Ikon</label>
                      <input
                        v-model="formState.icon"
                        type="text"
                        placeholder="🏭"
                        class="w-full h-10 px-3 text-center bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-lg"
                      />
                    </div>
                  </div>

                  <!-- Deskripsi -->
                  <div class="md:col-span-2">
                    <label class="block font-semibold text-slate-700 mb-1">Deskripsi Paket</label>
                    <textarea
                      v-model="formState.description"
                      rows="2"
                      placeholder="Keterangan dan ruang lingkup paket sarpras..."
                      class="w-full p-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    ></textarea>
                  </div>

                  <!-- Jumlah Tahap RAB -->
                  <div>
                    <label class="block font-semibold text-slate-700 mb-1">
                      Jumlah Tahap RAB <span class="text-rose-500">*</span>
                    </label>
                    <select
                      v-model.number="formState.jumlah_tahap"
                      class="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    >
                      <option :value="1">1 Tahap</option>
                      <option :value="2">2 Tahap</option>
                      <option :value="3">3 Tahap</option>
                      <option :value="4">4 Tahap</option>
                    </select>
                    <p class="text-[11px] text-slate-500 mt-1">
                      Menentukan jumlah termin penyusunan RAB &amp; alokasi bertahap.
                    </p>
                  </div>

                  <!-- Kode Nomor Paket (Penomoran Proposal) -->
                  <div>
                    <label class="block font-semibold text-slate-700 mb-1">
                      Kode Nomor Paket <span class="text-rose-500">*</span>
                    </label>
                    <input
                      v-model="formState.kode_penomoran"
                      type="text"
                      placeholder="Contoh: 1, 2, 10"
                      maxlength="10"
                      class="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono font-semibold"
                    />
                    <p class="text-[11px] text-slate-500 mt-1">
                      Prefix nomor proposal: <span class="font-mono text-emerald-700 font-bold">SPKA{{ formState.kode_penomoran || '1' }}...</span>
                    </p>
                  </div>
                </div>

                <!-- Checkbox Saprodi Pupuk -->
                <div class="flex items-center gap-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                  <input
                    v-model="formState.is_pupuk"
                    id="is_pupuk_checkbox"
                    type="checkbox"
                    class="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                  />
                  <label for="is_pupuk_checkbox" class="text-xs font-semibold text-amber-900 cursor-pointer">
                    Paket Saprodi Pupuk (Memerlukan Input Form Gudang Serah Terima & Verifikasi Gudang)
                  </label>
                </div>
              </div>

              <!-- Batas Minimum Rules -->
              <div class="space-y-4">
                <h4 class="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                  <Scale class="w-4 h-4 text-emerald-600" />
                  Batas Minimum Pekebun & Luas Lahan
                </h4>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block font-semibold text-slate-700 mb-1">Batas Minimal Pekebun (Orang)</label>
                    <input
                      v-model.number="formState.minimal_pekebun"
                      type="number"
                      min="0"
                      placeholder="Kosongkan jika tidak ada batas"
                      class="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label class="block font-semibold text-slate-700 mb-1">Batas Minimal Luas Lahan (Ha)</label>
                    <input
                      v-model.number="formState.minimal_luas_ha"
                      type="number"
                      step="0.1"
                      min="0"
                      placeholder="Kosongkan jika tidak ada batas"
                      class="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label class="block font-semibold text-slate-700 mb-1">Keterangan Tambahan Syarat Minimum</label>
                  <input
                    v-model="formState.keterangan"
                    type="text"
                    placeholder="Contoh: Minimal 20 orang atau luas minimal 3 Ha"
                    class="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              <!-- Pemetaan Dokumen Persyaratan -->
              <div class="space-y-3">
                <div class="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h4 class="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText class="w-4 h-4 text-emerald-600" />
                    Pemetaan Dokumen Persyaratan ({{ formState.dokumen_codes.length }} Dipilih)
                  </h4>
                  <span class="text-[11px] text-slate-500">Centang dokumen yang wajib diunggah untuk paket ini</span>
                </div>

                <div v-if="isLoadingDetail" class="py-8 text-center text-xs text-slate-500 bg-slate-50/50 rounded-xl border border-slate-200">
                  <Loader2 class="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                  <span>Memuat detail paket dan persyaratan berkas...</span>
                </div>

                <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
                  <div
                    v-for="doc in masterStore.dokumenCatalog"
                    :key="doc.code"
                    @click="toggleDocSelection(doc.code)"
                    :class="[
                      'p-2.5 rounded-lg border flex items-center gap-2.5 cursor-pointer transition-all select-none',
                      formState.dokumen_codes.includes(doc.code)
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50',
                    ]"
                  >
                    <div
                      :class="[
                        'w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-colors',
                        formState.dokumen_codes.includes(doc.code)
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white',
                      ]"
                    >
                      <Check v-if="formState.dokumen_codes.includes(doc.code)" class="w-3 h-3 stroke-[3]" />
                    </div>
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center justify-between gap-1">
                        <span class="block truncate text-xs">{{ doc.name }}</span>
                        <span
                          :class="[
                            'text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0',
                            doc.is_wajib !== false ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600',
                          ]"
                        >
                          {{ doc.is_wajib !== false ? 'WAJIB' : 'OPSIONAL' }}
                        </span>
                      </div>
                      <span class="block text-[10px] text-slate-400 font-mono">{{ doc.code }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Footer -->
            <div class="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                @click="showFormModal = false"
                class="px-4 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                @click="handleSavePaket"
                :disabled="isSubmitting || isLoadingDetail"
                class="px-6 py-2 text-xs font-bold rounded-xl bg-emerald-700 text-white hover:bg-emerald-800 transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Loader2 v-if="isSubmitting || isLoadingDetail" class="w-4 h-4 animate-spin" />
                <span>{{ isEditing ? 'Simpan Perubahan' : 'Buat Paket Sarpras' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ─── DELETE CONFIRMATION MODAL ────────────────────────────────────────── -->
    <Teleport to="body">
      <Transition name="fade">
        <div v-if="showDeleteModal" class="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div class="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 class="w-6 h-6" />
            </div>

            <div class="text-center space-y-1">
              <h3 class="text-base font-bold text-slate-900">Hapus Paket Sarpras?</h3>
              <p class="text-xs text-slate-500 leading-relaxed">
                Anda yakin ingin menghapus paket <strong class="text-slate-800">{{ deleteTargetPaket?.name }} ({{ deleteTargetPaket?.code }})</strong>? Seluruh konfigurasi syarat dan pemetaan dokumen untuk paket ini akan dihapus.
              </p>
            </div>

            <div class="flex items-center gap-3 pt-2">
              <button
                @click="showDeleteModal = false"
                class="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
              >
                Batal
              </button>
              <button
                @click="handleDeletePaket"
                :disabled="isDeleting"
                class="flex-1 py-2.5 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 shadow-sm"
              >
                <Loader2 v-if="isDeleting" class="w-4 h-4 animate-spin" />
                <span>Hapus Paket</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

