import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import authService from '@/services/auth.service';

declare module 'vue-router' {
  interface RouteMeta {
    roles?: string[];
    activeMenu?: string;
    title?: string;
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/DashboardView.vue'),
      meta: { title: 'Dashboard Overview' },
    },
    {
      path: '/pengusulan/baru',
      name: 'pengusulan-baru',
      component: () => import('@/views/pengusulan/FormPengusulanView.vue'),
      meta: { roles: ['KELEMBAGAAN_PEKEBUN'], activeMenu: '/pengusulan/pengajuan-proposal', title: 'Buat Proposal Baru' },
    },
    {
      path: '/pemohon/revisi-proposal/:id',
      name: 'pemohon-revisi-proposal',
      component: () => import('@/views/pemohon/RevisiProposalView.vue'),
      meta: { roles: ['KELEMBAGAAN_PEKEBUN'], activeMenu: '/pengusulan/pengajuan-proposal', title: 'Perbaikan Dokumen Proposal' },
    },
    {
      path: '/pemohon/profile-kelembagaan',
      name: 'pemohon-profile-kelembagaan',
      component: () => import('@/views/pemohon/ProfileKelembagaanView.vue'),
      meta: { roles: ['KELEMBAGAAN_PEKEBUN'], title: 'Profile Kelembagaan Pekebun' },
    },
    {
      path: '/master-data/pekebun',
      name: 'master-data-pekebun',
      component: () => import('@/views/master-data/PekebunListView.vue'),
      meta: { roles: ['KELEMBAGAAN_PEKEBUN'], title: 'Pekebun' },
    },
    {
      path: '/master-data/paket-sarpras',
      name: 'master-data-paket-sarpras',
      component: () => import('@/views/master-data/PaketSarprasListView.vue'),
      meta: { title: 'Master Data Paket Sarpras' },
    },
    {
      path: '/master-data/dokumen-persyaratan',
      name: 'master-data-dokumen-persyaratan',
      component: () => import('@/views/master-data/DokumenPersyaratanListView.vue'),
      meta: { title: 'Master Data Dokumen Persyaratan' },
    },

