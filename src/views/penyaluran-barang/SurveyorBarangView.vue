<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { usePenyaluranBarangStore } from '@/stores/penyaluranBarang';
import type { PermohonanPenyaluranBarang } from '@/types/penyaluranBarang';
import PenyaluranTimelineTracker from '@/components/penyaluran-barang/PenyaluranTimelineTracker.vue';
import ItemRabFormTable from '@/components/penyaluran-barang/ItemRabFormTable.vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import { useToast } from '@/composables/useToast';
import {
  Compass,
  Eye,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  X,
  FileCheck,
} from 'lucide-vue-next';

const store = usePenyaluranBarangStore();
const toast = useToast();

onMounted(() => {
  store.fetchPermohonanList().catch(() => {});
});

const searchQuery = ref('');
const filterStatus = ref<string>('ALL');
const selectedItem = ref<PermohonanPenyaluranBarang | null>(null);

// KPI Stats
const listTugasSurveyor = computed(() => {
  return store.permohonanList.filter(
    (p) => p.status === 'SURVEYOR_DITUGASKAN' || p.status === 'PROSES_PELAKSANAAN_KONTRAK' || p.status === 'SELESAI' || p.suratTugasSurveyor
  );
});

const totalTugas = computed(() => listTugasSurveyor.value.length);
const totalSedangMonitoring = computed(
  () => listTugasSurveyor.value.filter((p) => p.status === 'SURVEYOR_DITUGASKAN' || p.status === 'PROSES_PELAKSANAAN_KONTRAK').length
);
const totalSelesai = computed(() => listTugasSurveyor.value.filter((p) => p.status === 'SELESAI').length);

