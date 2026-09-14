<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePengusulanStore } from '@/stores/pengusulan';

import Card from '@/components/ui/Card.vue';
import Badge from '@/components/ui/Badge.vue';
import Button from '@/components/ui/Button.vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import Modal from '@/components/ui/Modal.vue';
import CascadingPaketSelect from '@/components/ui/CascadingPaketSelect.vue';
import Pagination from '@/components/ui/Pagination.vue';

import { getStatusLabel, getJenisSarprasLabel, PengajuanStatus } from '@/types/pengusulan';
import { usePekebunStore } from '@/stores/pekebun';
import { useAuthStore } from '@/stores/auth';
import { Search, Filter, ClipboardList, ChevronDown, CheckCircle2, FileText, ArrowUpDown, ArrowUp, ArrowDown, Download, Trash2 } from 'lucide-vue-next';
import ExportProposalModal from '@/components/pengusulan/ExportProposalModal.vue';
import { proposalService } from '@/services/proposal.service';
import { useToast } from '@/composables/useToast';

const store = usePengusulanStore();
const pekebunStore = usePekebunStore();
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const userKelembagaanId = computed(() => {
  return (
    (authStore.user?.kelembagaan_id ? Number(authStore.user.kelembagaan_id) : undefined) ??
    (authStore.user?.kelembagaanId ? Number(authStore.user.kelembagaanId) : undefined)
  );
});

const showDeleteConfirmModal = ref(false);
const draftToDelete = ref<any | null>(null);
const isDeletingDraft = ref(false);

function confirmDeleteDraft(item: any) {
  draftToDelete.value = item;
  showDeleteConfirmModal.value = true;
}

async function handleDeleteDraft() {
  if (!draftToDelete.value) return;
  isDeletingDraft.value = true;
  try {
    await proposalService.delete(draftToDelete.value.id);
    toast.success('Draft proposal berhasil dihapus.');
    showDeleteConfirmModal.value = false;
    draftToDelete.value = null;
    await loadProposals();
  } catch (err: any) {
    toast.error(err?.response?.data?.error?.message || err?.message || 'Gagal menghapus draft proposal.');
  } finally {
    isDeletingDraft.value = false;
  }
}

const showExportModal = ref(false);
const searchQuery = ref('');
const filterStatus = ref('');
const filterCategory = ref('');
const filterJenisSarpras = ref('');
const filterStartDate = ref('');
const filterEndDate = ref('');
const showFilterModal = ref(false);

const currentPage = ref(1);
const pageSize = ref(10);
const sortBy = ref('updated_at');
const sortOrder = ref<'asc' | 'desc'>('desc');

// ─── Draft filter state (modal: commit on "Terapkan" only) ───────────────────────
const draftFilterStatus = ref('');
const draftFilterCategory = ref('');
const draftFilterJenisSarpras = ref('');
const draftFilterStartDate = ref('');
const draftFilterEndDate = ref('');

function openFilterModal() {
  draftFilterStatus.value = filterStatus.value;
  draftFilterCategory.value = filterCategory.value;
  draftFilterJenisSarpras.value = filterJenisSarpras.value;
  draftFilterStartDate.value = filterStartDate.value;
  draftFilterEndDate.value = filterEndDate.value;
  showFilterModal.value = true;
}

function applyFilter() {
  filterStatus.value = draftFilterStatus.value;
  filterCategory.value = draftFilterCategory.value;
  filterJenisSarpras.value = draftFilterJenisSarpras.value;
  filterStartDate.value = draftFilterStartDate.value;
  filterEndDate.value = draftFilterEndDate.value;
  showFilterModal.value = false;
  currentPage.value = 1;
  loadProposals();
}

function resetDraftFilter() {
  draftFilterStatus.value = '';
  draftFilterCategory.value = '';
  draftFilterJenisSarpras.value = '';
  draftFilterStartDate.value = '';
  draftFilterEndDate.value = '';
}

const pageLoading = ref(true);

async function loadProposals() {
  pageLoading.value = true;
  try {
    const isDraftParam = filterStatus.value === 'DRAFT' ? true : undefined;
    const statusParam = filterStatus.value === 'DRAFT' ? undefined : (filterStatus.value || undefined);
    await store.fetchProposals({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value || undefined,
      status: statusParam,
      is_draft: isDraftParam,
      start_date: filterStartDate.value || undefined,
      end_date: filterEndDate.value || undefined,
      sort_by: sortBy.value,
      sort_order: sortOrder.value,
      kelembagaan_id: userKelembagaanId.value ? String(userKelembagaanId.value) : undefined,
    });
  } finally {
    pageLoading.value = false;
  }
}

