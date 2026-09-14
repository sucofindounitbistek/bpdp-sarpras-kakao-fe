<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { AlertTriangle } from 'lucide-vue-next';
import Modal from '@/components/ui/Modal.vue';
import Button from '@/components/ui/Button.vue';
import { LOCALIZATION } from '@/config/localization';

interface Props {
  isOpen: boolean;
  actionType: 'approve' | 'reject' | 'submit';
  destinationStage: string;
  notes?: string | string[];
}

const props = withDefaults(defineProps<Props>(), {
  notes: '',
});

const notePoints = computed<string[]>(() => {
  if (!props.notes) return [];
  if (Array.isArray(props.notes)) {
    return props.notes.map((n) => String(n).trim()).filter(Boolean);
  }
  const raw = String(props.notes).trim();
  if (!raw) return [];

  // If contains newlines
  if (raw.includes('\n')) {
    return raw
      .split(/\r?\n/)
      .map((l) => l.trim().replace(/^[-*•\d+.)]\s*/, ''))
      .filter(Boolean);
  }

  // If delimited by semicolons ';'
  if (raw.includes(';')) {
    const parts = raw.split(';').map((p) => p.trim().replace(/^[-*•\d+.)]\s*/, '')).filter(Boolean);
    if (parts.length > 1) {
      return parts;
    }
  }

  return [raw];
});

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();

const isConfirming = ref(false);
const errorMessage = ref('');

const title = computed(() => {
  if (props.actionType === 'submit') return LOCALIZATION.confirmationModal.submitTitle;
  return props.actionType === 'approve'
    ? LOCALIZATION.confirmationModal.approveTitle
    : LOCALIZATION.confirmationModal.rejectTitle;
});

const description = computed(() => {
  if (props.actionType === 'submit') return LOCALIZATION.confirmationModal.submitDescription;
  return props.actionType === 'approve'
    ? LOCALIZATION.confirmationModal.approveDescription
    : LOCALIZATION.confirmationModal.rejectDescription;
});

const confirmLabel = computed(() => {
  if (props.actionType === 'submit') return LOCALIZATION.confirmationModal.confirmSubmit;
  return props.actionType === 'approve'
    ? LOCALIZATION.confirmationModal.confirmApprove
    : LOCALIZATION.confirmationModal.confirmReject;
});

const confirmVariant = computed(() => props.actionType === 'reject' ? 'danger' : 'primary');

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    isConfirming.value = false;
    errorMessage.value = '';
  }
});

function handleConfirm() {
  if (isConfirming.value) return;
  isConfirming.value = true;
  errorMessage.value = '';
  emit('confirm');
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.isOpen) {
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
  <Modal :is-open="isOpen" :title="title" @close="emit('close')">
    <div class="flex flex-col gap-4">
      <p class="text-sm text-slate-600 dark:text-slate-400">
        {{ description }}
      </p>

      <div class="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
        <span class="text-sm font-semibold text-slate-700 dark:text-slate-300">
          {{ destinationStage }}
        </span>
      </div>

      <div v-if="notes && notePoints.length > 0" class="flex flex-col gap-1.5">
        <span class="text-xs font-medium text-slate-500 dark:text-slate-400">
          {{ LOCALIZATION.confirmationModal.notesLabel }}
        </span>
        <div class="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-100 dark:border-slate-700">
          <ul v-if="notePoints.length > 1" class="list-disc pl-4 space-y-1.5 text-slate-700 dark:text-slate-300">
            <li v-for="(point, idx) in notePoints" :key="idx" class="leading-relaxed">
              {{ point }}
            </li>
          </ul>
          <p v-else class="leading-relaxed text-slate-700 dark:text-slate-300">
            {{ notePoints[0] }}
          </p>
        </div>
      </div>

      <div
        v-if="errorMessage"
        class="flex items-start gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800"
      >
        <AlertTriangle class="w-4 h-4 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
        <p class="text-sm text-rose-700 dark:text-rose-300">{{ errorMessage }}</p>
      </div>
    </div>

    <template #footer>
      <Button
        variant="outline"
        size="sm"
        :disabled="isConfirming"
        @click="emit('close')"
      >
        {{ LOCALIZATION.confirmationModal.cancel }}
      </Button>
      <Button
        :variant="confirmVariant"
        size="sm"
        :loading="isConfirming"
        :disabled="isConfirming"
        @click="handleConfirm"
      >
        {{ confirmLabel }}
      </Button>
    </template>
  </Modal>
</template>