    {
      path: '/master-data/pekebun/tambah',
      name: 'master-data-pekebun-tambah',
      component: () => import('@/views/master-data/FormPekebunView.vue'),
      meta: { roles: ['KELEMBAGAAN_PEKEBUN'], activeMenu: '/master-data/pekebun', title: 'Tambah Pekebun' },
    },
    {
      path: '/master-data/pekebun/edit/:id',
      name: 'master-data-pekebun-edit',
      component: () => import('@/views/master-data/FormPekebunView.vue'),
      meta: { roles: ['KELEMBAGAAN_PEKEBUN'], activeMenu: '/master-data/pekebun', title: 'Edit Pekebun' },
    },
    {
      path: '/pengusulan/pengajuan-proposal',
      name: 'pengusulan-pengajuan-proposal',
      component: () => import('@/views/pengusulan/TrackingPengusulanView.vue'),
      meta: { roles: ['KELEMBAGAAN_PEKEBUN'], title: 'Pengajuan Proposal' },
    },
    {
      path: '/pengusulan/pengajuan-proposal/:id',
      name: 'pengusulan-pengajuan-proposal-detail',
      component: () => import('@/views/pengusulan/TrackingPengusulanDetailView.vue'),
      meta: { roles: ['KELEMBAGAAN_PEKEBUN'], activeMenu: '/pengusulan/pengajuan-proposal', title: 'Detail Proposal' },
    },
    {
      path: '/dinas/verifikasi',
      name: 'dinas-verifikasi-redirect',
      redirect: () => {
        const authStore = useAuthStore();
        if (authStore.activeRole === 'DINAS_PROV') {
          return { name: 'dinas-verifikasi-provinsi' };
        } else {
          return { name: 'dinas-verifikasi-kabupaten' };
        }
      },
    },
    {
      path: '/dinas/verifikasi/kabupaten',
      name: 'dinas-verifikasi-kabupaten',
      component: () => import('@/views/dinas/kabupaten/QueueVerifikasiKabView.vue'),
      meta: { roles: ['DINAS_KAB', 'DINAS_PROV'], title: 'Verifikasi Proposal' },
    },
    {
      path: '/dinas/verifikasi/kabupaten/:id',
      name: 'dinas-verifikasi-detail-kabupaten',
      component: () => import('@/views/dinas/kabupaten/DetailVerifikasiKabView.vue'),
      meta: { roles: ['DINAS_KAB', 'DINAS_PROV'], activeMenu: '/dinas/verifikasi/kabupaten', title: 'Detail Verifikasi Usulan' },
    },
    {
      path: '/dinas/verifikasi/kabupaten/:id/pekebun/:cpclId',
      name: 'dinas-verifikasi-pekebun-detail',
      component: () => import('@/views/dinas/kabupaten/VerifikasiPekebunDetailView.vue'),
      meta: { roles: ['DINAS_KAB', 'DINAS_PROV'] },
    },
    {
      path: '/dinas/verifikasi/provinsi',
      name: 'dinas-verifikasi-provinsi',
      component: () => import('@/views/dinas/provinsi/QueueVerifikasiProvinsiView.vue'),
      meta: { roles: ['DINAS_KAB', 'DINAS_PROV'], title: 'Asistensi Surat Keterangan CPCL' },
    },
    {
      path: '/dinas/verifikasi/provinsi/:id',
      name: 'dinas-verifikasi-detail-provinsi',
      component: () => import('@/views/dinas/provinsi/DetailVerifikasiProvinsiView.vue'),
      meta: { roles: ['DINAS_KAB', 'DINAS_PROV'] },
    },
    {
      path: '/dinas/verifikasi/provinsi/:id/pekebun/:cpclId',
      name: 'dinas-verifikasi-provinsi-pekebun-detail',
      component: () => import('@/views/dinas/provinsi/PratinjauPekebunDetailView.vue'),
      meta: { roles: ['DINAS_KAB', 'DINAS_PROV'] },
    },
    {
      path: '/dinas/provinsi/lembaga',
      name: 'dinas-provinsi-lembaga',
      component: () => import('@/views/dinas/provinsi/LembagaProvinsiView.vue'),
      meta: { roles: ['DINAS_PROV', 'DINAS_KAB'], title: 'Daftar Akun Kelembagaan Pekebun' },
    },
    {
      path: '/ditjenbun/penetapan',
      redirect: '/ditjenbun/rekomtek',
    },
    {
      path: '/ditjenbun/sk-penerbitan',
      redirect: '/ditjenbun/rekomtek',
    },
    {
      path: '/bpdp/penyaluran',
      redirect: '/penyaluran-dana/pks-3-pihak',
    },
    {
      path: '/bpdp/bast-lpj',
      name: 'bpdp-bast-lpj',
      component: () => import('@/views/bpdpks/PelaporanBASTView.vue'),
      meta: { roles: ['BPDP_VERIFIKATOR', 'BPDP_APPROVAL'], activeMenu: '/bpdp/penyaluran', title: 'Pelaporan BAST' },
    },
    {
      path: '/bpdp/user-management',
      name: 'bpdp-user-management',
      component: () => import('@/views/bpdpks/UserManagementView.vue'),
      meta: { roles: ['BPDP_APPROVAL'], title: 'User Management' },
    },
    {
      path: '/bpdp/role-management',
      name: 'bpdp-role-management',
      component: () => import('@/views/bpdpks/RoleManagementView.vue'),
      meta: { roles: ['BPDP_APPROVAL'], title: 'Role Management' },
    },
    {
      path: '/ditjenbun/rekomtek',
      name: 'ditjenbun-rekomtek',
      component: () => import('@/views/ditjenbun/AntreanRekomtekView.vue'),
      meta: { roles: ['DITJENBUN_VERIFIKATOR', 'DITJENBUN_APPROVAL'], title: 'Verifikasi Rekomtek' },
    },
    {
      path: '/ditjenbun/rekomtek/ceki/:id',
      name: 'ditjenbun-rekomtek-ceki',
      component: () => import('@/views/ditjenbun/CekiDitjenbunView.vue'),
      meta: { roles: ['DITJENBUN_VERIFIKATOR'], activeMenu: '/ditjenbun/rekomtek', title: 'Cek Kelengkapan Dokumen' },
    },
    {
      path: '/ditjenbun/rekomtek/approval/:id',
      name: 'ditjenbun-rekomtek-approval',
      component: () => import('@/views/ditjenbun/ApprovalDitjenbunView.vue'),
      meta: { roles: ['DITJENBUN_APPROVAL'], activeMenu: '/ditjenbun/rekomtek', title: 'Asistensi & Rekomtek' },
    },
    {
      path: '/bpdp/antrean',
      name: 'bpdp-antrean',
      component: () => import('@/views/bpdp/AntreanBpdpView.vue'),
      meta: { roles: ['BPDP_VERIFIKATOR', 'BPDP_APPROVAL'], title: 'Persetujuan Penelitian Rekomtek' },
    },
    {
      path: '/bpdp/revisi-penelitian',
      name: 'bpdp-revisi-penelitian',
      component: () => import('@/views/bpdp/RevisiPenelitianBpdpView.vue'),
      meta: { roles: ['BPDP_VERIFIKATOR'], title: 'Revisi Penelitian Rekomtek' },
    },
    {
      path: '/bpdp/ceki/:id',
      name: 'bpdp-ceki',
      component: () => import('@/views/bpdp/CekiBpdpView.vue'),
      meta: { roles: ['BPDP_VERIFIKATOR'], activeMenu: '/bpdp/antrean', title: 'Persetujuan Penelitian Rekomtek' },
    },
    {
      path: '/bpdp/approval/:id',
      name: 'bpdp-approval',
      component: () => import('@/views/bpdp/ApprovalBpdpView.vue'),
      meta: { roles: ['BPDP_APPROVAL', 'BPDP_VERIFIKATOR'], activeMenu: '/bpdp/antrean', title: 'Persetujuan Penelitian Rekomtek' },
    },
    {
      path: '/bpdp/finalisasi/:id',
      name: 'bpdp-finalisasi',
      component: () => import('@/views/bpdp/FinalisasiSkDirutView.vue'),
      meta: { roles: ['BPDP_VERIFIKATOR'], activeMenu: '/bpdp/sk-dirut', title: 'Finalisasi SK Dirut' },
    },
    {
      path: '/bpdp/sk-dirut',
      name: 'bpdp-sk-dirut',
      component: () => import('@/views/bpdp/SkDirutView.vue'),
      meta: { roles: ['BPDP_VERIFIKATOR'], title: 'SK Dirut' },
    },
    {
      path: '/bpdp/riwayat-selesai',
      name: 'bpdp-riwayat-selesai',
      component: () => import('@/views/bpdp/RiwayatSelesaiView.vue'),
      meta: { roles: ['BPDP_VERIFIKATOR', 'BPDP_APPROVAL'], title: 'Riwayat Selesai' },
    },
    {
      path: '/bpdp/audit-logs',
      name: 'bpdp-audit-logs',
      component: () => import('@/views/bpdp/AuditLogView.vue'),
      meta: { roles: ['BPDP_VERIFIKATOR', 'BPDP_APPROVAL'], title: 'Audit Log API' },
    },
    {
      path: '/penyaluran-barang/pemohon',
      name: 'penyaluran-barang-pemohon',
      component: () => import('@/views/penyaluran-barang/PekebunPermohonanBarangView.vue'),
      meta: { roles: ['KELEMBAGAAN_PEKEBUN'], title: 'Penyaluran Barang' },
    },
    {
      path: '/penyaluran-barang/pemohon/tambah',
      redirect: '/penyaluran-barang/pemohon',
    },
    {
      path: '/penyaluran-barang/verifikator',
      name: 'penyaluran-barang-verifikator',
      component: () => import('@/views/penyaluran-barang/BpdpVerifikatorBarangView.vue'),
      meta: { roles: ['BPDP_VERIFIKATOR', 'BPDP_APPROVAL'], title: 'Verifikasi & Kontrak Penyaluran Barang' },
    },
    {
      path: '/penyaluran-barang/ppk',
      name: 'penyaluran-barang-ppk',
      component: () => import('@/views/penyaluran-barang/BpdpPpkBarangView.vue'),
      meta: { roles: ['BPDP_PPK'], title: 'Disposisi Pengadaan (PPK)' },
    },
    {
      path: '/penyaluran-barang/ulp',
      name: 'penyaluran-barang-ulp',
      component: () => import('@/views/penyaluran-barang/BpdpUlpBarangView.vue'),
      meta: { roles: ['BPDP_ULP'], title: 'Tender & Vendor (ULP)' },
    },
    {
      path: '/penyaluran-barang/surveyor',
      name: 'penyaluran-barang-surveyor',
      component: () => import('@/views/penyaluran-barang/SurveyorBarangView.vue'),
      meta: { roles: ['SURVEYOR_SCI', 'SURVEYOR'], title: 'Penugasan Sampling & Monitoring Surveyor' },
    },
    {
      path: '/penyaluran-dana/pemohon',
      name: 'penyaluran-dana-pemohon',
      component: () => import('@/views/penyaluran-dana/PemohonPencairanView.vue'),
      meta: { roles: ['KELEMBAGAAN_PEKEBUN'], title: 'Penyaluran Dana' },
    },
    {
      path: '/penyaluran-dana/pemohon/tambah',
      name: 'penyaluran-dana-wizard',
      component: () => import('@/views/penyaluran-dana/PemohonWizardPermohonanView.vue'),
      meta: { roles: ['KELEMBAGAAN_PEKEBUN'], activeMenu: '/penyaluran-dana/pemohon', title: 'Tambah Permohonan Pencairan' },
    },
    {
      path: '/penyaluran-dana/pemohon/:id',
      name: 'penyaluran-dana-detail',
      component: () => import('@/views/penyaluran-dana/PemohonDetailTrackingView.vue'),
      meta: { roles: ['KELEMBAGAAN_PEKEBUN'], activeMenu: '/penyaluran-dana/pemohon', title: 'Detail & Tracking Permohonan' },
    },
    {
      path: '/penyaluran-dana/pks-3-pihak',
      name: 'penyaluran-dana-pks',
      component: () => import('@/views/penyaluran-dana/BpdpPks3PihakView.vue'),
      meta: { roles: ['BPDP_VERIFIKATOR', 'BPDP_APPROVAL'], title: 'PKS 3 Pihak' },
    },
    {
      path: '/penyaluran-dana/approval',
      name: 'penyaluran-dana-approval',
      component: () => import('@/views/penyaluran-dana/BpdpApprovalPencairanView.vue'),
      meta: { roles: ['BPDP_STAFF', 'BPDP_KADIV', 'BPDP_APPROVAL'], title: 'Approval Pencairan' },
    },
    {
      path: '/penyaluran-dana/verifikasi-dokumen',
      name: 'penyaluran-dana-verifikasi',
      component: () => import('@/views/penyaluran-dana/SciVerifikasiDokumenView.vue'),
      meta: { roles: ['SURVEYOR_SCI'], title: 'Verifikasi Dokumen Pencairan' },
    },
    {
      path: '/penyaluran-dana/monitoring-lapangan',
      name: 'penyaluran-dana-monitoring',
      component: () => import('@/views/penyaluran-dana/SciMonitoringLapanganView.vue'),
      meta: { roles: ['SURVEYOR_SCI', 'BPDP_VERIFIKATOR'], title: 'Monitoring Lapangan' },
    },
    {
      path: '/penyaluran-dana/bank-mitra',
      name: 'penyaluran-dana-bank',
      component: () => import('@/views/penyaluran-dana/BankMitraView.vue'),
      meta: { roles: ['BANK_MITRA'], title: 'Komparisi & Transfer' },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/access-denied',
      name: 'access-denied',
      component: () => import('@/views/AccessDeniedView.vue'),
    },
  ],
});

