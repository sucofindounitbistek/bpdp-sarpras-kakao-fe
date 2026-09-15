<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import {
  rolePermissionService,
  RoleMatrixItem,
  MenuMatrixItem,
  PermissionUpdateItem,
} from '@/services/rolePermission.service';
import Card from '@/components/ui/Card.vue';
import Button from '@/components/ui/Button.vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import {
  ShieldCheck,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertCircle,
  Search,
  Lock,
  SlidersHorizontal,
  Check,
  X,
  Filter,
  Eye,
  RotateCcw,
  Sparkles,
  ChevronRight
} from 'lucide-vue-next';

import { useNavigation } from '@/composables/useNavigation';

const authStore = useAuthStore();
const toast = useToast();
const { loadPermissions } = useNavigation();

const loading = ref(true);
const saving = ref(false);
const roles = ref<RoleMatrixItem[]>([]);
const menus = ref<MenuMatrixItem[]>([]);
const permissionMap = ref<Record<string, boolean>>({});
const initialPermissionMap = ref<Record<string, boolean>>({});

// Filter & Search states
const searchQuery = ref('');
const selectedGroupFilter = ref('ALL');
const viewMode = ref<'matrix' | 'single'>('matrix');
const focusedRoleId = ref<number>(1);
const hoveredColumnRoleId = ref<number | null>(null);

const isAuthorized = computed(() => {
  return authStore.activeRole === 'BPDP_APPROVAL';
});

// Group menus by group_name
const availableGroups = computed(() => {
  const set = new Set<string>();
  for (const m of menus.value) {
    if (m.group_name) set.add(m.group_name);
  }
  return Array.from(set);
});

// Filtered menus based on search and group filter
const filteredMenus = computed(() => {
  let result = menus.value;

  if (selectedGroupFilter.value !== 'ALL') {
    result = result.filter((m) => m.group_name === selectedGroupFilter.value);
  }

  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase().trim();
    result = result.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.path.toLowerCase().includes(q) ||
        m.code.toLowerCase().includes(q) ||
        m.group_name.toLowerCase().includes(q)
    );
  }

  return result;
});

// Group filtered menus by group_name
const groupedFilteredMenus = computed(() => {
  const map: Record<string, MenuMatrixItem[]> = {};
  for (const m of filteredMenus.value) {
    if (!map[m.group_name]) {
      map[m.group_name] = [];
    }
    map[m.group_name].push(m);
  }
  return map;
});

// Summary Stats
const totalPermissionsAllowed = computed(() => {
  let count = 0;
  for (const key of Object.keys(permissionMap.value)) {
    if (permissionMap.value[key]) count++;
  }
  return count;
});

const changedPermissionsCount = computed(() => {
  let count = 0;
  for (const key of Object.keys(permissionMap.value)) {
    if (permissionMap.value[key] !== initialPermissionMap.value[key]) {
      count++;
    }
  }
  return count;
});

const hasUnsavedChanges = computed(() => changedPermissionsCount.value > 0);

async function fetchMatrix() {
  loading.value = true;
  try {
    const data = await rolePermissionService.getMatrix();
    roles.value = data.roles || [];
    menus.value = data.menus || [];
    permissionMap.value = { ...data.permissions };
    initialPermissionMap.value = { ...data.permissions };
    if (roles.value.length > 0 && !focusedRoleId.value) {
      focusedRoleId.value = roles.value[0].id;
    }
  } catch (err: any) {
    console.error('Failed to load role permissions matrix:', err);
    toast.error('Gagal memuat matriks hak akses peran', 'Error');
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  fetchMatrix();
});

function getPermissionKey(roleId: number, menuId: number): string {
  return `${roleId}_${menuId}`;
}

function isAllowed(roleId: number, menuId: number): boolean {
  const key = getPermissionKey(roleId, menuId);
  return !!permissionMap.value[key];
}

function isProtectedMenu(roleId: number, menuId: number): boolean {
  const role = roles.value.find((r) => r.id === roleId);
  const menu = menus.value.find((m) => m.id === menuId);
  return (
    role?.code === 'BPDP_APPROVAL' &&
    (menu?.code === 'DASHBOARD' || menu?.code === 'BPDP_ROLE_MANAGEMENT')
  );
}

function togglePermission(roleId: number, menuId: number) {
  if (isProtectedMenu(roleId, menuId)) {
    toast.warning('Akses menu dasar untuk BPDP Approval dilindungi dan tidak dapat dinonaktifkan', 'Proteksi Sistem');
    return;
  }

  const key = getPermissionKey(roleId, menuId);
  permissionMap.value[key] = !permissionMap.value[key];
}

