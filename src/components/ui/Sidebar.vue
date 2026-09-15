<script setup lang="ts">
import { RouterLink, useRoute } from 'vue-router';
import { ref } from 'vue';
import { useNavigation } from '@/composables/useNavigation';
import { useAuthStore } from '@/stores/auth';
import { LOCALIZATION } from '@/config/localization';
import logoBpdp from '@/assets/img/logobpdp.png';
import { X, ChevronRight, ChevronDown, Layers, Lock, TreeDeciduous, LogOut } from 'lucide-vue-next';
import LogoutConfirmationModal from '@/components/ui/LogoutConfirmationModal.vue';

defineProps<{
  isOpenMobile?: boolean;
  isCollapsed?: boolean;
}>();

const emit = defineEmits<{
  (e: 'close-mobile'): void;
}>();

const route = useRoute();
const authStore = useAuthStore();
const isWorkspaceOpen = ref(false);
const activeCategory = ref<'kakao' | 'kelapa' | 'sawit'>('kelapa');
const isLogoutModalOpen = ref(false);

const handleLogoutConfirm = () => {
  authStore.logout();
};

const { filteredNavSections } = useNavigation();

const isItemActive = (itemTo: string) => {
  const fromQuery = route.query.from as string | undefined;
  if (fromQuery) {
    const normalizedFrom = fromQuery.startsWith('/') ? fromQuery : `/bpdp/${fromQuery}`;
    if (normalizedFrom === itemTo) {
      return true;
    }
    if (itemTo.startsWith('/bpdp/')) {
      return false;
    }
  }
  if (route.meta && route.meta.activeMenu) {
    return route.meta.activeMenu === itemTo;
  }
  return route.path === itemTo || route.path.startsWith(itemTo + '/');
};
</script>