function toggleSort(col: string) {
  if (sortBy.value === col) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = col;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
  loadProposals();
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    loadProposals();
  }, 400);
});

// ─── Custom Dropdown State ──────────────────────────────────────────────────────
const statusDropdownOpen = ref(false);
const statusDropdownRef = ref<HTMLElement | null>(null);

const statusSearchQuery = ref('');

const filteredStatusOptions = computed(() => {
  const q = statusSearchQuery.value.toLowerCase();
  if (!q) return statusOptions.value;
  return statusOptions.value.filter((s) =>
    getStatusLabel(s as PengajuanStatus)
      .toLowerCase()
      .includes(q),
  );
});

function openStatusDropdown() {
  statusSearchQuery.value = '';
  statusDropdownOpen.value = !statusDropdownOpen.value;
}

function onDocumentClick(e: MouseEvent) {
  if (statusDropdownRef.value && !statusDropdownRef.value.contains(e.target as Node)) {
    statusDropdownOpen.value = false;
  }
}

onMounted(async () => {
  document.addEventListener('click', onDocumentClick);
  await loadProposals();
});
onUnmounted(() => document.removeEventListener('click', onDocumentClick));

const breadcrumbs = [
  { label: 'Beranda', to: '/dashboard' },
  { label: 'Pengajuan Proposal', active: true },
];

const statusOptions = computed(() => {
  const rawStatuses = [
    'DRAFT',
    'SUBMITTED',
    'REV_FROM_KAB',
    'KAB_SUBMITTED',
    'REV_FROM_PROV',
    'PROV_SUBMITTED',
    'REV_FROM_DITJEN_VERIF',
    'DITJEN_VERIF_SUBMITTED',
    'REV_FROM_DITJEN_APPR',
    'DITJEN_APPR_SUBMITTED',
    'BPDP_VERIF_SUBMITTED',
    'REV_FROM_BPDP_VERIF',
    'BPDP_APPR_SUBMITTED',
    'REV_FROM_BPDP_APPR',
    'SK_DIRUT_PUBLISHED',
    'PKS_BPDP_SIGNED',
    'DISBURSED',
    'COMPLETED',
  ];

  // Collect actual statuses from current proposal list if any new ones exist
  const actualStatuses = store.listPengajuan.map((item) => item.status || item.currentStatus || '').filter((s) => s && s !== 'REJECTED' && s !== 'Ditolak');

  const combined = Array.from(new Set([...rawStatuses, ...actualStatuses]));

  const seenLabels = new Set<string>();
  const options: string[] = [];
  for (const s of combined) {
    if (s === 'REJECTED' || s === 'Ditolak') continue;
    const label = getStatusLabel(s as PengajuanStatus);
    if (label && label !== 'Ditolak' && !seenLabels.has(label)) {
      seenLabels.add(label);
      options.push(s);
    }
  }
  return options;
});

function getKabupatenNama(item: any): string {
  if (item.kabupatenNama) return item.kabupatenNama;
  if (item.kabupaten) return item.kabupaten;
  if (item.lembaga?.kabupatenNama) return item.lembaga.kabupatenNama;
  if (item.lembaga?.kabupaten) return item.lembaga.kabupaten;
  const kode = item.kabupatenKode || item.lembaga?.kabupatenKode || item.kode_kabupaten;
  if (kode) {
    const nama = pekebunStore.getWilayahNama(kode);
    if (nama) return nama;
  }
  if (item.lahans && item.lahans.length > 0) {
    const lahanKab = item.lahans[0].kode_kabupaten || item.lahans[0].kabupatenKode;
    if (lahanKab) {
      const nama = pekebunStore.getWilayahNama(lahanKab);
      if (nama) return nama;
    }
  }
  return 'Kab. Luwu Utara';
}

