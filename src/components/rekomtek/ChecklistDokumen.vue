<script setup lang="ts">
import { Check } from 'lucide-vue-next';

const props = withDefaults(
  defineProps<{
    items: { key: string; label: string; checked: boolean }[];
    readonly?: boolean;
  }>(),
  {
    readonly: false,
  }
);

const emit = defineEmits<{
  (e: 'update:items', updated: typeof props.items): void;
}>();

const toggleItem = (index: number) => {
  if (props.readonly) return;
  const newItems = [...props.items];
  newItems[index] = {
    ...newItems[index],
    checked: !newItems[index].checked,
  };
  emit('update:items', newItems);
};
</script>

<template>
  <div class="flex flex-col gap-2 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
    <div
      v-for="(item, idx) in items"
      :key="item.key"
      @click="toggleItem(idx)"
      :class="[
        'flex items-center gap-3 px-3 py-2.5 rounded-lg border text-[13px] transition-all duration-200 select-none',
        readonly ? 'cursor-default' : 'cursor-pointer active:scale-[0.99]',
        item.checked
          ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 font-semibold'
          : 'bg-white dark:bg-slate-950 border-slate-200/80 dark:border-slate-800/80 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700',
      ]"
    >
      <!-- Checkbox box -->
      <div
        :class="[
          'w-5.5 h-5.5 rounded-md border flex items-center justify-center transition-all duration-200 shrink-0',
          item.checked
            ? 'bg-[#066C2A] dark:bg-emerald-500 border-[#066C2A] dark:border-emerald-500'
            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-950',
        ]"
      >
        <Check v-if="item.checked" class="w-3.5 h-3.5 text-white" />
      </div>
      
      <!-- Document Label -->
      <span class="truncate flex-1">{{ item.label }}</span>
    </div>
  </div>
</template>
