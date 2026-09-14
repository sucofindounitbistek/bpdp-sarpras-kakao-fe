<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useAuthStore } from '@/stores/auth';
import Card from '@/components/ui/Card.vue';
import Badge from '@/components/ui/Badge.vue';
import Button from '@/components/ui/Button.vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import QueueFilter from '@/components/ui/QueueFilter.vue';
import Pagination from '@/components/ui/Pagination.vue';
import { useRouter } from 'vue-router';
import { getJenisSarprasLabel, getStatusLabel } from '@/types/pengusulan';
import { LOCALIZATION } from '@/config/localization';
import { useToast } from '@/composables/useToast';
import { ArrowUpDown, ArrowUp, ArrowDown, Download, ListTodo, Layers } from 'lucide-vue-next';
import ExportProposalModal from '@/components/pengusulan/ExportProposalModal.vue';
import ProposalWorkflowStaticStepper from '@/components/pengusulan/ProposalWorkflowStaticStepper.vue';
import { getKabupatenNama, getProvinsiNama } from '@/utils/regionHelper';

const store = usePengusulanStore();
const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

const activeRegencyName = computed(() => {
  if (store.listPengajuan && store.listPengajuan.length > 0) {
    const fromProposal = getKabupatenNama(store.listPengajuan[0]);
    if (fromProposal && fromProposal !== '-') return fromProposal;
  }
  const nomenklatur = authStore.user?.nomenklatur_dinas;
  if (nomenklatur) {
    const match = nomenklatur.match(/(?:Kabupaten|Kab\.|Kota)\s+([A-Za-z\s]+)/i);
    if (match && match[0]) return match[0].trim();
  }
  return 'Kab. Luwu Utara';
});

const pageLoading = ref(true);
const showExportModal = ref(false);

const activeTaskTab = ref<'my_task' | 'whole_task'>('my_task');

const search = ref('');
const status = ref('');
const jenisSarpras = ref('');

const currentPage = ref(1);
const pageSize = ref(10);
const sortBy = ref('updated_at');
const sortOrder = ref<'asc' | 'desc'>('desc');

const KAB_MY_TASK_STATUSES = ['SUBMITTED', 'REV_FROM_PROV'];

const filterStatusOptions = computed(() => {
  if (activeTaskTab.value === 'my_task') {
    return [
      { value: 'SUBMITTED', label: 'Menunggu Verifikasi Kabupaten' },
      { value: 'REV_FROM_PROV', label: 'Perlu Perbaikan' },
    ];
  }
  return [
    { value: 'SUBMITTED', label: 'Menunggu Verifikasi Kabupaten' },
    { value: 'REV_FROM_PROV', label: 'Perlu Perbaikan' },
    { value: 'REV_FROM_KAB', label: 'Sedang Perbaikan di Pemohon' },
    { value: 'KAB_SUBMITTED', label: 'Asistensi Dinas Provinsi' },
    { value: 'PROV_SUBMITTED', label: 'Verifikasi Ditjenbun' },
    { value: 'DITJEN_APPR_SUBMITTED', label: 'Verifikasi BPDP' },
    { value: 'SK_DIRUT_PUBLISHED', label: 'SK Dirut Terbit' },
    { value: 'COMPLETED', label: 'Selesai' },
  ];
});

function setTaskTab(tab: 'my_task' | 'whole_task') {
  if (activeTaskTab.value === tab) return;
  activeTaskTab.value = tab;
  status.value = '';
  currentPage.value = 1;
  loadData();
}

async function loadData() {
  try {
    pageLoading.value = true;
    let targetStatus: string[] | undefined = undefined;
    if (status.value) {
      targetStatus = [status.value];
    } else if (activeTaskTab.value === 'my_task') {
      targetStatus = KAB_MY_TASK_STATUSES;
    }
    await store.fetchProposals({
      page: currentPage.value,
      limit: pageSize.value,
      search: search.value || undefined,
      status: targetStatus,
      is_draft: false,
      sort_by: sortBy.value,
      sort_order: sortOrder.value,
    });
  } catch (error) {
    console.error(error);
    toast.error(LOCALIZATION.confirmationModal.errorDefault);
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
watch([search, status, jenisSarpras], () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    loadData();
  }, 350);
});

const filteredItems = computed(() => {
  return store.listPengajuan.filter((item) => {
    if (!jenisSarpras.value) return true;
    return (item.paket_sarpras || item.jenisSarpras) === jenisSarpras.value;
  });
});

const handleResetFilters = () => {
  search.value = '';
  status.value = '';
  jenisSarpras.value = '';
};

