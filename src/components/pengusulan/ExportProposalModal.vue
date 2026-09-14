<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Modal from '@/components/ui/Modal.vue';
import Button from '@/components/ui/Button.vue';
import { getStatusLabel, getJenisSarprasLabel } from '@/types/pengusulan';
import { PAKET_OPTIONS } from '@/lib/pengusulan-persyaratan.config';
import { exportProposalsToCsv, exportProposalsToPdf } from '@/utils/exportProposal';
import { matchesProposalRegion } from '@/utils/regionHelper';
import { proposalService, type ProposalExportQueryParams } from '@/services/proposal.service';
import { useToast } from '@/composables/useToast';
import { Download, FileSpreadsheet, Printer, Calendar, Filter, CheckCircle2, Loader2, MapPin, Lock } from 'lucide-vue-next';

interface StatusOption {
  value: string;
  label: string;
}

interface Props {
  isOpen: boolean;
  pageTitle?: string;
  sourceData?: any[];
  availableStatuses?: StatusOption[];
  defaultStatuses?: string[];
  searchQuery?: string;
  scopeRegionName?: string;
  scopeRegencyId?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  pageTitle: 'Daftar Proposal',
  sourceData: () => [],
  availableStatuses: () => [],
  defaultStatuses: () => [],
  searchQuery: '',
  scopeRegionName: '',
  scopeRegencyId: undefined,
});

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const toast = useToast();

// Filter States
const startDate = ref('');
const endDate = ref('');
const selectedStatus = ref('');
const selectedPaket = ref('');
const exportFormat = ref<'csv' | 'pdf'>('csv');
const isExporting = ref(false);
const isCountLoading = ref(false);
const matchedCount = ref(0);

// Status options
const statusOptionsList = computed<StatusOption[]>(() => {
  if (props.availableStatuses && props.availableStatuses.length > 0) {
    return props.availableStatuses;
  }
  return [];
});

const getActiveExportParams = (): ProposalExportQueryParams => {
  const params: ProposalExportQueryParams = {};
  if (props.searchQuery) params.search = props.searchQuery;

  if (selectedStatus.value) {
    params.status = selectedStatus.value;
  } else if (props.availableStatuses && props.availableStatuses.length > 0) {
    params.status = props.availableStatuses.map((s) => s.value);
  } else if (props.defaultStatuses && props.defaultStatuses.length > 0) {
    params.status = props.defaultStatuses;
  }

  if (selectedPaket.value) params.paket_sarpras = selectedPaket.value;
  if (startDate.value) params.start_date = startDate.value;
  if (endDate.value) params.end_date = endDate.value;

  if (props.scopeRegencyId) params.regency_id = props.scopeRegencyId;
  if (props.scopeRegionName) params.kabupaten = props.scopeRegionName;

  return params;
};

async function fetchMatchCount() {
  if (!props.isOpen) return;
  isCountLoading.value = true;
  try {
    const list = await proposalService.exportJson(getActiveExportParams());
    const scopedList = (list || []).filter((p) =>
      matchesProposalRegion(p, props.scopeRegencyId, props.scopeRegionName),
    );
    matchedCount.value = scopedList.length;
  } catch (err) {
    console.error('Failed to fetch proposal count:', err);
    matchedCount.value = 0;
  } finally {
    isCountLoading.value = false;
  }
}

// Auto-reset filters when modal opens and fetch live server-side match count
watch(
  () => props.isOpen,
  (val) => {
    if (val) {
      startDate.value = '';
      endDate.value = '';
      selectedStatus.value = '';
      selectedPaket.value = '';
      exportFormat.value = 'csv';
      fetchMatchCount();
    }
  },
);

watch([startDate, endDate, selectedStatus, selectedPaket], () => {
  if (props.isOpen) {
    fetchMatchCount();
  }
});

const handleReset = () => {
  startDate.value = '';
  endDate.value = '';
  selectedStatus.value = '';
  selectedPaket.value = '';
};

const handleExecuteExport = async () => {
  isExporting.value = true;
  const sanitizedTitle = props.pageTitle.replace(/\s+/g, '-').toLowerCase();
  const params = getActiveExportParams();

  try {
    const rawList = await proposalService.exportJson(params);
    const fullList = (rawList || []).filter((p) =>
      matchesProposalRegion(p, props.scopeRegencyId, props.scopeRegionName),
    );

    if (!fullList || fullList.length === 0) {
      toast.warning('Tidak ada data proposal yang cocok untuk diekspor.');
      return;
    }

    if (exportFormat.value === 'csv') {
      exportProposalsToCsv(fullList, `export-${sanitizedTitle}`);
      toast.success('Berkas CSV berhasil diunduh.', 'Ekspor Selesai');
    } else {
      const activeStatusObj = statusOptionsList.value.find((s) => s.value === selectedStatus.value);
      const statusLabel = selectedStatus.value
        ? activeStatusObj?.label || getStatusLabel(selectedStatus.value)
        : 'Semua Status';

      const paketLabel = selectedPaket.value
        ? getJenisSarprasLabel(selectedPaket.value)
        : 'Semua Paket';

      exportProposalsToPdf(fullList, props.pageTitle, {
        startDate: startDate.value,
        endDate: endDate.value,
        statusLabel,
        paketLabel,
        wilayahLabel: props.scopeRegionName || undefined,
      });
      toast.success('Dokumen PDF berhasil disiapkan.', 'Ekspor Selesai');
    }
    emit('close');
  } catch (err: any) {
    console.error('Export failed:', err);
    toast.error(err.message || 'Gagal mengekspor data proposal');
  } finally {
    isExporting.value = false;
  }
};
</script>

