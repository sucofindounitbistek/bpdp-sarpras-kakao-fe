<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useAuthStore } from '@/stores/auth';
import { getJenisSarprasLabel, getStatusLabel } from '@/types/pengusulan';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Button from '@/components/ui/Button.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import QueueFilter from '@/components/ui/QueueFilter.vue';
import { ArrowUpDown, ArrowUp, ArrowDown, Download, Eye, ListTodo, Layers } from 'lucide-vue-next';
import ExportProposalModal from '@/components/pengusulan/ExportProposalModal.vue';
import ProposalWorkflowStaticStepper from '@/components/pengusulan/ProposalWorkflowStaticStepper.vue';
import { getKabupatenNama, getProvinsiNama } from '@/utils/regionHelper';

const pengusulanStore = usePengusulanStore();
const authStore = useAuthStore();
const activeTaskTab = ref<'my_task' | 'whole_task'>('my_task');

const searchQuery = ref('');
const status = ref('');
const jenisSarpras = ref('');
const showExportModal = ref(false);

const currentPage = ref(1);
const pageSize = ref(10);
const sortBy = ref('updated_at');
const sortOrder = ref<'asc' | 'desc'>('desc');

const DITJENBUN_MY_TASK_STATUSES = computed(() => {
  if (authStore.activeRole === 'DITJENBUN_APPROVAL') {
    return ['DITJEN_VERIF_SUBMITTED', 'REV_FROM_BPDP_VERIF'];
  }
  return ['PROV_SUBMITTED', 'REV_FROM_DITJEN_APPR'];
});

const filterStatusOptions = computed(() => {
  if (activeTaskTab.value === 'my_task') {
    if (authStore.activeRole === 'DITJENBUN_APPROVAL') {
      return [
        { value: 'DITJEN_VERIF_SUBMITTED', label: 'Menunggu Approval Ketua' },
        { value: 'REV_FROM_BPDP_VERIF', label: 'Perlu Perbaikan' },
      ];
    }
    return [
      { value: 'PROV_SUBMITTED', label: 'Perlu Verifikasi Ditjenbun' },
      { value: 'REV_FROM_DITJEN_APPR', label: 'Perlu Perbaikan' },
    ];
  }
  const isApproval = authStore.activeRole === 'DITJENBUN_APPROVAL';
  return [
    { value: 'PROV_SUBMITTED', label: 'Perlu Verifikasi Ditjenbun' },
    { value: 'REV_FROM_DITJEN_VERIF', label: 'Sedang Perbaikan di Provinsi' },
    { value: 'DITJEN_VERIF_SUBMITTED', label: 'Menunggu Approval Ketua' },
    { value: 'REV_FROM_DITJEN_APPR', label: isApproval ? 'Menunggu Perbaikan' : 'Perlu Perbaikan' },
    { value: 'REV_FROM_BPDP_VERIF', label: 'Perlu Perbaikan' },
    { value: 'DITJEN_APPR_SUBMITTED', label: 'Disetujui Ditjenbun (Kirim BPDP)' },
    { value: 'SK_DIRUT_PUBLISHED', label: 'Selesai (SK Terbit)' },
  ];
});

const pageLoading = ref(true);

function setTaskTab(tab: 'my_task' | 'whole_task') {
  if (activeTaskTab.value === tab) return;
  activeTaskTab.value = tab;
  status.value = '';
  currentPage.value = 1;
  loadData();
}

