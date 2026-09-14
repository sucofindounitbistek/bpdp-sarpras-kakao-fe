<script setup lang="ts">
import PratinjauPekebunDetail from './PratinjauPekebunDetail.vue';

defineProps<{
  isOpen: boolean;
  pekebun: any;
  lahans?: any[];
  proposalId?: string | number;
}>();

const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-900/60 backdrop-blur-sm"
        @click.self="emit('close')"
      >
        <div
          class="relative w-full max-w-5xl bg-slate-50/95 backdrop-blur-xl rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 flex flex-col max-h-[92vh]"
        >
          <!-- Body Scroll Area -->
          <div class="flex-1 overflow-y-auto p-4 md:p-6">
            <PratinjauPekebunDetail
              :pekebun="pekebun"
              :lahans="lahans"
              :proposal-id="proposalId"
              :is-modal="true"
              @close="emit('close')"
            />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
