<script setup lang="ts">
import { defineAsyncComponent, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { Package, FileText, Users } from 'lucide-vue-next';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import { usePengusulanDraftStore } from '@/stores/pengusulanDraft';

const route = useRoute();
const store = usePengusulanDraftStore();

onMounted(async () => {
  const draftId = route.query.draft_id;
  if (draftId) {
    await store.loadDraft(Number(draftId));
  } else {
    store.resetDraft();
  }
});

// T023: 3-step wizard configuration
const steps = [
  { id: 1, title: 'Paket & Dokumen', description: 'Pilih Paket & Upload Dokumen', icon: Package },
  { id: 2, title: 'Pekebun & Lahan', description: 'Pilih Pekebun & Lahan', icon: Users },
  { id: 3, title: 'RAB & Submit', description: 'RAB & Kirim Proposal', icon: FileText },
];

// T023: Lazy-loaded step components with Skeleton fallback
const StepPaketSarpras = defineAsyncComponent({
  loader: () => import('./StepPaketSarpras.vue'),
  loadingComponent: { template: '<div class="animate-pulse h-64 bg-slate-100 rounded-xl" />' },
});
const StepPilihPekebunLahan = defineAsyncComponent({
  loader: () => import('./StepPilihPekebunLahan.vue'),
  loadingComponent: { template: '<div class="animate-pulse h-64 bg-slate-100 rounded-xl" />' },
});
const StepRAB = defineAsyncComponent({
  loader: () => import('./StepRAB.vue'),
  loadingComponent: { template: '<div class="animate-pulse h-64 bg-slate-100 rounded-xl" />' },
});

// T024: Step navigation — driven by store.currentStep
// Navigation buttons are handled within each step component for validation purposes.
// FormPengusulanView just renders the active step based on store.currentStep.
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <!-- T026: Updated Header & Breadcrumbs -->
    <header class="bg-white/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col gap-1.5">
      <Breadcrumb />
      <h1 class="text-base md:text-lg font-bold text-slate-900 font-apple-display-lg mt-0.5">Pengajuan Usulan Sarpras Baru</h1>
      <p class="text-xs text-slate-500 font-apple-caption">Lengkapi 3 langkah berikut untuk mengajukan bantuan sarana &amp; prasarana kelapa kepada BPDPKS.</p>
    </header>

    <!-- T023: 3-step Progress Indicator -->
    <div class="bg-white/90 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-slate-200/80 shadow-sm">
      <div class="flex items-center justify-between gap-2">
        <div
          v-for="(st, idx) in steps"
          :key="st.id"
          @click="store.currentStep = st.id as (1 | 2 | 3)"
          class="flex items-center gap-2 flex-1 cursor-pointer select-none"
        >
          <!-- Step Badge -->
          <div
            :class="[
              'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 shrink-0',
              store.currentStep === st.id ? 'bg-[#066C2A] text-white shadow-md shadow-emerald-900/20 ring-2 ring-emerald-200 scale-110' : store.currentStep > st.id ? 'bg-emerald-100 text-[#066C2A]' : 'bg-slate-100 text-slate-400',
            ]"
          >
            <component :is="st.icon" class="w-4 h-4" />
          </div>

          <!-- Step Label -->
          <div class="flex-col min-w-0 hidden sm:flex">
            <span :class="['text-xs font-bold leading-tight truncate', store.currentStep === st.id ? 'text-[#066C2A]' : 'text-slate-500']">{{ st.title }}</span>
            <span class="text-[10px] text-slate-400 truncate">{{ st.description }}</span>
          </div>

          <!-- Connector Bar (not on last) -->
          <div v-if="idx < steps.length - 1" class="h-1.5 flex-1 mx-2 rounded-full relative overflow-hidden bg-slate-200 shrink-0 min-w-8">
            <div class="h-full bg-[#066C2A] transition-all duration-500 ease-in-out" :style="{ width: store.currentStep > st.id ? '100%' : '0%' }" />
          </div>
        </div>
      </div>
    </div>

    <!-- T023+T024: Active Step Content — step navigation is handled within each step component -->
    <div class="bg-white/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <Transition name="step-slide" mode="out-in">
        <StepPaketSarpras v-if="store.currentStep === 1" key="step1" />
        <StepPilihPekebunLahan v-else-if="store.currentStep === 2" key="step2" />
        <StepRAB v-else-if="store.currentStep === 3" key="step3" />
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.step-slide-enter-active,
.step-slide-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}
.step-slide-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.step-slide-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>
