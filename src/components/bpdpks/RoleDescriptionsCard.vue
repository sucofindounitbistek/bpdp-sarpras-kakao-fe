<script setup lang="ts">
import { ROLE_DETAILS_MAP } from '@/types/role';
import { LOCALIZATION } from '@/config/localization';
import { ShieldCheck } from 'lucide-vue-next';

const rolesList = Object.values(ROLE_DETAILS_MAP);
</script>

<template>
  <div class="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col gap-4 shadow-xs">
    <div class="flex items-center justify-between border-b border-slate-100 pb-3">
      <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
        <ShieldCheck class="w-5 h-5 text-[#066C2A]" /> {{ LOCALIZATION.roleDescriptions.title }}
      </h3>
      <span class="text-xs font-semibold text-slate-400">{{ LOCALIZATION.roleDescriptions.subtitle }}</span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="role in rolesList"
        :key="role.id"
        class="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-[#066C2A]/40 transition-colors"
      >
        <div class="flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-slate-900 font-apple-body-strong">{{ role.name }}</span>
            <span class="text-[10px] font-bold text-[#066C2A] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-mono">
              {{ role.id }}
            </span>
          </div>
          <span class="text-[10px] font-semibold text-slate-400">{{ LOCALIZATION.roleDescriptions.scopePrefix.replace('{scope}', role.scope) }}</span>
          <p class="text-xs text-slate-600 mt-1 font-apple-caption leading-relaxed">
            {{ role.description }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
