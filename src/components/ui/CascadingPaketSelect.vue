<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronDown, ChevronRight, CheckCircle2, Package, Layers } from 'lucide-vue-next';
import { JenisSarpras } from '@/types/pengusulan';
import { useMasterSarprasStore } from '@/stores/masterSarpras';

interface Props {
  modelValue?: JenisSarpras | string | null;
  placeholder?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  placeholder: 'Pilih Paket Sarpras...',
  disabled: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', val: JenisSarpras | string | null): void;
  (e: 'change', val: JenisSarpras | string | null): void;
}>();

const masterStore = useMasterSarprasStore();
const isOpen = ref(false);
const dropdownRef = ref<HTMLElement | null>(null);
const activeGroupIndex = ref<number | null>(null);
const hoverTimeout = ref<any>(null);

const PAKET_GROUPS = computed(() => masterStore.paketGroups);

function getDropdownItemLabel(groupName: string, option: any): string {
  if (groupName === 'Unit Pengolahan Hasil') {
    if (option.code === 'UPH_1_JENIS' || option.id === 'UPH_1_JENIS') return 'Menghasilkan 1 jenis produk';
    if (option.code === 'UPH_MULTI_JENIS' || option.id === 'UPH_MULTI_JENIS') return 'Menghasilkan lebih dari 1 jenis produk';
  }
  if (groupName === 'Alat Transportasi') {
    if (option.code === 'ALAT_ANGKUT_LANGSIR' || option.id === 'ALAT_ANGKUT_LANGSIR') return 'Alat angkut langsir';
    if (option.code === 'GEROBAK_BERMOTOR' || option.id === 'GEROBAK_BERMOTOR') return 'Gerobak bermotor';
    if (option.code === 'PIKAP' || option.id === 'PIKAP') return 'Pikap';
    if (option.code === 'TRUK' || option.id === 'TRUK') return 'Truk';
  }
  return option.label || option.name;
}

const selectedOption = computed(() => {
  if (!props.modelValue) return null;
  return masterStore.paketList.find((p) => p.code === props.modelValue) ||
    masterStore.paketList.find((p) => String(p.id) === props.modelValue) || null;
});

const selectedGroup = computed(() => {
  if (!props.modelValue) return null;
  return PAKET_GROUPS.value.find((g) =>
    g.options.some((o: any) => o.code === props.modelValue || o.id === props.modelValue)
  ) || null;
});

function toggleDropdown() {
  if (props.disabled) return;
  isOpen.value = !isOpen.value;
  if (isOpen.value && props.modelValue) {
    const idx = PAKET_GROUPS.value.findIndex((g) =>
      g.options.some((o: any) => o.code === props.modelValue || o.id === props.modelValue)
    );
    if (idx !== -1) {
      activeGroupIndex.value = idx;
    }
  } else if (isOpen.value) {
    activeGroupIndex.value = 0;
  }
}


function onGroupMouseEnter(idx: number) {
  if (hoverTimeout.value) clearTimeout(hoverTimeout.value);
  hoverTimeout.value = setTimeout(() => {
    activeGroupIndex.value = idx;
  }, 50); // Windows Desktop fast hover delay
}

function selectGroup(idx: number) {
  activeGroupIndex.value = idx;
}

function selectOption(optionId: string) {
  emit('update:modelValue', optionId as JenisSarpras);
  emit('change', optionId as JenisSarpras);
  isOpen.value = false;
}

function handleClickOutside(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
}

onMounted(async () => {
  document.addEventListener('click', handleClickOutside);
  if (!masterStore.isLoaded || masterStore.paketList.length === 0) {
    await masterStore.fetchMasterData(true);
  }
});


onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  if (hoverTimeout.value) clearTimeout(hoverTimeout.value);
});
</script>

