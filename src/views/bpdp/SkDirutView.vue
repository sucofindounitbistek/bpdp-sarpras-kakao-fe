<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRekomtekStore } from '@/stores/rekomtek';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import { getJenisSarprasLabel, getStatusLabel } from '@/types/pengusulan';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Button from '@/components/ui/Button.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import QueueFilter from '@/components/ui/QueueFilter.vue';
import Pagination from '@/components/ui/Pagination.vue';
import { Eye, ArrowUpDown, ArrowUp, ArrowDown, Download } from 'lucide-vue-next';
import ExportProposalModal from '@/components/pengusulan/ExportProposalModal.vue';
import { getKabupatenNama, getProvinsiNama } from '@/utils/regionHelper';

const router = useRouter();
const authStore = useAuthStore();
const toast = useToast();
const store = useRekomtekStore();
const pengusulanStore = usePengusulanStore();

const searchQuery = ref('');
const status = ref('');
const jenisSarpras = ref('');
const showExportModal = ref(false);

const currentPage = ref(1);
const pageSize = ref(10);
const sortBy = ref('updated_at');
const sortOrder = ref<'asc' | 'desc'>('desc');

const filterStatusOptions = [{ value: 'BPDP_APPR_SUBMITTED', label: 'Disetujui Kadiv BPDP (Penerbitan SK)' }];

const SK_DIRUT_STATUSES = ['BPDP_APPR_SUBMITTED'];

const pageLoading = ref(true);

async function loadData() {
  if (authStore.activeRole === 'BPDP_APPROVAL') {
    toast.error('Akses ditolak: Anda tidak memiliki otoritas untuk mengakses menu SK Dirut', 'Forbidden');
    router.push('/bpdp/antrean');
    return;
  }

  pageLoading.value = true;
  try {
    const targetStatus = status.value ? [status.value] : SK_DIRUT_STATUSES;
    await pengusulanStore.fetchProposals({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value || undefined,
      status: targetStatus,
      sort_by: sortBy.value,
      sort_order: sortOrder.value,
    });
  } catch (err) {
    console.error('Gagal mengambil daftar usulan SK Dirut:', err);
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
  loadData();
}

let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch([searchQuery, status, jenisSarpras], () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    loadData();
  }, 350);
});

const handleResetFilters = () => {
  searchQuery.value = '';
  status.value = '';
  jenisSarpras.value = '';
};

onMounted(async () => {
  await loadData();
});

const filteredUsulans = computed<any[]>(() => {
  const sourceList: any[] = pengusulanStore.listPengajuan.length > 0 ? pengusulanStore.listPengajuan : store.usulans;
  return sourceList.filter((u: any) => {
    const proposalNomor = u.nomor_proposal || u.nomorProposal || u.nomorUsulan || '';
    const namaLembaga = u.lembaga?.namaLembaga || u.kelembagaan?.nama_lembaga || u.namaKelompokTani || '';
    const noRekomtek = u.no_rekomtek || u.noRekomtek || u.rekomtek?.nomorRekomtek || '';
    const uStatus = String(u.status || u.currentStatus || '');
    const uSarpras = u.paket_sarpras || u.jenisSarpras || '';

    // Search filter
    const matchSearch =
      !searchQuery.value || namaLembaga.toLowerCase().includes(searchQuery.value.toLowerCase()) || proposalNomor.toLowerCase().includes(searchQuery.value.toLowerCase()) || noRekomtek.toLowerCase().includes(searchQuery.value.toLowerCase());

    if (!matchSearch) return false;

    // Status filter
    if (status.value) {
      const matchStatus = uStatus === status.value || getStatusLabel(uStatus) === getStatusLabel(status.value as any);
      if (!matchStatus) return false;
    }

    // Jenis Sarpras filter
    if (jenisSarpras.value) {
      if (uSarpras !== jenisSarpras.value && getJenisSarprasLabel(uSarpras) !== getJenisSarprasLabel(jenisSarpras.value as any)) {
        return false;
      }
    }

    const allowedStatuses = ['BPDP_APPR_SUBMITTED', 'GENERATE_SK_DIRUT'];
    return allowedStatuses.includes(uStatus);
  });
});

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '-';
  }
}

