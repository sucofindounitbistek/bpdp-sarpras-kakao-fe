<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
  X,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  FileText,
  Loader2,
  CheckCircle2
} from 'lucide-vue-next';
import {
  generateRekomtekHtml,
  printRekomtekDocument,
  type RekomtekDocumentData
} from '@/utils/rekomtekPdfGenerator';

const props = defineProps<{
  show: boolean;
  documentData: RekomtekDocumentData | null;
  proposalNumber?: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();

const zoomLevel = ref<number>(100);
const isPrinting = ref<boolean>(false);

const htmlContent = computed(() => {
  if (!props.documentData) return '';
  return generateRekomtekHtml(props.documentData);
});

const handleZoomIn = () => {
  if (zoomLevel.value < 160) {
    zoomLevel.value += 15;
  }
};

const handleZoomOut = () => {
  if (zoomLevel.value > 60) {
    zoomLevel.value -= 15;
  }
};

const handleResetZoom = () => {
  zoomLevel.value = 100;
};

const handlePrint = () => {
  if (!props.documentData) return;
  isPrinting.value = true;
  try {
    printRekomtekDocument(props.documentData);
  } finally {
    setTimeout(() => {
      isPrinting.value = false;
    }, 800);
  }
};

// Reset zoom saat modal dibuka
watch(
  () => props.show,
  (val) => {
    if (val) {
      zoomLevel.value = 100;
    }
  }
);
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        class="relative w-full max-w-5xl h-[92vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
      >
        <!-- Modal Top Bar -->
        <div
          class="flex items-center justify-between px-5 py-3.5 bg-slate-900/95 border-b border-slate-800 text-white select-none z-10"
        >
          <!-- Left: Title & Info -->
          <div class="flex items-center gap-3">
            <div class="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileText class="w-5 h-5" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm sm:text-base font-bold text-slate-100">
                  Pratinjau Draf Rekomendasi Teknis (1:1 Ditjenbun)
                </h3>
                <span class="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  3 Halaman
                </span>
              </div>
              <p class="text-xs text-slate-400">
                Format resmi Kementerian Pertanian &bull; {{ proposalNumber || 'Draf Usulan' }}
              </p>
            </div>
          </div>

          <!-- Middle: Zoom Controls -->
          <div class="hidden md:flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-lg text-slate-300">
            <button
              type="button"
              title="Perkecil (-)"
              class="p-1 rounded hover:bg-slate-700 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="zoomLevel <= 60"
              @click="handleZoomOut"
            >
              <ZoomOut class="w-4 h-4" />
            </button>
            <span class="text-xs font-mono font-medium px-1.5 min-w-[48px] text-center">
              {{ zoomLevel }}%
            </span>
            <button
              type="button"
              title="Perbesar (+)"
              class="p-1 rounded hover:bg-slate-700 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              :disabled="zoomLevel >= 160"
              @click="handleZoomIn"
            >
              <ZoomIn class="w-4 h-4" />
            </button>
            <div class="h-4 w-px bg-slate-700 mx-1"></div>
            <button
              type="button"
              title="Reset Ukuran (100%)"
              class="p-1 rounded hover:bg-slate-700 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              @click="handleResetZoom"
            >
              <RotateCcw class="w-3.5 h-3.5" />
            </button>
          </div>

          <!-- Right: Actions -->
          <div class="flex items-center gap-2">
            <button
              type="button"
              class="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#066C2A] hover:bg-[#055a23] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer disabled:opacity-60"
              :disabled="isPrinting || !documentData"
              @click="handlePrint"
            >
              <Loader2 v-if="isPrinting" class="w-4 h-4 animate-spin" />
              <Printer v-else class="w-4 h-4" />
              <span>Cetak / Unduh PDF</span>
            </button>

            <button
              type="button"
              class="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              @click="emit('close')"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>

        <!-- Modal Body: Document Preview Frame -->
        <div class="flex-1 overflow-auto bg-slate-950/90 p-4 sm:p-8 flex justify-center">
          <div
            class="transition-transform duration-150 origin-top shadow-2xl rounded-sm"
            :style="{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: 'top center',
              width: '210mm',
            }"
          >
            <iframe
              :srcdoc="htmlContent"
              class="w-[210mm] min-h-[3050px] border-0 bg-transparent"
              title="Pratinjau Draf Rekomtek 1:1"
            ></iframe>
          </div>
        </div>

        <!-- Modal Footer Notice -->
        <div
          class="px-5 py-2.5 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400"
        >
          <div class="flex items-center gap-1.5">
            <CheckCircle2 class="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Dokumen digenerate otomatis 1:1 langsung oleh sistem BPDP Sarpras.</span>
          </div>
          <div class="text-slate-500">
            Tekan tombol <strong>Cetak / Unduh PDF</strong> untuk menyimpan berkas PDF.
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