function toggleGroupForRole(roleId: number, groupName: string, enable: boolean) {
  const targetMenus = menus.value.filter((m) => m.group_name === groupName);
  for (const m of targetMenus) {
    if (isProtectedMenu(roleId, m.id) && !enable) continue;
    const key = getPermissionKey(roleId, m.id);
    permissionMap.value[key] = enable;
  }
}

function resetChanges() {
  permissionMap.value = { ...initialPermissionMap.value };
  toast.info('Perubahan hak akses telah dikembalikan ke kondisi awal', 'Reset Selesai');
}

async function handleSave() {
  saving.value = true;
  try {
    const updates: PermissionUpdateItem[] = [];
    for (const r of roles.value) {
      for (const m of menus.value) {
        const key = getPermissionKey(r.id, m.id);
        const allowed = !!permissionMap.value[key];
        updates.push({
          role_id: r.id,
          menu_id: m.id,
          is_allowed: allowed,
        });
      }
    }

    await rolePermissionService.updatePermissions(updates);
    initialPermissionMap.value = { ...permissionMap.value };
    // Synchronize navigation permissions immediately
    await loadPermissions();
    toast.success('Konfigurasi hak akses menu berhasil disimpan dan disinkronkan!', 'Berhasil');
  } catch (err: any) {
    toast.error('Gagal menyimpan hak akses menu', 'Error');
  } finally {
    saving.value = false;
  }
}

