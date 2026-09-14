<script setup lang="ts">
import { computed } from 'vue';
import { AlertTriangle, FileText, Warehouse, Users, Calculator } from 'lucide-vue-next';
import { LOCALIZATION } from '@/config/localization';
import { parseRejectionNotes, ParsedRejectionNote } from '@/lib/parseRejectionNotes';

const props = defineProps<{
  catatanRaw?: string | null;
  rejectedDocuments?: Array<{ id: number; documentType: string; notes?: string | null; isResolved?: boolean }>;
}>();

const parsedNotes = computed<ParsedRejectionNote[]>(() => {
  if (props.catatanRaw) {
    return parseRejectionNotes(props.catatanRaw);
  }
  if (props.rejectedDocuments && props.rejectedDocuments.length > 0) {
    return props.rejectedDocuments.map((d) => ({
      category: 'PROPOSAL_DOC',
      targetKey: String(d.id),
      itemLabel: d.documentType,
      notes: d.notes || 'Perlu unggah ulang berkas penunjang yang sesuai.',
    }));
  }
  return [];
});

const proposalRejections = computed(() => parsedNotes.value.filter((n) => n.category === 'PROPOSAL_DOC'));
const gudangRejections = computed(() => parsedNotes.value.filter((n) => n.category === 'GUDANG'));
const pekebunRejections = computed(() => parsedNotes.value.filter((n) => n.category === 'PEKEBUN'));
const rabRejections = computed(() => parsedNotes.value.filter((n) => n.category === 'RAB'));
</script>

<template>
  <div v-if="parsedNotes.length > 0" class="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 flex items-center justify-center shrink-0">
        <AlertTriangle class="w-5 h-5" />
      </div>
      <div>
        <h4 class="font-bold text-sm text-amber-950 dark:text-amber-100">
          {{ LOCALIZATION.proposalRevision.alertTitle }}
        </h4>
        <p class="text-xs text-amber-800 dark:text-amber-300">
          {{ LOCALIZATION.proposalRevision.alertSubtitle }}
        </p>
      </div>
    </div>

    <!-- 4 CATEGORY GRID -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-amber-200/70 dark:border-amber-900/50">
      <!-- 1. PROPOSAL DOCS REJECTIONS -->
      <div class="bg-white/90 dark:bg-slate-900/80 rounded-xl p-4 border border-amber-200 dark:border-slate-800 flex flex-col gap-2">
        <div class="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-100">
          <FileText class="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span>1. Dokumen Persyaratan Proposal</span>
        </div>
        <ul v-if="proposalRejections.length > 0" class="space-y-2">
          <li
            v-for="(n, idx) in proposalRejections"
            :key="'prop-' + idx"
            class="text-xs p-2 rounded-lg bg-amber-50/60 dark:bg-slate-800/60 border border-amber-100 dark:border-slate-700 flex flex-col gap-0.5"
          >
            <span class="font-bold text-slate-900 dark:text-slate-100">{{ n.itemLabel }}:</span>
            <span class="text-slate-700 dark:text-slate-300 italic">"{{ n.notes }}"</span>
          </li>
        </ul>
        <p v-else class="text-xs text-slate-400 italic">Tidak ada catatan revisi dokumen proposal.</p>
      </div>

      <!-- 2. GUDANG / STORAGE AREA REJECTIONS -->
      <div class="bg-white/90 dark:bg-slate-900/80 rounded-xl p-4 border border-amber-200 dark:border-slate-800 flex flex-col gap-2">
        <div class="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-100">
          <Warehouse class="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span>2. Gudang / Tempat Penyimpanan</span>
        </div>
        <ul v-if="gudangRejections.length > 0" class="space-y-2">
          <li
            v-for="(n, idx) in gudangRejections"
            :key="'gudang-' + idx"
            class="text-xs p-2 rounded-lg bg-amber-50/60 dark:bg-slate-800/60 border border-amber-100 dark:border-slate-700 flex flex-col gap-0.5"
          >
            <span class="font-bold text-slate-900 dark:text-slate-100">{{ n.itemLabel }}:</span>
            <span class="text-slate-700 dark:text-slate-300 italic">"{{ n.notes }}"</span>
          </li>
        </ul>
        <p v-else class="text-xs text-slate-400 italic">Tidak ada catatan revisi tempat penyimpanan.</p>
      </div>

      <!-- 3. PEKEBUN & LAHAN REJECTIONS -->
      <div class="bg-white/90 dark:bg-slate-900/80 rounded-xl p-4 border border-amber-200 dark:border-slate-800 flex flex-col gap-2">
        <div class="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-100">
          <Users class="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span>3. Pekebun CPCL & Dokumen Lahan</span>
        </div>
        <ul v-if="pekebunRejections.length > 0" class="space-y-2">
          <li
            v-for="(n, idx) in pekebunRejections"
            :key="'pekebun-' + idx"
            class="text-xs p-2 rounded-lg bg-amber-50/60 dark:bg-slate-800/60 border border-amber-100 dark:border-slate-700 flex flex-col gap-0.5"
          >
            <span class="font-bold text-slate-900 dark:text-slate-100">{{ n.farmerName ? `${n.farmerName} (${n.itemLabel})` : n.itemLabel }}:</span>
            <span class="text-slate-700 dark:text-slate-300 italic">"{{ n.notes }}"</span>
          </li>
        </ul>
        <p v-else class="text-xs text-slate-400 italic">Tidak ada catatan revisi data/dokumen pekebun & lahan.</p>
      </div>

      <!-- 4. RAB REJECTIONS -->
      <div class="bg-white/90 dark:bg-slate-900/80 rounded-xl p-4 border border-amber-200 dark:border-slate-800 flex flex-col gap-2">
        <div class="flex items-center gap-2 text-xs font-bold text-amber-950 dark:text-amber-100">
          <Calculator class="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <span>4. Rencana Anggaran Biaya (RAB)</span>
        </div>
        <ul v-if="rabRejections.length > 0" class="space-y-2">
          <li
            v-for="(n, idx) in rabRejections"
            :key="'rab-' + idx"
            class="text-xs p-2 rounded-lg bg-amber-50/60 dark:bg-slate-800/60 border border-amber-100 dark:border-slate-700 flex flex-col gap-0.5"
          >
            <span class="font-bold text-slate-900 dark:text-slate-100">{{ n.itemLabel }}:</span>
            <span class="text-slate-700 dark:text-slate-300 italic">"{{ n.notes }}"</span>
          </li>
        </ul>
        <p v-else class="text-xs text-slate-400 italic">Tidak ada catatan revisi berkas/perincian RAB.</p>
      </div>
    </div>
  </div>
</template>