onMounted(async () => {
  await loadData();
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

const getBadgeVariant = (status: string) => {
  switch (status) {
    case 'SUBMITTED':
    case 'KAB_SUBMITTED':
      return 'info';
    case 'REV_FROM_PROV':
    case 'VERIFIED_ADMIN':
    case 'VERIFIED_FIELD':
      return 'warning';
    case 'REKOMTEK_KAB_ISSUED':
    case 'VALIDATED_PROV':
      return 'success';
    case 'REVISION_ADMIN':
    case 'REV_FROM_KAB':
      return 'danger';
    default:
      return 'secondary';
  }
};

const getTableStatusLabel = (status: string) => {
  if (status === 'REV_FROM_PROV') return 'Perlu Perbaikan';
  if (status === 'REV_FROM_KAB' || status === 'REVISION_ADMIN') return 'Sedang Perbaikan di Pemohon';
  return getStatusLabel(status);
};
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-col gap-1.5">
        <Breadcrumb />
        <h1 class="text-base md:text-lg font-bold text-slate-900 font-apple-display-md">{{ LOCALIZATION.dinasKabAntrean.page.title }}</h1>
        <p class="text-xs text-slate-500 font-apple-caption">{{ LOCALIZATION.dinasKabAntrean.page.subtitle }}</p>
      </div>
      <div class="flex items-center shrink-0">
        <Button variant="secondary" size="sm" @click="showExportModal = true" class="flex items-center gap-1.5">
          <Download class="w-4 h-4 text-emerald-600" />
          Ekspor Data
        </Button>
      </div>
    </header>

    <!-- Stepper Informasi Alur & Tanggung Jawab Peran -->
    <ProposalWorkflowStaticStepper current-role="DINAS_KAB" />

    <div v-if="pageLoading" class="flex flex-col gap-5">
      <Card :title="LOCALIZATION.dinasKabAntrean.card.title" :subtitle="LOCALIZATION.dinasKabAntrean.card.subtitle">
        <div class="space-y-3 mt-4">
          <Skeleton height="2.5rem" />
          <Skeleton height="3rem" />
          <Skeleton height="3rem" />
          <Skeleton height="3rem" />
        </div>
      </Card>
    </div>

    <Card v-else :title="LOCALIZATION.dinasKabAntrean.card.title" :subtitle="LOCALIZATION.dinasKabAntrean.card.subtitle">
      <!-- Navigation Tabs: My Task vs Whole Task -->
      <div class="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit border border-slate-200/60 dark:border-slate-700/60 mb-4">
        <button
          type="button"
          @click="setTaskTab('my_task')"
          :class="[
            'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
            activeTaskTab === 'my_task'
              ? 'bg-white dark:bg-slate-900 text-[#066C2A] dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <ListTodo class="w-4 h-4" />
          <span>Tugas Saya</span>
        </button>

        <button
          type="button"
          @click="setTaskTab('whole_task')"
          :class="[
            'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer',
            activeTaskTab === 'whole_task'
              ? 'bg-white dark:bg-slate-900 text-[#066C2A] dark:text-emerald-400 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
        >
          <Layers class="w-4 h-4" />
          <span>Semua Usulan</span>
        </button>
      </div>

      <!-- Reusable Filter Component -->
      <QueueFilter
        v-model:search="search"
        v-model:status="status"
        v-model:jenisSarpras="jenisSarpras"
        :status-options="filterStatusOptions"
        @reset="handleResetFilters"
        class="mb-4"
      />

      <div class="overflow-x-auto border border-slate-200 rounded-t-xl">
        <table class="w-full text-left text-xs text-slate-700">
          <thead class="bg-slate-100 text-slate-800 uppercase font-semibold border-b border-slate-200">
            <tr>
              <th class="p-3 cursor-pointer hover:bg-slate-200 transition-colors select-none" @click="toggleSort('nomor_proposal')">
                <div class="flex items-center gap-1.5">
                  <span>{{ LOCALIZATION.dinasKabAntrean.table.headers.nomorProposal }}</span>
                  <ArrowUp v-if="sortBy === 'nomor_proposal' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowDown v-else-if="sortBy === 'nomor_proposal' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </div>
              </th>
              <th class="p-3">{{ LOCALIZATION.dinasKabAntrean.table.headers.lembaga }}</th>
              <th class="p-3">Kabupaten</th>
              <th class="p-3">Provinsi</th>
              <th class="p-3 cursor-pointer hover:bg-slate-200 transition-colors select-none" @click="toggleSort('paket_sarpras')">
                <div class="flex items-center gap-1.5">
                  <span>{{ LOCALIZATION.dinasKabAntrean.table.headers.paketUsulan }}</span>
                  <ArrowUp v-if="sortBy === 'paket_sarpras' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowDown v-else-if="sortBy === 'paket_sarpras' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </div>
              </th>
              <th class="p-3 whitespace-nowrap">Luas Lahan (Ha)</th>
              <th class="p-3 whitespace-nowrap">Jumlah Pekebun</th>
              <th class="p-3 cursor-pointer hover:bg-slate-200 transition-colors select-none" @click="toggleSort('total_anggaran')">
                <div class="flex items-center gap-1.5">
                  <span>{{ LOCALIZATION.dinasKabAntrean.table.headers.totalAnggaran }}</span>
                  <ArrowUp v-if="sortBy === 'total_anggaran' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowDown v-else-if="sortBy === 'total_anggaran' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </div>
              </th>
              <th class="p-3 cursor-pointer hover:bg-slate-200 transition-colors select-none" @click="toggleSort('status')">
                <div class="flex items-center gap-1.5">
                  <span>{{ LOCALIZATION.dinasKabAntrean.table.headers.status }}</span>
                  <ArrowUp v-if="sortBy === 'status' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowDown v-else-if="sortBy === 'status' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </div>
              </th>
              <th class="p-3 cursor-pointer hover:bg-slate-200 transition-colors select-none" @click="toggleSort('updated_at')">
                <div class="flex items-center gap-1.5">
                  <span>Tanggal Proposal Diterima</span>
                  <ArrowUp v-if="sortBy === 'updated_at' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowDown v-else-if="sortBy === 'updated_at' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </div>
              </th>
              <th class="p-3 text-center">{{ LOCALIZATION.dinasKabAntrean.table.headers.aksi }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <template v-if="filteredItems.length > 0">
              <tr v-for="item in filteredItems" :key="item.id" class="hover:bg-slate-50">
                <td class="p-3 font-mono font-semibold text-slate-900">{{ item.nomor_proposal || item.nomorProposal }}</td>
                <td class="p-3 font-medium">{{ item.lembaga?.namaLembaga }}</td>
                <td class="p-3 font-medium text-slate-600">{{ getKabupatenNama(item) }}</td>
                <td class="p-3 font-medium text-slate-600">{{ getProvinsiNama(item) }}</td>
                <td class="p-3">{{ getJenisSarprasLabel(item.paket_sarpras) }}</td>
                <td class="p-3 font-medium text-slate-700 whitespace-nowrap">
                  {{ (item.totalLuasLahan || (item as any).total_luas_lahan) ? (item.totalLuasLahan || (item as any).total_luas_lahan).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Ha' : '-' }}
                </td>
                <td class="p-3 font-medium text-slate-700 whitespace-nowrap">
                  {{ (item.totalPekebun || (item as any).total_pekebun) ? (item.totalPekebun || (item as any).total_pekebun) + ' Pekebun' : '-' }}
                </td>
                <td class="p-3 font-mono text-[#066C2A] font-semibold">Rp {{ item.totalAnggaranPengajuan?.toLocaleString('id-ID') }}</td>
                <td class="p-3">
                  <Badge :variant="getBadgeVariant(item.currentStatus)">{{ getTableStatusLabel(item.currentStatus) }}</Badge>
                </td>
                <td class="p-3 text-slate-600 font-medium whitespace-nowrap">
                  {{ formatDate(item.updated_at || item.updatedAt || item.created_at || item.createdAt) }}
                </td>
                <td class="p-3 text-center">
                  <Button
                    :variant="KAB_MY_TASK_STATUSES.includes(item.currentStatus || item.status) ? 'primary' : 'outline'"
                    size="sm"
                    @click="router.push(`/dinas/verifikasi/kabupaten/${item.id}`)"
                  >
                    {{ KAB_MY_TASK_STATUSES.includes(item.currentStatus || item.status) ? LOCALIZATION.dinasKabAntrean.table.actionButton : 'Lihat Detail' }}
                  </Button>
                </td>
              </tr>
            </template>
            <tr v-else>
              <td colspan="11" class="p-6 text-center text-slate-400 dark:text-slate-500 font-medium">{{ LOCALIZATION.dinasKabAntrean.table.emptyState }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <Pagination v-model:currentPage="currentPage" v-model:pageSize="pageSize" :totalItems="store.pagination.total" :pageSizeOptions="[10, 25, 50]" :disabled="pageLoading" @change="loadData" />
    </Card>
    <!-- EXPORT MODAL -->
    <ExportProposalModal
      :is-open="showExportModal"
      page-title="Antrean Verifikasi Dinas Kabupaten"
      :default-statuses="KAB_MY_TASK_STATUSES"
      :available-statuses="filterStatusOptions"
      :search-query="search"
      :scope-region-name="activeRegencyName"
      :scope-regency-id="authStore.user?.regency_id"
      @close="showExportModal = false"
    />
  </div>
</template>
