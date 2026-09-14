<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePengusulanStore } from '@/stores/pengusulan';
import { usePekebunStore } from '@/stores/pekebun';
import { useVerifikasiKabDraftStore } from '@/stores/verifikasiKabDraft';
import Badge from '@/components/ui/Badge.vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import RevisiModal from '@/components/dinas/RevisiModal.vue';
import { useToast } from '@/composables/useToast';
import { Users, UserCheck, FileText, History } from 'lucide-vue-next';
import AuditTrailSidebar from '@/components/ui/AuditTrailSidebar.vue';
import Button from '@/components/ui/Button.vue';
import { getRoleAwareStatusLabel, getRoleAwareStatusVariant } from '@/lib/statusRoleHelper';

const route = useRoute();
const router = useRouter();
const pengusulanStore = usePengusulanStore();
const pekebunStore = usePekebunStore();
const verifikasiStore = useVerifikasiKabDraftStore();
const toast = useToast();

const id = route.params.id as string;
const pengajuan = computed(() => pengusulanStore.activePengajuan || pengusulanStore.listPengajuan.find((p) => String(p.id) === String(id)));

verifikasiStore.currentStep = 1;

const isModalRevisiOpen = ref(false);
const showAuditTrail = ref(false);


const pageLoading = ref(true);

