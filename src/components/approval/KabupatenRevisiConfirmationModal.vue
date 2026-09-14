<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { AlertTriangle, FileText, Users, AlertCircle } from 'lucide-vue-next';
import Modal from '@/components/ui/Modal.vue';
import Button from '@/components/ui/Button.vue';
import { LOCALIZATION } from '@/config/localization';
import type { RejectedProposalDocItem, GroupedPekebunRejection } from '@/types/approval';

interface Props {
  isOpen: boolean;
  isSubmitting?: boolean;
  proposalNumber?: string;
  lembagaName?: string;
  destinationStage?: string;
  rejectedProposalDocs?: RejectedProposalDocItem[];
  groupedPekebunRejections?: GroupedPekebunRejection[];
}

const props = withDefaults(defineProps<Props>(), {
  isSubmitting: false,
  proposalNumber: '-',
  lembagaName: '-',
  destinationStage: 'Pemohon (Revisi)',
  rejectedProposalDocs: () => [],
  groupedPekebunRejections: () => [],
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();

const isConfirming = ref(false);
const errorMessage = ref('');

watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      isConfirming.value = false;
      errorMessage.value = '';
    }
  }
);

watch(
  () => props.isSubmitting,
  (newVal) => {
    isConfirming.value = newVal;
  }
);

function handleConfirm() {
  if (isConfirming.value) return;
  isConfirming.value = true;
  errorMessage.value = '';
  emit('confirm');
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.isOpen && !isConfirming.value) {
    emit('close');
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
});

defineExpose({ isConfirming, errorMessage, setError, resetConfirming });

function setError(msg: string) {
  isConfirming.value = false;
  errorMessage.value = msg;
}

function resetConfirming() {
  isConfirming.value = false;
  errorMessage.value = '';
}
</script>