function getProvinsiNama(item: any): string {
  if (item.provinsiNama) return item.provinsiNama;
  if (item.provinsi) return item.provinsi;
  if (item.lembaga?.provinsiNama) return item.lembaga.provinsiNama;
  if (item.lembaga?.provinsi) return item.lembaga.provinsi;
  const kode = item.provinsiKode || item.lembaga?.provinsiKode || item.kode_provinsi;
  if (kode) {
    const nama = pekebunStore.getWilayahNama(kode);
    if (nama) return nama;
  }
  if (item.lahans && item.lahans.length > 0) {
    const lahanProv = item.lahans[0].kode_provinsi || item.lahans[0].provinsiKode;
    if (lahanProv) {
      const nama = pekebunStore.getWilayahNama(lahanProv);
      if (nama) return nama;
    }
  }
  return 'Sulawesi Selatan';
}

const filteredPengajuan = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();

  return store.listPengajuan.filter((item) => {
    const nomor = item.nomor_proposal || item.nomorProposal || '';
    const namaLembaga = item.lembaga?.namaLembaga || '';
    const kab = getKabupatenNama(item);
    const prov = getProvinsiNama(item);
    const paket = item.paket_sarpras || item.jenisSarpras || '';
    const detail = item.detail_usulan || item.detailUsulan || '';
    const searchableText = [item.id, nomor, namaLembaga, kab, prov, paket, detail].filter(Boolean).join(' ').toLowerCase();

    const matchSearch = !query || searchableText.includes(query);

    const currStatus = item.status || item.currentStatus || '';
    const isDraftItem = Boolean(item.is_draft || (item as any).isDraft || currStatus === 'DRAFT');
    let matchStatus = true;
    if (filterStatus.value === 'DRAFT') {
      matchStatus = isDraftItem;
    } else if (filterStatus.value) {
      matchStatus = !isDraftItem && (currStatus === filterStatus.value || getStatusLabel(currStatus) === getStatusLabel(filterStatus.value));
    }

    const matchJenis = !filterJenisSarpras.value || paket === filterJenisSarpras.value;

    const dateVal = item.created_at || item.createdAt;
    const itemDate = dateVal ? new Date(dateVal) : null;
    const matchStartDate = !filterStartDate.value || (itemDate && itemDate >= new Date(filterStartDate.value));
    const matchEndDate = !filterEndDate.value || (itemDate && itemDate <= new Date(filterEndDate.value + 'T23:59:59'));

    const matchKelembagaan =
      !userKelembagaanId.value ||
      (!item.kelembagaan_id && !item.lembaga?.id) ||
      (item.kelembagaan_id && String(item.kelembagaan_id) === String(userKelembagaanId.value)) ||
      (item.lembaga?.id && String(item.lembaga.id) === String(userKelembagaanId.value));

    return matchSearch && matchStatus && matchJenis && matchStartDate && matchEndDate && matchKelembagaan;
  });
});

const getStatusBadgeVariant = (status: string) => {
  switch (status) {
    case 'DRAFT':
      return 'secondary';

    case 'SK_DIRUT_PUBLISHED':
    case 'SELESAI':
    case 'SK_DIRUT_ISSUED':
    case 'PKS_BPDP_SIGNED':
    case 'DISBURSED':
    case 'COMPLETED':
      return 'success';

    case 'REV_FROM_KAB':
    case 'REV_FROM_PROV':
    case 'REV_FROM_DITJEN_VERIF':
    case 'REV_FROM_DITJEN_APPR':
    case 'REV_FROM_BPDP_VERIF':
    case 'REV_FROM_BPDP_APPR':
    case 'REVISION_ADMIN':
      return 'warning';

    case 'SUBMITTED':
    case 'KAB_SUBMITTED':
    case 'PROV_SUBMITTED':
    case 'DITJEN_VERIF_SUBMITTED':
    case 'DITJEN_APPR_SUBMITTED':
    case 'BPDP_VERIF_SUBMITTED':
    case 'BPDP_APPR_SUBMITTED':
    case 'REKOMTEK_KAB_ISSUED':
    case 'VALIDATED_PROV':
    case 'SK_DITJENBUN_ISSUED':
    case 'VERIFIED_ADMIN':
    case 'VERIFIED_FIELD':
    case 'GENERATE_SK_DIRUT':
      return 'info';

    default:
      return 'secondary';
  }
};

