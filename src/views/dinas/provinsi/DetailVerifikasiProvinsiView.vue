<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useVerifikasiProvinsiDraftStore } from '@/stores/verifikasiProvinsiDraft';
import { useVerifikasiProvinsiStore } from '@/stores/verifikasiProvinsi';
import { useVerifikasiKabStore } from '@/stores/verifikasiKab';
import { useMasterSarprasStore } from '@/stores/masterSarpras';
import Badge from '@/components/ui/Badge.vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import RevisiModal from '@/components/dinas/RevisiModal.vue';
import { useToast } from '@/composables/useToast';
import { Users, Eye, FileText, History } from 'lucide-vue-next';
import AuditTrailSidebar from '@/components/ui/AuditTrailSidebar.vue';
import Button from '@/components/ui/Button.vue';
import { getRoleAwareStatusLabel, getRoleAwareStatusVariant } from '@/lib/statusRoleHelper';

import type { DokumenUpload, Proposal } from '@/types/pengusulan';

const route = useRoute();
const router = useRouter();
const pengusulanStore = usePengusulanStore();
const verifikasiStore = useVerifikasiProvinsiDraftStore();
const verifikasiProvinsiStore = useVerifikasiProvinsiStore();
const verifikasiKabStore = useVerifikasiKabStore();
const masterStore = useMasterSarprasStore();
const toast = useToast();

const id = route.params.id as string;
const pengajuan = computed(() => {
  if (pengusulanStore.activePengajuan && String(pengusulanStore.activePengajuan.id) === String(id)) {
    return pengusulanStore.activePengajuan;
  }
  return pengusulanStore.listPengajuan.find((p) => String(p.id) === String(id)) || null;
});

verifikasiStore.initProposal(id);

function syncKabupatenDocuments(prop?: Proposal | null) {
  const p = prop || pengajuan.value;
  const kabSubmission = verifikasiKabStore.submissions.find((s) => String(s.pengajuanId) === String(id));

  const docs = p?.documents || [];
  const legacyDocs = p?.dokumen || [];

  const aliases: Record<string, string[]> = {
    BA_VERIFIKASI: ['BA_VERIFIKASI', 'BERITA_ACARA_DOKUMEN', 'BERITA_ACARA_VERIFIKASI', 'BERITA_ACARA'],
    BA_VERIFIKASI_LAPANGAN: ['BA_VERIFIKASI_LAPANGAN', 'BERITA_ACARA_LAPANGAN', 'BA_LAPANGAN'],
    SK_CPCL: ['SK_CPCL', 'SK-CPCL'],
  };

  const findDoc = (type: string): DokumenUpload | null => {
    const target = type.toUpperCase();
    const allowed = aliases[target] || [target];

    const docFromApi = docs.find((d: any) => {
      const t = (d.document_type || '').toUpperCase();
      return allowed.includes(t);
    });
    if (docFromApi) {
      return {
        id: docFromApi.id !== undefined ? Number(String(docFromApi.id).replace(/[^\d]/g, '')) || docFromApi.id : undefined,
        persyaratanId: type.toLowerCase().replace(/_/g, '-'),
        namaFile: docFromApi.file_name,
        mimeType: docFromApi.mime_type || 'application/pdf',
        ukuranBytes: typeof docFromApi.file_size === 'number' ? docFromApi.file_size : parseInt(docFromApi.file_size || '0', 10),
        dataUrl: docFromApi.file_url || '/templates/spek-teknis.pdf',
        uploadedAt: docFromApi.created_at || new Date().toISOString(),
      };
    }
    const legacy = legacyDocs.find((d: any) => {
      const t = (d.tipeDokumen || '').toUpperCase();
      return allowed.includes(t);
    });
    if (legacy) {
      return {
        id: legacy.id !== undefined ? Number(String(legacy.id).replace(/[^\d]/g, '')) || legacy.id : undefined,
        persyaratanId: type.toLowerCase().replace(/_/g, '-'),
        namaFile: legacy.namaFile,
        mimeType: 'application/pdf',
        ukuranBytes: legacy.ukuranBytes || 0,
        dataUrl: legacy.urlFile || '/templates/spek-teknis.pdf',
        uploadedAt: legacy.uploadedAt || new Date().toISOString(),
      };
    }
    return null;
  };

  const skCpclDoc = findDoc('SK_CPCL');
  verifikasiStore.kabSkCpcl = skCpclDoc || kabSubmission?.skCpcl || null;

  const baVerifDoc = findDoc('BA_VERIFIKASI');
  verifikasiStore.kabBaVerifikasi = baVerifDoc || kabSubmission?.beritaAcaraDokumen || null;

  const baLapDoc = findDoc('BA_VERIFIKASI_LAPANGAN');
  verifikasiStore.kabBaVerifikasiLapangan = baLapDoc || kabSubmission?.beritaAcaraLapangan || null;

  if (kabSubmission) {
    verifikasiStore.verifications = { ...kabSubmission.verifications, ...verifikasiStore.verifications };
    if (kabSubmission.fotoUdaraPerPekebun) {
      verifikasiStore.fotoUdaraPerPekebun = { ...kabSubmission.fotoUdaraPerPekebun, ...verifikasiStore.fotoUdaraPerPekebun };
    }
  }
}

syncKabupatenDocuments();

const isModalRevisiOpen = ref(false);
const showAuditTrail = ref(false);


const pageLoading = ref(true);

