<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { ChevronDown, FileSpreadsheet, MapPin, UserCheck } from 'lucide-vue-next';
import {
  exportLaporanTitikKoordinat,
  exportLaporanProfilPekebun,
  type ExportPekebunContext,
} from '@/utils/exportPekebunExcel';

const props = withDefaults(
  defineProps<{
    proposal?: any;
    pekebuns?: any[];
    lahans?: any[];
    disabled?: boolean;
    buttonClass?: string;
  }>(),
  {
    disabled: false,
    buttonClass: '',
  }
);

const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);

function toggleDropdown() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
}

function closeDropdown() {
  isOpen.value = false;
}

function handleExportTitikKoordinat() {
  const context: ExportPekebunContext = {
    proposal: props.proposal,
    pekebuns: props.pekebuns,
    lahans: props.lahans,
  };
  exportLaporanTitikKoordinat(context);
  closeDropdown();
}

function handleExportProfilPekebun() {
  const context: ExportPekebunContext = {
    proposal: props.proposal,
    pekebuns: props.pekebuns,
    lahans: props.lahans,
  };
  exportLaporanProfilPekebun(context);
  closeDropdown();
}

function handleClickOutside(event: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown();
  }
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>

<template>
  <div ref="dropdownRef" class="relative inline-block text-left">
    <button
      type="button"
      :disabled="disabled"
      @click.stop="toggleDropdown"
      :class="[
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all shadow-2xs cursor-pointer',
        disabled
          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
          : 'bg-emerald-50 border-emerald-200 text-[#066C2A] hover:bg-emerald-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20',
        buttonClass,
      ]"
      title="Unduh Data Pekebun Format Excel"
    >
      <FileSpreadsheet class="w-3.5 h-3.5 text-[#066C2A] shrink-0" />
      <span>Ekspor Data Pekebun</span>
      <ChevronDown
        :class="['w-3.5 h-3.5 text-[#066C2A] transition-transform duration-200', isOpen ? 'rotate-180' : '']"
      />
    </button>

    <!-- Dropdown Menu -->
    <transition
      enter-active-class="transition ease-out duration-100"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-75"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isOpen"
        class="absolute right-0 z-50 mt-1.5 w-64 origin-top-right rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-black/5 border border-slate-200 focus:outline-hidden"
      >
        <div class="px-2.5 py-1.5 border-b border-slate-100 mb-1">
          <p class="text-[11px] font-bold text-slate-700">Pilih Laporan Excel</p>
          <p class="text-[10px] text-slate-400">Unduh data proposal dalam format spreadsheet</p>
        </div>

        <button
          type="button"
          @click="handleExportTitikKoordinat"
          class="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs hover:bg-emerald-50/80 transition-colors cursor-pointer group"
        >
          <div class="p-1.5 rounded-md bg-emerald-100/60 text-[#066C2A] group-hover:bg-[#066C2A] group-hover:text-white transition-colors shrink-0 mt-0.5">
            <MapPin class="w-3.5 h-3.5" />
          </div>
          <div class="flex flex-col">
            <span class="font-semibold text-slate-800 group-hover:text-[#066C2A]">1. Laporan Titik Koordinat</span>
            <span class="text-[10px] text-slate-500">16 kolom, koordinat per titik poligon lahan</span>
          </div>
        </button>

        <button
          type="button"
          @click="handleExportProfilPekebun"
          class="w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left text-xs hover:bg-emerald-50/80 transition-colors cursor-pointer group mt-0.5"
        >
          <div class="p-1.5 rounded-md bg-emerald-100/60 text-[#066C2A] group-hover:bg-[#066C2A] group-hover:text-white transition-colors shrink-0 mt-0.5">
            <UserCheck class="w-3.5 h-3.5" />
          </div>
          <div class="flex flex-col">
            <span class="font-semibold text-slate-800 group-hover:text-[#066C2A]">2. Laporan Profil Pekebun</span>
            <span class="text-[10px] text-slate-500">12 kolom, NIK, KK, alamat &amp; legalitas</span>
          </div>
        </button>
      </div>
    </transition>
  </div>
</template>