async function loadData() {
  pageLoading.value = true;
  try {
    let targetStatus: string[] | undefined = undefined;
    if (status.value) {
      targetStatus = [status.value];
    } else if (activeTaskTab.value === 'my_task') {
      targetStatus = DITJENBUN_MY_TASK_STATUSES.value;
    }
    await pengusulanStore.fetchProposals({
      page: currentPage.value,
      limit: pageSize.value,
      search: searchQuery.value || undefined,
      status: targetStatus,
      is_draft: false,
      sort_by: sortBy.value,
      sort_order: sortOrder.value,
    });
  } catch (err) {
    console.error('Gagal mengambil daftar usulan Ditjenbun:', err);
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

const filteredUsulans = computed(() => {
  return pengusulanStore.listPengajuan.filter((u: any) => {
    const proposalNomor = u.nomor_proposal || u.nomorProposal || '';
    const namaLembaga = u.lembaga?.namaLembaga || u.kelembagaan?.nama_lembaga || u.namaKelompokTani || '';
    const uStatus = String(u.status || u.currentStatus || '');
    const uSarpras = u.paket_sarpras || u.jenisSarpras || '';

    // Search filter
    const matchSearch = !searchQuery.value || namaLembaga.toLowerCase().includes(searchQuery.value.toLowerCase()) || proposalNomor.toLowerCase().includes(searchQuery.value.toLowerCase());

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

    return true;
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
    case 'PROV_SUBMITTED':
    case 'VERIFIKASI_DITJENBUN':
      return { text: 'Perlu Verifikasi', class: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800' };
    case 'REV_FROM_DITJEN_VERIF':
    case 'PERBAIKAN_DINAS_PROV':
      return { text: 'Sedang Perbaikan di Provinsi', class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' };
    case 'REV_FROM_DITJEN_APPR':
      if (authStore.activeRole === 'DITJENBUN_APPROVAL') {
        return { text: 'Menunggu Perbaikan', class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' };
      }
      return { text: 'Perlu Perbaikan', class: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800' };
    case 'REV_FROM_BPDP_VERIF':
      return { text: 'Perlu Perbaikan', class: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800' };
    case 'DITJEN_VERIF_SUBMITTED':
    case 'APPROVAL_DITJENBUN':
      return { text: 'Menunggu Approval Ketua', class: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800' };
    case 'DITJEN_APPR_SUBMITTED':
    case 'VERIFIKASI_BPDP':
    case 'APPROVAL_BPDP':
    case 'GENERATE_SK_DIRUT':
    case 'SK_DITJENBUN_ISSUED':
      return { text: 'Disetujui Ditjenbun (Kirim BPDP)', class: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800' };
    case 'SELESAI':
    case 'COMPLETED':
      return { text: 'Selesai (SK Terbit)', class: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' };
    default:
      return { text: getStatusLabel(s) || s, class: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700' };
  }
};
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <!-- Header -->
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-col gap-1.5">
        <Breadcrumb />
        <h1 class="text-base md:text-lg font-semibold text-slate-900 dark:text-white font-apple-display-lg mt-0.5">Antrean Usulan Rekomtek</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-apple-caption">Daftar pengusulan sarana prasarana kelapa yang dikelola oleh Kementerian Pertanian (Ditjenbun).</p>
      </div>
      <div class="flex items-center shrink-0">
        <Button variant="secondary" size="sm" @click="showExportModal = true" class="flex items-center gap-1.5">
          <Download class="w-4 h-4 text-emerald-600" />
          Ekspor Data
        </Button>
      </div>
    </header>

    <!-- Stepper Informasi Alur & Tanggung Jawab Peran -->
    <ProposalWorkflowStaticStepper current-role="DITJENBUN" />

    <!-- Navigation Tabs -->
    <div class="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl w-fit border border-slate-200/60 dark:border-slate-700/60">
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
    <QueueFilter v-model:search="searchQuery" v-model:status="status" v-model:jenisSarpras="jenisSarpras" :status-options="filterStatusOptions" @reset="handleResetFilters" />

    <!-- Table content -->
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
              <th class="py-3 px-4">Kelompok Tani</th>
              <th class="py-3 px-4">Kabupaten</th>
              <th class="py-3 px-4">Provinsi</th>
              <th class="py-3 px-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors select-none" @click="toggleSort('paket_sarpras')">
                <div class="flex items-center gap-1.5">
                  <span>Paket Sarpras</span>
                  <ArrowUp v-if="sortBy === 'paket_sarpras' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowDown v-else-if="sortBy === 'paket_sarpras' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </div>
              </th>
              <th class="py-3 px-4 whitespace-nowrap">Luas Lahan (Ha)</th>
              <th class="py-3 px-4 whitespace-nowrap">Jumlah Pekebun</th>
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
                {{ usulan.nomor_proposal || usulan.nomorProposal || (usulan as any).nomorUsulan || '-' }}
              </td>
              <td class="py-3.5 px-4">
                {{ usulan.lembaga?.namaLembaga || (usulan as any).kelembagaan?.nama_lembaga || (usulan as any).namaKelompokTani || '-' }}
              </td>
              <td class="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                {{ getKabupatenNama(usulan) }}
              </td>
              <td class="py-3.5 px-4 font-medium text-slate-600 dark:text-slate-400">
                {{ getProvinsiNama(usulan) }}
              </td>
              <td class="py-3.5 px-4">
                <span class="font-medium text-slate-800 dark:text-slate-200">
                  {{ getJenisSarprasLabel(usulan.paket_sarpras || usulan.jenisSarpras) || '-' }}
                </span>
              </td>
              <td class="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                {{ (usulan.totalLuasLahan || (usulan as any).total_luas_lahan) ? (usulan.totalLuasLahan || (usulan as any).total_luas_lahan).toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' Ha' : '-' }}
              </td>
              <td class="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                {{ (usulan.totalPekebun || (usulan as any).total_pekebun) ? (usulan.totalPekebun || (usulan as any).total_pekebun) + ' Pekebun' : '-' }}
              </td>
              <td class="py-3.5 px-4">
                <span class="font-medium text-slate-800 dark:text-slate-200">
                  {{ usulan.bentuk_bantuan || (usulan as any).bantuanType || '-' }}
                </span>
              </td>
              <td class="py-3.5 px-4">
                <span :class="['px-2 py-1 rounded-md text-[11px] font-semibold border', getStatusBadge(usulan.status || usulan.currentStatus).class]">
                  {{ getStatusBadge(usulan.status || usulan.currentStatus).text }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap">
                {{ formatDate(usulan.updated_at || usulan.updatedAt || usulan.created_at || usulan.createdAt) }}
              </td>
              <td class="py-3.5 px-4 text-center">
                <router-link :to="authStore.activeRole === 'DITJENBUN_APPROVAL' ? `/ditjenbun/rekomtek/approval/${usulan.id}` : `/ditjenbun/rekomtek/ceki/${usulan.id}`">
                  <button
                    type="button"
                    class="h-8 px-3 rounded-lg text-xs font-semibold text-[#066C2A] dark:text-emerald-400 hover:bg-[#066C2A]/10 dark:hover:bg-emerald-400/10 flex items-center justify-center gap-1.5 border border-transparent hover:border-[#066C2A]/20 dark:hover:border-emerald-400/20 active:scale-95 transition-all duration-200 w-full cursor-pointer"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>
                      {{
                        authStore.activeRole === 'DITJENBUN_APPROVAL'
                          ? ['DITJEN_VERIF_SUBMITTED', 'APPROVAL_DITJENBUN', 'REV_FROM_BPDP_VERIF'].includes(usulan.status || usulan.currentStatus)
                            ? 'Tinjau'
                            : 'Pratinjau'
                          : ['PROV_SUBMITTED', 'REV_FROM_DITJEN_APPR'].includes(usulan.status || usulan.currentStatus)
                            ? 'Verifikasi'
                            : 'Pratinjau'
                      }}
                    </span>
                  </button>
                </router-link>
              </td>
            </tr>

            <!-- Empty Queue Row -->
            <tr v-if="filteredUsulans.length === 0">
              <td colspan="12" class="py-8 text-center text-slate-400 dark:text-slate-500 font-apple-body">Tidak ada usulan dalam antrean ini.</td>
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
      page-title="Antrean Usulan Rekomtek (Ditjenbun)"
      :default-statuses="DITJENBUN_MY_TASK_STATUSES"
      :available-statuses="filterStatusOptions"
      :search-query="searchQuery"
      @close="showExportModal = false"
    />
  </div>
</template>
