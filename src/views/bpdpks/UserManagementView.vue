<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { ROLE_DETAILS_MAP } from '@/types/role';
import { useToast } from '@/composables/useToast';
import { userService, UserManagementItem, UserRoleItem } from '@/services/user.service';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Badge from '@/components/ui/Badge.vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import {
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Info,
  Edit2,
  Search,
  RefreshCw,
  X
} from 'lucide-vue-next';

const authStore = useAuthStore();
const toast = useToast();

const users = ref<UserManagementItem[]>([]);
const rolesList = ref<UserRoleItem[]>([]);
const activeRoleTab = ref<string>('ALL');
const activeRoleDetailTab = ref<string>('KELEMBAGAAN_PEKEBUN');
const searchQuery = ref('');
const pageLoading = ref(true);
const tableLoading = ref(false);

// Edit Role Modal state
const isEditModalOpen = ref(false);
const selectedUser = ref<UserManagementItem | null>(null);
const editSelectedRoleId = ref<number>(1);
const isSaving = ref(false);

const roleTabs = [
  { id: 'ALL', label: 'Semua User' },
  { id: 'KELEMBAGAAN_PEKEBUN', label: 'Operator Kelembagaan Pekebun' },
  { id: 'DINAS_KAB', label: 'Dinas Kab/Kota' },
  { id: 'DINAS_PROV', label: 'Dinas Provinsi' },
  { id: 'DITJENBUN_VERIFIKATOR', label: 'Ditjenbun Verifikator' },
  { id: 'DITJENBUN_APPROVAL', label: 'Ditjenbun Approval' },
  { id: 'BPDP_VERIFIKATOR', label: 'BPDP Verifikator' },
  { id: 'BPDP_APPROVAL', label: 'BPDP Approval' },
  { id: 'BPDP_PPK', label: 'BPDP PPK' },
  { id: 'BPDP_ULP', label: 'BPDP ULP' },
];

async function fetchUsers() {
  tableLoading.value = true;
  try {
    const params: any = {
      page: 1,
      limit: 50,
    };
    if (searchQuery.value.trim()) {
      params.search = searchQuery.value.trim();
    }
    if (activeRoleTab.value !== 'ALL') {
      params.role_code = activeRoleTab.value;
    }
    const res = await userService.listUsers(params);
    users.value = res.data || [];
  } catch (err: any) {
    console.error('Failed to fetch users:', err);
    toast.error('Gagal memuat data pengguna', 'Error');
  } finally {
    tableLoading.value = false;
    pageLoading.value = false;
  }
}

async function fetchRoles() {
  try {
    const res = await userService.listRoles();
    rolesList.value = Array.isArray(res) ? res : (res as any).data || [];
  } catch (err) {
    console.error('Failed to fetch roles:', err);
  }
}

onMounted(async () => {
  await Promise.all([fetchUsers(), fetchRoles()]);
});

function handleTabChange(tabId: string) {
  activeRoleTab.value = tabId;
  if (tabId !== 'ALL') {
    activeRoleDetailTab.value = tabId;
  }
  fetchUsers();
}

async function handleToggleStatus(user: UserManagementItem) {
  const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
  try {
    await userService.updateUserStatus(user.id, newStatus);
    user.status = newStatus;
    const label = newStatus === 'ACTIVE' ? 'diaktifkan' : 'dinonaktifkan';
    toast.success(`User ${user.full_name} berhasil ${label}`, 'Status Diperbarui');
  } catch (err: any) {
    toast.error('Gagal memperbarui status pengguna', 'Error');
  }
}

function openEditModal(user: UserManagementItem) {
  selectedUser.value = user;
  editSelectedRoleId.value = user.role_id;
  isEditModalOpen.value = true;
}

async function handleSaveRole() {
  if (!selectedUser.value) return;
  isSaving.value = true;
  try {
    await userService.updateUserRole(selectedUser.value.id, {
      role_id: editSelectedRoleId.value,
    });
    toast.success(`Role pengguna ${selectedUser.value.full_name} berhasil diperbarui!`, 'Berhasil');
    isEditModalOpen.value = false;
    await fetchUsers();
  } catch (err: any) {
    toast.error('Gagal memperbarui role pengguna', 'Error');
  } finally {
    isSaving.value = false;
  }
}

// Authorized only for BPDP_APPROVAL
const isAuthorized = computed(() => {
  const role = authStore.activeRole;
  return role === 'BPDP_APPROVAL' || role === 'BPDP_VERIFIKATOR';
});

