<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePengusulanStore } from '@/stores/pengusulan';

import Card from '@/components/ui/Card.vue';
import Badge from '@/components/ui/Badge.vue';
import Button from '@/components/ui/Button.vue';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import Modal from '@/components/ui/Modal.vue';

import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import SatelliteMapPreview from '@/components/ui/SatelliteMapPreview.vue';
import ProposalAuditTimeline from '@/components/proposal/ProposalAuditTimeline.vue';

import { usePekebunStore } from '@/stores/pekebun';
import { getStatusLabel, getJenisSarprasLabel } from '@/types/pengusulan';
import type { DataCPCL, ProposalLahanResponse, ProposalLahanDocumentResponse } from '@/types/pengusulan';
import type { Pekebun, DokumenPekebun } from '@/types/pekebun';
import { LOCALIZATION } from '@/config/localization';
import { parseRejectionNotes } from '@/lib/parseRejectionNotes';

import {
  FileText,
  FileCheck,
  Check,
  AlertTriangle,
  Calculator,
  FileSpreadsheet,
  Layers,
  Eye,
  Users,
  ArrowLeft,
  Search,
  MapPin,
  ChevronRight,
  Download,
} from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const store = usePengusulanStore();
const pageLoading = ref(true);

const proposalId = computed(() => route.params.id as string);

const proposal = computed(() => {
  if (store.activePengajuan && String(store.activePengajuan.id) === String(proposalId.value)) {
    return store.activePengajuan;
  }
  return store.listPengajuan.find((item) => String(item.id) === String(proposalId.value)) || null;
});

const proposalNomor = computed(() => {
  return proposal.value?.nomor_proposal || proposal.value?.nomorProposal || proposal.value?.id || proposalId.value || '-';
});

const breadcrumbs = computed(() => [
  { label: 'Beranda', to: '/dashboard' },
  { label: 'Pengajuan Proposal', to: '/pengusulan/pengajuan-proposal' },
  { label: `Detail - Proposal: ${proposalNomor.value}`, active: true },
]);

async function loadProposalDetail() {
  if (!proposalId.value) return;
  pageLoading.value = true;
  try {
    await store.getProposalDetail(proposalId.value);
  } finally {
    pageLoading.value = false;
  }
}

onMounted(() => {
  loadProposalDetail();
  if (pekebunStore.listPekebun.length === 0) {
    pekebunStore.fetchPekebunList().catch(() => {});
  }
});

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadProposalDetail();
    }
  },
);

const getStatusBadgeVariant = (status?: string) => {
  switch (status) {
    case 'SK_DIRUT_PUBLISHED':
    case 'SELESAI':
    case 'SK_DIRUT_ISSUED':
    case 'PKS_BPDP_SIGNED':
    case 'DISBURSED':
    case 'COMPLETED':
      return 'success';
    case 'REV_FROM_KAB':
    case 'REV_FROM_PROV':
    case 'REV_FROM_DITJEN_VERIF':
    case 'REV_FROM_DITJEN_APPR':
    case 'REV_FROM_BPDP_VERIF':
    case 'REV_FROM_BPDP_APPR':
    case 'REVISION_ADMIN':
      return 'warning';
    case 'REJECTED':
      return 'danger';
    case 'SUBMITTED':
    case 'KAB_SUBMITTED':
    case 'PROV_SUBMITTED':
    case 'DITJEN_VERIF_SUBMITTED':
    case 'DITJEN_APPR_SUBMITTED':
    case 'BPDP_VERIF_SUBMITTED':
    case 'BPDP_APPR_SUBMITTED':
    case 'REKOMTEK_KAB_ISSUED':
    case 'VALIDATED_PROV':
    case 'SK_DITJENBUN_ISSUED':
      return 'info';
    default:
      return 'secondary';
  }
};

interface StepperStep {
  id: number;
  label: string;
  isCompleted: boolean;
  isActive: boolean;
  isWarning?: boolean;
  isError?: boolean;
}

const computedSteps = computed<StepperStep[]>(() => {
  if (!proposal.value) return [];
  const status = String(proposal.value.status || proposal.value.currentStatus || '');

  // 1. Submit Proposal (Pemohon)
  const step1Warning = status === 'REV_FROM_KAB' || status === 'REVISION_ADMIN';
  const step1Completed = !!status && status !== 'DRAFT';

  // 2. Verifikasi Dinas Kab/Kota
  // Completed when passed Kab level (starting from KAB_SUBMITTED / REKOMTEK_KAB_ISSUED onward)
  const kabDoneStatuses = [
    'KAB_SUBMITTED',
    'REKOMTEK_KAB_ISSUED',
    'PROV_SUBMITTED',
    'REV_FROM_PROV',
    'VALIDATED_PROV',
    'DITJEN_VERIF_SUBMITTED',
    'REV_FROM_DITJEN_VERIF',
    'DITJEN_APPR_SUBMITTED',
    'REV_FROM_DITJEN_APPR',
    'SK_DITJENBUN_ISSUED',
    'BPDP_VERIF_SUBMITTED',
    'REV_FROM_BPDP_VERIF',
    'BPDP_APPR_SUBMITTED',
    'REV_FROM_BPDP_APPR',
    'GENERATE_SK_DIRUT',
    'SK_DIRUT_PUBLISHED',
    'SELESAI',
    'SK_DIRUT_ISSUED',
    'PKS_BPDP_SIGNED',
    'DISBURSED',
    'COMPLETED',
  ];
  const step2Completed = kabDoneStatuses.includes(status);
  const step2Active = ['SUBMITTED', 'VERIFIED_ADMIN', 'VERIFIED_FIELD'].includes(status);
  const step2Warning = status === 'REV_FROM_KAB' || status === 'REVISION_ADMIN';

  // 3. Asistensi Dinas Provinsi
  // Active when KAB_SUBMITTED / REKOMTEK_KAB_ISSUED
  // Completed when passed Prov level (starting from PROV_SUBMITTED onward)
  const provDoneStatuses = [
    'PROV_SUBMITTED',
    'VALIDATED_PROV',
    'DITJEN_VERIF_SUBMITTED',
    'REV_FROM_DITJEN_VERIF',
    'DITJEN_APPR_SUBMITTED',
    'REV_FROM_DITJEN_APPR',
    'SK_DITJENBUN_ISSUED',
    'BPDP_VERIF_SUBMITTED',
    'REV_FROM_BPDP_VERIF',
    'BPDP_APPR_SUBMITTED',
    'REV_FROM_BPDP_APPR',
    'GENERATE_SK_DIRUT',
    'SK_DIRUT_PUBLISHED',
    'SELESAI',
    'SK_DIRUT_ISSUED',
    'PKS_BPDP_SIGNED',
    'DISBURSED',
    'COMPLETED',
  ];
  const step3Completed = provDoneStatuses.includes(status) && status !== 'REV_FROM_PROV';
  const step3Active = ['KAB_SUBMITTED', 'REKOMTEK_KAB_ISSUED'].includes(status);
  const step3Warning = status === 'REV_FROM_PROV';

  // 4. Penerbitan Rekomtek Ditjenbun
  // Active when PROV_SUBMITTED, DITJEN_VERIF_SUBMITTED, VALIDATED_PROV
  // Completed when passed Ditjenbun level (starting from DITJEN_APPR_SUBMITTED onward)
  const ditjenDoneStatuses = [
    'DITJEN_APPR_SUBMITTED',
    'BPDP_VERIF_SUBMITTED',
    'REV_FROM_BPDP_VERIF',
    'BPDP_APPR_SUBMITTED',
    'REV_FROM_BPDP_APPR',
    'GENERATE_SK_DIRUT',
    'SK_DITJENBUN_ISSUED',
    'SK_DIRUT_PUBLISHED',
    'SELESAI',
    'SK_DIRUT_ISSUED',
    'PKS_BPDP_SIGNED',
    'DISBURSED',
    'COMPLETED',
  ];
  const step4Completed = ditjenDoneStatuses.includes(status);
  const step4Active = ['PROV_SUBMITTED', 'DITJEN_VERIF_SUBMITTED', 'VALIDATED_PROV'].includes(status);
  const step4Warning = status === 'REV_FROM_DITJEN_VERIF' || status === 'REV_FROM_DITJEN_APPR';

  // 5. Penerbitan SK Dirut BPDP
  // Active when DITJEN_APPR_SUBMITTED, BPDP_VERIF_SUBMITTED, BPDP_APPR_SUBMITTED, GENERATE_SK_DIRUT, SK_DITJENBUN_ISSUED
  // Completed on SK_DIRUT_PUBLISHED, SELESAI, SK_DIRUT_ISSUED, PKS_BPDP_SIGNED, DISBURSED, COMPLETED
  const bpdpDoneStatuses = [
    'SK_DIRUT_PUBLISHED',
    'SELESAI',
    'SK_DIRUT_ISSUED',
    'PKS_BPDP_SIGNED',
    'DISBURSED',
    'COMPLETED',
  ];
  const step5Completed = bpdpDoneStatuses.includes(status);
  const step5Active = [
    'DITJEN_APPR_SUBMITTED',
    'BPDP_VERIF_SUBMITTED',
    'BPDP_APPR_SUBMITTED',
    'GENERATE_SK_DIRUT',
    'SK_DITJENBUN_ISSUED',
  ].includes(status);
  const step5Warning = status === 'REV_FROM_BPDP_VERIF' || status === 'REV_FROM_BPDP_APPR';

  const isRejected = status === 'REJECTED';

  return [
    {
      id: 1,
      label: LOCALIZATION.workflowSteps.submitPemohon,
      isCompleted: step1Completed && !step1Warning,
      isActive: false,
      isWarning: step1Warning,
    },
    {
      id: 2,
      label: LOCALIZATION.workflowSteps.rekomtekKab,
      isCompleted: step2Completed,
      isActive: step2Active && !isRejected,
      isWarning: step2Warning && !step2Completed,
      isError: isRejected && !step2Completed && !step1Warning,
    },
    {
      id: 3,
      label: LOCALIZATION.workflowSteps.asistensiProv,
      isCompleted: step3Completed,
      isActive: (step3Active || step3Warning) && !isRejected,
      isWarning: step3Warning && !step3Completed,
      isError: isRejected && step2Completed && !step3Completed,
    },
    {
      id: 4,
      label: LOCALIZATION.workflowSteps.rekomtekDitjenbun,
      isCompleted: step4Completed,
      isActive: (step4Active || step4Warning) && !isRejected,
      isWarning: step4Warning && !step4Completed,
      isError: isRejected && step3Completed && !step4Completed,
    },
    {
      id: 5,
      label: LOCALIZATION.workflowSteps.skDirutBpdp,
      isCompleted: step5Completed,
      isActive: (step5Active || step5Warning) && !isRejected,
      isWarning: step5Warning && !step5Completed,
      isError: isRejected && step4Completed && !step5Completed,
    },
  ];
});

// ─── RAB Tabs & Data Handling ──────────────────────────────────────────────────
export interface RabTabItem {
  key: 'PROPOSAL' | 'FINAL' | string;
  label: string;
  tag: string;
  rab: any;
  items: any[];
  totalAmount: number;
}