<template>
  <Modal
    :is-open="isOpen"
    :title="LOCALIZATION.kabupatenRejectionModal.title"
    size="xl"
    :close-on-overlay="!isConfirming"
    @close="!isConfirming && emit('close')"
  >
    <div class="flex flex-col gap-4 text-xs">
      <!-- Proposal Info & Rejection Notice Banner -->
      <div class="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex flex-col gap-2">
        <div class="flex items-start gap-2.5">
          <AlertCircle class="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
          <div class="flex flex-col">
            <span class="text-xs font-bold text-amber-900 leading-snug">
              {{ LOCALIZATION.kabupatenRejectionModal.description }}
            </span>
            <div class="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-amber-800">
              <span class="font-medium">
                Nomor Usulan: <strong class="font-mono font-bold">{{ proposalNumber }}</strong>
              </span>
              <span class="text-amber-400">&bull;</span>
              <span class="font-medium">
                Kelembagaan: <strong>{{ lembagaName }}</strong>
              </span>
              <span class="text-amber-400">&bull;</span>
              <span class="font-medium">
                Tujuan: <strong>{{ destinationStage }}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Scrollable Grouped Tables Container -->
      <div class="flex flex-col gap-5 max-h-[58vh] overflow-y-auto pr-1">
        <!-- Section A: Data dan Dokumen Usulan & Kelembagaan -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <FileText class="w-4 h-4 text-[#066C2A]" />
              <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {{ LOCALIZATION.kabupatenRejectionModal.sectionA }}
              </h4>
            </div>
            <span
              v-if="rejectedProposalDocs.length > 0"
              class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200"
            >
              {{ rejectedProposalDocs.length }} Item Ditolak
            </span>
          </div>

          <div
            v-if="rejectedProposalDocs.length > 0"
            class="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-2xs"
          >
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th class="p-2.5 w-12 text-center border-r border-slate-200">
                    {{ LOCALIZATION.kabupatenRejectionModal.thNo }}
                  </th>
                  <th class="p-2.5 w-2/5 border-r border-slate-200">
                    {{ LOCALIZATION.kabupatenRejectionModal.thDocName }}
                  </th>
                  <th class="p-2.5">
                    {{ LOCALIZATION.kabupatenRejectionModal.thNotes }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr
                  v-for="(doc, idx) in rejectedProposalDocs"
                  :key="idx"
                  class="hover:bg-slate-50/70 transition-colors"
                >
                  <td class="p-2.5 text-center font-mono text-slate-500 border-r border-slate-100 align-top">
                    {{ idx + 1 }}.
                  </td>
                  <td class="p-2.5 font-semibold text-slate-900 border-r border-slate-100 align-top">
                    {{ doc.name }}
                  </td>
                  <td class="p-2.5 text-rose-700 bg-rose-50/30 leading-relaxed align-top">
                    {{ doc.notes || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div
            v-else
            class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] italic"
          >
            {{ LOCALIZATION.kabupatenRejectionModal.noDocRejections }}
          </div>
        </div>

        <!-- Section B: Data dan Dokumen Pekebun & Lahan (CPCL) -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <Users class="w-4 h-4 text-blue-600" />
              <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">
                {{ LOCALIZATION.kabupatenRejectionModal.sectionB }}
              </h4>
            </div>
            <span
              v-if="groupedPekebunRejections.length > 0"
              class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200"
            >
              {{ groupedPekebunRejections.length }} Pekebun Bermasalah
            </span>
          </div>

          <div
            v-if="groupedPekebunRejections.length > 0"
            class="overflow-hidden border border-slate-200 rounded-xl bg-white shadow-2xs"
          >
            <table class="w-full text-left text-xs border-collapse">
              <thead class="bg-slate-50 text-slate-700 uppercase font-bold text-[10px] border-b border-slate-200">
                <tr>
                  <th class="p-2.5 w-12 text-center border-r border-slate-200">
                    {{ LOCALIZATION.kabupatenRejectionModal.thNo }}
                  </th>
                  <th class="p-2.5 w-1/4 border-r border-slate-200">
                    {{ LOCALIZATION.kabupatenRejectionModal.thPekebunName }}
                  </th>
                  <th class="p-2.5 w-1/3 border-r border-slate-200">
                    {{ LOCALIZATION.kabupatenRejectionModal.thDocType }}
                  </th>
                  <th class="p-2.5">
                    {{ LOCALIZATION.kabupatenRejectionModal.thNotes }}
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200">
                <template
                  v-for="(pekebun, pIdx) in groupedPekebunRejections"
                  :key="pekebun.pekebunId || pIdx"
                >
                  <!-- Row 1 of this Pekebun (with rowSpan on No and Nama Pekebun) -->
                  <tr
                    v-if="pekebun.items.length > 0"
                    class="hover:bg-slate-50/70 transition-colors"
                  >
                    <td
                      :rowspan="pekebun.items.length"
                      class="p-2.5 text-center font-mono text-slate-500 border-r border-slate-200 align-top bg-slate-50/40"
                    >
                      {{ pIdx + 1 }}.
                    </td>
                    <td
                      :rowspan="pekebun.items.length"
                      class="p-2.5 font-bold text-slate-900 border-r border-slate-200 align-top bg-slate-50/40"
                    >
                      <div class="flex flex-col">
                        <span>{{ pekebun.namaPekebun }}</span>
                        <span v-if="pekebun.nik && pekebun.nik !== '-'" class="text-[10px] font-mono text-slate-500 font-normal">
                          NIK: {{ pekebun.nik }}
                        </span>
                      </div>
                    </td>
                    <td class="p-2.5 font-semibold text-slate-800 border-r border-slate-100 align-top">
                      {{ pekebun.items[0].docTypeOrField }}
                    </td>
                    <td class="p-2.5 text-rose-700 bg-rose-50/30 leading-relaxed align-top">
                      {{ pekebun.items[0].notes || '-' }}
                    </td>
                  </tr>

                  <!-- Subsequent rows for the same Pekebun -->
                  <tr
                    v-for="(item, iIdx) in pekebun.items.slice(1)"
                    :key="`${pIdx}-${iIdx}`"
                    class="hover:bg-slate-50/70 transition-colors border-t border-slate-100"
                  >
                    <td class="p-2.5 font-semibold text-slate-800 border-r border-slate-100 align-top">
                      {{ item.docTypeOrField }}
                    </td>
                    <td class="p-2.5 text-rose-700 bg-rose-50/30 leading-relaxed align-top">
                      {{ item.notes || '-' }}
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>

          <div
            v-else
            class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-500 text-[11px] italic"
          >
            {{ LOCALIZATION.kabupatenRejectionModal.noPekebunRejections }}
          </div>
        </div>
      </div>

      <!-- Error Message Banner -->
      <div
        v-if="errorMessage"
        class="flex items-start gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700"
      >
        <AlertTriangle class="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
        <p class="text-xs font-semibold">{{ errorMessage }}</p>
      </div>
    </div>

    <!-- Modal Footer Actions -->
    <template #footer>
      <Button
        variant="outline"
        size="sm"
        :disabled="isConfirming"
        @click="emit('close')"
      >
        {{ LOCALIZATION.kabupatenRejectionModal.cancel }}
      </Button>
      <Button
        variant="danger"
        size="sm"
        :loading="isConfirming"
        :disabled="isConfirming"
        @click="handleConfirm"
      >
        {{ LOCALIZATION.kabupatenRejectionModal.confirmReject }}
      </Button>
    </template>
  </Modal>
</template>
