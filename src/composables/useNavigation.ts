import { ref, computed, onMounted, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { rolePermissionService } from '@/services/rolePermission.service';
import {
  LayoutDashboard,
  Scroll,
  CheckSquare,
  Users,
  FileText,
  History,
  Building2,
  Package,
  UserCheck,
  ShieldCheck,
  RotateCcw,
  Landmark,
  Compass,
  Layers,
} from 'lucide-vue-next';

export interface NavItem {
  label: string;
  to: string;
  icon: any;
  roles?: string[];
}

export interface NavSection {
  title: string;
  role: string | string[];
  items: NavItem[];
}

// Global cached allowed paths to keep views snappy
const allowedPaths = ref<string[]>([]);
const activePermissionRole = ref<string>('');
const permissionsLoaded = ref(false);

export function useNavigation() {
  const authStore = useAuthStore();

  async function loadPermissions() {
    if (!authStore.isAuthenticated) return;
    try {
      const currentRole = authStore.activeRole;
      const res = await rolePermissionService.getMyPermissions(currentRole);
      if (res && res.allowed_paths) {
        allowedPaths.value = res.allowed_paths;
        activePermissionRole.value = res.role_code || currentRole || '';
        permissionsLoaded.value = true;
      }
    } catch (e) {
      console.warn('Failed to load dynamic permissions from backend:', e);
    }
  }

  onMounted(() => {
    loadPermissions();
  });

  watch(
    () => authStore.activeRole,
    () => {
      loadPermissions();
    }
  );

  const navSections = computed<NavSection[]>(() => {
    const currentRole = authStore.activeRole;
    return [
      {
        title: 'UTAMA',
        role: 'ALL',
        items: [{ label: 'Dashboard Overview', to: '/dashboard', icon: LayoutDashboard }],
      },
      {
        title: '',
        role: ['PEMOHON', 'KELEMBAGAAN_PEKEBUN'],
        items: [
          { label: 'Pekebun', to: '/master-data/pekebun', icon: Users },
          { label: 'Pengajuan Proposal', to: '/pengusulan/pengajuan-proposal', icon: Scroll },
          { label: 'Penyaluran Barang', to: '/penyaluran-barang/pemohon', icon: Package },
          { label: 'Penyaluran Dana', to: '/penyaluran-dana/pemohon', icon: Landmark },
        ],
      },
      {
        title: 'DINAS KABUPATEN / KOTA',
        role: ['DINAS_KAB'],
        items: [{ label: 'Verifikasi Proposal', to: '/dinas/verifikasi/kabupaten', icon: CheckSquare }],
      },
      {
        title: 'DINAS PROVINSI',
        role: ['DINAS_PROV'],
        items: [
          { label: 'Asistensi Surat Keterangan CPCL', to: '/dinas/verifikasi/provinsi', icon: CheckSquare },
          { label: 'Lembaga', to: '/dinas/provinsi/lembaga', icon: Building2 },
        ],
      },
      {
        title: currentRole === 'DITJENBUN_VERIFIKATOR' ? 'DITJENBUN (VERIFIKATOR)' : 'DITJENBUN (APPROVAL)',
        role: ['DITJENBUN_VERIFIKATOR', 'DITJENBUN_APPROVAL'],
        items: [
          {
            label: 'Asistensi & Penerbitan Rekomtek',
            to: '/ditjenbun/rekomtek',
            icon: CheckSquare,
          },
        ],
      },
      {
        title: currentRole === 'BPDP_VERIFIKATOR' ? 'BPDP (VERIFIKATOR)' : 'BPDP (APPROVAL)',
        role: ['BPDP_VERIFIKATOR', 'BPDP_APPROVAL'],
        items: [
          {
            label: 'Persetujuan Penelitian Rekomtek',
            to: '/bpdp/antrean',
            icon: CheckSquare,
          },
          ...(currentRole === 'BPDP_VERIFIKATOR'
            ? [
                { label: 'Revisi Penelitian', to: '/bpdp/revisi-penelitian', icon: RotateCcw },
                { label: 'SK Dirut', to: '/bpdp/sk-dirut', icon: FileText },
              ]
            : []),
          { label: 'Riwayat Selesai', to: '/bpdp/riwayat-selesai', icon: History },
          { label: 'Penyaluran Barang', to: '/penyaluran-barang/verifikator', icon: Package },
          { label: 'PKS 3 Pihak (Penyaluran Dana)', to: '/penyaluran-dana/pks-3-pihak', icon: Landmark },
        ],
      },
      {
        title: 'BPDP (STAFF/KADIV)',
        role: ['BPDP_STAFF', 'BPDP_KADIV', 'BPDP_APPROVAL'],
        items: [{ label: 'Approval Pencairan Dana', to: '/penyaluran-dana/approval', icon: Landmark }],
      },
      {
        title: 'SURVEYOR SCI',
        role: ['SURVEYOR_SCI'],
        items: [
          { label: 'Sampling & Monitoring Barang', to: '/penyaluran-barang/surveyor', icon: Package },
          { label: 'Verifikasi Dokumen', to: '/penyaluran-dana/verifikasi-dokumen', icon: CheckSquare },
          { label: 'Monitoring Lapangan', to: '/penyaluran-dana/monitoring-lapangan', icon: Compass },
        ],
      },
      {
        title: 'BANK MITRA',
        role: ['BANK_MITRA'],
        items: [{ label: 'Komparisi & Transfer', to: '/penyaluran-dana/bank-mitra', icon: Landmark }],
      },
      {
        title: 'BPDP (PPK)',
        role: ['BPDP_PPK'],
        items: [{ label: 'Disposisi Pengadaan', to: '/penyaluran-barang/ppk', icon: Package }],
      },
      {
        title: 'BPDP (ULP)',
        role: ['BPDP_ULP'],
        items: [{ label: 'Tender & Vendor', to: '/penyaluran-barang/ulp', icon: Package }],
      },
      {
        title: '',
        role: ['PEMOHON', 'KELEMBAGAAN_PEKEBUN', 'BPDP_APPROVAL', 'BPDP_VERIFIKATOR', 'DITJENBUN_APPROVAL', 'DITJENBUN_VERIFIKATOR', 'DINAS_KAB', 'DINAS_PROV'],
        items: [
          { label: 'Profile Kelembagaan Pekebun', to: '/pemohon/profile-kelembagaan', icon: Building2 },
          { label: 'Paket Sarpras', to: '/master-data/paket-sarpras', icon: Layers },
          { label: 'Dokumen Persyaratan', to: '/master-data/dokumen-persyaratan', icon: FileText },
          {
            label: 'Audit Log API',
            to: '/bpdp/audit-logs',
            icon: ShieldCheck,
            roles: ['BPDP_VERIFIKATOR', 'BPDP_APPROVAL'],
          },
          {
            label: 'User Management',
            to: '/bpdp/user-management',
            icon: UserCheck,
            roles: ['BPDP_APPROVAL'],
          },
          {
            label: 'Role Management',
            to: '/bpdp/role-management',
            icon: ShieldCheck,
            roles: ['BPDP_APPROVAL'],
          },
        ],
      },
    ];

  });

  const filteredNavSections = computed(() => {
    const currentRole = authStore.activeRole;
    const isMatch = (r: string) =>
      r === currentRole ||
      (r === 'PEMOHON' && currentRole === 'KELEMBAGAAN_PEKEBUN') ||
      (r === 'KELEMBAGAAN_PEKEBUN' && currentRole === 'PEMOHON');

    // If dynamic permissions are loaded from backend AND match the active role
    if (
      permissionsLoaded.value &&
      allowedPaths.value.length > 0 &&
      activePermissionRole.value &&
      isMatch(activePermissionRole.value)
    ) {
      return navSections.value
        .map((section) => {
          // Filter section per peran (aturan yang sama dengan fallback) agar section milik
          // peran lain tidak bocor ketika overlay allowed_paths berisi path yang lebih luas.
          if (section.role !== 'ALL') {
            const matchesSection = Array.isArray(section.role) ? section.role.some(isMatch) : isMatch(section.role);
            if (!matchesSection) return null;
          }
          const visibleItems = section.items.filter((item) => {
            if (item.to === '/dashboard') return true;
            if (item.roles && !item.roles.some(isMatch)) return false;
            return allowedPaths.value.some((path) => item.to === path || item.to.startsWith(path));
          });
          return { ...section, items: visibleItems };
        })
        .filter((section): section is NavSection => section !== null && section.items.length > 0);
    }

    // Role-based matching (for simulation mode or role switcher)
    return navSections.value
      .map((section) => {
        if (section.role !== 'ALL') {
          const matchesSection = Array.isArray(section.role) ? section.role.some(isMatch) : isMatch(section.role);
          if (!matchesSection) return null;
        }

        const visibleItems = section.items.filter((item) => {
          if (item.roles && !item.roles.some(isMatch)) return false;
          return true;
        });

        return { ...section, items: visibleItems };
      })
      .filter((section): section is NavSection => section !== null && section.items.length > 0);
  });


  const filteredNavItems = computed<NavItem[]>(() => {
    const items: NavItem[] = [];
    const seen = new Set<string>();
    for (const section of filteredNavSections.value) {
      for (const item of section.items) {
        if (!seen.has(item.to)) {
          seen.add(item.to);
          items.push(item);
        }
      }
    }
    return items;
  });

  return {
    navSections,
    filteredNavSections,
    filteredNavItems,
    loadPermissions,
    allowedPaths,
  };
}