const rabTabs = computed<RabTabItem[]>(() => {
  const p = proposal.value as any;
  if (!p) return [];
  const tabs: RabTabItem[] = [];

  // Helper to normalize and map items from Golang DTO
  const normalizeItems = (items: any[], fallbackItems?: any[]) => {
    return items.map((item, idx) => {
      const volume = Number(item.volume ?? item.jumlahTotal ?? 0);
      const pricePerUnit = Number(item.price_per_unit ?? item.pricePerUnit ?? item.hargaSatuan ?? 0);
      const totalPrice = Number(item.total_price ?? item.totalPrice ?? item.subTotal ?? volume * pricePerUnit);

      // Extract details
      const details = item.details || {};
      const jenis = details.jenis || item.jenis || '';
      const jumlahTahap1 = details.jumlahTahap1 ?? item.jumlahTahap1 ?? null;
      const jumlahTahap2 = details.jumlahTahap2 ?? item.jumlahTahap2 ?? null;
      const jumlahTahap3 = details.jumlahTahap3 ?? item.jumlahTahap3 ?? null;
      const jumlahTahap4 = details.jumlahTahap4 ?? item.jumlahTahap4 ?? null;
      const jumlahTotal = details.jumlahTotal ?? item.jumlahTotal ?? volume;

      let itemVarietas = details.varietas ?? item.varietas ?? '';
      let itemVarietasCustom = details.varietasCustom ?? details.varietas_custom ?? item.varietasCustom ?? '';

      if (!itemVarietas && fallbackItems && fallbackItems.length > 0) {
        const fallbackMatch = fallbackItems.find((fb: any) => fb.uraian === item.uraian || fb.id === item.id) || fallbackItems[idx];
        if (fallbackMatch) {
          itemVarietas = fallbackMatch.varietas || fallbackMatch.details?.varietas || '';
          itemVarietasCustom = fallbackMatch.varietasCustom || fallbackMatch.details?.varietasCustom || fallbackMatch.details?.varietas_custom || '';
        }
      }

      // Extract tahap from details map or direct field
      let tahap = item.tahap || '';
      if (!tahap && details) {
        const activeStages = [
          jumlahTahap1 ? 'Tahap 1' : '',
          jumlahTahap2 ? 'Tahap 2' : '',
          jumlahTahap3 ? 'Tahap 3' : '',
          jumlahTahap4 ? 'Tahap 4' : '',
        ].filter(Boolean);

        if (activeStages.length === 4) {
          tahap = 'Tahap 1 - 4';
        } else if (activeStages.length > 0) {
          tahap = activeStages.join(' & ');
        }
      }

      return {
        ...item,
        id: item.id || `rab-item-${idx}`,
        uraian: item.uraian || item.kebutuhan || '-',
        item_type: item.item_type || item.itemType || '',
        volume,
        unit: item.unit || item.satuan || '-',
        satuan: item.satuan || item.unit || '-',
        price_per_unit: pricePerUnit,
        total_price: totalPrice,
        tahap: tahap || 'Semua Tahap',
        jenis: jenis || '-',
        varietas: itemVarietas,
        varietasCustom: itemVarietasCustom,
        jumlahTahap1,
        jumlahTahap2,
        jumlahTahap3,
        jumlahTahap4,
        jumlahTotal,
        details,
      };
    });
  };

  // 1. Primary: Direct rab_proposal / rabProposal object
  const rabProposalObj = p.rab_proposal || p.rabProposal;
  if (rabProposalObj && Array.isArray(rabProposalObj.items) && rabProposalObj.items.length > 0) {
    const items = normalizeItems(rabProposalObj.items);
    const total = items.reduce((sum, it) => sum + (it.total_price || 0), 0);
    tabs.push({
      key: 'PROPOSAL',
      label: 'RAB Pengajuan',
      tag: 'Pengajuan Awal',
      rab: rabProposalObj,
      items,
      totalAmount: total,
    });
  }

  // 2. Primary: Direct rab_final / rabFinal object
  const rabFinalObj = p.rab_final || p.rabFinal;
  if (rabFinalObj && Array.isArray(rabFinalObj.items) && rabFinalObj.items.length > 0) {
    const items = normalizeItems(rabFinalObj.items, rabProposalObj?.items);
    const total = items.reduce((sum, it) => sum + (it.total_price || 0), 0);
    tabs.push({
      key: 'FINAL',
      label: 'RAB Final',
      tag: 'Disetujui / Final',
      rab: rabFinalObj,
      items,
      totalAmount: total,
    });
  }

  // 3. Fallbacks for array rabs or rabItems if tabs is still empty
  if (tabs.length === 0) {
    const rawRabs: any[] = [];
    if (p.rabs && Array.isArray(p.rabs) && p.rabs.length > 0) {
      rawRabs.push(...p.rabs);
    } else if (p.rabProposals && Array.isArray(p.rabProposals) && p.rabProposals.length > 0) {
      rawRabs.push(...p.rabProposals);
    } else if (p.rabItems && Array.isArray(p.rabItems) && p.rabItems.length > 0) {
      rawRabs.push({
        flag: 'PROPOSAL',
        items: p.rabItems,
      });
    }

    const proposalRab = rawRabs.find((r) => String(r.flag).toUpperCase() === 'PROPOSAL');
    if (proposalRab && proposalRab.items && proposalRab.items.length > 0) {
      const items = normalizeItems(proposalRab.items);
      const total = items.reduce((sum, it) => sum + (it.total_price || 0), 0);
      tabs.push({
        key: 'PROPOSAL',
        label: 'RAB Pengajuan',
        tag: 'Pengajuan Awal',
        rab: proposalRab,
        items,
        totalAmount: total,
      });
    }

    const finalRab = rawRabs.find((r) => String(r.flag).toUpperCase() === 'FINAL');
    if (finalRab && finalRab.items && finalRab.items.length > 0) {
      const items = normalizeItems(finalRab.items, proposalRab?.items);
      const total = items.reduce((sum, it) => sum + (it.total_price || 0), 0);
      tabs.push({
        key: 'FINAL',
        label: 'RAB Final',
        tag: 'Disetujui / Final',
        rab: finalRab,
        items,
        totalAmount: total,
      });
    }
  }

  return tabs;
});

const activeTabKey = ref<string>('PROPOSAL');

// Keep activeTabKey aligned with available tabs
watch(
  rabTabs,
  (newTabs) => {
    if (newTabs.length > 0) {
      const exists = newTabs.some((t) => t.key === activeTabKey.value);
      if (!exists) {
        activeTabKey.value = newTabs[0].key;
      }
    }
  },
  { immediate: true },
);

const activeRabTab = computed(() => {
  return rabTabs.value.find((t) => t.key === activeTabKey.value) || rabTabs.value[0] || null;
});

const rabTahapCount = computed<number>(() => {
  const paket = (proposal.value as any)?.paket_sarpras || (proposal.value as any)?.jenisSarpras;
  if (paket) {
    const p = String(paket).toUpperCase();
    if (p.includes('INTENSIFIKASI')) return 4;
    if (p.includes('EKSTENSIFIKASI')) return 2;
  }
  const items = activeRabTab.value?.items || [];
  const hasTahap3Or4 = items.some(
    (it: any) =>
      it.jumlahTahap3 != null ||
      it.jumlahTahap4 != null ||
      it.details?.jumlahTahap3 != null ||
      it.details?.jumlahTahap4 != null,
  );
  if (hasTahap3Or4) return 4;
  const hasTahap2 = items.some(
    (it: any) => it.jumlahTahap2 != null || it.details?.jumlahTahap2 != null,
  );
  if (hasTahap2) return 2;
  return 1;
});

// ─── Document Preview Logic ────────────────────────────────────────────────────
const showDocPreview = ref(false);
const previewDoc = ref<{ title: string; dataUrl: string; mimeType: string } | null>(null);

const activeRabDocument = computed(() => {
  if (!proposal.value) return null;
  const targetDocType = activeTabKey.value === 'FINAL' ? 'RAB_FINAL' : 'RAB_PROPOSAL';

  // 1. Search in proposal.documents
  if (proposal.value.documents && Array.isArray(proposal.value.documents)) {
    const found = proposal.value.documents.find((d: any) => d.document_type === targetDocType || d.document_type?.toLowerCase() === targetDocType.toLowerCase());
    if (found && (found.file_url || (found as any).urlFile || (found as any).dataUrl)) {
      return {
        title: found.file_name || `Dokumen ${activeRabTab.value?.label || 'RAB'}`,
        dataUrl: found.file_url || (found as any).urlFile || (found as any).dataUrl || '/templates/spek-teknis.pdf',
        mimeType: found.mime_type || 'application/pdf',
      };
    }
  }

  // 2. Fallbacks for PROPOSAL if legacy structure
  if (activeTabKey.value === 'PROPOSAL') {
    if (proposal.value.rabDitandatangani && proposal.value.rabDitandatangani.dataUrl) {
      return {
        title: proposal.value.rabDitandatangani.namaFile || 'Dokumen RAB Bertandatangan',
        dataUrl: proposal.value.rabDitandatangani.dataUrl || '/templates/spek-teknis.pdf',
        mimeType: proposal.value.rabDitandatangani.mimeType || 'application/pdf',
      };
    }
    const docItem = proposal.value.dokumen?.find((d) => d.tipeDokumen === 'RAB_RK' || d.tipeDokumen === 'RAB_DETAIL' || d.tipeDokumen === 'RAB_PROPOSAL');
    if (docItem) {
      return {
        title: docItem.namaFile || 'Dokumen RAB Usulan',
        dataUrl: docItem.urlFile || '/templates/spek-teknis.pdf',
        mimeType: 'application/pdf',
      };
    }
  }

  return null;
});

function openRabDocPreview() {
  if (!activeRabDocument.value) return;
  previewDoc.value = activeRabDocument.value;
  showDocPreview.value = true;
}

// ─── Documents Popup & Preview Logic (Separated Cards) ────────────────────────
const isSupportingDocsModalOpen = ref(false);
const isValidatorDocsModalOpen = ref(false);

interface SupportingDocItem {
  id: string | number;
  document_type?: string;
  label: string;
  namaFile: string;
  dataUrl: string;
  mimeType: string;
  ukuranFormatted: string;
  uploadedAt: string;
  noSk?: string;
}

const VALIDATOR_DOC_TYPES = [
  'BA_VERIFIKASI',
  'BA_VERIFIKASI_LAPANGAN',
  'BA_VEIRIFKASI_LAPANGAN',
  'RAB_FINAL',
  'SK_CPCL',
  'SURAT_PENGANTAR_SK_CPCL',
  'REKOMTEK',
  'DRAF_REKOMTEK',
  'REKOMTEK_DITJENBUN',
  'KEPUTUSAN_KELAYAKAN',
  'LAPORAN_KELAYAKAN',
  'HASIL_PENELITIAN_BPDP',
];

const SK_DIRUT_DOC_TYPES = [
  'SK_DIRUT',
  'SKDIRUT',
  'SK_DIREKTUR_UTAMA',
  'SK_PENETAPAN_DIRUT',
];

const RAB_PROPOSAL_DOC_TYPES = [
  'RAB_PROPOSAL',
  'RAB_RK',
  'RAB_DETAIL',
];

function isValidatorDocType(type: string): boolean {
  const norm = (type || '').toUpperCase().replace(/[-]/g, '_');
  return VALIDATOR_DOC_TYPES.includes(norm);
}

function isSkDirutDocType(type: string): boolean {
  const norm = (type || '').toUpperCase().replace(/[-_]/g, '');
  return SK_DIRUT_DOC_TYPES.map((a) => a.replace(/[-_]/g, '')).includes(norm);
}

function isRabProposalDocType(type: string): boolean {
  const norm = (type || '').toUpperCase().replace(/[-]/g, '_');
  return RAB_PROPOSAL_DOC_TYPES.includes(norm);
}

