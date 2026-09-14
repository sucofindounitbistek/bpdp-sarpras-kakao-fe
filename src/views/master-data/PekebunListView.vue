<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { usePekebunStore } from '@/stores/pekebun';
import { useAuthStore } from '@/stores/auth';
import { Pekebun } from '@/types/pekebun';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Button from '@/components/ui/Button.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import Pagination from '@/components/ui/Pagination.vue';
import DetailPekebunModal from '@/components/master-data/DetailPekebunModal.vue';
import Modal from '@/components/ui/Modal.vue';
import { useToast } from '@/composables/useToast';
import { LOCALIZATION } from '@/config/localization';
import { Search, Plus, Users, Eye, FileEdit, Trash2, ArrowUpDown, ArrowUp, ArrowDown, AlertTriangle } from 'lucide-vue-next';

const router = useRouter();
const store = usePekebunStore();
const authStore = useAuthStore();
const toast = useToast();

const userKelembagaanId = computed(() => {
  return (
    (authStore.user?.kelembagaan_id ? Number(authStore.user.kelembagaan_id) : undefined) ??
    (authStore.user?.kelembagaanId ? Number(authStore.user.kelembagaanId) : undefined)
  );
});

const searchQuery = ref('');
const filterStatus = ref<'ALL' | 'REGISTERED' | 'DRAFT'>('ALL');
const currentPage = ref(1);
const pageSize = ref(10);
const sortBy = ref('updated_at');
const sortOrder = ref<'asc' | 'desc'>('desc');

function fetchData() {
  const isDraftParam = filterStatus.value === 'ALL' ? undefined : filterStatus.value === 'DRAFT';
  store.fetchPekebunList({
    page: currentPage.value,
    limit: pageSize.value,
    search: searchQuery.value || undefined,
    kelembagaan_id: userKelembagaanId.value ? String(userKelembagaanId.value) : undefined,
    is_draft: isDraftParam,
    sort_by: sortBy.value,
    sort_order: sortOrder.value,
  });
}

onMounted(() => {
  fetchData();
});

let searchTimer: ReturnType<typeof setTimeout> | null = null;
watch(searchQuery, () => {
  if (searchTimer) clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentPage.value = 1;
    fetchData();
  }, 400);
});

watch(filterStatus, () => {
  currentPage.value = 1;
  fetchData();
});

function toggleSort(col: string) {
  if (sortBy.value === col) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = col;
    sortOrder.value = 'asc';
  }
  currentPage.value = 1;
  fetchData();
}

const countAll = computed(() => store.pagination.total);
const countDraft = computed(() => store.listPekebun.filter((p) => p.isDraft).length);
const countRegistered = computed(() => store.listPekebun.filter((p) => !p.isDraft).length);

const pagination = computed(() => store.pagination);

const filteredPekebun = computed(() => {
  if (!userKelembagaanId.value) return store.listPekebun;
  return store.listPekebun.filter((p) => {
    if (!p.kelembagaanId) return true;
    return String(p.kelembagaanId) === String(userKelembagaanId.value);
  });
});

const isModalOpen = ref(false);
const selectedPekebun = ref<Pekebun | null>(null);

// State Modal Konfirmasi Hapus Pekebun
const isDeleteModalOpen = ref(false);
const pekebunToDelete = ref<Pekebun | null>(null);
const isDeleting = ref(false);

const handleOpenDetail = async (pekebun: Pekebun) => {
  const detail = await store.fetchPekebunDetail(pekebun.id);
  if (detail) {
    selectedPekebun.value = detail;
    isModalOpen.value = true;
  } else {
    toast.error('Gagal memuat detail pekebun', 'Error');
  }
};

const handleCloseModal = () => {
  isModalOpen.value = false;
  selectedPekebun.value = null;
};

const handleResumeDraft = (pekebun: Pekebun) => {
  router.push(`/master-data/pekebun/tambah?draftId=${pekebun.id}`);
};

const handleEditPekebun = (pekebun: Pekebun) => {
  if (pekebun.isInProposal) {
    toast.error('Pekebun sudah terdaftar dalam proposal dan tidak dapat diubah', 'Aksi Ditolak');
    return;
  }
  router.push(`/master-data/pekebun/edit/${pekebun.id}`);
};

