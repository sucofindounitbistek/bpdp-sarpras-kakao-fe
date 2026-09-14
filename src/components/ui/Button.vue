<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20',
  {
    variants: {
      variant: {
        primary: 'bg-[#066C2A] text-white hover:bg-[#055621]',
        secondary: 'bg-emerald-50 text-[#066C2A] hover:bg-emerald-100',
        outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
        danger: 'bg-rose-600 text-white hover:bg-rose-700',
        ghost: 'text-slate-600 hover:bg-slate-100',
      },
      size: {
        sm: 'h-9 px-3.5 text-xs md:text-sm gap-1.5',
        md: 'h-10 px-4 md:px-5 text-xs md:text-sm font-semibold gap-2',
        lg: 'h-11 md:h-12 px-6 text-sm md:text-base font-bold gap-2.5',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export type ButtonVariants = VariantProps<typeof buttonVariants>;

interface Props {
  type?: 'button' | 'submit' | 'reset';
  variant?: ButtonVariants['variant'];
  size?: ButtonVariants['size'];
  disabled?: boolean;
  loading?: boolean;
  customClass?: string;
}

withDefaults(defineProps<Props>(), {
  type: 'button',
  variant: 'primary',
  size: 'md',
  disabled: false,
  loading: false,
  customClass: '',
});
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="cn(buttonVariants({ variant, size }), customClass)"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <slot />
  </button>
</template>