const getStatusBadge = (s: string) => {
  switch (s) {
    case 'BPDP_APPR_SUBMITTED':
    case 'GENERATE_SK_DIRUT':
      return { text: 'Disetujui Kadiv BPDP', class: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' };
    case 'SELESAI':
    case 'SK_DIRUT_PUBLISHED':
    case 'SK_DIRUT_ISSUED':
      return { text: 'Selesai (SK Terbit)', class: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' };
    default:
      return { text: getStatusLabel(s) || s, class: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' };
  }
};
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-col gap-1.5">
        <Breadcrumb />
        <h1 class="text-base md:text-lg font-semibold text-slate-900 dark:text-white font-apple-display-lg mt-0.5">Penerbitan SK Dirut</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-apple-caption">Daftar usulan yang telah disetujui Kepala Divisi BPDP dan riwayat penerbitan Surat Keputusan Direktur Utama.</p>
      </div>
      <div class="flex items-center shrink-0">
        <Button variant="secondary" size="sm" @click="showExportModal = true" class="flex items-center gap-1.5">
          <Download class="w-4 h-4 text-emerald-600" />
          Ekspor Data
        </Button>
      </div>
    </header>

    <QueueFilter v-model:search="searchQuery" v-model:status="status" v-model:jenisSarpras="jenisSarpras" :status-options="filterStatusOptions" @reset="handleResetFilters" />

    <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden flex-1">
      <div v-if="pageLoading" class="p-6 flex flex-col gap-4">
        <Skeleton class="h-10 w-full rounded-xl" />
        <Skeleton class="h-16 w-full rounded-xl" />
        <Skeleton class="h-16 w-full rounded-xl" />
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th class="py-3 px-4 w-12 text-center">No</th>
              <th class="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none" @click="toggleSort('nomor_proposal')">
                <div class="flex items-center gap-1.5">
                  <span>Nomor Usulan</span>
                  <ArrowUp v-if="sortBy === 'nomor_proposal' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowDown v-else-if="sortBy === 'nomor_proposal' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </div>
              </th>
              <th class="py-3 px-4">Kelompok Tani / Lembaga</th>
              <th class="py-3 px-4">Kabupaten</th>
              <th class="py-3 px-4">Provinsi</th>
              <th class="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none" @click="toggleSort('no_rekomtek')">
                <div class="flex items-center gap-1.5">
                  <span>Nomor Rekomtek</span>
                  <ArrowUp v-if="sortBy === 'no_rekomtek' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowDown v-else-if="sortBy === 'no_rekomtek' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </div>
              </th>
              <th class="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none" @click="toggleSort('bentuk_bantuan')">
                <div class="flex items-center gap-1.5">
                  <span>Bentuk Bantuan</span>
                  <ArrowUp v-if="sortBy === 'bentuk_bantuan' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowDown v-else-if="sortBy === 'bentuk_bantuan' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </div>
              </th>
              <th class="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none" @click="toggleSort('status')">
                <div class="flex items-center gap-1.5">
                  <span>Status</span>
                  <ArrowUp v-if="sortBy === 'status' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowDown v-else-if="sortBy === 'status' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </div>
              </th>
              <th class="py-3 px-4 whitespace-nowrap cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none" @click="toggleSort('tanggal_sk_dirut')">
                <div class="flex items-center gap-1.5">
                  <span>Tanggal SK Dirut</span>
                  <ArrowUp v-if="sortBy === 'tanggal_sk_dirut' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowDown v-else-if="sortBy === 'tanggal_sk_dirut' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </div>
              </th>
              <th class="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none" @click="toggleSort('updated_at')">
                <div class="flex items-center gap-1.5">
                  <span>Tanggal Proposal Diterima</span>
                  <ArrowUp v-if="sortBy === 'updated_at' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowDown v-else-if="sortBy === 'updated_at' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </div>
              </th>
              <th class="py-3 px-4 w-28 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="(usulan, idx) in filteredUsulans" :key="usulan.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-[13px] text-slate-700 dark:text-slate-350 transition-colors">
              <td class="py-3.5 px-4 text-center font-apple-body-strong">{{ (currentPage - 1) * pageSize + idx + 1 }}</td>
              <td class="py-3.5 px-4 font-bold text-slate-900 dark:text-white">
                {{ usulan.nomor_proposal || usulan.nomorProposal || usulan.nomorUsulan || `USULAN-${usulan.id}` }}
              </td>
              <td class="py-3.5 px-4">
                {{ usulan.lembaga?.namaLembaga || usulan.kelembagaan?.nama_lembaga || usulan.namaKelompokTani || '-' }}
              </td>
              <td class="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                {{ getKabupatenNama(usulan) }}
              </td>
              <td class="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                {{ getProvinsiNama(usulan) }}
              </td>
              <td class="py-3.5 px-4">
                <span v-if="usulan.no_rekomtek || usulan.rekomtek?.nomorRekomtek" class="font-semibold text-slate-800 dark:text-slate-250">
                  {{ usulan.no_rekomtek || usulan.rekomtek?.nomorRekomtek }}
                </span>
                <span v-else class="text-slate-400 dark:text-slate-600">-</span>
              </td>
              <td class="py-3.5 px-4">
                <span v-if="usulan.paket_sarpras || usulan.bantuanType || usulan.bentuk_bantuan" class="capitalize font-semibold">
                  {{ getJenisSarprasLabel(usulan.paket_sarpras || usulan.bantuanType || usulan.bentuk_bantuan) || usulan.paket_sarpras || usulan.bantuanType }}
                </span>
                <span v-else class="text-slate-400 dark:text-slate-600">-</span>
              </td>
              <td class="py-3.5 px-4">
                <span :class="['px-2 py-1 rounded-md text-[11px] font-semibold border', getStatusBadge(usulan.status || usulan.currentStatus).class]">
                  {{ getStatusBadge(usulan.status || usulan.currentStatus).text }}
                </span>
              </td>
              <td class="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                <span v-if="usulan.tanggal_sk_dirut || (usulan as any).skDirut?.tanggalSk">
                  {{ formatDate(usulan.tanggal_sk_dirut || (usulan as any).skDirut?.tanggalSk) }}
                </span>
                <span v-else class="text-slate-400 dark:text-slate-600">-</span>
              </td>
              <td class="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                {{ formatDate(usulan.updated_at || usulan.updatedAt || usulan.created_at || usulan.createdAt) }}
              </td>
              <td class="py-3.5 px-4 text-center">
                <router-link :to="['SK_DIRUT_PUBLISHED', 'SELESAI', 'SK_DIRUT_ISSUED'].includes(usulan.status || usulan.currentStatus) ? `/bpdp/approval/${usulan.id}?from=sk-dirut` : `/bpdp/finalisasi/${usulan.id}`">
                  <button
                    type="button"
                    class="h-8 px-3 rounded-lg text-xs font-semibold text-[#066C2A] dark:text-emerald-400 hover:bg-[#066C2A]/10 dark:hover:bg-emerald-400/10 flex items-center justify-center gap-1.5 border border-transparent hover:border-[#066C2A]/20 dark:hover:border-emerald-400/20 active:scale-95 transition-all duration-200 w-full cursor-pointer"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>Tinjau</span>
                  </button>
                </router-link>
              </td>
            </tr>

            <tr v-if="filteredUsulans.length === 0">
              <td colspan="11" class="py-8 text-center text-slate-400 dark:text-slate-500 font-apple-body">Tidak ada usulan menunggu penerbitan SK Dirut.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <Pagination v-model:currentPage="currentPage" v-model:pageSize="pageSize" :totalItems="pengusulanStore.pagination.total" :pageSizeOptions="[10, 25, 50]" :disabled="pageLoading" @change="loadData" />
    </div>

    <!-- EXPORT MODAL -->
    <ExportProposalModal
      :is-open="showExportModal"
      page-title="Penerbitan SK Dirut (BPDPKS)"
      :default-statuses="['BPDP_APPR_SUBMITTED', 'SK_DIRUT_PUBLISHED', 'SELESAI', 'SK_DIRUT_ISSUED']"
      :available-statuses="filterStatusOptions"
      :search-query="searchQuery"
      @close="showExportModal = false"
    />
  </div>
</template>