onMounted(async () => {
  pageLoading.value = true;
  if (id) {
    const proposalIdNum = Number(String(id).replace(/[^\d]/g, '')) || id;
    verifikasiStore.initForProposal(String(id));
    try {
      const results = await Promise.allSettled([
        pengusulanStore.getProposalDetail(id),
        pengusulanStore.getProposalDocumentValidations({ proposal_id: Number(proposalIdNum) }),
        pengusulanStore.getFarmerDocumentValidations({ pengajuan_id: Number(proposalIdNum) }),
        pengusulanStore.getLandDocumentValidations({ pengajuan_id: Number(proposalIdNum) }),
        pekebunStore.fetchPekebunList({ limit: 100 }),
      ]);
      const proposalRes = results[0].status === 'fulfilled' ? results[0].value : null;
      const validationsRes = results[1].status === 'fulfilled' ? results[1].value : null;
      const farmerValidationsRes = results[2].status === 'fulfilled' ? results[2].value : null;
      const landValidationsRes = results[3].status === 'fulfilled' ? results[3].value : null;

      const validationList = Array.isArray(validationsRes) ? validationsRes : (validationsRes as any)?.data || [];
      const farmerValidationList = Array.isArray(farmerValidationsRes) ? farmerValidationsRes : (farmerValidationsRes as any)?.data || [];
      const landValidationList = Array.isArray(landValidationsRes) ? landValidationsRes : (landValidationsRes as any)?.data || [];

      const docs = (proposalRes as any)?.documents || (proposalRes as any)?.dokumen || [];
      const cpcl = pengusulanStore.activePengajuan?.daftarCPCL || (proposalRes as any)?.daftarCPCL || [];
      const pekebuns = (proposalRes as any)?.pekebuns || (proposalRes as any)?.cpcl || cpcl;
      const lahans = (proposalRes as any)?.lahans || (pengusulanStore.activePengajuan as any)?.lahans || [];

      if (docs.length > 0 || validationList.length > 0 || proposalRes) {
        verifikasiStore.syncProposalValidations(validationList, docs, proposalRes);
      }
      if (farmerValidationList.length > 0) {
        verifikasiStore.syncFarmerDocumentValidations(farmerValidationList, pekebuns, cpcl);
      }
      if (landValidationList.length > 0) {
        verifikasiStore.syncLandDocumentValidations(landValidationList, pekebuns, lahans, cpcl);
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal memuat detail proposal');
    } finally {
      pageLoading.value = false;
    }
  } else {
    pageLoading.value = false;
  }
});

// T023: 3-step wizard configuration
const steps = [
  { id: 1, title: 'Verifikasi Pekebun & Dokumen', description: 'Validasi Pekebun & Berkas', icon: UserCheck },
  { id: 3, title: 'SK CPCL', description: 'Upload Dokumen SK CPCL', icon: FileText },
  { id: 4, title: 'Summary & Submit', description: 'Submit dan Ajukan ke Provinsi', icon: Users },
];

const StepVerifikasiPekebunDanDokumen = defineAsyncComponent({
  loader: () => import('./StepVerifikasiPekebunDanDokumenProposal.vue'),
  loadingComponent: { template: '<div class="animate-pulse h-64 bg-slate-100 rounded-xl" />' },
});
const StepDataCPCL = defineAsyncComponent({
  loader: () => import('./StepDataCPCL.vue'),
  loadingComponent: { template: '<div class="animate-pulse h-64 bg-slate-100 rounded-xl" />' },
});
const StepSummaryDanSubmit = defineAsyncComponent({
  loader: () => import('./StepSummaryDanSubmit.vue'),
  loadingComponent: { template: '<div class="animate-pulse h-64 bg-slate-100 rounded-xl" />' },
});

const handleSaveRevisi = async (catatan: string) => {
  if (pengajuan.value) {
    try {
      await pengusulanStore.updateProposal(pengajuan.value.id, {
        status: 'REV_FROM_KAB',
      });
      pengusulanStore.updateStatus(pengajuan.value.id, 'REV_FROM_KAB', catatan);
      toast.warning('Proposal dikembalikan ke Pemohon untuk perbaikan berkas.', 'Revisi Dikirim');
      router.push('/dinas/verifikasi');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengembalikan proposal');
    }
  }
};

// const handleApproveRekomtek = () => {
//   if (pengajuan.value) {
//     store.updateStatus(pengajuan.value.id, PengajuanStatus.REKOMTEK_KAB_ISSUED);
//   }
//   toast.success('Surat Rekomtek Kab/Kota berhasil diterbitkan dan dikirim ke Ditjenbun!', 'Disetujui');
//   router.push('/dinas/verifikasi');
// };
</script>

<template>
  <div class="min-h-screen bg-transparent p-4 md:p-8 flex flex-col gap-6 mx-auto" v-if="pengajuan">
    <!-- Header -->
    <div class="flex flex-col gap-4 bg-white/90 backdrop-blur-xl p-6 rounded-2xl border border-slate-200 shadow-sm">
      <Breadcrumb />

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <Badge :variant="getRoleAwareStatusVariant(pengajuan.status || pengajuan.currentStatus, 'DINAS_KAB')">Status: {{ getRoleAwareStatusLabel(pengajuan.status || pengajuan.currentStatus, 'DINAS_KAB') }}</Badge>
            <span class="text-xs font-mono text-slate-400">Proposal: {{ pengajuan.nomor_proposal || pengajuan.nomorProposal }}</span>
          </div>
          <h1 class="text-2xl font-semibold text-slate-900 font-apple-display-md mt-1">Verifikasi Usulan: {{ pengajuan.lembaga?.namaLembaga }}</h1>
          <p class="text-xs text-slate-500 font-apple-caption mt-0.5">Ketua: {{ pengajuan.lembaga?.namaKetua }} (NIK: {{ pengajuan.lembaga?.nikKetua }}) | Telp: {{ pengajuan.lembaga?.telepon }}</p>
        </div>
        <div class="relative group">
          <Button variant="primary" size="sm" @click="showAuditTrail = !showAuditTrail"> <History class="w-4 h-4" /> Lihat Riwayat </Button>
        </div>
      </div>
    </div>

    <!-- T023: 3-step Progress Indicator (Rendered immediately without loading lag) -->
    <div class="bg-white/90 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-slate-200/80 shadow-sm">
      <div class="flex items-center justify-between gap-2">
        <div v-for="(st, idx) in steps" :key="st.id" class="flex items-center gap-2 flex-1">
          <!-- Step Badge -->
          <div
            :class="[
              'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 shrink-0',
              verifikasiStore.currentStep === st.id
                ? 'bg-[#066C2A] text-white shadow-md shadow-emerald-900/20 ring-2 ring-emerald-200 scale-110'
                : verifikasiStore.currentStep > st.id
                  ? 'bg-emerald-100 text-[#066C2A]'
                  : 'bg-slate-100 text-slate-400',
            ]"
          >
            <component :is="st.icon" class="w-4 h-4" />
          </div>

          <!-- Step Label -->
          <div class="flex flex-col min-w-0 hidden sm:flex">
            <span :class="['text-xs font-bold leading-tight truncate', verifikasiStore.currentStep === st.id ? 'text-[#066C2A]' : 'text-slate-500']">{{ st.title }}</span>
            <span class="text-[10px] text-slate-400 truncate">{{ st.description }}</span>
          </div>

          <!-- Connector Bar (not on last) -->
          <div v-if="idx < steps.length - 1" class="h-1.5 flex-1 mx-2 rounded-full relative overflow-hidden bg-slate-200 shrink-0 min-w-8">
            <div class="h-full bg-[#066C2A] transition-all duration-500 ease-in-out" :style="{ width: verifikasiStore.currentStep > st.id ? '100%' : '0%' }" />
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Skeleton for Step Content -->
    <div v-if="pageLoading" class="flex flex-col gap-5">
      <Skeleton class="h-40 w-full rounded-2xl" />
      <Skeleton class="h-64 w-full rounded-2xl" />
    </div>

    <!-- T023+T024: Active Step Content — step navigation is handled within each step component -->
    <div v-else class="bg-white/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
      <Transition name="step-slide" mode="out-in">
        <StepVerifikasiPekebunDanDokumen v-if="verifikasiStore.currentStep === 1" key="step1" />
        <StepDataCPCL v-else-if="verifikasiStore.currentStep === 3" key="step3" />
        <StepSummaryDanSubmit v-else-if="verifikasiStore.currentStep === 4" key="step4" />
      </Transition>
    </div>

    <!-- <div class="flex items-center gap-2">
      <Button variant="danger" size="sm" @click="isModalRevisiOpen = true"> Kembalikan (Revisi) </Button>
      <Button variant="primary" size="sm" @click="handleApproveRekomtek"> Terbitkan Rekomtek </Button>
    </div> -->

    <!-- Modal Revisi -->
    <RevisiModal :is-open="isModalRevisiOpen" @close="isModalRevisiOpen = false" @submit="handleSaveRevisi" />

    <!-- Audit Trail Sidebar -->
    <Teleport to="body">
      <div v-if="showAuditTrail" class="fixed inset-0 z-40 bg-black/20" @click="showAuditTrail = false" />
      <AuditTrailSidebar v-if="showAuditTrail" :proposal-id="id" @close="showAuditTrail = false" />
    </Teleport>
  </div>
</template>