<template>
  <!-- Mobile Backdrop Overlay -->
  <Transition
    enter-active-class="transition-opacity duration-300 ease-linear"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-300 ease-linear"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div v-if="isOpenMobile" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden" @click="emit('close-mobile')" />
  </Transition>

  <!-- Floating Card Sidebar Container -->
  <aside
    :class="[
      'fixed top-3 bottom-3 left-3 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl flex flex-col transition-all duration-300 ease-in-out md:translate-x-0 shadow-xl shadow-slate-200/50 dark:shadow-black/40',
      isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      isCollapsed ? 'md:w-20' : 'md:w-72 w-[calc(100vw-1.5rem)] max-w-72',
    ]"
  >
    <!-- Brand Header -->
    <div
      :class="[
        'h-16 border-b border-slate-100 dark:border-slate-800/80 flex items-center shrink-0 bg-slate-50/50 dark:bg-slate-950/40 transition-all duration-300 rounded-t-3xl',
        isCollapsed ? 'px-3 justify-center' : 'px-4 justify-between',
      ]"
    >
      <!-- Collapsed State -->
      <div v-if="isCollapsed" class="w-full h-full flex items-center justify-center">
        <RouterLink to="/" @click="emit('close-mobile')">
          <img :src="logoBpdp" alt="Logo BPDPKS" class="h-8 w-8 object-contain shrink-0" />
        </RouterLink>
      </div>

      <!-- Expanded State -->
      <div v-else class="relative flex items-center flex-1 justify-between min-w-0 gap-2">
        <RouterLink to="/" @click="emit('close-mobile')" class="shrink-0 flex items-center" title="Kembali ke Dashboard">
          <img :src="logoBpdp" alt="Logo BPDPKS" class="h-9 w-auto object-contain shrink-0 hover:opacity-85 transition-opacity" />
        </RouterLink>

        <button
          type="button"
          @click="isWorkspaceOpen = !isWorkspaceOpen"
          class="flex items-center justify-between border-l border-slate-200/80 dark:border-slate-800 pl-2.5 min-w-0 flex-1 h-11 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/50 transition-colors cursor-pointer text-left focus:outline-none"
          title="Klik untuk ganti workspace"
        >
          <div class="flex items-center gap-1.5 min-w-0">
            <span class="font-extrabold text-[15px] text-slate-900 dark:text-white font-apple-body-strong tracking-tight"> Sarpras </span>
            <span class="font-black text-[15px] text-amber-800 dark:text-emerald-400 font-apple-body-strong tracking-tight"> Kakao </span>
            <TreeDeciduous class="w-4 h-4 text-amber-800 dark:text-emerald-400 shrink-0" />
          </div>
          <ChevronDown class="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
        </button>

        <!-- Invisible Backdrop Overlay to close popover on click outside -->
        <div v-if="isWorkspaceOpen" class="fixed inset-0 z-40 bg-transparent cursor-default" @click="isWorkspaceOpen = false"></div>

        <!-- Workspace Dropdown Popover (Grouped by Commodity without emojis, with Icons) -->
        <div v-if="isWorkspaceOpen" class="absolute left-[calc(100%+0.75rem)] top-0 w-[460px] bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex overflow-hidden">
          <!-- Left Column (Commodity Selectors) -->
          <div class="w-1/3 bg-slate-50 dark:bg-slate-900/50 border-r border-slate-150 dark:border-slate-800/80 p-2 flex flex-col gap-1">
            <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 py-1.5"> Komoditas </span>
            <button
              type="button"
              @click="activeCategory = 'kakao'"
              :class="[
                'w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between',
                activeCategory === 'kakao' ? 'bg-emerald-50/70 dark:bg-emerald-950/20 text-[#066C2A] dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60',
              ]"
            >
              <span class="flex items-center gap-1.5 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0">
                  <path d="M4.5 16.5c2-6 7.5-11.5 13-11.5s5 3 2 9-9.5 9-13 7.5z" />
                  <path d="M7.5 14.5c1.5-4 5-8.5 9-9.5" />
                  <path d="M10.5 17.5c2-3.5 5.5-6.5 8-6.5" />
                  <path d="M18.5 5l2.5-2.5" />
                </svg>
                <span>Kakao</span>
              </span>
              <ChevronRight v-if="activeCategory === 'kakao'" class="w-3 h-3 text-[#066C2A] dark:text-emerald-400" />
            </button>
            <button
              type="button"
              @click="activeCategory = 'kelapa'"
              :class="[
                'w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between',
                activeCategory === 'kelapa' ? 'bg-emerald-50/70 dark:bg-emerald-950/20 text-[#066C2A] dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60',
              ]"
            >
              <span class="flex items-center gap-1.5 min-w-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500 shrink-0"
                >
                  <circle cx="12" cy="12" r="9" />
                  <circle cx="9.5" cy="9.5" r="1" fill="currentColor" />
                  <circle cx="14.5" cy="9.5" r="1" fill="currentColor" />
                  <circle cx="12" cy="14.5" r="1" fill="currentColor" />
                </svg>
                <span>Kelapa</span>
              </span>
              <ChevronRight v-if="activeCategory === 'kelapa'" class="w-3 h-3 text-[#066C2A] dark:text-emerald-400" />
            </button>
            <button
              type="button"
              @click="activeCategory = 'sawit'"
              :class="[
                'w-full text-left px-2.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between',
                activeCategory === 'sawit' ? 'bg-emerald-50/70 dark:bg-emerald-950/20 text-[#066C2A] dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60',
              ]"
            >
              <span class="flex items-center gap-1.5 min-w-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5 text-teal-600 dark:text-teal-500 shrink-0">
                  <path d="M3 22c5-5 14-14 18-20" />
                  <path d="M8 17c-2-3-3-6-3-9" />
                  <path d="M12 13c-2-3-3-5-3-8" />
                  <path d="M16 9c-1-2-2-4-2-6" />
                  <path d="M10 15c3-1 6-2 9-3" />
                  <path d="M14 11c3-1 5-2 8-3" />
                  <path d="M17 8c2-1 4-1 6-2" />
                </svg>
                <span>Kelapa Sawit</span>
              </span>
              <ChevronRight v-if="activeCategory === 'sawit'" class="w-3 h-3 text-[#066C2A] dark:text-emerald-400" />
            </button>
          </div>

          <!-- Right Column (Application List for Active Commodity) -->
          <div class="w-2/3 p-3 flex flex-col gap-2">
            <span class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-1"> Modul Aplikasi </span>

            <!-- Kakao Applications -->
            <template v-if="activeCategory === 'kakao'">
              <a
                href="https://bpdp-sarpras-kakao.scitechnology.id/"
                target="_blank"
                rel="noopener noreferrer"
                class="w-full text-left p-2.5 rounded-xl border border-amber-200/50 bg-amber-50/30 dark:bg-amber-950/10 text-slate-800 dark:text-slate-100 flex items-start gap-2.5 transition-all hover:bg-amber-50/50 cursor-pointer"
              >
                <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Layers class="w-4 h-4" />
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-bold flex items-center gap-1.5">
                    Sarpras Kakao
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <span class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug"> Sistem bantuan sarana prasarana, verifikasi rekomtek, dan monitoring. </span>
                </div>
              </a>

              <button
                type="button"
                disabled
                class="w-full text-left p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-650 flex items-start gap-2.5 cursor-not-allowed opacity-60"
              >
                <div class="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 flex items-center justify-center shrink-0">
                  <Lock class="w-4 h-4" />
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-bold">Peremajaan Kakao</span>
                  <span class="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 leading-snug"> Modul bantuan penyediaan benih & peremajaan lahan tanaman kakao. </span>
                </div>
              </button>
            </template>

            <!-- Kelapa Applications -->
            <template v-if="activeCategory === 'kelapa'">
              <button
                type="button"
                @click="isWorkspaceOpen = false"
                class="w-full text-left p-2.5 rounded-xl border border-emerald-200/50 bg-emerald-50/30 dark:bg-emerald-950/10 text-slate-800 dark:text-slate-100 flex items-start gap-2.5 transition-all hover:bg-emerald-50/50 cursor-pointer"
              >
                <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-[#066C2A] dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Layers class="w-4 h-4" />
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-bold flex items-center gap-1.5">
                    Sarpras Kakao
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  </span>
                  <span class="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug"> Bantuan sarana prasarana, verifikasi dinas, dan penyaluran dana. </span>
                </div>
              </button>

              <button
                type="button"
                disabled
                class="w-full text-left p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-650 flex items-start gap-2.5 cursor-not-allowed opacity-60"
              >
                <div class="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 flex items-center justify-center shrink-0">
                  <Lock class="w-4 h-4" />
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-bold">Peremajaan Kelapa</span>
                  <span class="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 leading-snug"> Replanting kelapa genjah/dalam untuk mendongkrak produksi daerah. </span>
                </div>
              </button>
            </template>

            <!-- Sawit Applications -->
            <template v-if="activeCategory === 'sawit'">
              <button
                type="button"
                disabled
                class="w-full text-left p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-400 dark:text-slate-650 flex items-start gap-2.5 cursor-not-allowed opacity-60"
              >
                <div class="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 flex items-center justify-center shrink-0">
                  <Lock class="w-4 h-4" />
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-xs font-bold">Sarpras Kelapa Sawit</span>
                  <span class="text-[10px] text-slate-450 dark:text-slate-500 mt-0.5 leading-snug"> Bantuan sarana prasarana, verifikasi dinas, dan monitoring. </span>
                </div>
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Mobile Close Button -->
      <button type="button" @click="emit('close-mobile')" class="md:hidden text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
        <X class="w-5 h-5" />
      </button>
    </div>

    <!-- Navigation Scroll Area (Grouped by Section) -->
    <div :class="['flex-1 overflow-y-auto flex flex-col gap-3 scrollbar-thin transition-all duration-300', isCollapsed ? 'p-2' : 'p-3']">
      <div v-for="section in filteredNavSections" :key="section.title" class="flex flex-col gap-1">
        <!-- Section Header Title -->
        <div v-if="!isCollapsed && section.title !== 'UTAMA'" class="px-3 pt-2 pb-0.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          {{ section.title }}
        </div>
        <div v-else-if="isCollapsed && section.title !== 'UTAMA'" class="my-1 border-t border-slate-100 dark:border-slate-800" />

        <!-- Section Navigation Items -->
        <RouterLink
          v-for="item in section.items"
          :key="item.to"
          :to="item.to"
          @click="emit('close-mobile')"
          :title="isCollapsed ? item.label : undefined"
          :class="[
            'flex items-center rounded-xl text-xs font-semibold transition-all duration-200 group',
            isCollapsed ? 'justify-center p-2.5' : 'justify-between px-3 py-2.5',
            isItemActive(item.to)
              ? 'bg-emerald-50/70 dark:bg-emerald-950/30 text-[#066C2A] dark:text-emerald-400 shadow-xs border border-emerald-200/50 dark:border-emerald-900/40 font-bold'
              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60',
          ]"
        >
          <div :class="['flex items-center', isCollapsed ? 'justify-center' : 'gap-2.5']">
            <component
              :is="item.icon"
              :class="[
                'w-4 h-4 transition-colors shrink-0',
                isItemActive(item.to) ? 'text-[#066C2A] dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300',
              ]"
            />
            <span v-if="!isCollapsed" class="truncate">{{ item.label }}</span>
          </div>

          <ChevronRight v-if="!isCollapsed && isItemActive(item.to)" class="w-3.5 h-3.5 text-[#066C2A] dark:text-emerald-400 shrink-0" />
        </RouterLink>
      </div>
    </div>

    <!-- Sidebar Footer with Logout Button -->
    <div :class="['border-t border-slate-100 dark:border-slate-800 flex flex-col transition-all duration-300', isCollapsed ? 'p-2' : 'p-3']">
      <button
        type="button"
        @click="isLogoutModalOpen = true"
        :title="isCollapsed ? LOCALIZATION.logout.buttonLabel : undefined"
        :class="[
          'flex items-center rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 cursor-pointer group',
          isCollapsed ? 'justify-center p-2.5' : 'justify-start gap-2.5 px-3 py-2.5 w-full',
        ]"
      >
        <LogOut class="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform shrink-0" />
        <span v-if="!isCollapsed" class="truncate font-bold">{{ LOCALIZATION.logout.buttonLabel }}</span>
      </button>
    </div>

    <!-- Logout Confirmation Modal -->
    <LogoutConfirmationModal
      :is-open="isLogoutModalOpen"
      @close="isLogoutModalOpen = false"
      @confirm="handleLogoutConfirm"
    />
  </aside>
</template>

