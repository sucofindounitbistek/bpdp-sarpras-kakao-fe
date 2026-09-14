<script setup lang="ts">
import { ref } from 'vue';
import { LogOut } from 'lucide-vue-next';
import Modal from '@/components/ui/Modal.vue';
import Button from '@/components/ui/Button.vue';
import { LOCALIZATION } from '@/config/localization';

interface Props {
  isOpen: boolean;
}

defineProps<Props>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'confirm'): void;
}>();

const isLoggingOut = ref(false);

const handleConfirm = () => {
  isLoggingOut.value = true;
  emit('confirm');
};
</script>

<template>
  <Modal :is-open="isOpen" max-width="md" @close="emit('close')">
    <div class="p-6 flex flex-col items-center text-center gap-4">
      <!-- Warning / Logout Icon Badge -->
      <div class="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-200/80 flex items-center justify-center shadow-xs">
        <LogOut class="w-7 h-7" />
      </div>

      <!-- Title & Description -->
      <div class="flex flex-col gap-1.5">
        <h3 class="text-base font-bold text-slate-900">
          {{ LOCALIZATION.logout.modalTitle }}
        </h3>
        <p class="text-xs text-slate-500 leading-relaxed max-w-sm">
          {{ LOCALIZATION.logout.modalDescription }}
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-3 w-full mt-2 pt-2 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          class="flex-1 rounded-xl text-xs py-2.5"
          :disabled="isLoggingOut"
          @click="emit('close')"
        >
          {{ LOCALIZATION.logout.cancelButton }}
        </Button>
        <Button
          type="button"
          class="flex-1 rounded-xl text-xs py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-600/20"
          :loading="isLoggingOut"
          @click="handleConfirm"
        >
          {{ LOCALIZATION.logout.confirmButton }}
        </Button>
      </div>
    </div>
  </Modal>
</template>