router.beforeEach(async (to, _, next) => {
  const authStore = useAuthStore();

  // 1. Intercept SSO callback token from URL
  const tokenParam = to.query.token as string | undefined;
  if (tokenParam) {
    try {
      const res = await authService.exchangeSSO(tokenParam);
      authStore.setAuth(res.access_token, res.user, res.refresh_token);

      // Clean query parameter and navigate to target route
      const nextQuery = { ...to.query };
      delete nextQuery.token;
      return next({ path: to.path, query: nextQuery, replace: true });
    } catch (err: any) {
      console.error('SSO Exchange failed:', err);
      const iamUrl = import.meta.env.VITE_IAM_FRONTEND_URL || 'https://bpdp-iam-dev.scitechnology.id';
      window.location.href = `${iamUrl}/login`;
      return next(false);
    }
  }

  // 2. Check authentication
  const isPublicRoute = to.name === 'login' || to.name === 'access-denied';
  if (!isPublicRoute && !authStore.isAuthenticated) {
    const iamUrl = import.meta.env.VITE_IAM_FRONTEND_URL || 'https://bpdp-iam-dev.scitechnology.id';
    window.location.href = `${iamUrl}/login`;
    return next(false);
  }

  // 3. Role authorization check
  const requiredRoles = to.meta.roles as string[] | undefined;
  if (requiredRoles && requiredRoles.length > 0) {
    const currentRole = authStore.activeRole;
    const isMatch = (r: string) =>
      r === currentRole ||
      (r === 'PEMOHON' && currentRole === 'KELEMBAGAAN_PEKEBUN') ||
      (r === 'KELEMBAGAAN_PEKEBUN' && currentRole === 'PEMOHON') ||
      (r === 'SURVEYOR' && currentRole === 'SURVEYOR_SCI');

    if (!requiredRoles.some(isMatch)) {
      return next({ name: 'access-denied' });
    }
  }

  next();
});

export default router;
