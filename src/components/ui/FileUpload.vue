<script setup lang="ts">
import { ref } from 'vue';
import { UploadCloud, FileText, CheckCircle2 } from 'lucide-vue-next';
import Button from './Button.vue';
import { cn } from '@/lib/utils';
import { formatStandardFileName } from '@/utils/fileNaming';

interface Props {
  id?: string;
  label?: string;
  placeholder?: string;
  accept?: string;
  required?: boolean;
  hint?: string;
  initialFileName?: string;
  documentLabel?: string;
  subLabel?: string;
  proposalNumber?: string | null;
  institutionName?: string | null;
  autoRename?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Unggah dokumen (PDF / JPG / PNG max 5MB)',
  accept: '.pdf,.png,.jpg,.jpeg',
  required: false,
  initialFileName: '',
  autoRename: true,
});

const emit = defineEmits<{
  (e: 'file-selected', file: File): void;
}>();

const fileInputRef = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    const rawFile = target.files[0];
    let fileToEmit = rawFile;

    if (props.autoRename && (props.documentLabel || props.label)) {
      const result = formatStandardFileName(rawFile, {
        documentLabel: props.documentLabel || props.label || 'Dokumen',
        subLabel: props.subLabel,
        proposalNumber: props.proposalNumber,
        institutionName: props.institutionName,
      });
      fileToEmit = result.file;
    }

    selectedFile.value = fileToEmit;
    emit('file-selected', fileToEmit);
    target.value = '';
  }
};
</script>

<template>
  <div class="w-full flex flex-col gap-1">
    <label v-if="label" :for="id" class="text-xs font-semibold text-slate-700 flex items-center gap-1">
      {{ label }}
      <span v-if="required" class="text-rose-500">*</span>
    </label>

    <div
      :class="
        cn(
          'border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center text-center gap-1.5 transition-colors duration-200',
          selectedFile || initialFileName
            ? 'border-emerald-500 bg-emerald-50/30'
            : 'border-slate-300 bg-slate-50/50 hover:border-[#066C2A] hover:bg-slate-50'
        )
      "
    >
      <input
        :id="id"
        ref="fileInputRef"
        type="file"
        :accept="accept"
        class="hidden"
        @change="handleFileChange"
      />

      <div class="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm border border-slate-200">
        <CheckCircle2 v-if="selectedFile || initialFileName" class="w-4 h-4 text-emerald-600" />
        <UploadCloud v-else class="w-4 h-4 text-[#066C2A]" />
      </div>

      <div class="flex flex-col items-center max-w-full px-2">
        <p
          v-if="selectedFile || initialFileName"
          class="text-sm font-semibold text-slate-800 flex items-center gap-1.5 max-w-full"
          :title="selectedFile ? selectedFile.name : initialFileName"
        >
          <FileText class="w-4 h-4 text-emerald-600 shrink-0" />
          <span class="truncate">{{ selectedFile ? selectedFile.name : initialFileName }}</span>
        </p>
        <p v-else class="text-xs text-slate-500">
          {{ placeholder }}
        </p>
      </div>

      <Button
        type="button"
        size="sm"
        variant="outline"
        custom-class="mt-1"
        @click="triggerFileInput"
      >
        {{ selectedFile || initialFileName ? 'Ganti Berkas' : 'Pilih Berkas' }}
      </Button>
    </div>

    <p v-if="hint" class="text-xs text-slate-400 font-apple-fine-print">
      {{ hint }}
    </p>
  </div>
</template>