const confirmDelete = (pekebun: Pekebun) => {
  if (pekebun.isInProposal) {
    toast.error('Pekebun sudah terdaftar dalam proposal dan tidak dapat dihapus', 'Aksi Ditolak');
    return;
  }
  pekebunToDelete.value = pekebun;
  isDeleteModalOpen.value = true;
};

const cancelDelete = () => {
  if (isDeleting.value) return;
  isDeleteModalOpen.value = false;
  pekebunToDelete.value = null;
};

const executeDelete = async () => {
  if (!pekebunToDelete.value) return;
  isDeleting.value = true;
  try {
    const target = pekebunToDelete.value;
    const ok = await store.deletePekebun(target.id);
    if (ok) {
      toast.success(target.isDraft ? LOCALIZATION.pekebunDraft.deleteDraftSuccess : 'Pekebun berhasil dihapus', 'Berhasil');
      isDeleteModalOpen.value = false;
      pekebunToDelete.value = null;
      fetchData();
    } else {
      toast.error('Gagal menghapus pekebun', 'Error');
    }
  } catch (err: any) {
    toast.error(err?.message || 'Terjadi kesalahan saat menghapus data pekebun', 'Error');
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <!-- Header -->
    <header class="bg-white/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-col gap-1.5">
        <Breadcrumb />
        <h1 class="text-base md:text-lg font-bold text-slate-900 font-apple-display-lg mt-0.5">Master Data Pekebun</h1>
        <p class="text-xs text-slate-500 font-apple-caption">Daftar Data Pekebun dan Lahan</p>
      </div>

      <router-link to="/master-data/pekebun/tambah">
        <Button variant="primary" class="flex items-center gap-1.5 shadow-sm shadow-emerald-900/10"> <Plus class="w-4 h-4" /> Tambah Pekebun </Button>
      </router-link>
    </header>

    <!-- Search & Status Tabs -->
    <div class="flex flex-col gap-3 bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/80 shadow-sm">
      <!-- Status Tabs -->
      <div class="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
        <button
          type="button"
          @click="filterStatus = 'ALL'"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0',
            filterStatus === 'ALL' ? 'bg-[#066C2A] text-white shadow-sm shadow-emerald-900/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70',
          ]"
        >
          <span>{{ LOCALIZATION.pekebunDraft.tabAll }}</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-semibold">{{ countAll }}</span>
        </button>
        <button
          type="button"
          @click="filterStatus = 'REGISTERED'"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0',
            filterStatus === 'REGISTERED' ? 'bg-[#066C2A] text-white shadow-sm shadow-emerald-900/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70',
          ]"
        >
          <span>{{ LOCALIZATION.pekebunDraft.tabRegistered }}</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-semibold">{{ countRegistered }}</span>
        </button>
        <button
          type="button"
          @click="filterStatus = 'DRAFT'"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shrink-0',
            filterStatus === 'DRAFT' ? 'bg-amber-600 text-white shadow-sm shadow-amber-900/20' : 'bg-amber-50 text-amber-800 hover:bg-amber-100/80 border border-amber-200/50',
          ]"
        >
          <span>{{ LOCALIZATION.pekebunDraft.tabDraft }}</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-white/30 font-semibold">{{ countDraft }}</span>
        </button>
      </div>

      <!-- Search Input -->
      <div class="relative">
        <span class="absolute inset-y-0 left-3.5 flex items-center text-slate-400">
          <Search class="w-4 h-4" />
        </span>
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Cari berdasarkan nama atau NIK..."
          class="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 bg-white text-slate-900 text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A]"
        />
      </div>
    </div>

    <!-- Data Table Card -->
    <div class="bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden flex-1">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-[10px] md:text-xs font-bold uppercase tracking-wider text-slate-500">
              <th class="py-3.5 px-4 md:px-5 w-12 text-center">No</th>
              <th class="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" @click="toggleSort('nik')">
                <div class="flex items-center gap-1.5">
                  <span>NIK</span>
                  <ArrowUp v-if="sortBy === 'nik' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowDown v-else-if="sortBy === 'nik' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </div>
              </th>
              <th class="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" @click="toggleSort('name')">
                <div class="flex items-center gap-1.5">
                  <span>Nama Pekebun</span>
                  <ArrowUp v-if="sortBy === 'name' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowDown v-else-if="sortBy === 'name' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </div>
              </th>
              <th class="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" @click="toggleSort('address')">
                <div class="flex items-center gap-1.5">
                  <span>Alamat</span>
                  <ArrowUp v-if="sortBy === 'address' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowDown v-else-if="sortBy === 'address' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </div>
              </th>
              <th class="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" @click="toggleSort('total_luas_lahan')">
                <div class="flex items-center gap-1.5">
                  <span>{{ LOCALIZATION.pekebunDraft.totalLuasLahanHeader }}</span>
                  <ArrowUp v-if="sortBy === 'total_luas_lahan' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowDown v-else-if="sortBy === 'total_luas_lahan' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </div>
              </th>
              <th class="py-3.5 px-4 cursor-pointer hover:bg-slate-100 transition-colors select-none" @click="toggleSort('updated_at')">
                <div class="flex items-center gap-1.5">
                  <span>Terakhir Diperbarui</span>
                  <ArrowUp v-if="sortBy === 'updated_at' && sortOrder === 'asc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowDown v-else-if="sortBy === 'updated_at' && sortOrder === 'desc'" class="w-3.5 h-3.5 text-[#066C2A]" />
                  <ArrowUpDown v-else class="w-3.5 h-3.5 text-slate-400 opacity-60" />
                </div>
              </th>
              <th class="py-3.5 px-4 w-28 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs md:text-sm text-slate-700">
            <template v-if="store.isLoading">
              <tr v-for="i in 3" :key="i">
                <td class="py-4 px-4 md:px-5"><Skeleton height="1rem" width="20px" custom-class="mx-auto" /></td>
                <td class="py-4 px-4"><Skeleton height="1rem" width="130px" /></td>
                <td class="py-4 px-4"><Skeleton height="1rem" width="150px" /></td>
                <td class="py-4 px-4"><Skeleton height="1rem" width="200px" /></td>
                <td class="py-4 px-4"><Skeleton height="1rem" width="90px" /></td>
                <td class="py-4 px-4"><Skeleton height="1rem" width="110px" /></td>
                <td class="py-4 px-4"><Skeleton height="1.75rem" width="60px" custom-class="mx-auto rounded-lg" /></td>
              </tr>
            </template>
            <template v-else>
              <tr v-if="filteredPekebun.length === 0">
                <td colspan="7" class="py-12 px-4 text-center">
                  <div class="flex flex-col items-center justify-center gap-3">
                    <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Users class="w-6 h-6" />
                    </div>
                    <div class="flex flex-col gap-0.5">
                      <p class="font-semibold text-slate-800">Tidak ada data pekebun</p>
                      <p class="text-xs text-slate-400">Silakan tambahkan data pekebun baru atau ubah kata kunci pencarian.</p>
                    </div>
                  </div>
                </td>
              </tr>
              <tr v-else v-for="(pekebun, idx) in filteredPekebun" :key="pekebun.id" class="hover:bg-slate-50/50 transition-colors">
                <td class="py-3 px-4 md:px-5 text-center font-semibold text-slate-400">
                  {{ (pagination.page - 1) * pagination.limit + idx + 1 }}
                </td>
                <td class="py-3 px-4 font-mono font-semibold text-slate-800">
                  {{ pekebun.nik }}
                </td>
                <td class="py-3 px-4 font-bold text-slate-900">
                  <div class="flex items-center gap-2">
                    <span>{{ pekebun.nama }}</span>
                    <span v-if="pekebun.isDraft" class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/50"> Draft </span>
                    <span v-else-if="pekebun.isInProposal" class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/50"> Terdaftar di Proposal </span>
                  </div>
                </td>
                <td class="py-3 px-4 text-slate-500">
                  {{ pekebun.alamat }}
                </td>
                <td class="py-3 px-4 font-semibold text-slate-800">
                  <span v-if="pekebun.totalLuasLahan && pekebun.totalLuasLahan > 0">
                    {{ pekebun.totalLuasLahan.toFixed(2) }} {{ LOCALIZATION.pekebunDraft.totalLuasLahanUnit }}
                  </span>
                  <span v-else class="text-slate-400 font-normal">{{ LOCALIZATION.pekebunDraft.noLahanDash }}</span>
                </td>
                <td class="py-3 px-4 text-xs text-slate-400 font-medium">
                  {{ pekebun.updatedAt ? new Date(pekebun.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-' }}
                </td>
                <td class="py-3 px-4 text-center">
                  <div v-if="pekebun.isDraft" class="flex items-center justify-center gap-1.5">
                    <Button size="sm" variant="outline" class="p-2 border-amber-300 text-amber-700 hover:bg-amber-50 active:bg-amber-100" :title="LOCALIZATION.pekebunDraft.resumeDraft" @click="handleResumeDraft(pekebun)">
                      <FileEdit class="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline" class="p-2 border-rose-200 text-rose-600 hover:bg-rose-50" :title="LOCALIZATION.pekebunDraft.deleteDraft" @click="confirmDelete(pekebun)">
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                  <div v-else class="flex items-center justify-center gap-1.5">
                    <Button size="sm" variant="outline" class="p-2 border-slate-200 text-slate-700 hover:bg-slate-50" title="Lihat Detail Pekebun" @click="handleOpenDetail(pekebun)">
                      <Eye class="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      :disabled="pekebun.isInProposal"
                      :class="[
                        'p-2',
                        pekebun.isInProposal
                          ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50 opacity-60'
                          : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50 active:bg-emerald-100'
                      ]"
                      :title="pekebun.isInProposal ? 'Pekebun sudah terdaftar dalam proposal dan tidak dapat diubah' : 'Edit Data Pekebun'"
                      @click="!pekebun.isInProposal && handleEditPekebun(pekebun)"
                    >
                      <FileEdit class="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      :disabled="pekebun.isInProposal"
                      :class="[
                        'p-2',
                        pekebun.isInProposal
                          ? 'border-slate-200 text-slate-300 cursor-not-allowed bg-slate-50 opacity-60'
                          : 'border-rose-200 text-rose-600 hover:bg-rose-50 active:bg-rose-100'
                      ]"
                      :title="pekebun.isInProposal ? 'Pekebun sudah terdaftar dalam proposal dan tidak dapat dihapus' : 'Hapus Data Pekebun'"
                      @click="!pekebun.isInProposal && confirmDelete(pekebun)"
                    >
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            </template>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <Pagination
        v-model:currentPage="currentPage"
        v-model:pageSize="pageSize"
        :totalItems="pagination.total"
        :pageSizeOptions="[10, 25, 50]"
        :disabled="store.isLoading"
        @change="fetchData"
      />
    </div>

    <!-- Modal Detail Pekebun -->
    <DetailPekebunModal :is-open="isModalOpen" :pekebun="selectedPekebun" @close="handleCloseModal" @edit="handleEditPekebun" />

    <!-- Modal Konfirmasi Hapus Pekebun -->
    <Modal
      :is-open="isDeleteModalOpen"
      size="sm"
      title="Konfirmasi Hapus Pekebun"
      @close="cancelDelete"
    >
      <div class="flex flex-col items-center text-center gap-4 py-2">
        <div class="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
          <AlertTriangle class="w-6 h-6" />
        </div>
        <div class="flex flex-col gap-1">
          <h4 class="text-sm font-bold text-slate-900 dark:text-white">
            Hapus Data Pekebun Ini?
          </h4>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2">
            Apakah Anda yakin ingin menghapus data pekebun
            <strong class="text-slate-800 dark:text-slate-200">{{ pekebunToDelete?.nama }}</strong>
            (NIK: <span class="font-mono text-slate-700 dark:text-slate-300">{{ pekebunToDelete?.nik }}</span>)?
            Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>
      </div>

      <template #footer>
        <div class="flex items-center justify-end gap-2.5 w-full pt-2">
          <Button
            variant="outline"
            size="sm"
            :disabled="isDeleting"
            @click="cancelDelete"
          >
            Batal
          </Button>
          <Button
            variant="danger"
            size="sm"
            :disabled="isDeleting"
            class="bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
            @click="executeDelete"
          >
            {{ isDeleting ? 'Menghapus...' : 'Ya, Hapus' }}
          </Button>
        </div>
      </template>
    </Modal>
  </div>
</template>
