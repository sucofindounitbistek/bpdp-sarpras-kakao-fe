<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore, User } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notification';
import { useToast } from '@/composables/useToast';
import { LOCALIZATION } from '@/config/localization';
import type { NotificationItem } from '@/types/notification';
import { UserCheck, PanelLeftClose, PanelLeftOpen, Bell, CheckCircle2, Clock, ChevronDown, ShieldCheck, AlertCircle, CheckCheck, Inbox, ArrowUpRight, Info, LogOut } from 'lucide-vue-next';
import LogoutConfirmationModal from '@/components/ui/LogoutConfirmationModal.vue';

defineProps<{
  isCollapsed?: boolean;
}>();

const emit = defineEmits<{
  (e: 'toggle-collapse'): void;
}>();

const router = useRouter();
const authStore = useAuthStore();
const notifStore = useNotificationStore();
const toast = useToast();

const isNotificationOpen = ref(false);
const isProfileModalOpen = ref(false);
const isLogoutModalOpen = ref(false);

const handleLogoutConfirm = () => {
  authStore.logout();
};

const initPolling = () => {
  if (authStore.isAuthenticated && authStore.token) {
    notifStore.startPolling(60000);
  } else {
    notifStore.stopPolling();
  }
};

onMounted(() => {
  initPolling();
});

watch(
  () => Boolean(authStore.isAuthenticated && authStore.token),
  () => {
    initPolling();
  }
);

onUnmounted(() => {
  notifStore.stopPolling();
});

const toggleNotificationDropdown = () => {
  isNotificationOpen.value = !isNotificationOpen.value;
  isProfileModalOpen.value = false;
  if (isNotificationOpen.value && authStore.isAuthenticated && authStore.token) {
    notifStore.fetchNotifications();
  }
};

const handleNotificationClick = async (n: NotificationItem) => {
  await notifStore.markAsRead(n.id);
  isNotificationOpen.value = false;
  if (n.action_url) {
    router.push(n.action_url);
  }
};

const handleMarkAllAsRead = async () => {
  await notifStore.markAllAsRead();
  toast.success('Semua notifikasi telah ditandai sebagai dibaca.', 'Berhasil');
};

const rolesList: Array<{ id: User['role']; name: string; desc: string }> = [
  { id: 'KELEMBAGAAN_PEKEBUN', name: LOCALIZATION.desktopHeader.roles.KELEMBAGAAN_PEKEBUN.name, desc: LOCALIZATION.desktopHeader.roles.KELEMBAGAAN_PEKEBUN.desc },
  { id: 'DINAS_KAB', name: LOCALIZATION.desktopHeader.roles.DINAS_KAB.name, desc: LOCALIZATION.desktopHeader.roles.DINAS_KAB.desc },
  { id: 'DINAS_PROV', name: LOCALIZATION.desktopHeader.roles.DINAS_PROV.name, desc: LOCALIZATION.desktopHeader.roles.DINAS_PROV.desc },
  { id: 'DITJENBUN_VERIFIKATOR', name: LOCALIZATION.desktopHeader.roles.DITJENBUN_VERIFIKATOR.name, desc: LOCALIZATION.desktopHeader.roles.DITJENBUN_VERIFIKATOR.desc },
  { id: 'DITJENBUN_APPROVAL', name: LOCALIZATION.desktopHeader.roles.DITJENBUN_APPROVAL.name, desc: LOCALIZATION.desktopHeader.roles.DITJENBUN_APPROVAL.desc },
  { id: 'BPDP_VERIFIKATOR', name: LOCALIZATION.desktopHeader.roles.BPDP_VERIFIKATOR.name, desc: LOCALIZATION.desktopHeader.roles.BPDP_VERIFIKATOR.desc },
  { id: 'BPDP_APPROVAL', name: LOCALIZATION.desktopHeader.roles.BPDP_APPROVAL.name, desc: LOCALIZATION.desktopHeader.roles.BPDP_APPROVAL.desc },
  { id: 'BPDP_PPK', name: LOCALIZATION.desktopHeader.roles.BPDP_PPK.name, desc: LOCALIZATION.desktopHeader.roles.BPDP_PPK.desc },
  { id: 'BPDP_ULP', name: LOCALIZATION.desktopHeader.roles.BPDP_ULP.name, desc: LOCALIZATION.desktopHeader.roles.BPDP_ULP.desc },
  { id: 'BPDP_STAFF', name: (LOCALIZATION.desktopHeader.roles as Record<string, { name: string; desc: string }>).BPDP_STAFF.name, desc: (LOCALIZATION.desktopHeader.roles as Record<string, { name: string; desc: string }>).BPDP_STAFF.desc },
  { id: 'BPDP_KADIV', name: (LOCALIZATION.desktopHeader.roles as Record<string, { name: string; desc: string }>).BPDP_KADIV.name, desc: (LOCALIZATION.desktopHeader.roles as Record<string, { name: string; desc: string }>).BPDP_KADIV.desc },
  {
    id: 'SURVEYOR_SCI',
    name: (LOCALIZATION.desktopHeader.roles as Record<string, { name: string; desc: string }>).SURVEYOR_SCI.name,
    desc: (LOCALIZATION.desktopHeader.roles as Record<string, { name: string; desc: string }>).SURVEYOR_SCI.desc,
  },
  { id: 'BANK_MITRA', name: (LOCALIZATION.desktopHeader.roles as Record<string, { name: string; desc: string }>).BANK_MITRA.name, desc: (LOCALIZATION.desktopHeader.roles as Record<string, { name: string; desc: string }>).BANK_MITRA.desc },
];

