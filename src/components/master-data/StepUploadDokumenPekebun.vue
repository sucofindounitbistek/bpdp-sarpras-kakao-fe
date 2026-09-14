<script setup lang="ts">
import { ref, watch } from 'vue';
import Card from '@/components/ui/Card.vue';
import FileUpload from '@/components/ui/FileUpload.vue';
import Badge from '@/components/ui/Badge.vue';
import { DokumenFormData, DokumenPekebun } from '@/types/pekebun';
import { LOCALIZATION } from '@/config/localization';
import { Download } from 'lucide-vue-next';

const props = defineProps<{
  modelValue: DokumenFormData;
  errors?: Record<string, string>;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: DokumenFormData): void;
}>();

const form = ref<DokumenFormData>({ ...props.modelValue });

watch(
  () => props.modelValue,
  (newVal) => {
    form.value = { ...newVal };
  },
  { deep: true },
);

function isExistingDoc(val: any): val is DokumenPekebun {
  return val && typeof val === 'object' && 'fileUrl' in val;
}

function getExistingName(field: keyof DokumenFormData): string {
  const val = form.value[field];
  if (val instanceof File) return val.name;
  if (isExistingDoc(val)) return val.fileName;
  return '';
}

function getExistingUrl(field: keyof DokumenFormData): string {
  const val = form.value[field];
  if (isExistingDoc(val)) return val.fileUrl;
  return '';
}

function hasDocument(field: keyof DokumenFormData): boolean {
  return form.value[field] !== null;
}

const handleFileSelected = (field: keyof DokumenFormData, file: File) => {
  (form.value as any)[field] = file;
  emit('update:modelValue', form.value);
};

const handleViewFile = (url: string) => {
  window.open(url, '_blank');
};

const docLabels: Record<keyof DokumenFormData, string> = {
  scanKTP: 'KTP',
  scanKK: 'KK',
  swafoto: 'Swafoto',
  suratKuasa: 'Surat Kuasa',
};
</script>

<template>
  <Card :title="LOCALIZATION.stepUploadDokumenPekebun.title" :subtitle="LOCALIZATION.stepUploadDokumenPekebun.subtitle">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
      <template v-for="(label, field) in docLabels" :key="field">
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between gap-2">
            <span class="text-xs md:text-sm font-semibold text-slate-800">
              {{ field === 'scanKTP' ? LOCALIZATION.stepUploadDokumenPekebun.labels.scanKTP : field === 'scanKK' ? LOCALIZATION.stepUploadDokumenPekebun.labels.scanKK : field === 'swafoto' ? LOCALIZATION.stepUploadDokumenPekebun.labels.swafoto : LOCALIZATION.stepUploadDokumenPekebun.labels.suratKuasa }}
              <span class="text-rose-500">*</span>
            </span>
            <div class="flex items-center gap-2">
              <a
                v-if="field === 'suratKuasa'"
                href="/templates/format-surat-kuasa.docx"
                download
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-[#066C2A] hover:bg-[#066C2A]/10 dark:hover:bg-[#066C2A]/20 transition-all duration-200 cursor-pointer"
                title="Unduh format template Surat Kuasa"
              >
                <Download class="w-3.5 h-3.5" />
                <span>Format Surat Kuasa</span>
              </a>
              <Badge v-slot v-if="hasDocument(field)" variant="success">{{ LOCALIZATION.stepUploadDokumenPekebun.badges.uploaded }}</Badge>
              <Badge v-slot v-else variant="danger">{{ LOCALIZATION.stepUploadDokumenPekebun.badges.required }}</Badge>
            </div>
          </div>
          <FileUpload
            :id="String(field)"
            :accept="field === 'suratKuasa' ? '.pdf' : '.jpg,.jpeg,.png'"
            :placeholder="field === 'suratKuasa' ? LOCALIZATION.stepUploadDokumenPekebun.placeholders.pdf : LOCALIZATION.stepUploadDokumenPekebun.placeholders.image"
            :initial-file-name="getExistingName(field)"
            @file-selected="handleFileSelected(field, $event)"
          />
          <button v-if="getExistingUrl(field)" type="button" class="text-xs font-semibold text-[#066C2A] hover:underline self-start" @click="handleViewFile(getExistingUrl(field))">{{ LOCALIZATION.stepUploadDokumenPekebun.viewDoc.replace('{doc}', label) }}</button>
          <p v-if="errors?.[field]" class="text-xs text-rose-600 font-apple-fine-print">
            {{ errors[field] }}
          </p>
        </div>
      </template>
    </div>
  </Card>
</template>
