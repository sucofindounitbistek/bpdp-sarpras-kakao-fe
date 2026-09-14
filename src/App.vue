<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterView } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { LOCALIZATION } from '@/config/localization';
import Sidebar from '@/components/ui/Sidebar.vue';
import DesktopHeader from '@/components/ui/DesktopHeader.vue';
import RoleSwitcher from '@/components/ui/RoleSwitcher.vue';
import LogoutConfirmationModal from '@/components/ui/LogoutConfirmationModal.vue';
import ToastContainer from '@/components/ui/ToastContainer.vue';
import logoBpdp from '@/assets/img/logobpdp.png';
import bgLogin from '@/assets/img/bg-login.png';
import { Menu, LogOut } from 'lucide-vue-next';

const authStore = useAuthStore();
const isMobileSidebarOpen = ref(false);
const isSidebarCollapsed = ref(false);
const isLogoutModalOpen = ref(false);

const handleLogoutConfirm = () => {
  isLogoutModalOpen.value = false;
  authStore.logout();
};

onMounted(() => {
  document.documentElement.classList.remove('dark');
});
</script>

<template>
  <div class="min-h-screen font-sans antialiased text-slate-900 flex flex-col md:flex-row relative">
    <!-- Background Image -->
    <div
      class="fixed inset-0 bg-cover bg-center bg-no-repeat bg-fixed filter blur-[6px] scale-105 pointer-events-none z-0"
      :style="{ backgroundImage: `url(${bgLogin})` }"
    />

    <!-- Soft Off-White Layer -->
    <div class="fixed inset-0 bg-slate-100/75 backdrop-blur-[3px] pointer-events-none z-0" />

    <!-- Floating Card Sidebar Navigation -->
    <Sidebar
      :is-open-mobile="isMobileSidebarOpen"
      :is-collapsed="isSidebarCollapsed"
      @close-mobile="isMobileSidebarOpen = false"
    />

    <!-- Main Workspace Content Wrapper -->
    <div
      :class="[
        'flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out z-10 relative',
        isSidebarCollapsed ? 'md:pl-24' : 'md:pl-[300px]',
      ]"
    >
      <!-- Desktop Floating Navbar Header (Sticky Top-3) -->
      <DesktopHeader
        :is-collapsed="isSidebarCollapsed"
        @toggle-collapse="isSidebarCollapsed = !isSidebarCollapsed"
      />

      <!-- Mobile Floating Navbar Header (Sticky Top-2) -->
      <header class="md:hidden min-h-14 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-2xl mx-3 my-2 px-3 py-2 flex items-center justify-between sticky top-2 z-40 shadow-lg gap-2 flex-wrap sm:flex-nowrap transition-all duration-200">
        <div class="flex items-center gap-2 shrink-0">
          <button
            type="button"
            @click="isMobileSidebarOpen = true"
            class="p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
            :aria-label="LOCALIZATION.appLayout.mobile.openSidebar"
          >
            <Menu class="w-5 h-5" />
          </button>

          <RouterLink to="/" class="flex items-center gap-2">
            <img :src="logoBpdp" alt="Logo BPDP" class="h-7 w-auto object-contain shrink-0" />
          </RouterLink>
        </div>

        <!-- Role Switcher & Mobile Logout Button -->
        <div class="flex items-center gap-1.5 shrink-0">
          <RoleSwitcher />
          <button
            type="button"
            @click="isLogoutModalOpen = true"
            class="p-2 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
            :title="LOCALIZATION.logout.buttonLabel"
            :aria-label="LOCALIZATION.logout.buttonLabel"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </header>

      <!-- Main Router Content View -->
      <main class="flex-1">
        <RouterView />
      </main>
    </div>

    <!-- Mobile Logout Confirmation Modal -->
    <LogoutConfirmationModal
      :is-open="isLogoutModalOpen"
      @close="isLogoutModalOpen = false"
      @confirm="handleLogoutConfirm"
    />

    <!-- Global Toast Container -->
    <ToastContainer />
  </div>
</template>
