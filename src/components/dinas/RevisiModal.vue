<script setup lang="ts">
import { ref } from 'vue';
import { AlertTriangle, X } from 'lucide-vue-next';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit-revisi', note: string): void;
}>();

const note = ref('');

const handleSubmit = () => {
  if (!note.value) return;
  emit('submit-revisi', note.value);
  note.value = '';
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 flex flex-col gap-4">
      <div class="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle class="w-5 h-5 text-amber-600" /> Form Catatan Revisi Berkas
        </h3>
        <button @click="emit('close')" class="text-slate-400 hover:text-slate-600">
          <X class="w-5 h-5" />
        </button>
      </div>

      <p class="text-xs text-slate-600">Masukkan alasan pengembalian berkas usulan ke Lembaga Pekebun / Pemohon untuk diperbaiki.</p>

      <textarea
        v-model="note"
        rows="4"
        placeholder="Tuliskan catatan perbaikan secara spesifik..."
        class="w-full p-3 border border-slate-200 rounded-xl text-xs bg-slate-50 focus:outline-none focus:border-[#066C2A]"
      ></textarea>

      <div class="flex justify-end gap-2 mt-2">
        <button @click="emit('close')" class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">Batal</button>
        <button @click="handleSubmit" class="px-4 py-2 text-xs font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700">Kirim Catatan Revisi</button>
      </div>
    </div>
  </div>
</template>
