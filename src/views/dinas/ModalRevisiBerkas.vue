<script setup lang="ts">
import { ref } from 'vue';
import Modal from '@/components/ui/Modal.vue';
import Button from '@/components/ui/Button.vue';

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'submit-revisi', catatan: string): void;
}>();

const catatanRevisi = ref('');

const handleSubmit = () => {
  if (!catatanRevisi.value) return;
  emit('submit-revisi', catatanRevisi.value);
  catatanRevisi.value = '';
};
</script>

<template>
  <Modal :is-open="isOpen" title="Kembalikan Berkas (Catatan Revisi)" @close="emit('close')">
    <div class="flex flex-col gap-4">
      <p class="text-xs text-slate-500 font-apple-caption">Tuliskan secara jelas alasan pengembalian atau berkas dokumen yang perlu diperbaiki oleh Kelembagaan Pekebun.</p>

      <div class="flex flex-col gap-1.5">
        <label class="text-xs font-semibold text-slate-700 font-apple-caption">Catatan Perbaikan / Revisi</label>
        <textarea
          v-model="catatanRevisi"
          rows="4"
          placeholder="Contoh: Scan KTP Pengurus buram dan STDB anggota Budi belum dilampirkan..."
          class="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20"
        ></textarea>
      </div>
    </div>

    <template #footer>
      <Button variant="outline" size="sm" @click="emit('close')">Batal</Button>
      <Button variant="danger" size="sm" :disabled="!catatanRevisi" @click="handleSubmit"> Kirim Catatan Revisi </Button>
    </template>
  </Modal>
</template>
