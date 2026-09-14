<script setup lang="ts">
// TahapProgressBar — progres distribusi 40/30/30 per permohonan + indikator gate; klik segmen memilih tahap.
import { LOCALIZATION } from '@/config/localization';
import { formatRupiah } from '@/utils/exportProposal';
import type { PencairanTahap } from '@/types/penyaluranDana';
import { Lock, CheckCircle2, Loader2 } from 'lucide-vue-next';

defineProps<{ tahapList: PencairanTahap[]; total: number }>();
const emit = defineEmits<{ select: [n: 1 | 2 | 3] }>();

const inProgress = (t: PencairanTahap) => !['DITRANSFER', 'TERKUNCI', 'DITOLAK', 'DITOLAK_PERBAIKAN'].includes(t.status);

const width = (t: PencairanTahap) => `${t.persen * 100}%`;

const segClass = (t: PencairanTahap) => {
  if (t.status === 'DITRANSFER') return 'bg-emerald-500';
  if (t.status === 'DISETUJUI' || t.status === 'VERIF_BPDP') return 'bg-emerald-400';
  if (t.status === 'VERIF_SCI' || t.status === 'DIAJUKAN') return 'bg-blue-400';
  if (t.status.includes('DITOLAK')) return 'bg-red-400';
  return 'bg-slate-200 dark:bg-slate-700';
};
</script>

<template>
  <section class="bg-white/95 dark:bg-slate-900/95 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs p-4 md:p-5">
    <div class="flex items-center justify-between mb-2">
      <h4 class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ LOCALIZATION.penyaluranDana.tahap.title }} (40 / 30 / 30)</h4>
      <p class="text-[11px] text-slate-500 dark:text-slate-400">{{ LOCALIZATION.penyaluranDana.common.total }}: <span class="font-semibold text-[#066C2A] dark:text-emerald-400">{{ formatRupiah(total) }}</span></p>
    </div>
    <div class="flex h-8 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
      <button
        v-for="t in tahapList"
        :key="t.id"
        type="button"
        class="relative h-full transition-all hover:brightness-95 flex items-center justify-center"
        :class="segClass(t)"
        :style="{ width: width(t) }"
        @click="emit('select', t.tahap)"
      >
        <span class="absolute inset-0 flex items-center justify-center gap-1 text-[10px] font-bold" :class="t.status === 'TERKUNCI' ? 'text-slate-500 dark:text-slate-400' : 'text-white'">
          <Lock v-if="t.status === 'TERKUNCI'" class="w-3 h-3" />
          <Loader2 v-else-if="inProgress(t)" class="w-3 h-3" />
          <CheckCircle2 v-else class="w-3 h-3" />
          T{{ t.tahap }} · {{ t.persen * 100 }}%
        </span>
      </button>
    </div>
    <div class="grid grid-cols-3 gap-2 mt-2">
      <p v-for="t in tahapList" :key="t.id" class="text-[10px] text-center text-slate-500 dark:text-slate-400 truncate">
        {{ t.idPenyaluran }}<br />
        <span v-if="t.nominal > 0" class="font-semibold text-slate-600 dark:text-slate-300">{{ formatRupiah(t.nominal) }}</span>
        <span v-else class="text-slate-400">{{ LOCALIZATION.penyaluranDana.tahap.terkunci }}</span>
      </p>
    </div>
  </section>
</template>
