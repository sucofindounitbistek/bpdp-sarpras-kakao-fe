<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePenyaluranBarangStore } from '@/stores/penyaluranBarang';
import type { PermohonanPenyaluranBarang } from '@/types/penyaluranBarang';
import PenyaluranTimelineTracker from '@/components/penyaluran-barang/PenyaluranTimelineTracker.vue';
import ItemRabFormTable from '@/components/penyaluran-barang/ItemRabFormTable.vue';
import TenderUlpModal from '@/components/penyaluran-barang/TenderUlpModal.vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import { useToast } from '@/composables/useToast';
import {
  Award,
  Play,
  Eye,
  Search,
  ShoppingCart,
  Clock,
  Layers,
  X,
  CheckCircle2,
} from 'lucide-vue-next';

const store = usePenyaluranBarangStore();
const toast = useToast();

const searchQuery = ref('');
const filterStatus = ref<string>('ALL');
const selectedItem = ref<PermohonanPenyaluranBarang | null>(null);
const isTenderModalOpen = ref(false);
const activeModalItem = ref<PermohonanPenyaluranBarang | null>(null);

onMounted(() => {
  store.fetchPermohonanList().catch(() => {});
});

// KPI Stats
const totalDisposisiUlp = computed(() => store.permohonanUlp.length);
const totalMenungguTender = computed(() => store.permohonanUlp.filter((p) => p.status === 'DISPOSISI_ULP').length);
const totalSedangTender = computed(() => store.permohonanUlp.filter((p) => p.status === 'PROSES_PEMILIHAN_PENYEDIA').length);
const totalPemenangDitetapkan = computed(() => store.permohonanUlp.filter((p) => p.status === 'PENETAPAN_PEMENANG').length);

const filteredList = computed(() => {
  return store.permohonanUlp.filter((item) => {
    const matchSearch =
      item.nomorPermohonan.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.namaLembagaPekebun.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.kabupaten.toLowerCase().includes(searchQuery.value.toLowerCase());

    const matchStatus = filterStatus.value === 'ALL' || item.status === filterStatus.value;
    return matchSearch && matchStatus;
  });
});

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(val);
};