const getBadgeVariant = (roleCode?: string) => {
  if (!roleCode || roleCode === 'KELEMBAGAAN_PEKEBUN' || roleCode === 'PEMOHON') return 'primary';
  if (roleCode === 'DINAS_KAB' || roleCode === 'DINAS_PROV') return 'info';
  if (roleCode.startsWith('DITJENBUN')) return 'warning';
  return 'success';
};
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <!-- Header Bar -->
    <header class="flex flex-col md:flex-row md:items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 gap-3">
      <div class="flex flex-col gap-1">
        <Breadcrumb />
        <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white font-sans">
          User Management & Hak Akses
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-sans">
          Pengelolaan pengguna terdaftar, peran operasional, dan status akses sistem Sarpras Kelapa.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <Button
          variant="secondary"
          custom-class="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl"
          @click="fetchUsers"
        >
          <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': tableLoading }" />
          <span>Refresh</span>
        </Button>
      </div>
    </header>

    <!-- Non-Authorized Warning Page -->
    <div v-if="!isAuthorized" class="bg-amber-50 border border-amber-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center max-w-2xl mx-auto my-12">
      <div class="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shadow-inner">
        <Info class="w-8 h-8" />
      </div>
      <h2 class="text-lg font-bold text-slate-800 font-sans">Halaman Terbatas</h2>
      <p class="text-sm text-slate-600 font-sans leading-relaxed">
        Anda sedang login dengan role <span class="font-bold text-[#066C2A]">{{ authStore.activeRole }}</span>. Halaman User Management ini hanya dapat diakses oleh <span class="font-bold text-[#066C2A]">BPDPKS Approval / Verifikator</span>.
      </p>
      <div class="flex flex-col gap-2 mt-2 w-full max-w-xs">
        <span class="text-xs text-slate-400 font-mono uppercase tracking-wider">Ganti Role Simulasi di Header:</span>
        <button
          @click="authStore.setRole('BPDP_APPROVAL')"
          class="py-2.5 px-4 bg-[#066C2A] text-white rounded-xl font-bold text-xs hover:bg-emerald-800 shadow-sm active:scale-95 transition-all"
        >
          Simulasikan sebagai BPDP Approval
        </button>
      </div>
    </div>

    <!-- Main Content for BPDPKS -->
    <div v-else-if="pageLoading" class="flex flex-col gap-5">
      <Card title="Daftar Akun Pengguna" subtitle="Memuat data pengguna dari database...">
        <div class="space-y-3 mt-4">
          <Skeleton height="2.5rem" />
          <Skeleton height="3rem" />
          <Skeleton height="3rem" />
          <Skeleton height="3rem" />
        </div>
      </Card>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Users Table (Left Column) -->
      <section class="lg:col-span-2 flex flex-col gap-5">
        <!-- Role Filter Tabs -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            v-for="tab in roleTabs"
            :key="tab.id"
            @click="handleTabChange(tab.id)"
            :class="[
              'px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-150',
              activeRoleTab === tab.id
                ? 'bg-[#066C2A] text-white shadow-sm font-bold'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50'
            ]"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Search Bar -->
        <div class="relative">
          <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            v-model="searchQuery"
            @keyup.enter="fetchUsers"
            type="text"
            placeholder="Cari berdasarkan nama, email, NIK..."
            class="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#066C2A]"
          />
        </div>

        <Card title="Daftar Pengguna Terdaftar" subtitle="Pengguna aktif tersinkronisasi dari Single Sign-On BPDP">
          <div class="overflow-x-auto -mx-6">
            <table class="w-full text-left border-collapse min-w-[600px]">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <th class="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase font-mono">ID</th>
                  <th class="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase font-mono">Nama & Email</th>
                  <th class="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase font-mono">Peran (Role)</th>
                  <th class="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase font-mono">Status</th>
                  <th class="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase font-mono text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-if="users.length === 0">
                  <td colspan="5" class="py-8 text-center text-xs text-slate-400">
                    Tidak ada data pengguna ditemukan.
                  </td>
                </tr>
                <tr
                  v-for="user in users"
                  :key="user.id"
                  class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td class="py-4 px-6 text-xs font-semibold text-slate-500 font-mono">
                    #{{ user.id }}
                  </td>
                  <td class="py-4 px-6 flex flex-col gap-0.5">
                    <span class="text-xs font-bold text-slate-900 dark:text-slate-100">{{ user.full_name }}</span>
                    <span class="text-[10px] text-slate-400 font-mono">{{ user.email }}</span>
                    <span v-if="user.nik" class="text-[10px] text-slate-500">NIK: {{ user.nik }}</span>
                  </td>
                  <td class="py-4 px-6">
                    <Badge :variant="getBadgeVariant(user.role?.code)" custom-class="font-mono text-[9px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full">
                      {{ user.role?.name || user.role?.code || 'Kelembagaan Pekebun' }}
                    </Badge>
                  </td>
                  <td class="py-4 px-6">
                    <Badge
                      :variant="user.status === 'ACTIVE' ? 'success' : 'secondary'"
                      custom-class="text-[9px] font-bold px-2 py-0.5 rounded-full"
                    >
                      {{ user.status }}
                    </Badge>
                  </td>
                  <td class="py-4 px-6 text-center">
                    <div class="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        @click="openEditModal(user)"
                        class="text-slate-500 hover:text-emerald-700 p-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                        title="Ubah Role"
                      >
                        <Edit2 class="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        @click="handleToggleStatus(user)"
                        class="text-slate-400 hover:text-slate-800 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                        :title="user.status === 'ACTIVE' ? 'Nonaktifkan' : 'Aktifkan'"
                      >
                        <ToggleRight v-if="user.status === 'ACTIVE'" class="w-5 h-5 text-emerald-600" />
                        <ToggleLeft v-else class="w-5 h-5 text-slate-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      <!-- Roles Descriptions Panel (Right Column) -->
      <section class="flex flex-col gap-6">
        <Card title="Deskripsi 9 Peran Utama" subtitle="Tugas operasional & batasan menu">
          <div class="flex flex-col gap-2">
            <button
              v-for="roleKey in Object.keys(ROLE_DETAILS_MAP)"
              :key="roleKey"
              type="button"
              @click="activeRoleDetailTab = roleKey"
              :class="[
                'flex items-center justify-between p-3.5 rounded-xl border text-xs font-semibold transition-all text-left',
                activeRoleDetailTab === roleKey
                  ? 'border-[#066C2A] bg-emerald-50/50 dark:bg-emerald-950/20 text-[#066C2A] dark:text-emerald-400 font-bold shadow-xs'
                  : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
              ]"
            >
              <div class="flex flex-col gap-0.5">
                <span class="font-bold">{{ ROLE_DETAILS_MAP[roleKey].name }}</span>
                <span class="text-[10px] text-slate-400 font-mono">{{ roleKey }}</span>
              </div>
              <ShieldCheck v-if="activeRoleDetailTab === roleKey" class="w-4 h-4 text-[#066C2A] shrink-0" />
            </button>
          </div>

          <!-- Active tab description display -->
          <div class="mt-6 p-4 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 rounded-2xl flex flex-col gap-3">
            <div class="flex items-center gap-2 border-b border-slate-200/50 dark:border-slate-700 pb-2">
              <Info class="w-4 h-4 text-[#066C2A]" />
              <span class="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">Rincian Hak Akses Menu:</span>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              {{ ROLE_DETAILS_MAP[activeRoleDetailTab]?.description }}
            </p>
            <div class="flex items-center justify-between text-[11px] pt-1 font-semibold">
              <span class="text-slate-400 uppercase font-mono">Cakupan Wilayah:</span>
              <span class="text-slate-700 dark:text-slate-200">{{ ROLE_DETAILS_MAP[activeRoleDetailTab]?.scope }}</span>
            </div>
          </div>
        </Card>
      </section>

    </div>

    <!-- Modal Edit User Role -->
    <Transition
      enter-active-class="transition-opacity duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div v-if="isEditModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-md p-6 flex flex-col gap-5">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 class="text-sm font-bold text-slate-900 dark:text-white">Ubah Peran (Role) Pengguna</h3>
            <button @click="isEditModalOpen = false" class="text-slate-400 hover:text-slate-600">
              <X class="w-5 h-5" />
            </button>
          </div>

          <div v-if="selectedUser" class="space-y-4 text-xs">
            <div class="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl space-y-1">
              <p class="font-bold text-slate-800 dark:text-slate-100">{{ selectedUser.full_name }}</p>
              <p class="text-slate-400 font-mono text-[11px]">{{ selectedUser.email }}</p>
            </div>

            <div class="space-y-1.5">
              <label class="font-semibold text-slate-700 dark:text-slate-300">Pilih Role Baru:</label>
              <select
                v-model="editSelectedRoleId"
                class="w-full p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-[#066C2A]"
              >
                <option v-for="r in rolesList" :key="r.id" :value="r.id">
                  {{ r.name }} ({{ r.code }})
                </option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-3 pt-2">
            <Button variant="secondary" @click="isEditModalOpen = false">Batal</Button>
            <Button
              variant="primary"
              :disabled="isSaving"
              @click="handleSaveRole"
              custom-class="bg-[#066C2A] text-white hover:bg-emerald-800 font-bold"
            >
              {{ isSaving ? 'Menyimpan...' : 'Simpan Perubahan' }}
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
