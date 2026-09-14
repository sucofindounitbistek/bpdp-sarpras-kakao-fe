<script setup lang="ts">
import { X } from 'lucide-vue-next';
import { LOCALIZATION } from '@/config/localization';

defineProps<{
  isOpen: boolean;
  title: string;
  dataUrl: string;
  mimeType: string;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0 z-[60] bg-slate-900/90 flex flex-col" @click.self="emit('close')">
      <div class="flex items-center justify-between px-4 py-3 bg-slate-900/50 shrink-0">
        <span class="text-sm font-semibold text-white truncate">{{ title }}</span>
        <button
          type="button"
          @click="emit('close')"
          class="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          :aria-label="LOCALIZATION.documentPreviewModal.closeAria"
        >
          <X class="w-5 h-5" />
        </button>
      </div>
      <div class="flex-1 flex items-center justify-center p-4 min-h-0">
        <img
          v-if="mimeType.startsWith('image/')"
          :src="dataUrl"
          class="max-w-full max-h-full object-contain"
          :alt="title"
        />
        <iframe
          v-else
          :src="dataUrl"
          :title="LOCALIZATION.documentPreviewModal.previewIframeTitle"
          class="w-full h-full rounded-lg border border-slate-700"
        />
      </div>
    </div>
  </Teleport>
</template>
