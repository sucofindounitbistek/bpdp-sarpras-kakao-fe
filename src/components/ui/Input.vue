<script setup lang="ts">
import { ref } from 'vue';
import { cn } from '@/lib/utils';

interface Props {
  id?: string;
  label?: string;
  modelValue?: string | number;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
  inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url';
  maxlength?: number | string;
  minlength?: number | string;
  pattern?: string;
  onlyDigits?: boolean;
  customClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  required: false,
  disabled: false,
  onlyDigits: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let val = target.value;
  if (props.onlyDigits) {
    val = val.replace(/\D/g, '');
    if (props.maxlength) {
      val = val.slice(0, Number(props.maxlength));
    }
    target.value = val;
  }
  emit('update:modelValue', val);
};

const handleKeyDown = (event: KeyboardEvent) => {
  if (props.onlyDigits) {
    if (
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === 'Tab' ||
      event.key === 'Escape' ||
      event.key === 'Enter' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key === 'ArrowUp' ||
      event.key === 'ArrowDown' ||
      event.key === 'Home' ||
      event.key === 'End' ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }
};
</script>

<template>
  <div :class="cn('w-full flex flex-col gap-1.5', customClass)">
    <label
      v-if="label"
      :for="id"
      class="text-xs md:text-sm font-semibold text-slate-700 flex items-center gap-1 font-apple-caption"
    >
      {{ label }}
      <span v-if="required" class="text-rose-500">*</span>
    </label>

    <input
      ref="inputRef"
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :inputmode="inputmode || (onlyDigits ? 'numeric' : undefined)"
      :maxlength="maxlength ? Number(maxlength) : undefined"
      :minlength="minlength ? Number(minlength) : undefined"
      :pattern="pattern"
      @input="handleInput"
      @keydown="handleKeyDown"
      :class="
        cn(
          'w-full h-10 px-3.5 rounded-xl border bg-white text-slate-900 text-xs md:text-sm transition-colors duration-200',
          'placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A]',
          'disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed',
          error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20' : 'border-slate-200'
        )
      "
    />

    <p v-if="error" class="text-xs text-rose-600 font-apple-fine-print mt-0.5">
      {{ error }}
    </p>
    <p v-else-if="hint" class="text-xs text-slate-400 font-apple-fine-print mt-0.5">
      {{ hint }}
    </p>
  </div>
</template>
