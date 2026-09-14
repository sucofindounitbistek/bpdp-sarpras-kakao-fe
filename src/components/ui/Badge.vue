<script setup lang="ts">
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-mono font-semibold border transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-emerald-50 text-[#066C2A] border-emerald-200',
        secondary: 'bg-slate-100 text-slate-700 border-slate-200',
        success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        warning: 'bg-amber-50 text-amber-700 border-amber-200',
        danger: 'bg-rose-50 text-rose-700 border-rose-200',
        info: 'bg-sky-50 text-sky-700 border-sky-200',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  }
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

interface Props {
  variant?: BadgeVariants['variant'];
  customClass?: string;
}

withDefaults(defineProps<Props>(), {
  variant: 'primary',
  customClass: '',
});
</script>

<template>
  <span :class="cn(badgeVariants({ variant }), customClass)">
    <slot />
  </span>
</template>