function getRoleBadgeColor(code: string): { bg: string; text: string; border: string } {
  switch (code) {
    case 'KELEMBAGAAN_PEKEBUN':
      return { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' };
    case 'DINAS_KAB':
    case 'DINAS_PROV':
      return { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-300', border: 'border-sky-200 dark:border-sky-800' };
    case 'DITJENBUN_VERIFIKATOR':
    case 'DITJENBUN_APPROVAL':
      return { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800' };
    case 'BPDP_VERIFIKATOR':
    case 'BPDP_APPROVAL':
      return { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' };
    case 'BPDP_PPK':
    case 'BPDP_ULP':
    case 'BPDP_STAFF':
    case 'BPDP_KADIV':
      return { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' };
    case 'SURVEYOR_SCI':
      return { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' };
    case 'BANK_MITRA':
      return { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800' };
    default:
      return { bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' };
  }
}

function getRoleShortName(code: string): string {
  switch (code) {
    case 'KELEMBAGAAN_PEKEBUN':
      return 'Operator';
    case 'DINAS_KAB':
      return 'Dinas Kab';
    case 'DINAS_PROV':
      return 'Dinas Prov';
    case 'DITJENBUN_VERIFIKATOR':
      return 'Ditjenbun Ver';
    case 'DITJENBUN_APPROVAL':
      return 'Ditjenbun App';
    case 'BPDP_VERIFIKATOR':
      return 'BPDP Ver';
    case 'BPDP_APPROVAL':
      return 'BPDP App (Admin)';
    case 'BPDP_PPK':
      return 'BPDP PPK';
    case 'BPDP_ULP':
      return 'BPDP ULP';
    case 'BPDP_STAFF':
      return 'Staff';
    case 'BPDP_KADIV':
      return 'Kadiv';
    case 'SURVEYOR_SCI':
      return 'Surveyor SCI';
    case 'BANK_MITRA':
      return 'Bank Mitra';
    default:
      return code;
  }
}

const focusedRole = computed(() => {
  return roles.value.find((r) => r.id === focusedRoleId.value) || roles.value[0];
});

function getRoleAllowedCount(roleId: number): number {
  return menus.value.filter((m) => isAllowed(roleId, m.id)).length;
}
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-6 font-sans">
    <!-- Header Section (Enterprise Hero) -->
    <header class="relative overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200/80 dark:border-slate-800 transition-all">
      <!-- Decorative subtle accent background glow -->
      <div class="absolute -right-20 -top-20 w-64 h-64 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div class="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="flex flex-col gap-1.5">
          <Breadcrumb />
          <div class="flex items-center gap-3">
            <div class="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#066C2A] to-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20 shrink-0">
              <ShieldCheck class="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h1 class="text-lg md:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Matriks Izin Peran & Rute Dinamis
                </h1>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-[#066C2A] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                  RBAC v2.0
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Konfigurasi granular visibilitas navigasi untuk 13 peran ekosistem Sarpras Kakao BPDP.
              </p>
            </div>
          </div>
        </div>

        <!-- Action Buttons Bar -->
        <div class="flex items-center gap-2 shrink-0 self-start lg:self-center">
          <Button
            variant="secondary"
            custom-class="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 shadow-2xs transition-all active:scale-95"
            @click="fetchMatrix"
          >
            <RefreshCw class="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" :class="{ 'animate-spin': loading }" />
            <span>Muat Ulang</span>
          </Button>

          <Button
            v-if="isAuthorized && hasUnsavedChanges"
            variant="secondary"
            custom-class="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 shadow-2xs transition-all active:scale-95"
            @click="resetChanges"
          >
            <RotateCcw class="w-3.5 h-3.5" />
            <span>Reset</span>
          </Button>

          <Button
            v-if="isAuthorized"
            variant="primary"
            :disabled="saving || !hasUnsavedChanges"
            custom-class="flex items-center gap-2 px-4 py-2 text-xs font-bold bg-[#066C2A] text-white hover:bg-emerald-800 rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            @click="handleSave"
          >
            <Save class="w-3.5 h-3.5" />
            <span>{{ saving ? 'Menyimpan...' : 'Simpan Hak Akses' }}</span>
          </Button>
        </div>
      </div>

      <!-- Quick Metrics Strip -->
      <div v-if="!loading && roles.length > 0" class="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-3 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-xs font-mono">
            {{ roles.length }}
          </div>
          <div>
            <div class="text-[11px] font-bold text-slate-800 dark:text-slate-200">Peran Sistem</div>
            <div class="text-[10px] text-slate-400">Total peran terdaftar</div>
          </div>
        </div>

        <div class="flex items-center gap-3 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs font-mono">
            {{ menus.length }}
          </div>
          <div>
            <div class="text-[11px] font-bold text-slate-800 dark:text-slate-200">Rute Menu</div>
            <div class="text-[10px] text-slate-400">Katalog navigasi aktif</div>
          </div>
        </div>

        <div class="flex items-center gap-3 bg-slate-50/70 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80">
          <div class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs font-mono">
            {{ totalPermissionsAllowed }}
          </div>
          <div>
            <div class="text-[11px] font-bold text-slate-800 dark:text-slate-200">Relasi Diizinkan</div>
            <div class="text-[10px] text-slate-400">Total izin aktif</div>
          </div>
        </div>

        <div
          class="flex items-center gap-3 p-2.5 rounded-xl border transition-all"
          :class="hasUnsavedChanges
            ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300/80 dark:border-amber-700/80'
            : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800/80'"
        >
          <div
            class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs font-mono transition-all"
            :class="hasUnsavedChanges ? 'bg-amber-200 text-amber-900 animate-pulse' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'"
          >
            {{ changedPermissionsCount }}
          </div>
          <div>
            <div class="text-[11px] font-bold" :class="hasUnsavedChanges ? 'text-amber-900 dark:text-amber-200' : 'text-slate-800 dark:text-slate-200'">
              {{ hasUnsavedChanges ? 'Perubahan Tertunda' : 'Sinkron' }}
            </div>
            <div class="text-[10px] text-slate-400">
              {{ hasUnsavedChanges ? 'Perlu disimpan' : 'Database up to date' }}
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Non-Authorized Warning Page -->
    <div v-if="!isAuthorized" class="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 text-center max-w-2xl mx-auto my-12 shadow-sm">
      <div class="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/60 flex items-center justify-center text-amber-700 dark:text-amber-300 shadow-inner">
        <Lock class="w-8 h-8" />
      </div>
      <div>
        <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100">Halaman Terbatas (Admin Only)</h2>
        <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-md mt-1">
          Anda login dengan peran <span class="font-bold text-[#066C2A]">{{ authStore.activeRole }}</span>. Pengaturan matriks hak akses hanya dapat diakses oleh administrator <span class="font-bold text-[#066C2A]">BPDP Approval (Admin)</span>.
        </p>
      </div>
      <button
        @click="authStore.setRole('BPDP_APPROVAL')"
        class="py-2.5 px-5 bg-[#066C2A] text-white rounded-xl font-bold text-xs hover:bg-emerald-800 shadow-sm active:scale-95 transition-all flex items-center gap-2"
      >
        <Sparkles class="w-4 h-4" />
        <span>Ganti ke BPDP Approval (Simulasi)</span>
      </button>
    </div>

    <!-- Loading Skeleton -->
    <div v-else-if="loading" class="flex flex-col gap-4">
      <Card title="Memuat Data..." subtitle="Menyiapkan matriks perizinan 13 peran sistem">
        <div class="space-y-3 mt-4">
          <Skeleton height="3.5rem" />
          <Skeleton height="3.5rem" />
          <Skeleton height="3.5rem" />
          <Skeleton height="3.5rem" />
        </div>
      </Card>
    </div>

    <!-- Main Content for Authorized BPDP Approval -->
    <div v-else class="flex flex-col gap-5">
      <!-- Unsaved Changes Floating Banner -->
      <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
        <div
          v-if="hasUnsavedChanges"
          class="bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md shadow-amber-500/20"
        >
          <div class="flex items-center gap-3 text-center sm:text-left">
            <AlertCircle class="w-5 h-5 shrink-0" />
            <span class="text-xs font-semibold">
              Terdapat <strong>{{ changedPermissionsCount }} perubahan</strong> izin menu yang belum disimpan ke database. Klik "Simpan Sekarang" untuk menerapkan.
            </span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <button
              @click="resetChanges"
              class="px-3 py-1.5 text-xs font-semibold bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              @click="handleSave"
              :disabled="saving"
              class="px-4 py-1.5 text-xs font-bold bg-white text-amber-900 hover:bg-amber-50 rounded-lg shadow-sm transition-all"
            >
              {{ saving ? 'Menyimpan...' : 'Simpan Sekarang' }}
            </button>
          </div>
        </div>
      </transition>

      <!-- Control & Filter Bar -->
      <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <!-- Search and Group Filters -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
          <div class="relative flex-1 max-w-md">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari nama menu, kode, atau path URL..."
              class="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#066C2A] focus:border-transparent transition-all"
            />
            <button
              v-if="searchQuery"
              @click="searchQuery = ''"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X class="w-3.5 h-3.5" />
            </button>
          </div>

          <div class="flex items-center gap-2">
            <Filter class="w-4 h-4 text-slate-400 shrink-0 hidden sm:inline" />
            <select
              v-model="selectedGroupFilter"
              class="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 outline-none cursor-pointer focus:ring-2 focus:ring-[#066C2A] focus:border-transparent"
            >
              <option value="ALL">Semua Kelompok Modul ({{ availableGroups.length }})</option>
              <option v-for="g in availableGroups" :key="g" :value="g">{{ g }}</option>
            </select>
          </div>
        </div>

        <!-- View Mode Switcher -->
        <div class="flex items-center gap-2 border border-slate-200 dark:border-slate-700 p-1 rounded-xl bg-slate-50 dark:bg-slate-800 self-start sm:self-auto">
          <button
            @click="viewMode = 'matrix'"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            :class="viewMode === 'matrix' ? 'bg-[#066C2A] text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'"
          >
            <SlidersHorizontal class="w-3.5 h-3.5" />
            <span>Matriks Lengkap (13 Peran)</span>
          </button>
          <button
            @click="viewMode = 'single'"
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
            :class="viewMode === 'single' ? 'bg-[#066C2A] text-white shadow-xs' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'"
          >
            <Eye class="w-3.5 h-3.5" />
            <span>Fokus Per Peran</span>
          </button>
        </div>
      </div>

      <!-- VIEW MODE 1: COMPLETE MATRIX TABLE -->
      <div v-if="viewMode === 'matrix'" class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[1300px]">
            <thead>
              <tr class="bg-slate-50/90 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800">
                <th class="py-4 px-6 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase font-mono sticky left-0 bg-slate-50 dark:bg-slate-800 z-20 w-80 shadow-r border-r border-slate-200 dark:border-slate-700">
                  <div class="flex items-center justify-between">
                    <span>Modul & Rute Menu</span>
                    <span class="text-[10px] text-slate-400 font-normal normal-case">({{ filteredMenus.length }} menu)</span>
                  </div>
                </th>
                <th
                  v-for="r in roles"
                  :key="r.id"
                  @mouseenter="hoveredColumnRoleId = r.id"
                  @mouseleave="hoveredColumnRoleId = null"
                  class="py-3 px-2 text-center transition-colors min-w-[100px] border-r border-slate-100 dark:border-slate-800/60"
                  :class="hoveredColumnRoleId === r.id ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''"
                >
                  <div class="flex flex-col items-center gap-1">
                    <span
                      class="px-2 py-0.5 text-[11px] font-bold rounded-lg border whitespace-nowrap"
                      :class="[getRoleBadgeColor(r.code).bg, getRoleBadgeColor(r.code).text, getRoleBadgeColor(r.code).border]"
                      :title="r.name"
                    >
                      {{ getRoleShortName(r.code) }}
                    </span>
                    <span class="text-[9px] text-slate-400 dark:text-slate-500 font-mono truncate max-w-[90px]" :title="r.code">
                      {{ r.code }}
                    </span>
                    <span class="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono">
                      {{ getRoleAllowedCount(r.id) }}/{{ menus.length }}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              <template v-for="(groupItems, groupName) in groupedFilteredMenus" :key="groupName">
                <!-- Group Header Row -->
                <tr class="bg-slate-100/80 dark:bg-slate-800/50">
                  <td
                    class="py-2 px-6 font-bold text-[11px] text-[#066C2A] dark:text-emerald-400 uppercase font-mono sticky left-0 bg-slate-100 dark:bg-slate-800/90 z-10 border-r border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <span>{{ groupName }}</span>
                    <span class="text-[10px] text-slate-400 font-normal">({{ groupItems.length }})</span>
                  </td>
                  <td
                    v-for="r in roles"
                    :key="r.id"
                    class="py-2 px-2 text-center"
                    :class="hoveredColumnRoleId === r.id ? 'bg-emerald-50/30 dark:bg-emerald-950/10' : ''"
                  >
                    <!-- Quick Batch Toggle Button for Group -->
                    <button
                      type="button"
                      @click="toggleGroupForRole(r.id, groupName as string, !groupItems.every(m => isAllowed(r.id, m.id)))"
                      class="text-[9px] font-bold text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 px-1.5 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      :title="`Beri/Cabut semua ${groupName} untuk ${getRoleShortName(r.code)}`"
                    >
                      All
                    </button>
                  </td>
                </tr>

                <!-- Menu Item Row -->
                <tr
                  v-for="menu in groupItems"
                  :key="menu.id"
                  class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <!-- Menu Info Column (Sticky) -->
                  <td class="py-3 px-6 sticky left-0 bg-white dark:bg-slate-900 z-10 border-r border-slate-200 dark:border-slate-700 shadow-r">
                    <div class="flex flex-col gap-0.5">
                      <span class="font-bold text-slate-900 dark:text-slate-100 text-xs flex items-center gap-1.5">
                        <span>{{ menu.name }}</span>
                      </span>
                      <span class="text-[10px] text-slate-400 font-mono truncate max-w-[260px]" :title="menu.path">
                        {{ menu.path }}
                      </span>
                    </div>
                  </td>

                  <!-- Role Permission Toggle Cells -->
                  <td
                    v-for="role in roles"
                    :key="role.id"
                    @mouseenter="hoveredColumnRoleId = role.id"
                    @mouseleave="hoveredColumnRoleId = null"
                    class="py-2.5 px-2 text-center border-r border-slate-100 dark:border-slate-800/50 transition-colors"
                    :class="hoveredColumnRoleId === role.id ? 'bg-emerald-50/40 dark:bg-emerald-950/20' : ''"
                  >
                    <!-- Protected Item Indicator -->
                    <div v-if="isProtectedMenu(role.id, menu.id)" class="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 shadow-xs cursor-not-allowed" title="Akses sistem terproteksi (tidak dapat dicabut)">
                      <Lock class="w-3.5 h-3.5" />
                    </div>

                    <!-- Interactive Toggle Button -->
                    <button
                      v-else
                      type="button"
                      @click="togglePermission(role.id, menu.id)"
                      :class="[
                        'w-7 h-7 rounded-lg inline-flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-90',
                        isAllowed(role.id, menu.id)
                          ? 'bg-[#066C2A] text-white hover:bg-emerald-800 ring-2 ring-emerald-400/20'
                          : 'bg-slate-100 dark:bg-slate-800 text-transparent border border-slate-300 dark:border-slate-700 hover:border-emerald-500 hover:bg-emerald-50/50'
                      ]"
                      :title="`${isAllowed(role.id, menu.id) ? 'Cabut Akses' : 'Beri Akses'}: ${menu.name} untuk ${role.name}`"
                    >
                      <CheckCircle2 v-if="isAllowed(role.id, menu.id)" class="w-4 h-4 text-white" />
                    </button>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>
      </div>

      <!-- VIEW MODE 2: SINGLE ROLE FOCUS INSPECTION -->
      <div v-else class="flex flex-col lg:flex-row gap-5 items-start">
        <!-- Role Selector Sidebar -->
        <div class="w-full lg:w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col gap-3 shrink-0">
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
            <span class="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase font-mono">Daftar Peran ({{ roles.length }})</span>
          </div>
          <div class="flex flex-col gap-1.5 max-h-[600px] overflow-y-auto pr-1">
            <button
              v-for="r in roles"
              :key="r.id"
              @click="focusedRoleId = r.id"
              class="flex items-center justify-between p-2.5 rounded-xl border text-left transition-all"
              :class="focusedRoleId === r.id ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-[#066C2A] text-slate-900 dark:text-white shadow-xs' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'"
            >
              <div class="flex flex-col gap-0.5">
                <span class="text-xs font-bold leading-tight">{{ getRoleShortName(r.code) }}</span>
                <span class="text-[10px] text-slate-400 font-mono">{{ r.code }}</span>
              </div>
              <div class="flex items-center gap-1.5">
                <span class="px-2 py-0.5 text-[10px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {{ getRoleAllowedCount(r.id) }} menu
                </span>
                <ChevronRight class="w-3.5 h-3.5 text-slate-400" />
              </div>
            </button>
          </div>
        </div>

        <!-- Focused Role Permission Matrix Card -->
        <div class="flex-1 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-5 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col gap-5 w-full">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-1 text-xs font-bold rounded-lg border" :class="[getRoleBadgeColor(focusedRole.code).bg, getRoleBadgeColor(focusedRole.code).text, getRoleBadgeColor(focusedRole.code).border]">
                  {{ getRoleShortName(focusedRole.code) }}
                </span>
                <h2 class="text-base font-bold text-slate-900 dark:text-white">{{ focusedRole.name }}</h2>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">{{ focusedRole.description || 'Hak akses operasional modul Sarpras' }}</p>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Akses Diberikan: <strong>{{ getRoleAllowedCount(focusedRole.id) }} dari {{ menus.length }} menu</strong>
              </span>
            </div>
          </div>

          <!-- Group Cards List -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="(groupItems, groupName) in groupedFilteredMenus"
              :key="groupName"
              class="border border-slate-200 dark:border-slate-700 rounded-xl p-4 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col gap-3"
            >
              <div class="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-700/60">
                <span class="text-xs font-bold text-[#066C2A] dark:text-emerald-400 uppercase font-mono tracking-wider">{{ groupName }}</span>
                <div class="flex items-center gap-1.5">
                  <button
                    type="button"
                    @click="toggleGroupForRole(focusedRole.id, groupName as string, true)"
                    class="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline px-1.5 py-0.5"
                  >
                    Beri Semua
                  </button>
                  <span class="text-slate-300">|</span>
                  <button
                    type="button"
                    @click="toggleGroupForRole(focusedRole.id, groupName as string, false)"
                    class="text-[10px] font-bold text-rose-600 dark:text-rose-400 hover:underline px-1.5 py-0.5"
                  >
                    Cabut Semua
                  </button>
                </div>
              </div>

              <div class="flex flex-col gap-2">
                <div
                  v-for="menu in groupItems"
                  :key="menu.id"
                  @click="togglePermission(focusedRole.id, menu.id)"
                  class="flex items-center justify-between p-2.5 rounded-lg border transition-all cursor-pointer"
                  :class="isAllowed(focusedRole.id, menu.id) ? 'bg-white dark:bg-slate-800 border-emerald-300 dark:border-emerald-800 shadow-2xs' : 'bg-slate-100/70 dark:bg-slate-900/60 border-transparent opacity-60 hover:opacity-100'"
                >
                  <div class="flex flex-col gap-0.5 max-w-[80%]">
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">{{ menu.name }}</span>
                    <span class="text-[10px] text-slate-400 font-mono truncate">{{ menu.path }}</span>
                  </div>

                  <div v-if="isProtectedMenu(focusedRole.id, menu.id)" class="w-6 h-6 rounded-md bg-amber-100 text-amber-700 flex items-center justify-center" title="Akses terproteksi">
                    <Lock class="w-3.5 h-3.5" />
                  </div>
                  <div
                    v-else
                    class="w-6 h-6 rounded-md flex items-center justify-center transition-all"
                    :class="isAllowed(focusedRole.id, menu.id) ? 'bg-[#066C2A] text-white' : 'border border-slate-300 dark:border-slate-600 text-transparent'"
                  >
                    <Check class="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