const formatDate = (dateStr?: string) => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-col gap-1.5 flex-1 min-w-0">
        <Breadcrumb :items="breadcrumbs" />

        <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 font-apple-display-md truncate">Status & Tracking Proposal</h1>

        <p class="text-xs text-slate-500 font-apple-caption truncate">Monitoring progres usulan bantuan sarana prasarana kelapa</p>
      </div>

      <div class="flex shrink-0">
        <Button variant="primary" size="sm" @click="router.push('/pengusulan/baru')"> + Buat Proposal Baru </Button>
      </div>
    </header>

    <div v-if="pageLoading" class="flex flex-col gap-5">
      <Skeleton class="h-16 w-full rounded-2xl" />
      <Skeleton class="h-96 w-full rounded-2xl" />
    </div>

    <template v-else>
      <!-- SEARCH + FILTER BUTTON -->
      <div class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="flex items-center gap-3 p-4">
          <div class="relative flex-1">
            <Search class="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nomor proposal, lembaga, paket sarpras..."
              class="w-full h-10 pl-10 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs md:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A]"
            />
          </div>
          <button
            type="button"
            @click="openFilterModal"
            class="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <Filter class="w-3.5 h-3.5" />
            Filter
          </button>
          <button
            type="button"
            @click="showExportModal = true"
            class="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors shrink-0"
          >
            <Download class="w-3.5 h-3.5" />
            Ekspor
          </button>
        </div>
      </div>

      <!-- FILTER MODAL -->
      <Modal :isOpen="showFilterModal" title="Filter Proposal" :overflowVisible="true" @close="showFilterModal = false">
        <div class="flex flex-col gap-4">
          <!-- Status Filter with Custom Dropdown -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-300">Status</label>
            <div ref="statusDropdownRef" class="relative">
              <button
                type="button"
                @click="openStatusDropdown"
                :class="[
                  'flex items-center justify-between w-full h-10 px-3 rounded-xl border text-left transition-all duration-200',
                  statusDropdownOpen || draftFilterStatus ? 'border-[#066C2A] bg-emerald-50/50 dark:bg-emerald-950/30' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-emerald-300',
                ]"
              >
                <span v-if="draftFilterStatus" class="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <Badge :variant="getStatusBadgeVariant(draftFilterStatus)" customClass="pointer-events-none">
                    {{ getStatusLabel(draftFilterStatus) }}
                  </Badge>
                </span>
                <span v-else class="text-xs text-slate-400">Semua Status</span>
                <ChevronDown :class="['w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200', statusDropdownOpen ? 'rotate-180' : '']" />
              </button>

              <Transition name="dropdown">
                <div v-if="statusDropdownOpen" class="absolute z-20 mt-1 w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg overflow-hidden">
                  <div class="p-2 border-b border-slate-100 dark:border-slate-800">
                    <input
                      v-model="statusSearchQuery"
                      type="text"
                      placeholder="Ketik untuk mencari..."
                      class="w-full h-8 px-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A]"
                      @click.stop
                    />
                  </div>
                  <div class="max-h-48 overflow-y-auto">
                    <button
                      type="button"
                      @click="
                        draftFilterStatus = '';
                        statusDropdownOpen = false;
                      "
                      :class="['flex items-center w-full px-3 py-2 text-left text-xs transition-colors', !draftFilterStatus ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800']"
                    >
                      <span class="text-slate-500 dark:text-slate-400">Semua Status</span>
                      <CheckCircle2 v-if="!draftFilterStatus" class="w-3 h-3 text-[#066C2A] shrink-0 ml-auto" />
                    </button>
                    <button
                      v-for="status in filteredStatusOptions"
                      :key="status"
                      type="button"
                      @click="
                        draftFilterStatus = status;
                        statusDropdownOpen = false;
                      "
                      :class="['flex items-center w-full px-3 py-2 text-left transition-colors', draftFilterStatus === status ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'hover:bg-slate-50 dark:hover:bg-slate-800']"
                    >
                      <Badge :variant="getStatusBadgeVariant(status)" customClass="pointer-events-none">
                        {{ getStatusLabel(status) }}
                      </Badge>
                      <CheckCircle2 v-if="draftFilterStatus === status" class="w-3 h-3 text-[#066C2A] shrink-0 ml-auto" />
                    </button>
                    <div v-if="filteredStatusOptions.length === 0" class="px-3 py-3 text-center text-xs text-slate-400">Tidak ada status yang cocok</div>
                  </div>
                </div>
              </Transition>
            </div>
          </div>

          <!-- Windows Desktop Style Hover Cascading Double Dropdown for Filter Paket Sarpras -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-300">Paket Sarpras</label>
            <CascadingPaketSelect
              :model-value="draftFilterJenisSarpras"
              placeholder="Semua Paket Sarpras"
              @update:model-value="
                (val) => {
                  draftFilterJenisSarpras = (val as string) || '';
                }
              "
            />
          </div>

          <!-- Date Range -->
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-slate-600 dark:text-slate-300">Tanggal Pengajuan</label>
            <div class="grid grid-cols-2 gap-2">
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-[10px] text-slate-400 font-semibold">Dari</span>
                <input
                  v-model="draftFilterStartDate"
                  type="date"
                  class="w-full h-10 pl-12 pr-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A]"
                />
              </div>
              <div class="relative">
                <span class="absolute left-3 top-2.5 text-[10px] text-slate-400 font-semibold">Sampai</span>
                <input
                  v-model="draftFilterEndDate"
                  type="date"
                  class="w-full h-10 pl-14 pr-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A]"
                />
              </div>
            </div>
          </div>
        </div>
        <template #footer>
          <button type="button" @click="resetDraftFilter" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Reset</button>
          <button type="button" @click="applyFilter" class="px-4 py-2 rounded-xl text-xs font-semibold bg-[#066C2A] text-white hover:bg-emerald-800 transition-colors">Terapkan</button>
        </template>
      </Modal>

      <!-- LIST VIEW: DATA TABLE -->
      <div class="flex flex-col gap-5">
        <Card custom-class="shadow-sm">
          <div class="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-t-xl">
            <table class="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead class="bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th class="p-4 w-12 text-center">No</th>
                  <th class="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none" @click="toggleSort('created_at')">
                    <div class="flex items-center gap-1.5">
                      <span>Tanggal Pengajuan</span>
                      <ArrowUp v-if="sortBy === 'created_at' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                      <ArrowDown v-else-if="sortBy === 'created_at' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                      <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                    </div>
                  </th>
                  <th class="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none" @click="toggleSort('nomor_proposal')">
                    <div class="flex items-center gap-1.5">
                      <span>Nomor Proposal</span>
                      <ArrowUp v-if="sortBy === 'nomor_proposal' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                      <ArrowDown v-else-if="sortBy === 'nomor_proposal' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                      <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                    </div>
                  </th>
                  <th class="p-4">Kelembagaan Pekebun</th>
                  <th class="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none" @click="toggleSort('paket_sarpras')">
                    <div class="flex items-center gap-1.5">
                      <span>Paket Usulan</span>
                      <ArrowUp v-if="sortBy === 'paket_sarpras' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                      <ArrowDown v-else-if="sortBy === 'paket_sarpras' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                      <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                    </div>
                  </th>
                  <th class="p-4">Jumlah Pekebun</th>
                  <th class="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none" @click="toggleSort('total_anggaran')">
                    <div class="flex items-center gap-1.5">
                      <span>Total Anggaran</span>
                      <ArrowUp v-if="sortBy === 'total_anggaran' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                      <ArrowDown v-else-if="sortBy === 'total_anggaran' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                      <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                    </div>
                  </th>
                  <th class="p-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors select-none" @click="toggleSort('status')">
                    <div class="flex items-center gap-1.5">
                      <span>Status</span>
                      <ArrowUp v-if="sortBy === 'status' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                      <ArrowDown v-else-if="sortBy === 'status' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                      <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                    </div>
                  </th>
                  <th class="p-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="(item, index) in filteredPengajuan" :key="item.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="p-4 text-center font-semibold text-slate-400">{{ (currentPage - 1) * pageSize + index + 1 }}</td>
                  <td class="p-4 text-slate-600 dark:text-slate-400 font-medium">{{ formatDate(item.created_at || item.createdAt) }}</td>
                  <td class="p-4 font-semibold text-slate-900 dark:text-slate-100">{{ item.nomor_proposal || item.nomorProposal }}</td>
                  <td class="p-4 font-medium text-slate-800 dark:text-slate-200">{{ item.lembaga?.namaLembaga || 'Kelembagaan' }}</td>
                  <td class="p-4 text-slate-600 dark:text-slate-400">{{ getJenisSarprasLabel(item.paket_sarpras || item.jenisSarpras) }}</td>
                  <td class="p-4 font-bold text-slate-800 dark:text-slate-200">
                    {{ item?.jumlah_pekebun || 0 }} <span class="text-[10px] font-medium text-slate-400">Orang</span>
                  </td>
                  <td class="p-4 font-bold text-[#066C2A]">Rp {{ (item.total_anggaran ?? item.totalAnggaranPengajuan ?? 0).toLocaleString('id-ID') }}</td>
                  <td class="p-4">
                    <Badge :variant="getStatusBadgeVariant((item.is_draft || (item as any).isDraft) ? 'DRAFT' : (item.status || item.currentStatus))">
                      {{ (item.is_draft || (item as any).isDraft) ? 'Draft' : getStatusLabel(item.status || item.currentStatus) }}
                    </Badge>
                  </td>
                  <td class="p-4 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <!-- DRAFT: Lanjutkan Pengisian & Hapus Draft -->
                      <template v-if="(item.is_draft || (item as any).isDraft) || (item.status || item.currentStatus) === 'DRAFT'">
                        <button
                          type="button"
                          @click.stop="router.push(`/pengusulan/baru?draft_id=${item.id}`)"
                          class="px-3 py-1.5 text-xs font-bold bg-[#066C2A] hover:bg-emerald-800 text-white rounded-xl flex items-center gap-1 shadow-xs transition-colors shrink-0"
                        >
                          <FileText class="w-3.5 h-3.5" /> Lanjutkan Pengisian
                        </button>
                        <button
                          type="button"
                          @click.stop="confirmDeleteDraft(item)"
                          class="px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-1 transition-colors shrink-0"
                        >
                          <Trash2 class="w-3.5 h-3.5" /> Hapus Draft
                        </button>
                      </template>

                      <!-- REV_FROM_KAB: Perbaiki Usulan -->
                      <button
                        v-else-if="(item.status || item.currentStatus) === 'REV_FROM_KAB'"
                        @click.stop="router.push(`/pemohon/revisi-proposal/${item.id}`)"
                        class="px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-xl flex items-center gap-1 shadow-xs transition-colors shrink-0"
                      >
                        <FileText class="w-3.5 h-3.5" /> Perbaiki Usulan
                      </button>

                      <Button v-else variant="secondary" size="sm" class="font-semibold" @click="router.push(`/pengusulan/pengajuan-proposal/${item.id}`)"> Tinjau </Button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredPengajuan.length === 0">
                  <td colspan="9" class="p-12 text-center">
                    <ClipboardList class="mx-auto w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
                    <p class="font-semibold text-slate-800 dark:text-slate-200">Tidak ada proposal ditemukan</p>
                    <p class="text-xs text-slate-400">Coba ubah kata kunci atau filter pencarian</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <Pagination v-model:currentPage="currentPage" v-model:pageSize="pageSize" :totalItems="store.pagination.total" :pageSizeOptions="[10, 25, 50]" :disabled="pageLoading" @change="loadProposals" />
        </Card>
      </div>

      <!-- EXPORT MODAL -->
      <ExportProposalModal :is-open="showExportModal" page-title="Pengajuan Proposal" :source-data="store.listPengajuan" @close="showExportModal = false" />

      <!-- DELETE DRAFT MODAL -->
      <Modal :isOpen="showDeleteConfirmModal" title="Hapus Draft Proposal" @close="showDeleteConfirmModal = false">
        <div class="flex flex-col gap-4">
          <p class="text-sm text-slate-700 dark:text-slate-300">
            Apakah Anda yakin ingin menghapus draft proposal <span class="font-bold text-slate-900 dark:text-slate-100">{{ draftToDelete?.nomor_proposal || draftToDelete?.nomorProposal }}</span>?
          </p>
          <p class="text-xs text-rose-600 bg-rose-50 dark:bg-rose-950/30 p-3 rounded-xl border border-rose-200 dark:border-rose-900">
            Tindakan ini tidak dapat dibatalkan. Lahan dan dokumen yang terkait akan dibebaskan kembali.
          </p>
        </div>
        <template #footer>
          <button type="button" @click="showDeleteConfirmModal = false" class="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Batal</button>
          <button
            type="button"
            @click="handleDeleteDraft"
            :disabled="isDeletingDraft"
            class="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors disabled:opacity-50"
          >
            {{ isDeletingDraft ? 'Menghapus...' : 'Hapus Draft' }}
          </button>
        </template>
      </Modal>
    </template>
  </div>
</template>

<style scoped>
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
