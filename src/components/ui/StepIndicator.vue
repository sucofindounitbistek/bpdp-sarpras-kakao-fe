<script setup lang="ts">
import { Check } from 'lucide-vue-next';

interface Props {
  steps: string[];
  currentStep: number; // 1-based
}

defineProps<Props>();
</script>

<template>
  <div class="w-full flex items-center justify-between relative">
    <template v-for="(step, index) in steps" :key="index">
      <!-- Connector line -->
      <div
        v-if="index > 0"
        class="flex-1 h-0.5 mx-2 transition-colors duration-300"
        :class="index + 1 <= currentStep ? 'bg-[#066C2A]' : 'bg-slate-200'"
      />

      <!-- Step node -->
      <div class="flex flex-col items-center gap-1.5 z-10">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-200"
          :class="[
            index + 1 < currentStep
              ? 'bg-[#066C2A] text-white'
              : index + 1 === currentStep
              ? 'border-2 border-[#066C2A] text-[#066C2A] bg-white ring-4 ring-[#066C2A]/20 font-bold'
              : 'border-2 border-slate-300 text-slate-400 bg-white',
          ]"
        >
          <Check v-if="index + 1 < currentStep" class="w-4 h-4 stroke-[3]" />
          <span v-else>{{ index + 1 }}</span>
        </div>

        <span
          class="text-[11px] font-semibold text-center line-clamp-2 max-w-[6rem]"
          :class="index + 1 <= currentStep ? 'text-slate-900' : 'text-slate-400'"
        >
          {{ step }}
        </span>
      </div>
    </template>
  </div>
</template>