const filteredList = computed(() => {
  return listTugasSurveyor.value.filter((item) => {
    const matchSearch =
      item.nomorPermohonan.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.namaLembagaPekebun.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      item.kabupaten.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      (item.suratTugasSurveyor?.nomorSurat || '').toLowerCase().includes(searchQuery.value.toLowerCase());

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

function handleCompleteMonitoring(item: PermohonanPenyaluranBarang) {
  store.selesaikanSurveyorMonitoring(item.id);
  toast.success(`Pengawasan & sampling mutu barang untuk ${item.nomorPermohonan} telah diselesaikan dan diverifikasi valid!`);
  selectedItem.value = null;
}
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <!-- Header Floating Card (Aligned with Navbar) -->
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-col gap-1">
        <Breadcrumb />
        <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          Penugasan Sampling Mutu & Monitoring Lapangan <span class="text-[#066C2A] font-bold">(Surveyor Independen)</span>
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Pengawasan fisik komoditas bibit, pupuk, sarpras kelapa serta verifikasi kesesuaian BASTP di titik gudang pekebun
        </p>
      </div>
    </header>

    <!-- KPI Metric Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
          <Layers class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Total Penugasan Surveyor</p>
          <p class="text-lg font-bold text-slate-900 dark:text-slate-100">{{ totalTugas }}</p>
        </div>
      </div>

      <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
          <Clock class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Sedang Sampling & Monitoring</p>
          <p class="text-lg font-bold text-teal-700 dark:text-teal-400">{{ totalSedangMonitoring }}</p>
        </div>
      </div>

      <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
          <CheckCircle2 class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Monitoring Selesai</p>
          <p class="text-lg font-bold text-emerald-700 dark:text-emerald-400">{{ totalSelesai }}</p>
        </div>
      </div>
    </div>

    <!-- Filter & Search Bar Card -->
    <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
      <div class="relative w-full sm:w-80">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          v-model="searchQuery"
          placeholder="Cari surat tugas, lembaga, lokasi..."
          class="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/40 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
        <span class="text-xs font-semibold text-slate-500 hidden sm:inline">Status:</span>
        <select
          v-model="filterStatus"
          class="h-9 text-xs px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/40 text-slate-800 dark:text-slate-200 font-semibold outline-none cursor-pointer"
        >
          <option value="ALL">Semua Status</option>
          <option value="SURVEYOR_DITUGASKAN">Sedang Sampling</option>
          <option value="SELESAI">Monitoring Selesai</option>
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
              <th class="py-3.5 px-4 min-w-[170px]">Surat Tugas Surveyor</th>
              <th class="py-3.5 px-4 min-w-[200px]">Lembaga & Lokasi</th>
              <th class="py-3.5 px-4 min-w-[180px]">Penyedia / Vendor</th>
              <th class="py-3.5 px-4 text-right min-w-[120px]">Nilai Kontrak</th>
              <th class="py-3.5 px-4 min-w-[150px]">Status Sampling</th>
              <th class="py-3.5 px-4 w-36 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
            <tr v-if="filteredList.length === 0">
              <td colspan="7" class="py-12 text-center text-slate-400 dark:text-slate-500">
                <Compass class="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p class="font-bold text-slate-700 dark:text-slate-300 text-sm">Tidak Ada Tugas Sampling Surveyor</p>
                <p class="text-xs text-slate-400 mt-1">Belum ada surat tugas monitoring yang diterbitkan oleh BPDP Teknis.</p>
              </td>
            </tr>
            <tr
              v-for="(item, idx) in filteredList"
              :key="item.id"
              class="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
            >
              <td class="py-3.5 px-4 text-center font-semibold text-slate-400">{{ idx + 1 }}</td>
              <td class="py-3.5 px-4">
                <span class="font-bold text-teal-800 dark:text-teal-300 block">
                  {{ item.suratTugasSurveyor?.nomorSurat || item.nomorPermohonan }}
                </span>
                <span class="text-[11px] text-slate-400">
                  {{ item.suratTugasSurveyor?.namaLembagaSurveyor || 'PT Surveyor Indonesia' }}
                </span>
              </td>
              <td class="py-3.5 px-4">
                <p class="font-bold text-slate-900 dark:text-slate-100">{{ item.namaLembagaPekebun }}</p>
                <p class="text-[11px] text-slate-500">{{ item.desa }}, {{ item.kabupaten }}</p>
              </td>
              <td class="py-3.5 px-4">
                <p class="font-bold text-slate-800 dark:text-slate-200">{{ item.dokumenKontrak?.namaPenyedia || item.pemenangVendor || '-' }}</p>
                <p class="text-[11px] text-slate-400">Kontrak: {{ item.dokumenKontrak?.nomorKontrak || '-' }}</p>
              </td>
              <td class="py-3.5 px-4 text-right font-bold text-emerald-700 dark:text-emerald-400">
                {{ formatRupiah(item.dokumenKontrak?.totalNilaiKontrak || item.nilaiPemenangTender || 0) }}
              </td>
              <td class="py-3.5 px-4">
                <span
                  :class="[
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border',
                    item.status === 'SELESAI'
                      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200 border-emerald-400'
                      : 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-300',
                  ]"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current" />
                  {{ item.status === 'SELESAI' ? 'Sampling Selesai (Valid)' : 'Sedang Sampling Mutu' }}
                </span>
              </td>
              <td class="py-3.5 px-4 text-center">
                <button
                  type="button"
                  @click="selectedItem = item"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all cursor-pointer shadow-2xs"
                >
                  <Eye class="w-3.5 h-3.5" />
                  Detail Sampling
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detail & Sampling Verification Modal -->
    <div
      v-if="selectedItem"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto"
    >
      <div class="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-6 sm:p-7 shadow-2xl space-y-5 my-8">
        <!-- Modal Header -->
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="text-xs font-bold text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800">
                {{ selectedItem.suratTugasSurveyor?.nomorSurat || selectedItem.nomorPermohonan }}
              </span>
              <span class="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                Paket {{ selectedItem.kategoriPaket }}
              </span>
            </div>
            <h3 class="text-base font-bold text-slate-900 dark:text-slate-100">
              {{ selectedItem.namaLembagaPekebun }}
            </h3>
            <p class="text-xs text-slate-500">
              Penyedia: {{ selectedItem.dokumenKontrak?.namaPenyedia || selectedItem.pemenangVendor }} • Lokasi: {{ selectedItem.desa }}, {{ selectedItem.kabupaten }}
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

        <!-- Surat Tugas Surveyor Box -->
        <div v-if="selectedItem.suratTugasSurveyor" class="bg-teal-50/70 dark:bg-teal-950/30 border border-teal-200 dark:border-teal-800 rounded-2xl p-5 text-xs space-y-2">
          <p class="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-2 text-sm">
            <Compass class="w-4 h-4 text-teal-600" />
            Detail Surat Penugasan Sampling:
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-700 dark:text-slate-300">
            <div><span class="text-slate-500">Nomor Surat Tugas:</span> <p class="font-bold text-slate-900 dark:text-slate-100">{{ selectedItem.suratTugasSurveyor.nomorSurat }}</p></div>
            <div><span class="text-slate-500">Lembaga Pelaksana:</span> <p class="font-bold text-teal-800 dark:text-teal-300">{{ selectedItem.suratTugasSurveyor.namaLembagaSurveyor }}</p></div>
            <div><span class="text-slate-500">Lingkup Penugasan:</span> <p class="font-medium">{{ selectedItem.suratTugasSurveyor.lingkupTugas }}</p></div>
          </div>
        </div>

        <!-- Spesifikasi Barang yang Disampling -->
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

          <button
            v-if="selectedItem.status !== 'SELESAI'"
            type="button"
            @click="handleCompleteMonitoring(selectedItem)"
            class="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
          >
            <FileCheck class="w-4 h-4" />
            Selesaikan Sampling & Verifikasi Mutu Sesuai
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