const handleRoleSelect = (newRole: User['role']) => {
  authStore.setRole(newRole);
  isProfileModalOpen.value = false;
  if (authStore.isAuthenticated && authStore.token) {
    notifStore.fetchUnreadCounts();
  }
  toast.success(LOCALIZATION.desktopHeader.toast.roleSwitchedMessage.replace('{role}', newRole), LOCALIZATION.desktopHeader.toast.roleSwitchedTitle);
};
</script>

<template>
  <header
    class="hidden md:flex min-h-16 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl mx-4 lg:mx-6 my-3 px-4 lg:px-6 py-2.5 items-center justify-between sticky top-3 z-40 shadow-lg shadow-slate-200/50 gap-3 flex-wrap lg:flex-nowrap transition-all duration-300"
  >
    <div class="flex items-center gap-3 min-w-0">
      <!-- Dynamic Toggle Sidebar Button in Navbar -->
      <button
        type="button"
        @click="emit('toggle-collapse')"
        class="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-all duration-200 shrink-0 group cursor-pointer"
        :title="isCollapsed ? LOCALIZATION.desktopHeader.toggleSidebarOpen : LOCALIZATION.desktopHeader.toggleSidebarClose"
        :aria-label="LOCALIZATION.desktopHeader.toggleSidebarAria"
      >
        <PanelLeftOpen v-if="isCollapsed" class="w-5 h-5 text-[#066C2A] group-hover:scale-110 transition-transform" />
        <PanelLeftClose v-else class="w-5 h-5 text-slate-700 group-hover:scale-110 transition-transform" />
      </button>
    </div>

    <!-- Right Side Header Controls -->
    <div class="flex items-center gap-2.5 lg:gap-3.5 shrink-0">
      <!-- Notification Bell Popover Button -->
      <div class="relative">
        <button
          type="button"
          @click="toggleNotificationDropdown"
          class="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors relative shrink-0 cursor-pointer"
          :title="LOCALIZATION.desktopHeader.notifications.title"
          aria-label="Lihat Notifikasi"
        >
          <Bell class="w-5 h-5 text-slate-700" />
          <!-- Animated Notification Badges -->
          <span
            v-if="notifStore.unreadCount > 0"
            :class="[
              'absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold flex items-center justify-center text-white ring-2 ring-white transition-all',
              notifStore.actionRequiredCount > 0 ? 'bg-rose-600 animate-pulse' : 'bg-[#066C2A]',
            ]"
          >
            {{ notifStore.unreadCount > 99 ? '99+' : notifStore.unreadCount }}
          </span>
        </button>

        <!-- Notification Popover Dropdown -->
        <div v-if="isNotificationOpen" class="absolute right-0 mt-2 w-96 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-4 flex flex-col gap-3 max-w-[90vw]">
          <!-- Header Popover -->
          <div class="flex items-center justify-between border-b border-slate-100 pb-3">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-900 flex items-center gap-1.5 font-apple-body-strong"> <Bell class="w-4 h-4 text-[#066C2A]" /> {{ LOCALIZATION.desktopHeader.notifications.title }} </span>
              <span v-if="notifStore.unreadCount > 0" class="text-[10px] bg-emerald-50 text-[#066C2A] font-semibold px-2 py-0.5 rounded-full border border-emerald-200"> {{ notifStore.unreadCount }} Belum Dibaca </span>
            </div>
            <button v-if="notifStore.unreadCount > 0" type="button" @click="handleMarkAllAsRead" class="text-[11px] font-semibold text-slate-500 hover:text-[#066C2A] flex items-center gap-1 transition-colors cursor-pointer">
              <CheckCheck class="w-3.5 h-3.5" /> Tandai Dibaca
            </button>
          </div>

          <!-- Tabs Filter -->
          <div class="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              @click="notifStore.activeTab = 'ALL'"
              :class="['flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer text-[11px]', notifStore.activeTab === 'ALL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900']"
            >
              Semua
            </button>
            <button
              type="button"
              @click="notifStore.activeTab = 'ACTION_REQUIRED'"
              :class="[
                'flex-1 py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer flex items-center justify-center gap-1 text-[11px]',
                notifStore.activeTab === 'ACTION_REQUIRED' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-rose-600',
              ]"
            >
              Perlu Tindakan
              <span v-if="notifStore.actionRequiredCount > 0" class="w-2 h-2 rounded-full bg-rose-500" />
            </button>
          </div>

          <!-- Notifications List -->
          <div class="flex flex-col gap-2 max-h-80 overflow-y-auto pr-0.5">
            <!-- Loading State -->
            <div v-if="notifStore.isLoading && notifStore.items.length === 0" class="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
              <div class="w-5 h-5 border-2 border-[#066C2A] border-t-transparent rounded-full animate-spin" />
              <span class="text-xs">Memuat notifikasi...</span>
            </div>

            <!-- Empty State -->
            <div v-else-if="notifStore.filteredItems.length === 0" class="py-10 flex flex-col items-center justify-center text-slate-400 gap-2 text-center px-4">
              <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <Inbox class="w-5 h-5" />
              </div>
              <span class="text-xs font-medium text-slate-600">Tidak ada notifikasi</span>
              <p class="text-[11px] text-slate-400">
                {{ notifStore.activeTab === 'ACTION_REQUIRED' ? 'Semua berkas yang memerlukan tindakan telah selesai.' : 'Anda sudah membaca semua notifikasi terbaru.' }}
              </p>
            </div>

            <!-- Notification Items -->
            <div
              v-for="n in notifStore.filteredItems"
              :key="n.id"
              @click="handleNotificationClick(n)"
              :class="[
                'p-3 rounded-xl border text-xs flex flex-col gap-1.5 transition-all cursor-pointer group',
                !n.is_read && n.category === 'ACTION_REQUIRED'
                  ? 'bg-rose-50/70 border-rose-200/90 hover:bg-rose-50 hover:border-rose-300'
                  : !n.is_read
                    ? 'bg-emerald-50/50 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300'
                    : 'bg-slate-50/70 border-slate-200/70 hover:bg-white hover:border-slate-300',
              ]"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex items-center gap-1.5 min-w-0">
                  <!-- Category Semantic Icon -->
                  <AlertCircle v-if="n.category === 'ACTION_REQUIRED'" class="w-4 h-4 text-rose-600 shrink-0" />
                  <CheckCircle2 v-else-if="n.category === 'STATUS_MILESTONE'" class="w-4 h-4 text-emerald-600 shrink-0" />
                  <Clock v-else-if="n.category === 'SLA_WARNING'" class="w-4 h-4 text-amber-600 shrink-0" />
                  <Info v-else class="w-4 h-4 text-sky-600 shrink-0" />
                  <span :class="['font-semibold truncate', !n.is_read ? 'text-slate-900' : 'text-slate-700']">
                    {{ n.title }}
                  </span>
                </div>
                <span class="text-[10px] text-slate-400 shrink-0 font-normal">
                  {{ notifStore.formatTimeAgo(n.created_at) }}
                </span>
              </div>

              <p class="text-[11px] text-slate-600 leading-relaxed font-apple-caption">
                {{ n.message }}
              </p>

              <div class="flex items-center justify-between pt-1 border-t border-slate-200/50 mt-0.5">
                <span v-if="n.category === 'ACTION_REQUIRED'" class="text-[10px] font-semibold text-rose-700 uppercase tracking-wider font-mono"> Tindakan Diperlukan </span>
                <span v-else class="text-[10px] font-medium text-slate-400 font-mono"> {{ n.entity_type }} #{{ n.entity_id }} </span>

                <span class="text-[11px] font-semibold text-[#066C2A] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5"> Buka Berkas <ArrowUpRight class="w-3 h-3" /> </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- User Profile Badge (Clicking opens Role Switcher Modal) -->
      <div class="relative border-l border-slate-200 pl-3">
        <button
          type="button"
          @click="
            isProfileModalOpen = !isProfileModalOpen;
            isNotificationOpen = false;
          "
          class="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100/80 transition-all duration-200 group text-left cursor-pointer"
        >
          <div class="w-8 h-8 rounded-full bg-emerald-100 text-[#066C2A] border border-emerald-200 flex items-center justify-center font-bold text-xs shadow-inner shrink-0 group-hover:scale-105 transition-transform">
            {{ (authStore.user?.name || 'U')[0] }}
          </div>
          <div class="hidden sm:flex flex-col">
            <span class="text-xs font-bold text-slate-800 leading-none group-hover:text-[#066C2A] transition-colors flex items-center gap-1">
              {{ authStore.user?.name || 'User Simulation' }}
              <ChevronDown class="w-3.5 h-3.5 text-slate-400 group-hover:text-[#066C2A]" />
            </span>
            <span class="text-[10px] font-semibold text-[#066C2A] mt-1 font-mono">
              {{ authStore.activeRole }}
            </span>
          </div>
        </button>

        <!-- Profile & Role Switcher Popover Modal -->
        <div v-if="isProfileModalOpen" class="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 p-4 flex flex-col gap-4">
          <!-- User Profile Info Header -->
          <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <div class="w-10 h-10 rounded-full bg-[#066C2A] text-white flex items-center justify-center font-bold text-sm shadow-md shrink-0">
              {{ (authStore.user?.name || 'U')[0] }}
            </div>
            <div class="flex flex-col min-w-0">
              <span class="text-xs font-bold text-slate-900 truncate">
                {{ authStore.user?.name || LOCALIZATION.desktopHeader.userProfile.defaultName }}
              </span>
              <span class="text-[11px] text-slate-500 truncate">
                {{ authStore.user?.email || LOCALIZATION.desktopHeader.userProfile.defaultEmail }}
              </span>
              <span class="inline-flex items-center gap-1 text-[10px] font-bold text-[#066C2A] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1 w-fit"> <ShieldCheck class="w-3 h-3" /> {{ authStore.activeRole }} </span>
            </div>
          </div>

          <!-- Role Switcher Section -->
          <div class="flex flex-col gap-2">
            <label class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1"> <UserCheck class="w-3.5 h-3.5 text-[#066C2A]" /> {{ LOCALIZATION.desktopHeader.userProfile.switchRoleTitle }} </label>
            <div class="flex flex-col gap-1.5 max-h-[300px] overflow-y-auto pr-1">
              <button
                v-for="role in rolesList"
                :key="role.id"
                type="button"
                @click="handleRoleSelect(role.id)"
                :class="[
                  'w-full text-left p-2.5 rounded-xl border text-xs flex flex-col transition-all duration-200 shrink-0 cursor-pointer',
                  authStore.activeRole === role.id ? 'bg-emerald-50/80 border-[#066C2A] text-[#066C2A] font-bold shadow-xs' : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50',
                ]"
              >
                <div class="flex items-center justify-between">
                  <span class="font-bold">{{ role.name }}</span>
                  <span v-if="authStore.activeRole === role.id" class="w-2 h-2 rounded-full bg-[#066C2A]" />
                </div>
                <span class="text-[10px] font-normal text-slate-500 mt-0.5">{{ role.desc }}</span>
              </button>
            </div>
          </div>

          <!-- Logout Button Section -->
          <div class="pt-2 border-t border-slate-100 flex flex-col">
            <button
              type="button"
              @click="
                isLogoutModalOpen = true;
                isProfileModalOpen = false;
              "
              class="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl border border-red-200/80 bg-red-50/50 hover:bg-red-50 text-red-600 hover:text-red-700 text-xs font-bold transition-all duration-200 cursor-pointer shadow-xs"
            >
              <LogOut class="w-4 h-4" />
              <span>{{ LOCALIZATION.logout.buttonAccountLabel }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <LogoutConfirmationModal :is-open="isLogoutModalOpen" @close="isLogoutModalOpen = false" @confirm="handleLogoutConfirm" />
  </header>
</template>