function formatDocTypeLabel(type: string): string {
  const map: Record<string, string> = {
    // Pemohon Supporting Docs
    SURAT_PERMOHONAN: 'Surat Permohonan',
    DOKUMEN_LEGALITAS_KELEMBAGAAN: 'Legalitas Kelembagaan',
    LEGALITAS_KP: 'Legalitas Kelompok Pekebun',
    KTP: 'KTP Pengurus / Pekebun',
    KK: 'Kartu Keluarga (KK)',
    STDB: 'Surat Tanda Daftar Budidaya (STDB)',
    SURAT_KET_KADES: 'Surat Keterangan Kepala Desa',
    SURAT_BEDA_NAMA: 'Surat Keterangan Beda Nama',
    GAMBAR_LAHAN: 'Peta / Gambar Batas Lahan',
    PERNYATAAN_LUAS: 'Surat Pernyataan Luas Lahan',
    PERNYATAAN_TANPA_BAKAR: 'Surat Pernyataan Pembukaan Lahan Tanpa Bakar',
    DOKUMEN_SID: 'Dokumen Survei Investigasi Desain (SID)',
    FOTO_JALAN: 'Dokumen Foto Akses Jalan',

    // Lahan Docs
    FOTO_UDARA: 'Foto Udara Lahan',
    LEGALITAS_LAHAN: 'Legalitas Lahan',
    SCAN_LEGALITAS: 'Scan Legalitas Lahan',
    SURAT_KETERANGAN_KEPALA_DESA: 'Surat Keterangan Kepala Desa',

    // Validator Docs
    BA_VERIFIKASI: 'Berita Acara Verifikasi Administrasi',
    BA_VERIFIKASI_LAPANGAN: 'Berita Acara Verifikasi Lapangan',
    BA_VEIRIFKASI_LAPANGAN: 'Berita Acara Verifikasi Lapangan',
    RAB_FINAL: 'RAB Final / Penyesuaian',
    SK_CPCL: 'Surat Keputusan CPCL',
    SURAT_PENGANTAR_SK_CPCL: 'Surat Pengantar SK CPCL',
    REKOMTEK: 'Rekomendasi Teknis Ditjenbun',
    DRAF_REKOMTEK: 'Rekomendasi Teknis Ditjenbun',
    REKOMTEK_DITJENBUN: 'Rekomendasi Teknis Ditjenbun',
    KEPUTUSAN_KELAYAKAN: 'Laporan Keputusan Penelitian BPDP',
    LAPORAN_KELAYAKAN: 'Laporan Keputusan Penelitian BPDP',
    HASIL_PENELITIAN_BPDP: 'Laporan Keputusan Penelitian BPDP',

    // SK Dirut
    SK_DIRUT: 'Surat Keputusan Direktur Utama BPDPKS',
    SKDIRUT: 'Surat Keputusan Direktur Utama BPDPKS',
    SK_DIREKTUR_UTAMA: 'Surat Keputusan Direktur Utama BPDPKS',
    SK_PENETAPAN_DIRUT: 'Surat Keputusan Direktur Utama BPDPKS',
  };
  if (map[type]) return map[type];
  return type
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Validator Documents:
 * "BA_VERIFIKASI", "BA_VEIRIFKASI_LAPANGAN", "RAB_FINAL", "SK_CPCL",
 * "SURAT_PENGANTAR_SK_CPCL", "REKOMTEK", "KEPUTUSAN_KELAYAKAN"
 */
const validatorDocuments = computed<SupportingDocItem[]>(() => {
  const p = proposal.value as any;
  if (!p) return [];
  const list: SupportingDocItem[] = [];
  const addedTypes = new Set<string>();

  // 1. proposal.documents
  if (p.documents && Array.isArray(p.documents)) {
    p.documents.forEach((doc: any, idx: number) => {
      const type = doc.document_type || doc.tipeDokumen || '';
      if (isValidatorDocType(type)) {
        const normType = type.toUpperCase().replace(/[-]/g, '_');
        addedTypes.add(normType);
        const sizeNum = typeof doc.file_size === 'number' ? doc.file_size : parseInt(doc.file_size || '0', 10);
        const sizeStr = sizeNum ? `${(sizeNum / 1024).toFixed(0)} KB` : '-';
        list.push({
          id: doc.id || `val-doc-${idx}`,
          document_type: type,
          label: formatDocTypeLabel(type),
          namaFile: doc.file_name || doc.namaFile || `Dokumen_Validator_${idx + 1}.pdf`,
          dataUrl: doc.file_url || doc.urlFile || '',
          mimeType: doc.mime_type || (doc.file_extension === 'png' ? 'image/png' : 'application/pdf'),
          ukuranFormatted: sizeStr,
          uploadedAt: doc.created_at || doc.uploadedAt || '-',
        });
      }
    });
  }

  // 2. proposal.dokumen fallback
  if (p.dokumen && Array.isArray(p.dokumen)) {
    p.dokumen.forEach((doc: any, idx: number) => {
      const type = doc.tipeDokumen || doc.document_type || '';
      const normType = type.toUpperCase().replace(/[-]/g, '_');
      if (isValidatorDocType(type) && !addedTypes.has(normType)) {
        addedTypes.add(normType);
        const sizeStr = doc.ukuranBytes ? `${(doc.ukuranBytes / 1024).toFixed(0)} KB` : '-';
        list.push({
          id: doc.id || `val-dok-${idx}`,
          document_type: type,
          label: formatDocTypeLabel(type),
          namaFile: doc.namaFile || doc.file_name || `Dokumen_Validator_${idx + 1}.pdf`,
          dataUrl: doc.urlFile || doc.file_url || '',
          mimeType: 'application/pdf',
          ukuranFormatted: sizeStr,
          uploadedAt: doc.uploadedAt || '-',
        });
      }
    });
  }

  // 3. Fallbacks for nested objects
  if (!addedTypes.has('REKOMTEK') && p.rekomtek?.signedUrl) {
    list.push({
      id: 'val-rekomtek',
      document_type: 'REKOMTEK',
      label: 'Rekomendasi Teknis Ditjenbun',
      namaFile: 'rekomtek_signed.pdf',
      dataUrl: p.rekomtek.signedUrl,
      mimeType: 'application/pdf',
      ukuranFormatted: '-',
      uploadedAt: '-',
    });
  }

  if (!addedTypes.has('KEPUTUSAN_KELAYAKAN') && (p.kelayakan?.signedUrl || p.kelayakan?.draftUrl)) {
    list.push({
      id: 'val-kelayakan',
      document_type: 'KEPUTUSAN_KELAYAKAN',
      label: 'Laporan Keputusan Penelitian BPDP',
      namaFile: 'laporan_kelayakan.pdf',
      dataUrl: p.kelayakan.signedUrl || p.kelayakan.draftUrl,
      mimeType: 'application/pdf',
      ukuranFormatted: '-',
      uploadedAt: '-',
    });
  }

  if (!addedTypes.has('SK_CPCL') && p.skCpcl?.signedUrl) {
    list.push({
      id: 'val-skcpcl',
      document_type: 'SK_CPCL',
      label: 'Surat Keputusan CPCL',
      namaFile: 'sk_cpcl.pdf',
      dataUrl: p.skCpcl.signedUrl,
      mimeType: 'application/pdf',
      ukuranFormatted: '-',
      uploadedAt: '-',
    });
  }

  return list;
});

/**
 * SK Dirut Document (Single Document, No Popup):
 */
const skDirutDocument = computed<SupportingDocItem | null>(() => {
  const p = proposal.value as any;
  if (!p) return null;

  // 1. proposal.documents
  if (p.documents && Array.isArray(p.documents)) {
    const doc = p.documents.find((d: any) => isSkDirutDocType(d.document_type || d.tipeDokumen || ''));
    if (doc) {
      const sizeNum = typeof doc.file_size === 'number' ? doc.file_size : parseInt(doc.file_size || '0', 10);
      const sizeStr = sizeNum ? `${(sizeNum / 1024).toFixed(0)} KB` : '-';
      return {
        id: doc.id || 'sk-dirut-doc',
        document_type: doc.document_type || 'SK_DIRUT',
        label: 'Surat Keputusan Direktur Utama BPDPKS',
        namaFile: doc.file_name || doc.namaFile || 'sk_dirut_signed.pdf',
        dataUrl: doc.file_url || doc.urlFile || '',
        mimeType: doc.mime_type || (doc.file_extension === 'png' ? 'image/png' : 'application/pdf'),
        ukuranFormatted: sizeStr,
        uploadedAt: doc.created_at || doc.uploadedAt || '-',
        noSk: p.no_sk_dirut || p.skDirut?.nomorSk || '',
      };
    }
  }

  // 2. proposal.dokumen
  if (p.dokumen && Array.isArray(p.dokumen)) {
    const doc = p.dokumen.find((d: any) => isSkDirutDocType(d.tipeDokumen || d.document_type || ''));
    if (doc) {
      const sizeStr = doc.ukuranBytes ? `${(doc.ukuranBytes / 1024).toFixed(0)} KB` : '-';
      return {
        id: doc.id || 'sk-dirut-dok',
        document_type: doc.tipeDokumen || 'SK_DIRUT',
        label: 'Surat Keputusan Direktur Utama BPDPKS',
        namaFile: doc.namaFile || doc.file_name || 'sk_dirut_signed.pdf',
        dataUrl: doc.urlFile || doc.file_url || '',
        mimeType: 'application/pdf',
        ukuranFormatted: sizeStr,
        uploadedAt: doc.uploadedAt || '-',
        noSk: p.no_sk_dirut || p.skDirut?.nomorSk || '',
      };
    }
  }

  // 3. Fallback proposal.skDirut
  if (p.skDirut?.signedUrl) {
    return {
      id: 'sk-dirut-fallback',
      document_type: 'SK_DIRUT',
      label: 'Surat Keputusan Direktur Utama BPDPKS',
      namaFile: 'sk_dirut_signed.pdf',
      dataUrl: p.skDirut.signedUrl,
      mimeType: 'application/pdf',
      ukuranFormatted: '-',
      uploadedAt: '-',
      noSk: p.no_sk_dirut || p.skDirut?.nomorSk || '',
    };
  }

  // 4. Fallback if no_sk_dirut is present but without direct document object
  if (p.no_sk_dirut) {
    return {
      id: 'sk-dirut-meta',
      document_type: 'SK_DIRUT',
      label: 'Surat Keputusan Direktur Utama BPDPKS',
      namaFile: 'sk_dirut_signed.pdf',
      dataUrl: '',
      mimeType: 'application/pdf',
      ukuranFormatted: '-',
      uploadedAt: '-',
      noSk: p.no_sk_dirut,
    };
  }

  return null;
});

/**
 * Supporting Documents:
 * Pemohon supporting documents (excluding Validator docs, SK Dirut, and RAB)
 */
const supportingDocuments = computed<SupportingDocItem[]>(() => {
  const p = proposal.value as any;
  if (!p) return [];
  const list: SupportingDocItem[] = [];

  // 1. Primary: proposal.documents
  if (p.documents && Array.isArray(p.documents) && p.documents.length > 0) {
    p.documents.forEach((doc: any, idx: number) => {
      const type = doc.document_type || doc.tipeDokumen || '';
      if (isValidatorDocType(type) || isSkDirutDocType(type) || isRabProposalDocType(type) || type === 'RAB_FINAL') {
        return;
      }

      const sizeNum = typeof doc.file_size === 'number' ? doc.file_size : parseInt(doc.file_size || '0', 10);
      const sizeStr = sizeNum ? `${(sizeNum / 1024).toFixed(0)} KB` : '-';

      list.push({
        id: doc.id || `doc-${idx}`,
        document_type: type,
        label: formatDocTypeLabel(type),
        namaFile: doc.file_name || doc.namaFile || `Dokumen_${idx + 1}.pdf`,
        dataUrl: doc.file_url || doc.urlFile || '',
        mimeType: doc.mime_type || (doc.file_extension === 'png' ? 'image/png' : 'application/pdf'),
        ukuranFormatted: sizeStr,
        uploadedAt: doc.created_at || doc.uploadedAt || '-',
      });
    });
  }

  // 2. Fallback: proposal.dokumen if list is empty
  if (list.length === 0 && p.dokumen && Array.isArray(p.dokumen)) {
    p.dokumen.forEach((doc: any, idx: number) => {
      const type = doc.tipeDokumen || doc.document_type || '';
      if (isValidatorDocType(type) || isSkDirutDocType(type) || isRabProposalDocType(type) || type === 'RAB_FINAL') {
        return;
      }

      const sizeStr = doc.ukuranBytes ? `${(doc.ukuranBytes / 1024).toFixed(0)} KB` : '-';
      list.push({
        id: doc.id || `dok-${idx}`,
        document_type: type,
        label: formatDocTypeLabel(type),
        namaFile: doc.namaFile || doc.file_name || `Dokumen_${idx + 1}.pdf`,
        dataUrl: doc.urlFile || doc.file_url || '',
        mimeType: 'application/pdf',
        ukuranFormatted: sizeStr,
        uploadedAt: doc.uploadedAt || '-',
      });
    });
  }

  return list;
});

function openSupportingDocPreview(doc: SupportingDocItem) {
  previewDoc.value = {
    title: `${doc.label} — ${doc.namaFile}`,
    dataUrl: doc.dataUrl,
    mimeType: doc.mimeType,
  };
  showDocPreview.value = true;
}

function openSkDirutPreview() {
  if (!skDirutDocument.value?.dataUrl) return;
  previewDoc.value = {
    title: `SK Direktur Utama — ${skDirutDocument.value.namaFile}`,
    dataUrl: skDirutDocument.value.dataUrl,
    mimeType: skDirutDocument.value.mimeType || 'application/pdf',
  };
  showDocPreview.value = true;
}

// ─── CPCL List & Detail Modal Sliding State ───────────────────────────────────
const pekebunStore = usePekebunStore();
const isCpclModalOpen = ref(false);
const currentCpclView = ref<'list' | 'detail'>('list');
const slideDirection = ref<'next' | 'prev'>('next');
const selectedCpcl = ref<DataCPCL | null>(null);
const cpclSearchQuery = ref('');
const activePekebunTab = ref<'identitas' | 'dokumen'>('identitas');

const cpclList = computed<DataCPCL[]>(() => {
  if (!proposal.value) return [];
  if (proposal.value.daftarCPCL && Array.isArray(proposal.value.daftarCPCL) && proposal.value.daftarCPCL.length > 0) {
    return proposal.value.daftarCPCL;
  }
  if ((proposal.value as any).pekebuns && Array.isArray((proposal.value as any).pekebuns)) {
    return (proposal.value as any).pekebuns.map((p: any) => ({
      id: String(p.id),
      namaPekebun: p.nama || p.name || p.namaPekebun || '',
      nik: p.nik || '',
      nomorKK: p.nomorKK || p.nomor_kk || '',
      luasLahanHektar: Number(p.luasLahan || p.luas_lahan || p.luasLahanHektar || 0),
      jenisHakLahan: p.jenisHakLahan || p.jenisLegalitas || 'SHM',
      nomorSuratLahan: p.nomorSuratLahan || p.nomorLegalitas || '-',
      coordinates: p.coordinates || p.lahan?.coordinates || [],
    }));
  }
  return [];
});

const totalLuasLahan = computed(() => {
  return cpclList.value.reduce((sum, item) => sum + (Number(item.luasLahanHektar) || 0), 0).toFixed(2);
});

const filteredCpclList = computed(() => {
  const q = cpclSearchQuery.value.toLowerCase().trim();
  if (!q) return cpclList.value;
  return cpclList.value.filter((item) => {
    const text = [item.namaPekebun, item.nik, item.nomorKK, item.jenisHakLahan, item.nomorSuratLahan]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return text.includes(q);
  });
});

const matchedPekebunDetail = computed<Pekebun | null>(() => {
  if (!selectedCpcl.value) return null;
  return pekebunStore.listPekebun.find((p) => p.nik === selectedCpcl.value?.nik) || null;
});

function openCpclModal() {
  cpclSearchQuery.value = '';
  currentCpclView.value = 'list';
  selectedCpcl.value = null;
  activePekebunTab.value = 'identitas';
  slideDirection.value = 'next';
  isCpclModalOpen.value = true;
}

function selectCpclForDetail(cpcl: DataCPCL) {
  slideDirection.value = 'next';
  selectedCpcl.value = cpcl;
  activePekebunTab.value = 'identitas';
  currentCpclView.value = 'detail';
}

function backToCpclList() {
  slideDirection.value = 'prev';
  currentCpclView.value = 'list';
}

function openPekebunDocPreview(doc: DokumenPekebun) {
  previewDoc.value = {
    title: `${doc.documentType.replace('_', ' ')} — ${doc.fileName}`,
    dataUrl: doc.fileUrl && doc.fileUrl !== '#' ? doc.fileUrl : '/templates/scan-ktp.png',
    mimeType: doc.fileExtension === 'png' || doc.fileExtension === 'jpg' ? 'image/png' : 'application/pdf',
  };
  showDocPreview.value = true;
}

// ─── Lahan List & Detail Modal Sliding State ─────────────────────────────────
const isLahanModalOpen = ref(false);
const currentLahanView = ref<'list' | 'detail'>('list');
const slideLahanDirection = ref<'next' | 'prev'>('next');
const selectedLahan = ref<ProposalLahanResponse | null>(null);
const lahanSearchQuery = ref('');
const activeLahanTab = ref<'detail' | 'peta' | 'dokumen'>('detail');

const lahanList = computed<ProposalLahanResponse[]>(() => {
  if (!proposal.value) return [];
  // 1. If proposal has lahans array directly
  if (proposal.value.lahans && Array.isArray(proposal.value.lahans) && proposal.value.lahans.length > 0) {
    return proposal.value.lahans;
  }
  // 2. Fallback: map from daftarCPCL / pekebuns
  if (proposal.value.daftarCPCL && Array.isArray(proposal.value.daftarCPCL) && proposal.value.daftarCPCL.length > 0) {
    return proposal.value.daftarCPCL.map((cpcl, idx) => ({
      id: Number(cpcl.id?.replace(/\D/g, '')) || idx + 1,
      pekebun_id: idx + 1,
      jenis_legalitas: cpcl.jenisHakLahan || 'SHM',
      nomor_legalitas: cpcl.nomorSuratLahan || `SHM-${idx + 101}`,
      tanggal_penerbitan_legalitas: '2021-01-01',
      luas_lahan: Number(cpcl.luasLahanHektar) || 0,
      kode_provinsi: proposal.value?.lembaga?.provinsiKode || '73',
      kode_kabupaten: proposal.value?.lembaga?.kabupatenKode || '7322',
      kode_kecamatan: '732201',
      kode_desa: '73220101',
      alamat_kebun: proposal.value?.lembaga?.alamatLengkap || 'Desa Perkebunan',
      tahun_tanam: 2021,
      jenis_bibit: 'Kelapa Dalam Varietas Unggul',
      nomor_surat_beda_nama: null,
      coordinates: (cpcl.coordinates || []).map((c) => ({ lat: Number(c.lat) || 0, lng: Number(c.lng) || 0 })),
      documents: [
        {
          id: 100 + idx,
          document_type: 'LEGALITAS_LAHAN',
          file_name: `dokumen_lahan_${cpcl.nomorSuratLahan || idx + 1}.pdf`,
          file_url: '/templates/stdb-template.pdf',
          file_size: '2048000',
          file_extension: 'pdf',
          mime_type: 'application/pdf',
          created_at: '2026-07-28T10:00:00Z',
        },
      ],
      created_at: '2026-07-28T10:00:00Z',
      updated_at: '2026-07-28T10:00:00Z',
    }));
  }
  return [];
});

const totalLuasLahanPengajuan = computed(() => {
  return lahanList.value.reduce((sum, item) => sum + (Number(item.luas_lahan) || 0), 0).toFixed(2);
});

function getPekebunOwnerName(pekebunId: number | string): string {
  if (!proposal.value) return '-';
  if (proposal.value.daftarCPCL && Array.isArray(proposal.value.daftarCPCL)) {
    const cpcl = proposal.value.daftarCPCL.find((c, idx) => c.id === String(pekebunId) || idx + 1 === Number(pekebunId));
    if (cpcl) return cpcl.namaPekebun;
  }
  if (proposal.value.pekebuns && Array.isArray(proposal.value.pekebuns)) {
    const p = proposal.value.pekebuns.find((item: any, idx) => item.id === pekebunId || idx + 1 === Number(pekebunId));
    if (p) return p.name || p.nama || p.namaPekebun;
  }
  return `Pekebun ID #${pekebunId}`;
}

const filteredLahanList = computed(() => {
  const q = lahanSearchQuery.value.toLowerCase().trim();
  if (!q) return lahanList.value;
  return lahanList.value.filter((item) => {
    const owner = getPekebunOwnerName(item.pekebun_id);
    const text = [item.nomor_legalitas, item.jenis_legalitas, item.alamat_kebun, item.jenis_bibit, String(item.tahun_tanam), owner]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return text.includes(q);
  });
});

function openLahanModal() {
  lahanSearchQuery.value = '';
  currentLahanView.value = 'list';
  selectedLahan.value = null;
  activeLahanTab.value = 'detail';
  slideLahanDirection.value = 'next';
  isLahanModalOpen.value = true;
}

function selectLahanForDetail(lahan: ProposalLahanResponse) {
  slideLahanDirection.value = 'next';
  selectedLahan.value = lahan;
  activeLahanTab.value = 'detail';
  currentLahanView.value = 'detail';
}

function backToLahanList() {
  slideLahanDirection.value = 'prev';
  currentLahanView.value = 'list';
}

function openLahanDocPreview(doc: ProposalLahanDocumentResponse) {
  previewDoc.value = {
    title: `${formatDocTypeLabel(doc.document_type)} — ${doc.file_name}`,
    dataUrl: doc.file_url && doc.file_url !== '#' ? doc.file_url : '/templates/stdb-template.pdf',
    mimeType: doc.mime_type || (doc.file_extension === 'png' ? 'image/png' : 'application/pdf'),
  };
  showDocPreview.value = true;
}

const parsedRejections = computed(() => {
  const notes = proposal.value?.catatanDinas || (proposal.value as any)?.catatan || (proposal.value as any)?.notes || '';
  return parseRejectionNotes(notes);
});

const pekebunRejections = computed(() => parsedRejections.value.filter((r) => r.category === 'PEKEBUN'));
const proposalRejections = computed(() => parsedRejections.value.filter((r) => r.category === 'PROPOSAL_DOC' || r.category === 'GUDANG' || r.category === 'RAB'));
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <!-- HEADER -->
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-sm border border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex flex-col gap-1.5 flex-1 min-w-0">
        <Breadcrumb :items="breadcrumbs" />

        <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 font-apple-display-md leading-tight break-words">
          <template v-if="proposal"> Detail Usulan: {{ proposal.lembaga?.namaLembaga || 'Kelembagaan' }} </template>
          <template v-else> Detail Usulan Proposal </template>
        </h1>

        <p class="text-xs text-slate-500 font-apple-caption truncate">
          Nomor Proposal:
          <span class="font-semibold text-slate-700 dark:text-slate-300">{{ proposalNomor }}</span>
        </p>
      </div>

      <div class="flex shrink-0">
        <Button variant="secondary" size="sm" @click="router.push('/pengusulan/pengajuan-proposal')"> &larr; Kembali ke Daftar </Button>
      </div>
    </header>

    <!-- LOADING STATE -->
    <div v-if="pageLoading" class="flex flex-col gap-5">
      <Skeleton class="h-64 w-full rounded-2xl" />
      <Skeleton class="h-80 w-full rounded-2xl" />
    </div>

    <!-- PROPOSAL DETAIL CONTENT -->
    <template v-else-if="proposal">
      <!-- 1. WHITE CONTAINER: PROPOSAL OVERVIEW & TIMELINE -->
      <Card custom-class="shadow-sm">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div>
            <div class="flex gap-2 items-center">
              <span class="text-xs font-semibold text-slate-400">
                {{ proposal.id }}
              </span>
              <Badge :variant="getStatusBadgeVariant(proposal.status || proposal.currentStatus)">
                {{ getStatusLabel(proposal.status || proposal.currentStatus) }}
              </Badge>
            </div>

            <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100 font-apple-body-strong mt-1">
              {{ proposal.lembaga?.namaLembaga || 'Kelembagaan' }}
            </h3>

            <p class="text-xs text-slate-500 font-apple-caption mt-0.5">
              Nomor Proposal:
              <strong class="text-slate-800 dark:text-slate-200 font-semibold">
                {{ proposal.nomor_proposal || proposal.nomorProposal }}
              </strong>
            </p>
          </div>

          <div class="text-left md:text-right">
            <p class="text-xs text-slate-400 font-apple-caption">Estimasi Total Anggaran</p>
            <p class="text-lg font-bold text-[#066C2A]">Rp {{ (proposal.total_anggaran ?? proposal.totalAnggaranPengajuan ?? 0).toLocaleString('id-ID') }}</p>
          </div>
        </div>

        <!-- CONTEXTUAL REJECTION BANNER FOR REV_FROM_KAB -->
        <div v-if="(proposal.status === 'REV_FROM_KAB' || proposal.currentStatus === 'REV_FROM_KAB') && parsedRejections.length > 0" class="mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl p-4 flex flex-col gap-3">
          <div class="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-bold text-xs">
            <AlertTriangle class="w-4 h-4 text-rose-600 shrink-0" />
            <span>Catatan Perbaikan Dari Verifikator Kabupaten:</span>
          </div>

          <!-- Proposal Document Rejections Section -->
          <div v-if="proposalRejections.length > 0" class="flex flex-col gap-1.5 pl-2 md:pl-6">
            <span class="text-[11px] font-semibold text-rose-900 dark:text-rose-100">Berkas Proposal & Gudang:</span>
            <ul class="list-disc list-inside text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <li v-for="(rej, idx) in proposalRejections" :key="'prop-rej-' + idx">
                <strong class="font-semibold text-rose-900 dark:text-rose-100">{{ rej.itemLabel }}:</strong> {{ rej.notes }}
              </li>
            </ul>
          </div>

          <!-- Pekebun Rejections Section -->
          <div v-if="pekebunRejections.length > 0" class="flex flex-col gap-1.5 pl-2 md:pl-6">
            <span class="text-[11px] font-semibold text-rose-900 dark:text-rose-100">Berkas Pekebun & Lahan:</span>
            <ul class="list-disc list-inside text-xs text-rose-700 dark:text-rose-300 space-y-1">
              <li v-for="(rej, idx) in pekebunRejections" :key="'pek-rej-' + idx">
                <strong class="font-semibold text-rose-900 dark:text-rose-100">{{ rej.farmerName || 'Pekebun' }} ({{ rej.itemLabel }}):</strong> {{ rej.notes }}
              </li>
            </ul>
          </div>

          <div class="pt-2 border-t border-rose-200/60 dark:border-rose-800/40 flex justify-end">
            <button
              v-if="proposal.status === 'REV_FROM_KAB' || proposal.currentStatus === 'REV_FROM_KAB'"
              @click="router.push(`/pemohon/revisi-proposal/${proposal.id}`)"
              class="px-4 py-2 text-xs font-bold bg-amber-600 text-white rounded-xl hover:bg-amber-700 flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <FileText class="w-4 h-4" /> Perbaiki Dokumen Proposal
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <span class="text-xs text-slate-400 font-apple-caption"> Paket Sarpras Usulan </span>
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
                {{ getJenisSarprasLabel(proposal.paket_sarpras || proposal.jenisSarpras) }}
              </p>
            </div>
            <p class="text-xs text-slate-500 mt-0.5 line-clamp-2">
              {{ proposal.detail_usulan || proposal.detailUsulan || '-' }}
            </p>
          </div>

          <!-- 2. Daftar CPCL Pekebun Card (Clickable & Hoverable) -->
          <div
            @click="openCpclModal"
            class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer group hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-sm hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-400 font-apple-caption"> Daftar CPCL Pekebun </span>
                <span class="text-[10px] text-[#066C2A] font-bold opacity-80 group-hover:opacity-100 group-hover:underline transition-opacity">
                  Lihat Daftar &rarr;
                </span>
              </div>
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                <Users class="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{{ cpclList.length }} Pekebun Terdaftar</span>
              </p>
            </div>
            <p class="text-[10px] text-slate-400 mt-1">Total Luas: {{ totalLuasLahan }} Ha &bull; Klik untuk melihat</p>
          </div>

          <!-- 3. Pengajuan Lahan Card (Clickable & Hoverable) -->
          <div
            @click="openLahanModal"
            class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer group hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-sm hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-400 font-apple-caption"> Pengajuan Lahan </span>
                <span class="text-[10px] text-[#066C2A] font-bold opacity-80 group-hover:opacity-100 group-hover:underline transition-opacity">
                  Lihat Lahan &rarr;
                </span>
              </div>
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                <MapPin class="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{{ lahanList.length }} Lahan Diajukan</span>
              </p>
            </div>
            <p class="text-[10px] text-slate-400 mt-1">Total Luas: {{ totalLuasLahanPengajuan }} Ha &bull; Klik untuk melihat</p>
          </div>

          <!-- 4. Dokumen Pendukung Card (Clickable & Hoverable) -->
          <div
            @click="isSupportingDocsModalOpen = true"
            class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer group hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-sm hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-400 font-apple-caption"> Dokumen Pendukung </span>
                <span class="text-[10px] text-[#066C2A] font-bold opacity-80 group-hover:opacity-100 group-hover:underline transition-opacity">
                  Lihat Berkas &rarr;
                </span>
              </div>
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                <FileText class="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{{ supportingDocuments.length }} File Terlampir</span>
              </p>
            </div>
            <p class="text-[10px] text-slate-400 mt-1">Berkas persyaratan pemohon &bull; Klik untuk melihat</p>
          </div>

          <!-- 5. Dokumen Validator Card (Clickable & Hoverable) -->
          <div
            @click="isValidatorDocsModalOpen = true"
            class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 cursor-pointer group hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-sm hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-400 font-apple-caption"> Dokumen Validator </span>
                <span class="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold opacity-80 group-hover:opacity-100 group-hover:underline transition-opacity">
                  Lihat Berkas &rarr;
                </span>
              </div>
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 flex items-center gap-1.5">
                <FileCheck class="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{{ validatorDocuments.length }} Berkas Validator</span>
              </p>
            </div>
            <p class="text-[10px] text-slate-400 mt-1">BA, SK CPCL, Rekomtek, Kelayakan &bull; Klik melihat</p>
          </div>

          <!-- 6. SK Dirut Card (Direct Card - NO POPUP) -->
          <div
            :class="[
              'p-3 rounded-xl border flex flex-col justify-between transition-all duration-200',
              skDirutDocument?.dataUrl || (proposal as any).no_sk_dirut
                ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-250 dark:border-emerald-800'
                : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800'
            ]"
          >
            <div>
              <div class="flex items-center justify-between">
                <span class="text-xs text-slate-500 dark:text-slate-400 font-apple-caption font-semibold"> SK Dirut </span>
                <span
                  v-if="skDirutDocument?.dataUrl || (proposal as any).no_sk_dirut"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-[#066C2A] dark:text-emerald-300"
                >
                  Telah Terbit
                </span>
                <span
                  v-else
                  class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                >
                  Belum Terbit
                </span>
              </div>

              <div v-if="skDirutDocument?.dataUrl || (proposal as any).no_sk_dirut" class="mt-1">
                <p class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {{ (proposal as any).no_sk_dirut || skDirutDocument?.noSk || 'SK Direktur Utama BPDP' }}
                </p>
                <p v-if="skDirutDocument?.namaFile" class="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate mt-0.5">
                  {{ skDirutDocument.namaFile }}
                </p>
              </div>
              <div v-else class="mt-1">
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Menunggu penerbitan SK Direktur Utama BPDP
                </p>
              </div>
            </div>

            <div v-if="skDirutDocument?.dataUrl" class="pt-2 flex items-center gap-2 border-t border-emerald-200/60 dark:border-emerald-800/60 mt-2">
              <button
                type="button"
                class="flex-1 h-7 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-[#066C2A] dark:text-emerald-400 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950 flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                @click="openSkDirutPreview"
              >
                <Eye class="w-3.5 h-3.5" />
                <span>Pratinjau</span>
              </button>
              <a
                :href="skDirutDocument.dataUrl"
                download
                class="h-7 px-2.5 rounded-lg text-xs font-semibold bg-[#066C2A] text-white hover:bg-emerald-800 flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
              >
                <Download class="w-3.5 h-3.5" />
                <span>Unduh</span>
              </a>
            </div>
            <p v-else class="text-[10px] text-slate-400 mt-2">
              {{ (proposal as any).no_sk_dirut ? `Nomor: ${(proposal as any).no_sk_dirut}` : 'Penerbitan final oleh BPDPKS' }}
            </p>
          </div>
        </div>

        <!-- Workflow Progress Timeline (Connected Stepper) -->
        <div class="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <h4 class="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-5">Progres Pengusulan (Workflow Progress)</h4>

          <div class="relative flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-4 w-full px-2">
            <!-- Steps -->
            <div v-for="(step, index) in computedSteps" :key="step.id" class="flex flex-row md:flex-col items-center md:items-center gap-4 md:gap-3 flex-1 relative z-10 w-full md:w-auto">
              <!-- Circle Indicator -->
              <div
                :class="[
                  'w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 transition-all duration-300 border-2 relative z-10',
                  step.isCompleted
                    ? 'bg-[#066C2A] border-[#066C2A] text-white shadow-sm shadow-[#066C2A]/20'
                    : step.isActive
                      ? 'bg-white dark:bg-slate-900 border-[#066C2A] text-[#066C2A] ring-4 ring-emerald-50 dark:ring-emerald-950/50'
                      : step.isWarning
                        ? 'bg-amber-500 border-amber-500 text-white ring-4 ring-amber-50 dark:ring-amber-950/30'
                        : step.isError
                          ? 'bg-rose-500 border-rose-500 text-white ring-4 ring-rose-50 dark:ring-rose-950/30'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500',
                ]"
              >
                <!-- Completed: Check Icon -->
                <Check v-if="step.isCompleted" class="w-4 h-4 text-white" />
                <!-- Warning: AlertTriangle Icon -->
                <AlertTriangle v-else-if="step.isWarning" class="w-4 h-4 text-white animate-pulse" />
                <!-- Error: AlertTriangle Icon -->
                <AlertTriangle v-else-if="step.isError" class="w-4 h-4 text-white" />
                <!-- Active or Pending: Step Number -->
                <span v-else>{{ step.id }}</span>
              </div>

              <!-- Connecting Line (Desktop: Horizontal) -->
              <div v-if="index < computedSteps.length - 1" class="hidden md:block absolute top-[18px] left-1/2 w-full h-[2px] bg-slate-100 dark:bg-slate-800 -z-0">
                <div class="h-full bg-[#066C2A] transition-all duration-500" :style="{ width: computedSteps[index + 1].isCompleted ? '100%' : '0%' }"></div>
              </div>

              <!-- Connecting line for Mobile (vertical) -->
              <div v-if="index < computedSteps.length - 1" class="md:hidden absolute left-[18px] top-9 bottom-[-32px] w-[2px] bg-slate-100 dark:bg-slate-800 -z-0">
                <div class="w-full bg-[#066C2A] transition-all duration-500" :style="{ height: computedSteps[index + 1].isCompleted ? '100%' : '0%' }"></div>
              </div>

              <!-- Text labels -->
              <div class="flex flex-col md:items-center text-left md:text-center min-w-0 max-w-[140px] md:max-w-[160px]">
                <span
                  :class="[
                    'text-xs md:text-xs font-semibold transition-colors duration-300 leading-snug break-words text-left md:text-center',
                    step.isCompleted
                      ? 'text-slate-800 dark:text-slate-200 font-medium'
                      : step.isActive
                        ? 'text-[#066C2A] font-bold'
                        : step.isWarning
                          ? 'text-amber-600 dark:text-amber-500 font-bold'
                          : step.isError
                            ? 'text-rose-600 dark:text-rose-500 font-bold'
                            : 'text-slate-400 dark:text-slate-500 font-medium',
                  ]"
                >
                  {{ step.label }}
                </span>
                <!-- Badge description -->
                <span v-if="step.isActive" class="text-[9px] text-[#066C2A] font-semibold tracking-wider uppercase mt-0.5 animate-pulse">
                  {{ LOCALIZATION.stepStatus.active }}
                </span>
                <span v-else-if="step.isWarning" class="text-[9px] text-amber-600 dark:text-amber-500 font-semibold tracking-wider uppercase mt-0.5">
                  {{ LOCALIZATION.stepStatus.warning }}
                </span>
                <span v-else-if="step.isError" class="text-[9px] text-rose-600 dark:text-rose-500 font-semibold tracking-wider uppercase mt-0.5">
                  {{ LOCALIZATION.stepStatus.error }}
                </span>
                <span v-else-if="step.isCompleted" class="text-[9px] text-[#066C2A] font-semibold tracking-wider uppercase mt-0.5">
                  {{ LOCALIZATION.stepStatus.completed }}
                </span>
                <span v-else class="text-[9px] text-slate-400 dark:text-slate-600 font-semibold tracking-wider uppercase mt-0.5">
                  {{ LOCALIZATION.stepStatus.pending }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
      <!-- AUDIT TIMELINE -->
      <ProposalAuditTimeline :proposal-id="proposalId" class="mt-2 mb-2" />

      <!-- 2. RAB SECTION BELOW PROPOSAL DETAIL CONTAINER -->
      <section class="flex flex-col gap-4">
        <!-- Tab Switcher (if RAB tabs available) -->
        <div v-if="rabTabs.length > 0" class="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <!-- TABS -->
          <div class="flex items-center gap-2 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 w-fit">
            <button
              v-for="tab in rabTabs"
              :key="tab.key"
              type="button"
              @click="activeTabKey = tab.key"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all duration-200',
                activeTabKey === tab.key
                  ? 'bg-white dark:bg-slate-900 text-[#066C2A] shadow-sm font-bold border border-slate-200/60 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/50',
              ]"
            >
              <FileSpreadsheet class="w-3.5 h-3.5" :class="activeTabKey === tab.key ? 'text-[#066C2A]' : 'text-slate-400'" />
              <span>{{ tab.label }}</span>
              <span
                :class="[
                  'px-2 py-0.5 text-[10px] rounded-full font-mono font-medium',
                  activeTabKey === tab.key ? 'bg-emerald-50 dark:bg-emerald-950/60 text-[#066C2A]' : 'bg-slate-200/70 dark:bg-slate-700 text-slate-600 dark:text-slate-400',
                ]"
              >
                {{ tab.items.length }} Item
              </span>
            </button>
          </div>

          <!-- Total Info for active tab -->
          <div v-if="activeRabTab" class="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-white/90 dark:bg-slate-900/90 px-3 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800">
            <Calculator class="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Total Anggaran ({{ activeRabTab.label }}):</span>
            <strong class="font-mono text-sm text-[#066C2A]"> Rp {{ activeRabTab.totalAmount.toLocaleString('id-ID') }} </strong>
          </div>
        </div>

        <!-- RAB TABLE CARD -->
        <Card v-if="activeRabTab" custom-class="shadow-sm">
          <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-4">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-[#066C2A]">
                <Layers class="w-4 h-4" />
              </div>
              <div>
                <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100">Rencana Anggaran Biaya — {{ activeRabTab.label }}</h3>
                <p class="text-[11px] text-slate-400">Rincian komponen biaya dan kebutuhan barang/jasa usulan sarpras kelapa</p>
              </div>
            </div>

            <!-- PREVIEW BUTTON REPLACING BADGE -->
            <Button v-if="activeRabDocument" variant="outline" size="sm" class="text-xs flex items-center gap-1.5 text-[#066C2A] border-[#066C2A]/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/50" @click="openRabDocPreview">
              <Eye class="w-3.5 h-3.5" />
              <span>Pratinjau Dokumen RAB</span>
            </Button>
            <span v-else class="text-[11px] text-slate-400 italic"> Dokumen {{ activeTabKey === 'FINAL' ? 'RAB Final' : 'RAB Pengajuan' }} belum diunggah </span>
          </div>

          <!-- TABLE -->
          <div class="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
            <table class="w-full text-left text-xs text-slate-700 dark:text-slate-300">
              <thead class="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-800 text-[11px]">
                <tr>
                  <th class="p-3 w-12 text-center">No</th>
                  <th class="p-3 text-left">Jenis</th>
                  <th class="p-3 text-left">Uraian Kebutuhan</th>
                  <th class="p-3 text-left">Varietas</th>

                  <!-- 4 Tahap (Intensifikasi) -->
                  <template v-if="rabTahapCount === 4">
                    <th class="p-3 text-left">Tahap 1</th>
                    <th class="p-3 text-left">Tahap 2</th>
                    <th class="p-3 text-left">Tahap 3</th>
                    <th class="p-3 text-left">Tahap 4</th>
                    <th class="p-3 text-left">Jumlah Total</th>
                  </template>

                  <!-- 2 Tahap (Ekstensifikasi) -->
                  <template v-else-if="rabTahapCount === 2">
                    <th class="p-3 text-left">Tahap 1</th>
                    <th class="p-3 text-left">Tahap 2</th>
                    <th class="p-3 text-left">Jumlah Total</th>
                  </template>

                  <!-- 1 Tahap (Lainnya) -->
                  <template v-else>
                    <th class="p-3 text-left">Tahap 1</th>
                  </template>

                  <th class="p-3 text-left">Satuan</th>
                  <th class="p-3 text-left">Harga Satuan</th>
                  <th class="p-3 text-left">Sub Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr v-for="(item, idx) in activeRabTab.items" :key="item.id || idx" class="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td class="p-3 text-center font-mono text-slate-400">{{ idx + 1 }}</td>
                  
                  <!-- Jenis from details -->
                  <td class="p-3 text-left font-medium text-slate-800 dark:text-slate-200">
                    <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-[11px]">
                      {{ item.details?.jenis || item.jenis || '-' }}
                    </span>
                  </td>

                  <!-- Uraian Kebutuhan -->
                  <td class="p-3 text-left font-medium text-slate-900 dark:text-slate-100">
                    <div>{{ item.uraian }}</div>
                    <div v-if="item.item_type" class="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Tipe: {{ item.item_type }}</div>
                  </td>

                  <!-- Varietas -->
                  <td class="p-3 text-left font-medium text-slate-800 dark:text-slate-200">
                    <span v-if="(item.varietas || item.details?.varietas) === 'Kelapa Varietas Lainnya'">
                      {{ item.varietas || item.details?.varietas }}
                      <span v-if="item.varietasCustom || item.details?.varietasCustom || item.details?.varietas_custom" class="text-slate-500 font-normal">
                        ({{ item.varietasCustom || item.details?.varietasCustom || item.details?.varietas_custom }})
                      </span>
                    </span>
                    <span v-else>
                      {{ item.varietas || item.details?.varietas || '-' }}
                    </span>
                  </td>

                  <!-- 4 Tahap Breakdown -->
                  <template v-if="rabTahapCount === 4">
                    <td class="p-3 text-left font-mono text-slate-600 dark:text-slate-300">{{ (item.details?.jumlahTahap1 ?? item.jumlahTahap1 ?? 0).toLocaleString('id-ID') }}</td>
                    <td class="p-3 text-left font-mono text-slate-600 dark:text-slate-300">{{ (item.details?.jumlahTahap2 ?? item.jumlahTahap2 ?? 0).toLocaleString('id-ID') }}</td>
                    <td class="p-3 text-left font-mono text-slate-600 dark:text-slate-300">{{ (item.details?.jumlahTahap3 ?? item.jumlahTahap3 ?? 0).toLocaleString('id-ID') }}</td>
                    <td class="p-3 text-left font-mono text-slate-600 dark:text-slate-300">{{ (item.details?.jumlahTahap4 ?? item.jumlahTahap4 ?? 0).toLocaleString('id-ID') }}</td>
                    <td class="p-3 text-left font-mono font-bold text-slate-900 dark:text-slate-100">
                      {{ (item.volume ?? item.jumlahTotal ?? 0).toLocaleString('id-ID') }}
                    </td>
                  </template>

                  <!-- 2 Tahap Breakdown -->
                  <template v-else-if="rabTahapCount === 2">
                    <td class="p-3 text-left font-mono text-slate-600 dark:text-slate-300">{{ (item.details?.jumlahTahap1 ?? item.jumlahTahap1 ?? 0).toLocaleString('id-ID') }}</td>
                    <td class="p-3 text-left font-mono text-slate-600 dark:text-slate-300">{{ (item.details?.jumlahTahap2 ?? item.jumlahTahap2 ?? 0).toLocaleString('id-ID') }}</td>
                    <td class="p-3 text-left font-mono font-bold text-slate-900 dark:text-slate-100">
                      {{ (item.volume ?? item.jumlahTotal ?? 0).toLocaleString('id-ID') }}
                    </td>
                  </template>

                  <!-- 1 Tahap (Tahap 1) -->
                  <template v-else>
                    <td class="p-3 text-left font-mono font-medium">
                      {{ (item.volume ?? item.details?.jumlahTahap1 ?? item.jumlahTotal ?? 0).toLocaleString('id-ID') }}
                    </td>
                  </template>

                  <!-- Satuan -->
                  <td class="p-3 text-left">
                    <span class="px-2 py-0.5 rounded bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-400 font-mono">
                      {{ item.satuan || item.unit || '-' }}
                    </span>
                  </td>

                  <!-- Harga Satuan -->
                  <td class="p-3 text-left font-mono text-slate-600 dark:text-slate-400">Rp {{ (item.price_per_unit ?? item.hargaSatuan ?? 0).toLocaleString('id-ID') }}</td>

                  <!-- Sub Total -->
                  <td class="p-3 text-left font-mono text-[#066C2A] font-semibold">Rp {{ (item.total_price ?? item.subTotal ?? (item.volume || 0) * (item.price_per_unit || 0)).toLocaleString('id-ID') }}</td>
                </tr>
              </tbody>
              <tfoot class="bg-emerald-50/60 dark:bg-emerald-950/40 border-t-2 border-emerald-200 dark:border-emerald-900">
                <tr class="font-bold">
                  <td :colspan="rabTahapCount === 4 ? 11 : rabTahapCount === 2 ? 9 : 7" class="p-3 text-right text-slate-800 dark:text-slate-200 text-xs">Total {{ activeRabTab.label }}:</td>
                  <td class="p-3 text-left font-mono text-sm text-[#066C2A]">Rp {{ activeRabTab.totalAmount.toLocaleString('id-ID') }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        <!-- EMPTY STATE (NO RAB DATA FOUND) -->
        <Card v-else custom-class="shadow-sm">
          <div class="py-12 px-4 text-center">
            <FileSpreadsheet class="mx-auto w-10 h-10 text-slate-300 dark:text-slate-600 mb-3" />
            <h4 class="text-sm font-semibold text-slate-800 dark:text-slate-200">Belum Ada Rencana Anggaran Biaya (RAB)</h4>
            <p class="text-xs text-slate-400 mt-1 max-w-md mx-auto">Proposal ini belum memiliki data rincian RAB yang tersimpan.</p>
          </div>
        </Card>
      </section>
    </template>

    <!-- NOT FOUND STATE -->
    <Card v-else custom-class="shadow-sm">
      <div class="py-16 px-4 text-center">
        <AlertTriangle class="mx-auto w-12 h-12 text-amber-400 mb-3" />
        <h3 class="text-base font-bold text-slate-800 dark:text-slate-200">Proposal Tidak Ditemukan</h3>
        <p class="text-xs text-slate-400 mt-1">Data proposal dengan ID tersebut tidak tersedia atau telah dihapus.</p>
        <Button variant="primary" size="sm" class="mt-4" @click="router.push('/pengusulan/pengajuan-proposal')"> Kembali ke Daftar Proposal </Button>
      </div>
    </Card>

    <!-- SUPPORTING DOCUMENTS LIST MODAL -->
    <Modal
      :isOpen="isSupportingDocsModalOpen"
      title="Dokumen Pendukung Proposal"
      size="lg"
      @close="isSupportingDocsModalOpen = false"
    >
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Daftar berkas persyaratan terlampir (di luar dokumen RAB):
          </p>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-[#066C2A]">
            {{ supportingDocuments.length }} Dokumen
          </span>
        </div>

        <div v-if="supportingDocuments.length > 0" class="max-h-[60vh] overflow-y-auto pr-1 flex flex-col gap-2.5">
          <div
            v-for="(doc, idx) in supportingDocuments"
            :key="doc.id || idx"
            class="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all gap-3"
          >
            <div class="flex items-start gap-3 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
                <FileText class="w-4 h-4" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {{ doc.label }}
                </span>
                <span class="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  {{ doc.namaFile }}
                </span>
                <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span>Ukuran: {{ doc.ukuranFormatted }}</span>
                  <span>•</span>
                  <span>Diunggah: {{ doc.uploadedAt }}</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              class="text-xs shrink-0 flex items-center gap-1.5 text-[#066C2A] border-[#066C2A]/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
              @click="openSupportingDocPreview(doc)"
            >
              <Eye class="w-3.5 h-3.5" />
              <span>Pratinjau</span>
            </Button>
          </div>
        </div>

        <div v-else class="py-8 text-center text-xs text-slate-400">
          Tidak ada dokumen pendukung selain RAB pada proposal ini.
        </div>
      </div>

      <template #footer>
        <Button variant="secondary" size="sm" @click="isSupportingDocsModalOpen = false">
          Tutup
        </Button>
      </template>
    </Modal>

    <!-- VALIDATOR DOCUMENTS LIST MODAL -->
    <Modal
      :isOpen="isValidatorDocsModalOpen"
      title="Dokumen Validator Proposal"
      size="lg"
      @close="isValidatorDocsModalOpen = false"
    >
      <div class="flex flex-col gap-3">
        <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Daftar berkas hasil verifikasi dinas, rekomendasi teknis, dan keputusan kelayakan:
          </p>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
            {{ validatorDocuments.length }} Dokumen
          </span>
        </div>

        <div v-if="validatorDocuments.length > 0" class="max-h-[60vh] overflow-y-auto pr-1 flex flex-col gap-2.5">
          <div
            v-for="(doc, idx) in validatorDocuments"
            :key="doc.id || idx"
            class="flex items-center justify-between p-3 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/60 hover:border-indigo-300 dark:hover:border-indigo-600 transition-all gap-3"
          >
            <div class="flex items-start gap-3 min-w-0">
              <div class="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                <FileCheck class="w-4 h-4" />
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {{ doc.label }}
                </span>
                <span class="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                  {{ doc.namaFile }}
                </span>
                <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                  <span>Ukuran: {{ doc.ukuranFormatted }}</span>
                  <span>•</span>
                  <span>Diunggah: {{ doc.uploadedAt }}</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              class="text-xs shrink-0 flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
              @click="openSupportingDocPreview(doc)"
            >
              <Eye class="w-3.5 h-3.5" />
              <span>Pratinjau</span>
            </Button>
          </div>
        </div>

        <div v-else class="py-8 text-center text-xs text-slate-400">
          Belum ada dokumen validator yang diunggah untuk proposal ini.
        </div>
      </div>

      <template #footer>
        <Button variant="secondary" size="sm" @click="isValidatorDocsModalOpen = false">
          Tutup
        </Button>
      </template>
    </Modal>

    <!-- DAFTAR CPCL PEKEBUN (LIST & SLIDING DETAIL MODAL) -->
    <Modal
      :isOpen="isCpclModalOpen"
      :title="currentCpclView === 'list' ? 'Daftar CPCL Pekebun Proposal' : `Detail Pekebun — ${selectedCpcl?.namaPekebun || ''}`"
      size="xl"
      @close="isCpclModalOpen = false"
    >
      <div class="relative min-h-[480px]">
        <Transition :name="slideDirection === 'next' ? 'slide-next' : 'slide-prev'" mode="out-in">
          <!-- VIEW 1: LIST OF PEKEBUN (CARDS) -->
          <div v-if="currentCpclView === 'list'" key="cpcl-list" class="flex flex-col gap-4">
            <!-- Summary Header Banner -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/60">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#066C2A] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                  <Users class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {{ proposal?.lembaga?.namaLembaga || 'Kelembagaan Pekebun' }}
                  </h4>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    Total Calon Petani & Calon Lokasi (CPCL) yang diajukan
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-4 text-xs font-semibold">
                <div class="flex flex-col items-start sm:items-end">
                  <span class="text-[10px] text-slate-400 font-normal uppercase">Jumlah Pekebun</span>
                  <span class="text-slate-800 dark:text-slate-200 font-bold">{{ cpclList.length }} Orang</span>
                </div>
                <div class="h-6 w-px bg-emerald-200 dark:bg-emerald-800"></div>
                <div class="flex flex-col items-start sm:items-end">
                  <span class="text-[10px] text-slate-400 font-normal uppercase">Total Luas Lahan</span>
                  <span class="text-[#066C2A] font-bold">{{ totalLuasLahan }} Hektar</span>
                </div>
              </div>
            </div>

            <!-- Search Bar -->
            <div class="relative">
              <Search class="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                v-model="cpclSearchQuery"
                type="text"
                placeholder="Cari nama pekebun, NIK, nomor surat lahan..."
                class="w-full h-9 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A]"
              />
            </div>

            <!-- List Grid of Pekebun Cards -->
            <div v-if="filteredCpclList.length > 0" class="max-h-[52vh] overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                v-for="(cpcl, idx) in filteredCpclList"
                :key="cpcl.id || idx"
                @click="selectCpclForDetail(cpcl)"
                class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3 group"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-[#066C2A] dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60 group-hover:bg-[#066C2A] group-hover:text-white transition-colors">
                      {{ cpcl.namaPekebun.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'P' }}
                    </div>
                    <div class="flex flex-col min-w-0">
                      <h4 class="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#066C2A] transition-colors">
                        {{ cpcl.namaPekebun }}
                      </h4>
                      <span class="text-[11px] text-slate-500 font-mono">
                        NIK: {{ cpcl.nik }}
                      </span>
                    </div>
                  </div>
                  <Badge variant="success" customClass="shrink-0 text-[10px] font-bold font-mono">
                    {{ cpcl.luasLahanHektar }} Ha
                  </Badge>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div>
                    <span class="text-[9px] text-slate-400 uppercase font-semibold">No. KK</span>
                    <p class="font-mono text-slate-700 dark:text-slate-300 truncate text-[11px]">{{ cpcl.nomorKK || '-' }}</p>
                  </div>
                  <div>
                    <span class="text-[9px] text-slate-400 uppercase font-semibold">Hak Lahan</span>
                    <p class="font-medium text-slate-700 dark:text-slate-300 truncate text-[11px]">
                      {{ cpcl.jenisHakLahan }} &bull; {{ cpcl.nomorSuratLahan || '-' }}
                    </p>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500">
                  <span class="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin class="w-3 h-3 text-emerald-600" />
                    {{ (cpcl.coordinates && cpcl.coordinates.length) ? `${cpcl.coordinates.length} Titik Poligon` : 'Peta Lahan Tersedia' }}
                  </span>
                  <span class="text-[11px] font-semibold text-[#066C2A] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Lihat Detail <ChevronRight class="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            <!-- Empty Search Results -->
            <div v-else class="py-12 text-center text-xs text-slate-400">
              <Users class="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p class="font-semibold text-slate-700 dark:text-slate-300">Tidak ada pekebun yang cocok</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Coba cari dengan kata kunci nama atau NIK lain</p>
            </div>
          </div>

          <!-- VIEW 2: DETAIL VIEW OF PEKEBUN (SLIDED FROM RIGHT) -->
          <div v-else-if="currentCpclView === 'detail' && selectedCpcl" key="cpcl-detail" class="flex flex-col gap-4">
            <!-- Navigation Header -->
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                @click="backToCpclList"
                class="flex items-center gap-1.5 text-xs text-[#066C2A] border-[#066C2A]/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
              >
                <ArrowLeft class="w-3.5 h-3.5" />
                <span>Kembali ke Daftar Pekebun</span>
              </Button>
              <Badge variant="success" customClass="text-xs font-bold font-mono">
                Luas: {{ selectedCpcl.luasLahanHektar }} Hektar
              </Badge>
            </div>

            <!-- Header Info Banner -->
            <div class="flex items-center gap-3.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <div class="w-11 h-11 rounded-2xl bg-[#066C2A] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                {{ selectedCpcl.namaPekebun.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'P' }}
              </div>
              <div class="flex flex-col min-w-0">
                <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  {{ selectedCpcl.namaPekebun }}
                </h4>
                <div class="flex items-center gap-3 text-xs text-slate-500 font-mono mt-0.5">
                  <span>NIK: {{ selectedCpcl.nik }}</span>
                  <span>&bull;</span>
                  <span>No. KK: {{ selectedCpcl.nomorKK || '-' }}</span>
                </div>
              </div>
            </div>

            <!-- Inner Tabs -->
            <div class="flex border-b border-slate-100 dark:border-slate-800">
              <button
                v-for="tab in [
                  { key: 'identitas', label: 'Identitas Pekebun' },
                  { key: 'dokumen', label: 'Dokumen Pekebun' },
                ] as const"
                :key="tab.key"
                type="button"
                @click="activePekebunTab = tab.key"
                :class="[
                  'px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px',
                  activePekebunTab === tab.key
                    ? 'border-[#066C2A] text-[#066C2A] dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
                ]"
              >
                {{ tab.label }}
              </button>
            </div>

            <!-- Tab 1: Identitas Pekebun -->
            <div v-if="activePekebunTab === 'identitas'" class="max-h-[46vh] overflow-y-auto pr-1 flex flex-col gap-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Nama Lengkap</span>
                  <p class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {{ selectedCpcl.namaPekebun }}
                  </p>
                </div>
                <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Nomor Induk Kependudukan (NIK)</span>
                  <p class="text-xs md:text-sm font-semibold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                    {{ selectedCpcl.nik }}
                  </p>
                </div>
                <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Nomor Kartu Keluarga (KK)</span>
                  <p class="text-xs md:text-sm font-semibold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                    {{ selectedCpcl.nomorKK || '-' }}
                  </p>
                </div>
                <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Status Pernikahan</span>
                  <p class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5 capitalize">
                    {{ matchedPekebunDetail?.statusPernikahan?.replace('_', ' ').toLowerCase() || 'Menikah' }}
                  </p>
                </div>
                <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Tempat & Tanggal Lahir</span>
                  <p class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {{ matchedPekebunDetail?.tempatLahir ? `${matchedPekebunDetail.tempatLahir}, ${new Date(matchedPekebunDetail.tanggalLahir).toLocaleDateString('id-ID')}` : '-' }}
                  </p>
                </div>
                <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Nomor Telepon / HP</span>
                  <p class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {{ matchedPekebunDetail?.nomorHP || '081234567890' }}
                  </p>
                </div>
                <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 sm:col-span-2">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Alamat Lengkap</span>
                  <p class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {{ matchedPekebunDetail?.alamat || proposal?.lembaga?.alamatLengkap || '-' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Tab 2: Dokumen Pekebun -->
            <div v-else-if="activePekebunTab === 'dokumen'" class="max-h-[46vh] overflow-y-auto pr-1 flex flex-col gap-3">
              <div v-if="matchedPekebunDetail?.dokumen && matchedPekebunDetail.dokumen.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="doc in matchedPekebunDetail.dokumen"
                  :key="doc.id"
                  class="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#066C2A] flex items-center justify-center shrink-0">
                      <FileText class="w-4 h-4" />
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {{ doc.documentType.replace('_', ' ') }}
                      </span>
                      <span class="text-[11px] text-slate-500 font-mono truncate">
                        {{ doc.fileName }}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    class="text-xs shrink-0 flex items-center gap-1 text-[#066C2A] border-[#066C2A]/30 hover:bg-emerald-50"
                    @click="openPekebunDocPreview(doc)"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>Pratinjau</span>
                  </Button>
                </div>
              </div>

              <!-- Fallback sample documents for CPCL preview -->
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="docItem in [
                    { title: 'Scan KTP Pekebun', file: `ktp_${selectedCpcl.nik}.png`, url: '/templates/scan-ktp.png', type: 'image/png' },
                    { title: 'Scan Kartu Keluarga', file: `kk_${selectedCpcl.nomorKK || selectedCpcl.nik}.webp`, url: '/templates/scan-kk.webp', type: 'image/webp' },
                  ]"
                  :key="docItem.title"
                  class="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#066C2A] flex items-center justify-center shrink-0">
                      <FileText class="w-4 h-4" />
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {{ docItem.title }}
                      </span>
                      <span class="text-[11px] text-slate-500 font-mono truncate">
                        {{ docItem.file }}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    class="text-xs shrink-0 flex items-center gap-1 text-[#066C2A] border-[#066C2A]/30 hover:bg-emerald-50"
                    @click="previewDoc = { title: docItem.title, dataUrl: docItem.url, mimeType: docItem.type }; showDocPreview = true;"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>Pratinjau</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <template #footer>
        <div class="flex items-center justify-between w-full">
          <div>
            <Button
              v-if="currentCpclView === 'detail'"
              variant="outline"
              size="sm"
              @click="backToCpclList"
              class="text-xs flex items-center gap-1"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>Daftar Pekebun</span>
            </Button>
          </div>
          <Button variant="secondary" size="sm" @click="isCpclModalOpen = false">
            Tutup
          </Button>
        </div>
      </template>
    </Modal>

    <!-- PENGAJUAN LAHAN (LIST & SLIDING DETAIL MODAL) -->
    <Modal
      :isOpen="isLahanModalOpen"
      :title="currentLahanView === 'list' ? 'Daftar Pengajuan Lahan Usulan' : `Detail Lahan — ${selectedLahan?.nomor_legalitas || 'Lahan'}`"
      size="xl"
      @close="isLahanModalOpen = false"
    >
      <div class="relative min-h-[480px]">
        <Transition :name="slideLahanDirection === 'next' ? 'slide-next' : 'slide-prev'" mode="out-in">
          <!-- VIEW 1: LIST OF LAHAN (CARDS) -->
          <div v-if="currentLahanView === 'list'" key="lahan-list" class="flex flex-col gap-4">
            <!-- Summary Header Banner -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/60">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-[#066C2A] text-white flex items-center justify-center font-bold shrink-0 shadow-sm">
                  <MapPin class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {{ proposal?.lembaga?.namaLembaga || 'Kelembagaan Pekebun' }}
                  </h4>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    Total bidang lahan kebun yang didaftarkan dalam proposal
                  </p>
                </div>
              </div>
              <div class="flex items-center gap-4 text-xs font-semibold">
                <div class="flex flex-col items-start sm:items-end">
                  <span class="text-[10px] text-slate-400 font-normal uppercase">Jumlah Lahan</span>
                  <span class="text-slate-800 dark:text-slate-200 font-bold">{{ lahanList.length }} Bidang</span>
                </div>
                <div class="h-6 w-px bg-emerald-200 dark:bg-emerald-800"></div>
                <div class="flex flex-col items-start sm:items-end">
                  <span class="text-[10px] text-slate-400 font-normal uppercase">Total Luas Lahan</span>
                  <span class="text-[#066C2A] font-bold">{{ totalLuasLahanPengajuan }} Hektar</span>
                </div>
              </div>
            </div>

            <!-- Search Bar -->
            <div class="relative">
              <Search class="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
              <input
                v-model="lahanSearchQuery"
                type="text"
                placeholder="Cari nomor legalitas, jenis hak, alamat kebun, jenis bibit, pemilik..."
                class="w-full h-9 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-xs focus:outline-none focus:ring-2 focus:ring-[#066C2A]/20 focus:border-[#066C2A]"
              />
            </div>

            <!-- List Grid of Lahan Cards -->
            <div v-if="filteredLahanList.length > 0" class="max-h-[52vh] overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div
                v-for="(lahan, idx) in filteredLahanList"
                :key="lahan.id || idx"
                @click="selectLahanForDetail(lahan)"
                class="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md hover:bg-emerald-50/20 dark:hover:bg-emerald-950/20 cursor-pointer transition-all duration-200 flex flex-col justify-between gap-3 group"
              >
                <div class="flex items-start justify-between gap-2">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-[#066C2A] dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-200/60 dark:border-emerald-800/60 group-hover:bg-[#066C2A] group-hover:text-white transition-colors">
                      {{ lahan.jenis_legalitas }}
                    </div>
                    <div class="flex flex-col min-w-0">
                      <h4 class="text-xs md:text-sm font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-[#066C2A] transition-colors">
                        {{ lahan.nomor_legalitas }}
                      </h4>
                      <span class="text-[11px] text-slate-500 truncate">
                        Pemilik: {{ getPekebunOwnerName(lahan.pekebun_id) }}
                      </span>
                    </div>
                  </div>
                  <Badge variant="success" customClass="shrink-0 text-[10px] font-bold font-mono">
                    {{ lahan.luas_lahan }} Ha
                  </Badge>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs py-2 px-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800">
                  <div class="col-span-2">
                    <span class="text-[9px] text-slate-400 uppercase font-semibold">Lokasi / Alamat Kebun</span>
                    <p class="font-medium text-slate-700 dark:text-slate-300 truncate text-[11px]">{{ lahan.alamat_kebun || '-' }}</p>
                  </div>
                  <div>
                    <span class="text-[9px] text-slate-400 uppercase font-semibold">Tahun Tanam</span>
                    <p class="font-mono text-slate-700 dark:text-slate-300 truncate text-[11px]">Tahun {{ lahan.tahun_tanam }}</p>
                  </div>
                  <div>
                    <span class="text-[9px] text-slate-400 uppercase font-semibold">Jenis Bibit</span>
                    <p class="font-medium text-slate-700 dark:text-slate-300 truncate text-[11px]">{{ lahan.jenis_bibit }}</p>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500">
                  <span class="text-[10px] text-slate-400 flex items-center gap-1">
                    <MapPin class="w-3 h-3 text-emerald-600" />
                    {{ (lahan.coordinates && lahan.coordinates.length) ? `${lahan.coordinates.length} Titik Poligon` : 'Peta Lahan Tersedia' }}
                  </span>
                  <span class="text-[11px] font-semibold text-[#066C2A] group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    Lihat Detail <ChevronRight class="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            <!-- Empty Search Results -->
            <div v-else class="py-12 text-center text-xs text-slate-400">
              <MapPin class="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
              <p class="font-semibold text-slate-700 dark:text-slate-300">Tidak ada lahan yang cocok</p>
              <p class="text-[11px] text-slate-400 mt-0.5">Coba cari dengan nomor legalitas atau kata kunci lain</p>
            </div>
          </div>

          <!-- VIEW 2: DETAIL VIEW OF LAHAN (SLIDED FROM RIGHT) -->
          <div v-else-if="currentLahanView === 'detail' && selectedLahan" key="lahan-detail" class="flex flex-col gap-4">
            <!-- Navigation Header -->
            <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                @click="backToLahanList"
                class="flex items-center gap-1.5 text-xs text-[#066C2A] border-[#066C2A]/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
              >
                <ArrowLeft class="w-3.5 h-3.5" />
                <span>Kembali ke Daftar Lahan</span>
              </Button>
              <Badge variant="success" customClass="text-xs font-bold font-mono">
                Luas: {{ selectedLahan.luas_lahan }} Hektar
              </Badge>
            </div>

            <!-- Header Info Banner -->
            <div class="flex items-center gap-3.5 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <div class="w-11 h-11 rounded-2xl bg-[#066C2A] text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                {{ selectedLahan.jenis_legalitas }}
              </div>
              <div class="flex flex-col min-w-0">
                <h4 class="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                  Nomor Legalitas: {{ selectedLahan.nomor_legalitas }}
                </h4>
                <div class="flex items-center gap-3 text-xs text-slate-500 font-mono mt-0.5">
                  <span>Pemilik: {{ getPekebunOwnerName(selectedLahan.pekebun_id) }}</span>
                  <span>&bull;</span>
                  <span>Penerbitan: {{ selectedLahan.tanggal_penerbitan_legalitas || '-' }}</span>
                </div>
              </div>
            </div>

            <!-- Inner Tabs -->
            <div class="flex border-b border-slate-100 dark:border-slate-800">
              <button
                v-for="tab in [
                  { key: 'detail', label: 'Detail & Legalitas Lahan' },
                  { key: 'peta', label: 'Peta Satelit & Poligon' },
                  { key: 'dokumen', label: 'Dokumen Lahan' },
                ] as const"
                :key="tab.key"
                type="button"
                @click="activeLahanTab = tab.key"
                :class="[
                  'px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-px',
                  activeLahanTab === tab.key
                    ? 'border-[#066C2A] text-[#066C2A] dark:text-emerald-400'
                    : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200',
                ]"
              >
                {{ tab.label }}
              </button>
            </div>

            <!-- Tab 1: Detail & Legalitas Lahan -->
            <div v-if="activeLahanTab === 'detail'" class="max-h-[46vh] overflow-y-auto pr-1 flex flex-col gap-3">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Jenis Legalitas Lahan</span>
                  <p class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {{ selectedLahan.jenis_legalitas }}
                  </p>
                </div>
                <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Nomor Legalitas Surat Lahan</span>
                  <p class="text-xs md:text-sm font-semibold font-mono text-slate-800 dark:text-slate-200 mt-0.5">
                    {{ selectedLahan.nomor_legalitas }}
                  </p>
                </div>
                <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Tanggal Penerbitan Legalitas</span>
                  <p class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {{ selectedLahan.tanggal_penerbitan_legalitas || '-' }}
                  </p>
                </div>
                <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Luas Lahan</span>
                  <p class="text-xs md:text-sm font-semibold text-[#066C2A] dark:text-emerald-400 mt-0.5">
                    {{ selectedLahan.luas_lahan }} Hektar
                  </p>
                </div>
                <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Pemilik Lahan</span>
                  <p class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {{ getPekebunOwnerName(selectedLahan.pekebun_id) }}
                  </p>
                </div>
                <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Tahun Tanam & Jenis Bibit</span>
                  <p class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    Tahun {{ selectedLahan.tahun_tanam }} &bull; {{ selectedLahan.jenis_bibit }}
                  </p>
                </div>
                <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 sm:col-span-2">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Alamat Kebun</span>
                  <p class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {{ selectedLahan.alamat_kebun }}
                  </p>
                </div>
                <div v-if="selectedLahan.nomor_surat_beda_nama" class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 sm:col-span-2">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Nomor Surat Keterangan Beda Nama</span>
                  <p class="text-xs md:text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {{ selectedLahan.nomor_surat_beda_nama }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Tab 2: Peta Satelit & Poligon -->
            <div v-else-if="activeLahanTab === 'peta'" class="max-h-[46vh] overflow-y-auto pr-1 flex flex-col gap-3.5">
              <div class="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                <div class="flex items-center justify-between">
                  <span class="text-[10px] uppercase font-bold text-slate-400">Peta Poligon Lahan (Mode Satelit)</span>
                  <span class="text-[10px] font-mono text-emerald-600 font-semibold">
                    {{ selectedLahan.coordinates?.length || 0 }} Titik Koordinat
                  </span>
                </div>
                <SatelliteMapPreview
                  :coordinates="selectedLahan.coordinates"
                  :luas-lahan="selectedLahan.luas_lahan"
                  height="280px"
                />
              </div>
            </div>

            <!-- Tab 3: Dokumen Lahan -->
            <div v-else-if="activeLahanTab === 'dokumen'" class="max-h-[46vh] overflow-y-auto pr-1 flex flex-col gap-3">
              <div v-if="selectedLahan.documents && selectedLahan.documents.length > 0" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="doc in selectedLahan.documents"
                  :key="doc.id"
                  class="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#066C2A] flex items-center justify-center shrink-0">
                      <FileText class="w-4 h-4" />
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {{ formatDocTypeLabel(doc.document_type) }}
                      </span>
                      <span class="text-[11px] text-slate-500 font-mono truncate">
                        {{ doc.file_name }}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    class="text-xs shrink-0 flex items-center gap-1 text-[#066C2A] border-[#066C2A]/30 hover:bg-emerald-50"
                    @click="openLahanDocPreview(doc)"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>Pratinjau</span>
                  </Button>
                </div>
              </div>

              <!-- Fallback sample documents for Lahan preview -->
              <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="docItem in [
                    { title: 'Surat Legalitas Lahan (' + selectedLahan.jenis_legalitas + ')', file: `${selectedLahan.nomor_legalitas || 'legalitas'}.pdf`, url: '/templates/stdb-template.pdf', type: 'application/pdf' },
                    { title: 'Peta Polygon Batas Lahan', file: 'peta_polygon.pdf', url: '/templates/peta-template.pdf', type: 'application/pdf' },
                  ]"
                  :key="docItem.title"
                  class="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#066C2A] flex items-center justify-center shrink-0">
                      <FileText class="w-4 h-4" />
                    </div>
                    <div class="flex flex-col min-w-0">
                      <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                        {{ docItem.title }}
                      </span>
                      <span class="text-[11px] text-slate-500 font-mono truncate">
                        {{ docItem.file }}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    class="text-xs shrink-0 flex items-center gap-1 text-[#066C2A] border-[#066C2A]/30 hover:bg-emerald-50"
                    @click="previewDoc = { title: docItem.title, dataUrl: docItem.url, mimeType: docItem.type }; showDocPreview = true;"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>Pratinjau</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <template #footer>
        <div class="flex items-center justify-between w-full">
          <div>
            <Button
              v-if="currentLahanView === 'detail'"
              variant="outline"
              size="sm"
              @click="backToLahanList"
              class="text-xs flex items-center gap-1"
            >
              <ArrowLeft class="w-3.5 h-3.5" />
              <span>Daftar Lahan</span>
            </Button>
          </div>
          <Button variant="secondary" size="sm" @click="isLahanModalOpen = false">
            Tutup
          </Button>
        </div>
      </template>
    </Modal>

    <!-- DOCUMENT PREVIEW MODAL -->
    <DocumentPreviewModal
      :is-open="showDocPreview && !!previewDoc"
      :title="previewDoc?.title || 'Pratinjau Dokumen'"
      :data-url="previewDoc?.dataUrl || ''"
      :mime-type="previewDoc?.mimeType || 'application/pdf'"
      @close="showDocPreview = false"
    />
  </div>
</template>

<style scoped>
/* CPCL Modal Slide Transition */
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-next-enter-from {
  opacity: 0;
  transform: translateX(40px);
}
.slide-next-leave-to {
  opacity: 0;
  transform: translateX(-40px);
}

.slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-40px);
}
.slide-prev-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>
