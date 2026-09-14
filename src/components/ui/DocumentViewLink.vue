<script setup lang="ts">
// DocumentViewLink — tautan reusabel untuk melihat dokumen (PDF/gambar), self-contained.
// Bila dataUrl/fileUrl backend tersedia dipakai langsung; bila hanya ada fileName
// (data client-simulated) otomatis digenerate mock PDF. Pratinjau memakai DocumentPreviewModal.
import { Eye } from 'lucide-vue-next';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import { useDocumentPreview } from '@/composables/useDocumentPreview';
import type { MockDocContext } from '@/utils/mockDocumentViewer';

withDefaults(
  defineProps<{
    fileName?: string;
    title?: string;
    dataUrl?: string;
    fileUrl?: string;
    mimeType?: string;
    context?: MockDocContext;
    compact?: boolean;
  }>(),
  { fileName: '', title: '', dataUrl: '', fileUrl: '', mimeType: '', context: undefined, compact: false },
);

const { previewDoc, openDocument, closeDocument } = useDocumentPreview();
</script>

<template>
  <button
    v-if="fileName || dataUrl || fileUrl"
    type="button"
    :title="fileName || title"
    class="inline-flex items-center gap-1 text-left hover:underline active:scale-95 transition-transform"
    @click.stop="openDocument({ fileName, title, dataUrl, fileUrl, mimeType, context })"
  >
    <Eye class="w-3.5 h-3.5 shrink-0 text-[#066C2A] dark:text-emerald-400" />
    <span v-if="fileName" class="font-medium truncate" :class="compact ? 'text-[10px]' : 'text-[11px]'">{{ fileName }}</span>
  </button>

  <DocumentPreviewModal
    :is-open="!!previewDoc"
    :title="previewDoc?.title ?? ''"
    :data-url="previewDoc?.dataUrl ?? ''"
    :mime-type="previewDoc?.mimeType ?? ''"
    @close="closeDocument"
  />
</template>