onMounted(async () => {
  if (id) {
    const proposalIdNum = Number(String(id).replace(/[^\d]/g, '')) || id;
    try {
      const results = await Promise.allSettled([
        pengusulanStore.getProposalDetail(id),
        pengusulanStore.getSpatialOverlap(id),
        pengusulanStore.getProposalDocumentValidations({ proposal_id: proposalIdNum }),
      ]);
      const proposalRes = results[0].status === 'fulfilled' ? results[0].value : null;
      syncKabupatenDocuments(proposalRes);

      const validationsRes = results[2].status === 'fulfilled' ? results[2].value : null;
      const validationList = Array.isArray(validationsRes) ? validationsRes : (validationsRes as any)?.data || [];
      if (proposalRes?.documents && validationList.length > 0) {
        verifikasiStore.syncProposalValidations(validationList, proposalRes.documents, proposalRes);
      }
      const pId = proposalRes?.paket_sarpras || proposalRes?.jenisSarpras || (proposalRes as any)?.jenis_sarpras;
      if (pId && masterStore.fetchPersyaratan) {
        masterStore.fetchPersyaratan(pId).catch(() => {});
      }
    } catch (err) {
      console.error('Gagal mengambil detail proposal atau spatial overlap:', err);
      syncKabupatenDocuments();
    }
  }
  pageLoading.value = false;
});

// T023: 3-step wizard configuration
const steps = [
  { id: 1, title: 'Pratinjau Pekebun & Dokumen Proposal', description: 'Tinjau data pekebun dan berkas', icon: Eye },
  { id: 3, title: 'Surat Pengantar SK CPCL', description: 'Asistensi Surat Pengantar SK CPCL', icon: FileText },
  { id: 4, title: 'Summary & Submit', description: 'Submit dan Ajukan ke Ditjenbun', icon: Users },
];

const PratinjauPekebunDanDokumen = defineAsyncComponent({
  loader: () => import('@/components/verification/PratinjauPekebunDanDokumenProposal.vue'),
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
    await verifikasiProvinsiStore.sendBackForRevision(pengajuan.value.id, [], catatan);
  }
  toast.warning('Proposal dikembalikan untuk perbaikan berkas.', 'Revisi Dikirim');
  router.push('/dinas/verifikasi/provinsi');
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
            <Badge :variant="getRoleAwareStatusVariant(pengajuan.status || pengajuan.currentStatus, 'DINAS_PROV')">Status: {{ getRoleAwareStatusLabel(pengajuan.status || pengajuan.currentStatus, 'DINAS_PROV') }}</Badge>
            <span class="text-xs font-mono text-slate-400">Proposal: {{ pengajuan.nomor_proposal || pengajuan.nomorProposal }}</span>
          </div>
          <h1 class="text-2xl font-semibold text-slate-900 font-apple-display-md mt-1">Verifikasi Usulan: {{ pengajuan.lembaga?.namaLembaga || (pengajuan as any)?.kelembagaan?.nama_lembaga || 'Pengusulan' }}</h1>
          <p class="text-xs text-slate-500 font-apple-caption mt-0.5">Ketua: {{ pengajuan.lembaga?.namaKetua || '-' }} (NIK: {{ pengajuan.lembaga?.nikKetua || '-' }}) | Telp: {{ pengajuan.lembaga?.telepon || '-' }}</p>
        </div>
        <div>
          <Button variant="primary" size="sm" @click="showAuditTrail = !showAuditTrail"> <History class="w-4 h-4" /> Lihat Riwayat </Button>
        </div>
      </div>
    </div>

    <div v-if="pageLoading" class="flex flex-col gap-5">
      <Skeleton class="h-60 w-full rounded-2xl" />
      <Skeleton class="h-40 w-full rounded-2xl" />
    </div>

    <template v-else>
      <!-- T023: 3-step Progress Indicator -->
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
            <div class="flex-col min-w-0 hidden sm:flex">
              <span :class="['text-xs font-bold leading-tight truncate', verifikasiStore.currentStep === st.id ? 'text-[#066C2A]' : 'text-slate-500']">{{ st.title }}</span>
              <span class="text-[10px] text-slate-400 truncate">{{ st.description }}</span>
            </div>

            <!-- Connector Bar (not on last) -->
            <div v-if="idx < steps.length - 1" class="h-1.5 flex-1 mx-2 rounded-full relative overflow-hidden bg-slate-200 shrink-0 min-w-100 min-w-8">
              <div class="h-full bg-[#066C2A] transition-all duration-500 ease-in-out" :style="{ width: verifikasiStore.currentStep > st.id ? '100%' : '0%' }" />
            </div>
          </div>
        </div>
      </div>

      <!-- Verification Checklist & Documents -->
      <!-- <KabVerifikasiChecklist :pengajuan="pengajuan" /> -->

      <!-- Document List Preview -->
      <!-- <Card title="Dokumen Legalitas & Persyaratan Usulan">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          <div v-for="doc in pengajuan.dokumen" :key="doc.id" class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <div class="flex flex-col">
              <span class="text-xs font-bold text-slate-800">{{ doc.namaFile }}</span>
              <span class="text-[10px] text-slate-400 font-mono">{{ doc.tipeDokumen || 'Terunggah' }}</span>
            </div>
            <Badge :variant="doc.isValid ? 'success' : 'warning'">
              {{ doc.isValid ? 'Valid' : 'Perlu Cek' }}
            </Badge>
          </div>
        </div>
      </Card> -->

      <!-- T023+T024: Active Step Content — step navigation is handled within each step component -->
      <div class="bg-white/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <Transition name="step-slide" mode="out-in">
          <PratinjauPekebunDanDokumen
            v-if="verifikasiStore.currentStep === 1"
            key="step1"
            :proposal-id="pengajuan.id"
            :show-next-button="true"
            @next="verifikasiStore.currentStep = 3"
          />
          <StepDataCPCL v-else-if="verifikasiStore.currentStep === 3" key="step3" />
          <StepSummaryDanSubmit v-else-if="verifikasiStore.currentStep === 4" key="step4" />
        </Transition>
      </div>
    </template>

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