<template>
  <div ref="dropdownRef" class="relative w-full">
    <!-- Main Dropdown Trigger Button -->
    <button
      type="button"
      @click="toggleDropdown"
      :disabled="disabled"
      :class="[
        'flex items-center justify-between w-full h-11 px-3.5 rounded-xl border-2 text-left transition-all duration-200 select-none',
        disabled ? 'opacity-60 cursor-not-allowed bg-slate-100 border-slate-200' : '',
        isOpen || modelValue
          ? 'border-[#066C2A] bg-emerald-50/40 shadow-sm ring-2 ring-[#066C2A]/10'
          : 'border-slate-200 bg-white hover:border-emerald-400 hover:bg-slate-50/50',
      ]"
    >
      <div class="flex items-center gap-2.5 min-w-0 flex-1">
        <template v-if="selectedOption">
          <span class="text-lg leading-none shrink-0">{{ selectedOption.icon }}</span>
          <div class="flex flex-col min-w-0">
            <span class="text-xs font-bold text-slate-800 truncate">
              {{ selectedOption.label }}
            </span>
            <span v-if="selectedGroup" class="text-[10px] text-emerald-700 font-medium truncate">
              {{ selectedGroup.name }}
            </span>
          </div>
        </template>
        <template v-else>
          <Package class="w-4 h-4 text-slate-400 shrink-0" />
          <span class="text-xs text-slate-400 font-normal">{{ placeholder }}</span>
        </template>
      </div>
      <ChevronDown
        :class="[
          'w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ml-2',
          isOpen ? 'rotate-180 text-[#066C2A]' : '',
        ]"
      />
    </button>

    <!-- Windows Desktop Style Hover Cascading Menu Container -->
    <Transition name="dropdown-cascade">
      <div
        v-if="isOpen"
        class="absolute z-50 mt-1.5 w-full md:w-[620px] left-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[420px]"
      >
        <!-- Level 1: Kelompok Paket List (Left Column / Windows Start Menu Style) -->
        <div class="w-full md:w-64 bg-slate-50/90 dark:bg-slate-950/60 border-b md:border-b-0 md:border-r border-slate-200/70 dark:border-slate-800 overflow-y-auto shrink-0 divide-y divide-slate-100/80 dark:divide-slate-800/50">
          <div class="px-3.5 py-2 bg-slate-100/70 dark:bg-slate-900 text-[10px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10 backdrop-blur-sm flex items-center gap-1.5">
            <Layers class="w-3 h-3 text-[#066C2A]" />
            <span>Kelompok Paket</span>
          </div>

          <div
            v-for="(group, idx) in PAKET_GROUPS"
            :key="group.name"
            @mouseenter="onGroupMouseEnter(idx)"
            @click="selectGroup(idx)"
            :class="[
              'group relative flex items-center justify-between px-3.5 py-2.5 text-left cursor-pointer transition-all duration-150',
              activeGroupIndex === idx
                ? 'bg-emerald-600 text-white font-semibold shadow-inner'
                : 'hover:bg-emerald-50/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300',
            ]"
          >
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="text-base leading-none shrink-0 group-hover:scale-110 transition-transform">{{ group.icon }}</span>
              <div class="flex flex-col min-w-0">
                <span class="text-xs truncate" :class="activeGroupIndex === idx ? 'text-white font-bold' : 'font-medium'">
                  {{ group.name }}
                </span>
                <span
                  class="text-[10px] truncate"
                  :class="activeGroupIndex === idx ? 'text-emerald-100' : 'text-slate-400 dark:text-slate-500'"
                >
                  {{ group.options.length }} opsi paket
                </span>
              </div>
            </div>
            <ChevronRight
              :class="[
                'w-4 h-4 shrink-0 transition-transform duration-150',
                activeGroupIndex === idx ? 'text-white translate-x-0.5' : 'text-slate-400 opacity-60 group-hover:opacity-100',
              ]"
            />
          </div>
        </div>

        <!-- Level 2: Sub-Paket Options (Right Column / Windows Cascading Flyout Panel) -->
        <div class="flex-1 bg-white dark:bg-slate-900 overflow-y-auto flex flex-col divide-y divide-slate-100 dark:divide-slate-800/80">
          <template v-if="activeGroupIndex !== null && PAKET_GROUPS[activeGroupIndex]">
            <div class="px-4 py-2.5 bg-emerald-50/50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 sticky top-0 z-10 backdrop-blur-sm flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-lg leading-none">{{ PAKET_GROUPS[activeGroupIndex].icon }}</span>
                <div class="flex flex-col">
                  <span class="text-xs font-bold text-slate-900 dark:text-white">
                    {{ PAKET_GROUPS[activeGroupIndex].name }}
                  </span>
                  <span class="text-[10px] text-slate-500 dark:text-slate-400">
                    {{ PAKET_GROUPS[activeGroupIndex].description }}
                  </span>
                </div>
              </div>
            </div>

            <div class="p-2 space-y-1">
              <button
                v-for="option in PAKET_GROUPS[activeGroupIndex].options"
                :key="option.code || option.id"
                type="button"
                @click="selectOption(option.code || String(option.id))"
                :class="[
                  'w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-150 group/item',
                  modelValue === option.code || modelValue === String(option.id)
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 shadow-sm'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent',
                ]"
              >
                <span class="text-xl leading-none shrink-0 group-hover/item:scale-110 transition-transform mt-0.5">
                  {{ option.icon || '📦' }}
                </span>
                <div class="flex flex-col flex-1 min-w-0 gap-0.5">
                  <div class="flex items-center justify-between gap-2">
                    <span
                      class="text-xs font-bold"
                      :class="(modelValue === option.code || modelValue === String(option.id)) ? 'text-[#066C2A] dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'"
                    >
                      {{ getDropdownItemLabel(PAKET_GROUPS[activeGroupIndex].name, option) }}
                    </span>
                    <CheckCircle2
                      v-if="modelValue === option.code || modelValue === String(option.id)"
                      class="w-4 h-4 text-[#066C2A] dark:text-emerald-400 shrink-0"
                    />
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug line-clamp-2">
                    {{ option.description || option.name }}
                  </p>
                  <div v-if="option.is_pupuk" class="mt-1">
          
                  </div>
                </div>
              </button>

            </div>
          </template>
          <template v-else>
            <div class="flex flex-col items-center justify-center h-full p-8 text-center text-slate-400">
              <Layers class="w-8 h-8 opacity-40 mb-2" />
              <p class="text-xs">Arahkan kursor atau pilih Kelompok Paket di sebelah kiri.</p>
            </div>
          </template>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-cascade-enter-active,
.dropdown-cascade-leave-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.dropdown-cascade-enter-from,
.dropdown-cascade-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.98);
}
</style>