function getStatusBadge(status: PermohonanPenyaluranBarang['status']) {
  switch (status) {
    case 'DISPOSISI_ULP':
      return { label: 'Siap Pemilihan e-Catalog', class: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200' };
    case 'PROSES_PEMILIHAN_PENYEDIA':
      return { label: 'Sedang Proses Tender', class: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200' };
    case 'PENETAPAN_PEMENANG':
      return { label: 'Pemenang Ditetapkan', class: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300' };
    default:
      return { label: status, class: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
}

function handleStartTender(item: PermohonanPenyaluranBarang) {
  store.mulaiTenderUlp(item.id);
  toast.info(`Status permohonan ${item.nomorPermohonan} diubah menjadi: Proses Pemilihan Penyedia (Tender e-Catalog).`);
  selectedItem.value = null;
}

function openTenderModal(item: PermohonanPenyaluranBarang) {
  activeModalItem.value = item;
  isTenderModalOpen.value = true;
}

function handleConfirmSelesai() {
  if (activeModalItem.value) {
    store.selesaikanTenderUlp(activeModalItem.value.id);
    toast.success(
      `Pemilihan penyedia untuk ${activeModalItem.value.nomorPermohonan} telah selesai! Berkas diteruskan ke BPDP Teknis untuk pembuatan Dokumen Kontrak "A".`
    );
    isTenderModalOpen.value = false;
    selectedItem.value = null;
  }
}
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <!-- Header Floating Card (Aligned with Navbar) -->
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <Breadcrumb />
        <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Tender & Pemilihan Vendor e-Catalog <span class="text-[#066C2A] font-bold">(BPDP ULP)</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Pelaksanaan proses pengadaan penyedia barang bantuan sarpras kelapa melalui sistem e-catalog
        </p>
      </div>
    </header>

    <!-- KPI Metric Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Paket ULP</p>
          <p class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ totalDisposisiUlp }}</p>
        </div>
      </div>

      <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
          <Clock class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Siap Tender</p>
          <p class="text-lg font-bold text-purple-700 dark:text-purple-400">{{ totalMenungguTender }}</p>
        </div>
      </div>

      <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
          <Play class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Sedang Proses e-Catalog</p>
          <p class="text-lg font-bold text-cyan-700 dark:text-cyan-400">{{ totalSedangTender }}</p>
        </div>
      </div>

      <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <Award class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Pemenang Ditetapkan</p>
          <p class="text-lg font-bold text-emerald-700 dark:text-emerald-400">{{ totalPemenangDitetapkan }}</p>
        </div>
      </div>
    </div>

    <!-- Filter & Search Bar Card -->
    <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
      <div class="relative w-full sm:w-80">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          placeholder="Cari no permohonan, lembaga, lokasi..."
          class="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
        <span class="text-xs font-semibold text-slate-500 hidden sm:inline">Status:</span>
        <select
          v-model="filterStatus"
          class="h-9 text-xs px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 font-semibold outline-none cursor-pointer"
        >
          <option value="ALL">Semua Status ULP</option>
          <option value="DISPOSISI_ULP">Siap Pemilihan e-Catalog</option>
          <option value="PROSES_PEMILIHAN_PENYEDIA">Sedang Proses Tender</option>
          <option value="PENETAPAN_PEMENANG">Pemenang Ditetapkan</option>
        </select>
      </div>
    </div>

    <!-- Main List Table Card -->
    <div class="overflow-hidden border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead class="bg-slate-50/90 dark:bg-slate-950/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10.5px]">
            <tr>
              <th class="py-3.5 px-4 w-12 text-center">No</th>
              <th class="py-3.5 px-4 min-w-[170px]">Nomor Permohonan</th>
              <th class="py-3.5 px-4 min-w-[220px]">Lembaga & Lokasi</th>
              <th class="py-3.5 px-4 min-w-[150px] whitespace-nowrap">Kategori Paket</th>
              <th class="py-3.5 px-4 text-right min-w-[130px]">Pagu RAB</th>
              <th class="py-3.5 px-4 min-w-[160px]">Status Tender</th>
              <th class="py-3.5 px-4 w-40 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
            <tr v-if="filteredList.length === 0">
              <td colspan="7" class="py-12 text-center text-slate-400 dark:text-slate-500">
                <ShoppingCart class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p class="font-bold text-slate-700 dark:text-slate-300 text-sm">Tidak Ada Paket Pengadaan di ULP</p>
                <p class="text-xs text-slate-400 mt-1">Belum ada disposisi paket tender masuk dari PPK.</p>
              </td>
            </tr>
            <tr
              v-for="(item, idx) in filteredList"
              :key="item.id"
              class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
            >
              <td class="py-3.5 px-4 text-center font-semibold text-slate-400">{{ idx + 1 }}</td>
              <td class="py-3.5 px-4">
                <span class="font-bold text-emerald-800 dark:text-emerald-300 block">
                  {{ item.nomorPermohonan }}
                </span>
                <span class="text-[11px] text-slate-400">Ketua: {{ item.namaKetua }}</span>
              </td>
              <td class="py-3.5 px-4">
                <p class="font-bold text-slate-900 dark:text-slate-100">{{ item.namaLembagaPekebun }}</p>
                <p class="text-[11px] text-slate-500">{{ item.kabupaten }}, {{ item.provinsi }}</p>
              </td>
              <td class="py-3.5 px-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold border whitespace-nowrap',
                    item.kategoriPaket === 'Ekstensifikasi'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800'
                      : 'bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
                  ]"
                >
                  {{ item.kategoriPaket }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-right font-bold text-emerald-700 dark:text-emerald-400">
                {{ formatRupiah(item.itemsRAB.reduce((s, it) => s + it.estimasiTotal, 0)) }}
              </td>
              <td class="py-3.5 px-4">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border',
                    getStatusBadge(item.status).class,
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current" />
                  {{ getStatusBadge(item.status).label }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-center">
                <button
                  type="button"
                  @click="selectedItem = item"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
                >
                  <Eye class="w-3.5 h-3.5" />
                  Detail & Tender
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail & Action Modal -->
    <Teleport to="body">
      <div
        v-if="selectedItem"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-slate-900/60 backdrop-blur-md overflow-y-auto"
        @click.self="selectedItem = null"
      >
        <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto">
          <!-- Modal Header -->
          <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  {{ selectedItem.nomorPermohonan }}
                </span>
                <span class="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  Paket {{ selectedItem.kategoriPaket }}
                </span>
              </div>
              <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
                {{ selectedItem.namaLembagaPekebun }}
              </h3>
              <p class="text-xs text-slate-500">
                Ketua: {{ selectedItem.namaKetua }} • Lokasi: {{ selectedItem.desa }}, {{ selectedItem.kabupaten }}, {{ selectedItem.provinsi }}
              </p>
            </div>

            <button
              type="button"
              @click="selectedItem = null"
              class="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <PenyaluranTimelineTracker
            :status="selectedItem.status"
            :proposal-id="selectedItem.proposalId || (selectedItem as any).proposal_id"
          />

          <!-- RAB Table -->
          <ItemRabFormTable :model-value="selectedItem.itemsRAB" :disabled="true" />

          <!-- Modal Actions Footer -->
          <div class="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              @click="selectedItem = null"
              class="px-5 py-2.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
            >
              Tutup
            </button>

            <div class="flex items-center gap-2">
              <!-- Action 1: Mulai Pemilihan Penyedia (sesuai Gambar 3) -->
              <button
                v-if="selectedItem.status === 'DISPOSISI_ULP'"
                type="button"
                @click="handleStartTender(selectedItem)"
                class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <Play class="w-4 h-4" />
                Mulai Pemilihan Penyedia
              </button>

              <!-- Action 2: Tombol Selesai (sesuai Gambar 3/4) -->
              <button
                v-if="selectedItem.status === 'PROSES_PEMILIHAN_PENYEDIA'"
                type="button"
                @click="openTenderModal(selectedItem)"
                class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
              >
                <CheckCircle2 class="w-4 h-4" />
                Selesai
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Konfirmasi Penyelesaian Pemilihan Penyedia -->
    <TenderUlpModal
      :is-open="isTenderModalOpen"
      :permohonan="activeModalItem"
      @close="isTenderModalOpen = false"
      @confirm="handleConfirmSelesai"
    />
  </div>
</template>
