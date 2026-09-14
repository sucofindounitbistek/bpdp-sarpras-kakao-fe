<script setup lang="ts">
import { ref, watch } from 'vue';
import { X, History, ExternalLink, AlertTriangle, CheckCircle2, FileText } from 'lucide-vue-next';
import dokumenSyncService from '@/services/dokumenSync.service';
import type { ProposalDocumentItem } from '@/types/dokumenSync';

const props = defineProps<{
  isOpen: boolean;
  proposalId: number;
  documentType: string;
  documentLabel?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const isLoading = ref(false);
const historyList = ref<ProposalDocumentItem[]>([]);
const errorMessage = ref<string | null>(null);

const fetchHistory = async () => {
  if (!props.proposalId || !props.documentType) return;
  isLoading.value = true;
  errorMessage.value = null;
  try {
    const data = await dokumenSyncService.getDocumentVersionHistory(props.proposalId, props.documentType);
    historyList.value = data || [];
  } catch (err: any) {
    errorMessage.value = err?.message || 'Gagal memuat riwayat versi dokumen';
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      fetchHistory();
    } else {
      historyList.value = [];
      errorMessage.value = null;
    }
  },
  { immediate: true }
);

const handleViewFile = (url: string) => {
  if (url) {
    window.open(url, '_blank');
  }
};
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all"
    @click.self="emit('close')"
  >
    <div
      class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
    >
      <!-- HEADER -->
      <div class="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-[#066C2A]">
            <History class="w-5 h-5" />
          </div>
          <div class="flex flex-col">
            <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">
              Riwayat Versi Dokumen
            </h3>
            <span class="text-xs text-slate-500 dark:text-slate-400">
              {{ documentLabel || documentType }}
            </span>
          </div>
        </div>

        <button
          type="button"
          @click="emit('close')"
          class="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X class="w-5 h-5" />
        </button>
      </div>

      <!-- BODY -->
      <div class="p-6 overflow-y-auto flex flex-col gap-4">
        <!-- LOADING SKELETON -->
        <div v-if="isLoading" class="flex flex-col gap-3 py-6">
          <div class="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
          <div class="h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
        </div>

        <!-- ERROR STATE -->
        <div
          v-else-if="errorMessage"
          class="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-xs text-rose-800 dark:text-rose-300 flex items-center gap-2"
        >
          <AlertTriangle class="w-4 h-4 shrink-0 text-rose-600" />
          <span>{{ errorMessage }}</span>
        </div>

        <!-- EMPTY STATE -->
        <div
          v-else-if="historyList.length === 0"
          class="py-12 flex flex-col items-center justify-center text-center gap-2"
        >
          <FileText class="w-10 h-10 text-slate-300 dark:text-slate-600" />
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Belum ada riwayat pergantian versi untuk dokumen ini.
          </p>
        </div>

        <!-- VERSION COMPARISON LIST -->
        <div v-else class="flex flex-col gap-4">
          <div
            v-for="(item, idx) in historyList"
            :key="item.id || idx"
            class="p-4 rounded-2xl border transition-all flex flex-col gap-3"
            :class="[
              item.isActive
                ? 'bg-emerald-50/40 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-900 ring-1 ring-emerald-500/20'
                : 'bg-slate-50/60 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 opacity-80',
            ]"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="flex items-center gap-2">
                <span
                  class="px-2.5 py-1 text-xs font-bold rounded-lg"
                  :class="item.isActive ? 'bg-[#066C2A] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'"
                >
                  Versi {{ item.version || idx + 1 }}
                </span>
                <span
                  v-if="item.isActive"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                >
                  Aktif (Terbaru)
                </span>
                <span
                  v-if="item.source === 'IAM_SYNC'"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                >
                  ✓ Sinkronisasi IAM
                </span>
              </div>

              <span class="text-[11px] text-slate-400 dark:text-slate-500">
                {{ item.uploadedAt }}
              </span>
            </div>

            <!-- FILE DETAILS -->
            <div class="flex items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800">
              <div class="flex items-center gap-2 min-w-0">
                <FileText class="w-4 h-4 text-slate-400 shrink-0" />
                <span class="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {{ item.fileName }}
                </span>
                <span v-if="item.fileSize" class="text-[10px] text-slate-400 shrink-0">
                  ({{ item.fileSize }})
                </span>
              </div>

              <button
                v-if="item.fileUrl"
                type="button"
                @click="handleViewFile(item.fileUrl)"
                class="px-3 py-1 text-xs font-bold text-[#066C2A] hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                <ExternalLink class="w-3.5 h-3.5" />
                <span>Pratinjau</span>
              </button>
            </div>

            <!-- REJECTION REASON (OLD VERSION) -->
            <div
              v-if="item.reviewNotes"
              class="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-xs flex flex-col gap-1 text-amber-900 dark:text-amber-200"
            >
              <div class="flex items-center gap-1.5 font-bold">
                <AlertTriangle class="w-3.5 h-3.5 text-amber-600" />
                <span>Catatan Penolakan Verifikator:</span>
              </div>
              <p class="text-[11px] pl-5">{{ item.reviewNotes }}</p>
            </div>

            <!-- APPLICANT NOTES / REPLACED REASON -->
            <div
              v-if="item.replacedReason"
              class="p-3 rounded-xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 text-xs flex flex-col gap-1 text-blue-900 dark:text-blue-200"
            >
              <div class="flex items-center gap-1.5 font-bold">
                <CheckCircle2 class="w-3.5 h-3.5 text-blue-600" />
                <span>Keterangan Perbaikan Pemohon:</span>
              </div>
              <p class="text-[11px] pl-5">{{ item.replacedReason }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- FOOTER -->
      <div class="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-end">
        <button
          type="button"
          @click="emit('close')"
          class="px-4 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>