<template>
  <Modal :is-open="isOpen" :title="`Ekspor Data - ${pageTitle}`" size="lg" @close="emit('close')">
    <div class="flex flex-col gap-5 py-1">
      <!-- Locked Region Scope Banner (Dinas Kabupaten) -->
      <div
        v-if="scopeRegionName || scopeRegencyId"
        class="flex items-start gap-3 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 text-xs transition-all"
      >
        <div class="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 mt-0.5">
          <MapPin class="w-4 h-4" />
        </div>
        <div class="flex-1 flex flex-col gap-1">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <span class="font-semibold flex items-center gap-1.5 text-slate-800 dark:text-slate-100">
              Cakupan Wilayah: <span class="font-bold text-[#066C2A] dark:text-emerald-400">{{ scopeRegionName || 'Kabupaten Terkait' }}</span>
            </span>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
              <Lock class="w-3 h-3" />
              Terkunci Otomatis
            </span>
          </div>
          <p class="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Penyaringan wilayah per kecamatan/desa sedang ditangguhkan menunggu kesiapan API Wilayah. Seluruh data yang diekspor otomatis dibatasi khusus untuk wilayah kabupaten dinas terkait.
          </p>
        </div>
      </div>

      <!-- Filter Criteria Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Date Range: Start Date -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Calendar class="w-3.5 h-3.5 text-slate-400" />
            Tanggal Mulai Pengajuan
          </label>
          <input
            v-model="startDate"
            type="date"
            class="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <!-- Date Range: End Date -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Calendar class="w-3.5 h-3.5 text-slate-400" />
            Tanggal Selesai Pengajuan
          </label>
          <input
            v-model="endDate"
            type="date"
            class="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>

        <!-- Status Filter -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Filter class="w-3.5 h-3.5 text-slate-400" />
            Filter Status Proposal
          </label>
          <select
            v-model="selectedStatus"
            class="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="">Semua Status</option>
            <option v-for="opt in statusOptionsList" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- Paket Sarpras Filter -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Filter class="w-3.5 h-3.5 text-slate-400" />
            Filter Paket Sarpras
          </label>
          <select
            v-model="selectedPaket"
            class="px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          >
            <option value="">Semua Paket Sarpras</option>
            <option v-for="paket in PAKET_OPTIONS" :key="paket.id" :value="paket.id">
              {{ paket.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- Format Selection -->
      <div class="flex flex-col gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Format Berkas Ekspor</label>
        <div class="grid grid-cols-2 gap-3">
          <label
            :class="[
              'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
              exportFormat === 'csv'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300',
            ]"
          >
            <input v-model="exportFormat" type="radio" value="csv" class="hidden" />
            <div class="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet class="w-5 h-5" />
            </div>
            <div>
              <div class="text-xs font-bold">CSV / Excel</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400">Tabel data spreadsheet (.csv)</div>
            </div>
          </label>

          <label
            :class="[
              'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
              exportFormat === 'pdf'
                ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300',
            ]"
          >
            <input v-model="exportFormat" type="radio" value="pdf" class="hidden" />
            <div class="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
              <Printer class="w-5 h-5" />
            </div>
            <div>
              <div class="text-xs font-bold">Printable PDF</div>
              <div class="text-[11px] text-slate-500 dark:text-slate-400">Format dokumen siap cetak (A4)</div>
            </div>
          </label>
        </div>
      </div>

      <!-- Preview Summary Banner -->
      <div
        :class="[
          'flex items-center justify-between p-3 rounded-xl text-xs font-medium border',
          matchedCount > 0
            ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300',
        ]"
      >
        <div class="flex items-center gap-2">
          <Loader2 v-if="isCountLoading" class="w-4 h-4 text-slate-400 animate-spin" />
          <CheckCircle2 v-else-if="matchedCount > 0" class="w-4 h-4 text-emerald-600" />
          <span>
            Total data yang akan diekspor: <b>{{ matchedCount }} Proposal</b>
          </span>
        </div>
        <button
          v-if="startDate || endDate || selectedStatus || selectedPaket"
          type="button"
          @click="handleReset"
          class="text-[11px] text-emerald-600 hover:underline cursor-pointer"
        >
          Reset Filter
        </button>
      </div>

      <!-- Modal Footer Action Buttons -->
      <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button variant="secondary" size="sm" :disabled="isExporting" @click="emit('close')">
          Batal
        </Button>
        <Button
          variant="primary"
          size="sm"
          :disabled="matchedCount === 0 || isExporting || isCountLoading"
          @click="handleExecuteExport"
          class="flex items-center gap-1.5"
        >
          <Loader2 v-if="isExporting" class="w-4 h-4 animate-spin" />
          <Download v-else class="w-4 h-4" />
          {{ isExporting ? 'Memproses Ekspor...' : (exportFormat === 'csv' ? 'Unduh CSV (Excel)' : 'Cetak / Unduh PDF') }}
        </Button>
      </div>
    </div>
  </Modal>
</template>
