<script setup lang="ts">
import { ref } from 'vue';
import { LOCALIZATION } from '@/config/localization';
import { CheckSquare } from 'lucide-vue-next';

const checklistItems = ref([
  { id: '1', label: LOCALIZATION.kabVerifikasiChecklist.items.item1, checked: true },
  { id: '2', label: LOCALIZATION.kabVerifikasiChecklist.items.item2, checked: true },
  { id: '3', label: LOCALIZATION.kabVerifikasiChecklist.items.item3, checked: true },
  { id: '4', label: LOCALIZATION.kabVerifikasiChecklist.items.item4, checked: false },
]);

const toggleItem = (id: string) => {
  const item = checklistItems.value.find(i => i.id === id);
  if (item) item.checked = !item.checked;
};
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-xs">
    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
      <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
        <CheckSquare class="w-5 h-5 text-[#066C2A]" /> {{ LOCALIZATION.kabVerifikasiChecklist.title }}
      </h3>
      <span class="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
        {{ LOCALIZATION.kabVerifikasiChecklist.verifiedCount.replace('{count}', String(checklistItems.filter(i => i.checked).length)).replace('{total}', String(checklistItems.length)) }}
      </span>
    </div>

    <div class="flex flex-col gap-2.5">
      <div
        v-for="item in checklistItems"
        :key="item.id"
        @click="toggleItem(item.id)"
        class="flex items-start gap-3 p-3 rounded-xl border border-slate-200/80 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <input type="checkbox" :checked="item.checked" class="mt-0.5 rounded text-[#066C2A] focus:ring-0 cursor-pointer" />
        <span :class="['text-xs font-semibold', item.checked ? 'text-slate-900' : 'text-slate-500']">
          {{ item.label }}
        </span>
      </div>
    </div>
  </div>
</template>

