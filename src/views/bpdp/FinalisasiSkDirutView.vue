<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRekomtekStore } from '@/stores/rekomtek';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useVerifikasiBPDPStore } from '@/stores/verifikasiBPDP';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import LogStatusUsulan from '@/components/rekomtek/LogStatusUsulan.vue';
import FileUpload from '@/components/ui/FileUpload.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import Button from '@/components/ui/Button.vue';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import PratinjauPekebunDanDokumenTab from '@/components/verification/PratinjauPekebunDanDokumenProposal.vue';
import { ChevronLeft, ChevronRight, Download, CheckCircle2, Eye, FileCheck, FileText, Check } from 'lucide-vue-next';
import type { SpatialOverlapResponse, Proposal } from '@/types/pengusulan';
import { parseCoordinatePolygon } from '@/lib/coordinatePolygon';
import { formatUploadedAt } from '@/utils/formatUploadedAt';

const route = useRoute();
const router = useRouter();
const store = useRekomtekStore();
const pengusulanStore = usePengusulanStore();
const verifikasiBPDPStore = useVerifikasiBPDPStore();
const authStore = useAuthStore();
const toast = useToast();

const usulanId = route.params.id as string;
const pageLoading = ref(true);
const currentStep = ref(1);
const nomorSk = ref('');
const tanggalSk = ref('');
const isSubmitting = ref(false);
const selectedFile = ref<File | null>(null);
const currentSpatialOverlap = ref<SpatialOverlapResponse | null>(null);
const previewDoc = ref<{ dataUrl: string; mimeType: string; title: string } | null>(null);
const showPreview = ref(false);

const steps = [
  { id: 1, title: 'Pratinjau Pekebun & Dokumen', description: 'Tinjau Data & Lahan', icon: Eye },
  { id: 2, title: 'Penerbitan SK Dirut', description: 'Finalisasi & Pengesahan SK', icon: FileCheck },
];

function openUrlPreview(url: string, title = 'Pratinjau Dokumen') {
  if (!url) {
    toast.error('URL berkas tidak tersedia untuk pratinjau.', 'Pratinjau Gagal');
    return;
  }
  previewDoc.value = {
    dataUrl: url,
    mimeType: 'application/pdf',
    title,
  };
  showPreview.value = true;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

function downloadSkFormat() {
  const customUrl = (activeUsulan.value as any)?.skDirut?.draftUrl || (activeUsulan.value as any)?.skDirut?.formatUrl;
  if (customUrl) {
    const a = document.createElement('a');
    a.href = customUrl;
    a.download = `Format_SK_Dirut_${activeUsulan.value?.nomor_proposal || activeUsulan.value?.nomorProposal || usulanId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast.success('Format SK Dirut berhasil diunduh.', 'Unduh Berhasil');
    return;
  }

  const proposalNo = activeUsulan.value?.nomor_proposal || activeUsulan.value?.nomorProposal || activeUsulan.value?.nomorUsulan || `USULAN-${usulanId}`;
  const lembagaName = activeUsulan.value?.lembaga?.namaLembaga || activeUsulan.value?.kelembagaan?.nama_lembaga || activeUsulan.value?.namaKelompokTani || 'Kelompok Tani';
  const rekomtekNo = activeUsulan.value?.no_rekomtek || activeUsulan.value?.rekomtek?.nomorRekomtek || '-';

  const formatText = `
SURAT KEPUTUSAN DIREKTUR UTAMA
BADAN PENGELOLA DANA PERKEBUNAN KELAPA SAWIT (BPDPKS)
Nomor: [NOMOR_SK_DIRUT]

TENTANG
PENETAPAN PENERIMA BANTUAN SARANA DAN PRASARANA PERKEBUNAN KELAPA SAWIT

DIREKTUR UTAMA BADAN PENGELOLA DANA PERKEBUNAN KELAPA SAWIT,

Menimbang:
a. bahwa berdasarkan hasil asistensi Ditjenbun No. ${rekomtekNo} dan hasil penelitian kepatuhan BPDPKS terhadap Usulan Nomor: ${proposalNo};
b. bahwa Lembaga/Kelompok Tani: ${lembagaName} telah memenuhi seluruh persyaratan verifikasi dan dinyatakan layak menerima bantuan;

MEMUTUSKAN:
Menetapkan:
KESATU: Menetapkan Lembaga/Kelompok Tani ${lembagaName} sebagai Penerima Bantuan Sarana dan Prasarana Perkebunan Kelapa Sawit.
KEDUA: Keputusan ini berlaku sejak tanggal ditetapkan.

Ditetapkan di Jakarta,
Pada tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}

Direktur Utama BPDPKS,

[TANDA TANGAN & STEMPEL]
( ..................................................... )
`.trim();

  const blob = new Blob([formatText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Format_SK_Dirut_${String(proposalNo).replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast.success('Format template SK Dirut berhasil diunduh.', 'Unduh Berhasil');
}

async function loadSpatialOverlap(proposalId: string | number) {
  currentSpatialOverlap.value = null;
  try {
    const res = await pengusulanStore.getSpatialOverlap(proposalId);
    currentSpatialOverlap.value = res;
  } catch {
    currentSpatialOverlap.value = null;
  }
}

onMounted(async () => {
  if (authStore.activeRole === 'BPDP_APPROVAL') {
    toast.error('Akses ditolak: Anda tidak memiliki otoritas untuk mengakses menu SK Dirut', 'Forbidden');
    router.push('/bpdp/antrean');
    return;
  }

  pageLoading.value = true;
  const proposalIdNum = Number(String(usulanId).replace(/[^\d]/g, '')) || usulanId;

  try {
    const detailItem = await pengusulanStore.getProposalDetail(proposalIdNum);
    if (!detailItem) {
      await store.fetchUsulanById(usulanId);
    }
    await pengusulanStore.fetchProposals({ status: ['BPDP_APPR_SUBMITTED', 'SK_DIRUT_PUBLISHED', 'SELESAI', 'SK_DIRUT_ISSUED'] });
    await loadSpatialOverlap(proposalIdNum);

    const active: any = pengusulanStore.activePengajuan || store.activeUsulan;
    if (active) {
      if (active.no_sk_dirut) {
        nomorSk.value = active.no_sk_dirut;
      } else if (active.skDirut?.nomorSk) {
        nomorSk.value = active.skDirut.nomorSk;
      }
      if (active.tanggal_sk_dirut) {
        tanggalSk.value = String(active.tanggal_sk_dirut).slice(0, 10);
      } else if (active.skDirut?.tanggalSk) {
        tanggalSk.value = String(active.skDirut.tanggalSk).slice(0, 10);
      }
    }
  } catch (err) {
    console.error('Gagal memuat detail usulan SK Dirut:', err);
  } finally {
    pageLoading.value = false;
  }
});

const pengajuan = computed<Proposal | null>(() => {
  if (pengusulanStore.activePengajuan && String(pengusulanStore.activePengajuan.id) === String(usulanId)) {
    return pengusulanStore.activePengajuan;
  }
  return pengusulanStore.listPengajuan.find((p) => String(p.id) === String(usulanId)) || null;
});

const activeUsulan = computed<any>(() => {
  return pengajuan.value || store.activeUsulan || store.usulans.find((u) => String(u.id) === String(usulanId)) || null;
});

const isPublished = computed(() => {
  const st = String(activeUsulan.value?.status || activeUsulan.value?.currentStatus || '');
  return st === 'SK_DIRUT_PUBLISHED' || st === 'SELESAI' || st === 'SK_DIRUT_ISSUED';
});

/**
 * Resolves the "REKOMTEK" document from the proposal detail.
 */
const rekomtekDoc = computed(() => {
  const p = activeUsulan.value;
  if (!p) return null;
  const aliases = ['REKOMTEK', 'DRAF_REKOMTEK', 'REKOMTEK_DITJENBUN'];

  if (p.documents && Array.isArray(p.documents)) {
    const d = p.documents.find((doc: any) => {
      const dt = (doc.document_type || doc.tipeDokumen || '').toUpperCase().replace(/[-_]/g, '');
      return aliases.map((a) => a.replace(/[-_]/g, '')).includes(dt);
    });
    if (d && (d.file_url || d.urlFile || d.file_name || d.namaFile)) {
      return {
        id: d.id !== undefined ? Number(String(d.id).replace(/[^\d]/g, '')) || d.id : undefined,
        fileName: d.file_name || d.namaFile || 'rekomtek_signed.pdf',
        fileUrl: d.file_url || d.urlFile || '',
      };
    }
  }

  if (p.dokumen && Array.isArray(p.dokumen)) {
    const d = p.dokumen.find((doc: any) => {
      const dt = (doc.tipeDokumen || doc.document_type || '').toUpperCase().replace(/[-_]/g, '');
      return aliases.map((a) => a.replace(/[-_]/g, '')).includes(dt);
    });
    if (d && (d.urlFile || d.file_url || d.namaFile || d.file_name)) {
      return {
        id: (d as any).id !== undefined ? Number(String((d as any).id).replace(/[^\d]/g, '')) || (d as any).id : undefined,
        fileName: d.namaFile || (d as any).file_name || 'rekomtek_signed.pdf',
        fileUrl: d.urlFile || (d as any).file_url || '',
      };
    }
  }

  if (p.rekomtek?.signedUrl) {
    return {
      id: undefined,
      fileName: 'rekomtek_signed.pdf',
      fileUrl: p.rekomtek.signedUrl,
    };
  }
  return null;
});

/**
 * Resolves the "KEPUTUSAN_KELAYAKAN" document from the proposal detail.
 */
const kelayakanDoc = computed(() => {
  const p = activeUsulan.value;
  if (!p) return null;
  const aliases = ['KEPUTUSAN_KELAYAKAN', 'KELAYAKAN', 'LAPORAN_KELAYAKAN', 'HASIL_PENELITIAN_BPDP', 'LAPORAN_PENELITIAN'];

  if (p.documents && Array.isArray(p.documents)) {
    const d = p.documents.find((doc: any) => {
      const dt = (doc.document_type || doc.tipeDokumen || '').toUpperCase().replace(/[-_]/g, '');
      return aliases.map((a) => a.replace(/[-_]/g, '')).includes(dt);
    });
    if (d && (d.file_url || d.urlFile || d.file_name || d.namaFile)) {
      return {
        id: d.id !== undefined ? Number(String(d.id).replace(/[^\d]/g, '')) || d.id : undefined,
        fileName: d.file_name || d.namaFile || 'laporan_kelayakan.pdf',
        fileUrl: d.file_url || d.urlFile || '',
      };
    }
  }

  if (p.dokumen && Array.isArray(p.dokumen)) {
    const d = p.dokumen.find((doc: any) => {
      const dt = (doc.tipeDokumen || doc.document_type || '').toUpperCase().replace(/[-_]/g, '');
      return aliases.map((a) => a.replace(/[-_]/g, '')).includes(dt);
    });
    if (d && (d.urlFile || d.file_url || d.namaFile || d.file_name)) {
      return {
        id: (d as any).id !== undefined ? Number(String((d as any).id).replace(/[^\d]/g, '')) || (d as any).id : undefined,
        fileName: d.namaFile || (d as any).file_name || 'laporan_kelayakan.pdf',
        fileUrl: d.urlFile || (d as any).file_url || '',
      };
    }
  }

  if (p.kelayakan?.signedUrl || p.kelayakan?.draftUrl) {
    return {
      id: undefined,
      fileName: 'laporan_kelayakan.pdf',
      fileUrl: p.kelayakan.signedUrl || p.kelayakan.draftUrl,
    };
  }
  return null;
});

/**
 * Resolves the "SK_DIRUT" document from the proposal detail.
 */
const skDirutDoc = computed(() => {
  const p = activeUsulan.value;
  if (!p) return null;
  const aliases = ['SK_DIRUT', 'SKDIRUT', 'SK_DIREKTUR_UTAMA', 'SK_PENETAPAN_DIRUT'];

  if (p.documents && Array.isArray(p.documents)) {
    const d = p.documents.find((doc: any) => {
      const dt = (doc.document_type || doc.tipeDokumen || '').toUpperCase().replace(/[-_]/g, '');
      return aliases.map((a) => a.replace(/[-_]/g, '')).includes(dt);
    });
    if (d && (d.file_url || d.urlFile || d.file_name || d.namaFile || d.id)) {
      return {
        id: d.id !== undefined ? Number(String(d.id).replace(/[^\d]/g, '')) || d.id : undefined,
        fileName: d.file_name || d.namaFile || 'sk_dirut_signed.pdf',
        fileUrl: d.file_url || d.urlFile || '',
        documentType: d.document_type || 'SK_DIRUT',
        uploadedBy: d.updated_by_name || d.created_by_name || d.uploadedBy || '',
        uploadedAtFormatted: formatUploadedAt(d.uploaded_at_formatted || d.uploadedAtFormatted, d.updated_at || d.created_at),
      };
    }
  }

  if (p.dokumen && Array.isArray(p.dokumen)) {
    const d = p.dokumen.find((doc: any) => {
      const dt = (doc.tipeDokumen || doc.document_type || '').toUpperCase().replace(/[-_]/g, '');
      return aliases.map((a) => a.replace(/[-_]/g, '')).includes(dt);
    });
    if (d && (d.urlFile || d.file_url || d.namaFile || d.file_name || d.id)) {
      return {
        id: (d as any).id !== undefined ? Number(String((d as any).id).replace(/[^\d]/g, '')) || (d as any).id : undefined,
        fileName: d.namaFile || (d as any).file_name || 'sk_dirut_signed.pdf',
        fileUrl: d.urlFile || (d as any).file_url || '',
        documentType: d.tipeDokumen || d.document_type || 'SK_DIRUT',
        uploadedBy: (d as any).updated_by_name || (d as any).created_by_name || (d as any).uploadedBy || '',
        uploadedAtFormatted: formatUploadedAt((d as any).uploaded_at_formatted || (d as any).uploadedAtFormatted, (d as any).updated_at || (d as any).created_at),
      };
    }
  }

  if (p.skDirut?.signedUrl) {
    return {
      id: undefined,
      fileName: 'sk_dirut_signed.pdf',
      fileUrl: p.skDirut.signedUrl,
      documentType: 'SK_DIRUT',
      uploadedBy: '',
      uploadedAtFormatted: '',
    };
  }
  return null;
});

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function parsePolygonCoords(raw: string): Array<[number, number]> {
  if (!raw || !raw.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 3) {
      return parsed
        .filter((p: any) => p && ((Array.isArray(p) && p.length >= 2) || (typeof p.lat === 'number' && typeof p.lng === 'number')))
        .map((p: any) => {
          if (Array.isArray(p)) return [Number(p[0]), Number(p[1])] as [number, number];
          return [Number(p.lat), Number(p.lng)] as [number, number];
        })
        .filter(([lat, lng]: [number, number]) => Number.isFinite(lat) && Number.isFinite(lng));
    }
  } catch {
    /* fall through */
  }
  const lines = raw
    .split(/[\n;]/)
    .map((l) => l.trim())
    .filter(Boolean);
  const coords = lines
    .map((line) => {
      const [latStr, lngStr] = line.split(',').map((s) => s.trim());
      const lat = Number(latStr);
      const lng = Number(lngStr);
      return [lat, lng] as [number, number];
    })
    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
  if (coords.length >= 3) return coords;
  const points = parseCoordinatePolygon(raw);
  return points.filter((pt) => pt.lat !== null && pt.lng !== null).map((pt) => [pt.lat!, pt.lng!] as [number, number]);
}

function extractLahanCoords(lahan?: any): Array<[number, number]> {
  if (!lahan) return [];
  if (Array.isArray(lahan.coordinates)) {
    return lahan.coordinates.filter((c: any) => c && typeof c.lat === 'number' && typeof c.lng === 'number').map((c: any) => [c.lat, c.lng] as [number, number]);
  }
  if (typeof lahan.koordinatPoligon === 'string' || typeof lahan.polygon === 'string' || typeof lahan.koordinat_polygon === 'string') {
    return parsePolygonCoords(lahan.koordinatPoligon || lahan.polygon || lahan.koordinat_polygon);
  }
  return [];
}

const activePolygons = computed(() => {
  if (currentSpatialOverlap.value?.active_polygons?.length) {
    return currentSpatialOverlap.value.active_polygons.map((poly: any) => ({
      coordinates: (poly.coordinates || []).map((c: any) => (Array.isArray(c) ? [Number(c[0]), Number(c[1])] : [Number(c.lat), Number(c.lng)])) as [number, number][],
      label: poly.label || poly.nama_pekebun || 'Lahan Pekebun',
    }));
  }

  const u = activeUsulan.value as any;
  if (u?.lahans && u.lahans.length > 0) {
    return u.lahans.flatMap((lahan: any, idx: number) => {
      const coords = extractLahanCoords(lahan);
      if (coords.length < 3) return [];
      const pekebunFromProp = (u?.pekebuns ?? []).find((p: any) => p.id === lahan.pekebun_id || String(p.id) === String(lahan.pekebun_id));
      return [{ coordinates: coords, label: pekebunFromProp?.name || pekebunFromProp?.nama || `Lahan Pekebun ${idx + 1}` }];
    });
  }

  if (u?.pekebunList) {
    return u.pekebunList.flatMap((p: any) => {
      const coords = extractLahanCoords(p.lahan);
      if (coords.length < 3) return [];
      return [{ coordinates: coords, label: p.nama || 'Lahan Pekebun' }];
    });
  }
  return [];
});

const nearbyProposals = computed(() => {
  if (currentSpatialOverlap.value?.other_proposals?.length) {
    return currentSpatialOverlap.value.other_proposals.map((np: any) => ({
      proposalId: String(np.proposalId || np.proposal_id || np.id),
      proposalNumber: np.proposalNumber || np.proposal_number || '',
      proposalName: np.proposalName || np.proposal_name || '',
      polygons: (np.polygons || []).map((p: any) => ({
        coordinates: p.coordinates || [],
        label: p.label || 'Lahan',
      })),
      distance: np.distance,
    }));
  }

  if (activePolygons.value.length === 0) return [];
  const activeCentroid = activePolygons.value[0].coordinates
    .reduce((acc: [number, number], [lat, lng]: [number, number]) => [acc[0] + lat, acc[1] + lng] as [number, number], [0, 0])
    .map((v: number) => v / activePolygons.value[0].coordinates.length) as [number, number];

  return store.usulans
    .filter((u) => String(u.id) !== String(usulanId))
    .filter((u) => {
      if (!u.pekebunList || u.pekebunList.length === 0) return false;
      return u.pekebunList.some((p) => {
        const coords = extractLahanCoords(p.lahan);
        if (coords.length < 3) return false;
        const centroid = coords.reduce((acc: [number, number], [lat, lng]: [number, number]) => [acc[0] + lat, acc[1] + lng] as [number, number], [0, 0]).map((v: number) => v / coords.length) as [number, number];
        return haversineDistance(activeCentroid[0], activeCentroid[1], centroid[0], centroid[1]) <= 50;
      });
    })
    .map((u) => ({
      proposalId: String(u.id),
      proposalNumber: u.nomorUsulan,
      proposalName: u.namaKelompokTani,
      polygons: u.pekebunList!.flatMap((p) => {
        const coords = extractLahanCoords(p.lahan);
        if (coords.length < 3) return [];
        return [{ coordinates: coords, label: p.nama }];
      }),
      distance: Math.round(
        haversineDistance(
          activeCentroid[0],
          activeCentroid[1],
          extractLahanCoords(u.pekebunList![0].lahan)[0]?.[0] || 0,
          extractLahanCoords(u.pekebunList![0].lahan)[0]?.[1] || 0
        ) * 10
      ) / 10,
    }));
});

const handleFileSelected = (file: File) => {
  selectedFile.value = file;
};

const handleSelesai = async () => {
  if (!nomorSk.value.trim()) {
    toast.error('Mohon masukkan Nomor SK Dirut.', 'Validasi Gagal');
    return;
  }
  if (!tanggalSk.value) {
    toast.error('Mohon isi Tanggal SK Dirut.', 'Validasi Gagal');
    return;
  }
  if (!selectedFile.value && !skDirutDoc.value?.fileUrl) {
    toast.error('Mohon unggah berkas SK Dirut yang sudah ditandatangani.', 'Validasi Gagal');
    return;
  }

  isSubmitting.value = true;
  try {
    await verifikasiBPDPStore.submitSKDirut(usulanId, {
      no_sk_dirut: nomorSk.value.trim(),
      tanggal_sk_dirut: tanggalSk.value,
      skDirutFile: selectedFile.value,
      status: 'SK_DIRUT_PUBLISHED',
      notes: `Penerbitan SK Dirut nomor: ${nomorSk.value.trim()} tanggal: ${tanggalSk.value}`,
    });

    toast.success('Penerbitan SK Dirut berhasil diselesaikan! Usulan dialihkan ke status SK Terbit.', 'Selesai');
    setTimeout(() => {
      router.push('/bpdp/sk-dirut');
    }, 500);
  } catch (err: any) {
    toast.error(err?.message || 'Gagal menyimpan dan menerbitkan SK Dirut.', 'Gagal');
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <!-- Header -->
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 md:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <router-link to="/bpdp/sk-dirut" class="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
          <ChevronLeft class="w-5 h-5" />
        </router-link>
        <Breadcrumb />
      </div>

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1" v-if="activeUsulan">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60 px-2 py-0.5 rounded-md">
              Penerbitan SK Dirut
            </span>
            <span class="text-[11px] font-mono text-slate-400">
              ID: {{ activeUsulan.id }}
            </span>
          </div>
          <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white font-apple-display-lg mt-0.5">
            {{ activeUsulan.lembaga?.namaLembaga || (activeUsulan as any).kelembagaan?.nama_lembaga || activeUsulan.namaKelompokTani || 'Lembaga Pengusul' }}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Nomor Pengusulan: <span class="font-semibold text-slate-800 dark:text-slate-200">{{ activeUsulan.nomor_proposal || activeUsulan.nomorProposal || activeUsulan.nomorUsulan || `USULAN-${activeUsulan.id}` }}</span>
          </p>
        </div>
      </div>
    </header>

    <div v-if="pageLoading" class="flex flex-col gap-5">
      <Skeleton class="h-20 w-full rounded-2xl" />
      <Skeleton class="h-60 w-full rounded-2xl" />
      <Skeleton class="h-40 w-full rounded-2xl" />
    </div>

    <div v-else-if="activeUsulan" class="flex flex-col gap-5">
      <!-- 2-Step Progress Indicator (Exactly like CekiBpdpView.vue) -->
      <div class="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
        <div class="flex items-center justify-between gap-2">
          <div v-for="(st, idx) in steps" :key="st.id" class="flex items-center gap-2 flex-1">
            <!-- Step Badge Button -->
            <button
              type="button"
              @click="currentStep = st.id"
              :class="[
                'w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all duration-300 shrink-0 cursor-pointer',
                currentStep === st.id
                  ? 'bg-[#066C2A] text-white shadow-md shadow-emerald-900/20 ring-2 ring-emerald-200 dark:ring-emerald-800 scale-110'
                  : currentStep > st.id
                    ? 'bg-emerald-100 dark:bg-emerald-950 text-[#066C2A] dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400',
              ]"
            >
              <component :is="st.icon" class="w-4 h-4" />
            </button>

            <!-- Step Label -->
            <div class="flex-col min-w-0 hidden sm:flex cursor-pointer" @click="currentStep = st.id">
              <span :class="['text-xs font-bold leading-tight truncate', currentStep === st.id ? 'text-[#066C2A] dark:text-emerald-400' : 'text-slate-500']">{{ st.title }}</span>
              <span class="text-[10px] text-slate-400 truncate">{{ st.description }}</span>
            </div>

            <!-- Connector Bar (not on last) -->
            <div v-if="idx < steps.length - 1" class="h-1.5 flex-1 mx-2 rounded-full relative overflow-hidden bg-slate-200 dark:bg-slate-800 shrink-0 min-w-8">
              <div class="h-full bg-[#066C2A] transition-all duration-500 ease-in-out" :style="{ width: currentStep > st.id ? '100%' : '0%' }" />
            </div>
          </div>
        </div>
      </div>

      <!-- Step 1: Pratinjau Pekebun & Dokumen -->
      <div v-if="currentStep === 1" class="flex flex-col gap-5">
        <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <PratinjauPekebunDanDokumenTab :usulan="activeUsulan" :active-polygons="activePolygons" :other-proposals="nearbyProposals" />
        </div>

        <!-- Navigation Buttons -->
        <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <router-link to="/bpdp/sk-dirut">
            <Button variant="outline" size="sm" class="flex items-center gap-1.5 cursor-pointer">
              <ChevronLeft class="w-4 h-4" />
              <span>Kembali ke Antrean SK Dirut</span>
            </Button>
          </router-link>
          <button
            type="button"
            @click="currentStep = 2"
            class="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-[#066C2A] hover:bg-emerald-800 text-white transition-all shadow-sm active:scale-95 cursor-pointer"
          >
            <span>Lanjut ke Penerbitan SK Dirut</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Step 2: Penerbitan SK Dirut -->
      <div v-else-if="currentStep === 2" class="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <!-- Left Panel: Audit logs & details -->
        <div class="lg:col-span-2 flex flex-col gap-5">
          <!-- Rujukan Kelayakan & Rekomtek Card -->
          <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
            <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div class="flex flex-col gap-0.5">
                <h3 class="text-[14px] font-semibold text-slate-900 dark:text-white">
                  Hasil Penelitian & Dokumen Usulan BPDP
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Rujukan persetujuan dan verifikasi berkas sebelum pengesahan SK Direktur Utama.
                </p>
              </div>
              <span class="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#066C2A] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                Disetujui Kadiv BPDP
              </span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px]">
              <!-- Nomor Rekomtek -->
              <div class="flex flex-col gap-1 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <span class="text-[11px] font-semibold text-slate-400 uppercase">Nomor Rekomtek Ditjenbun</span>
                <span class="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {{ activeUsulan.no_rekomtek || activeUsulan.rekomtek?.nomorRekomtek || '-' }}
                </span>
                <div v-if="rekomtekDoc?.fileUrl" class="pt-1.5 flex items-center gap-2">
                  <button
                    type="button"
                    class="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                    @click="openUrlPreview(rekomtekDoc.fileUrl, 'Rekomendasi Teknis Ditjenbun')"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>Pratinjau Dokumen Rekomtek</span>
                  </button>
                </div>
              </div>

              <!-- Laporan Penelitian BPDP -->
              <div class="flex flex-col gap-1 bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                <span class="text-[11px] font-semibold text-slate-400 uppercase">Laporan Keputusan Penelitian</span>
                <span class="font-bold text-emerald-700 dark:text-emerald-400">
                  LAYAK (Disetujui Kadiv BPDP)
                </span>
                <div v-if="kelayakanDoc?.fileUrl" class="pt-1.5 flex items-center gap-2">
                  <button
                    type="button"
                    class="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                    @click="openUrlPreview(kelayakanDoc.fileUrl, 'Laporan Keputusan Penelitian BPDP')"
                  >
                    <Eye class="w-3.5 h-3.5" />
                    <span>Pratinjau Dokumen Penelitian</span>
                  </button>
                </div>
              </div>

              <!-- Dokumen SK Dirut (if already uploaded in proposal) -->
              <div v-if="skDirutDoc" class="sm:col-span-2 flex flex-col gap-1 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 rounded-xl border border-emerald-200/70 dark:border-emerald-800/60">
                <div class="flex items-center justify-between">
                  <span class="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 uppercase">Dokumen SK Dirut Terunggah</span>
                  <span class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300">Tersedia</span>
                </div>
                <div class="flex items-center justify-between gap-2 mt-1">
                  <div class="flex flex-col min-w-0">
                    <div class="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-medium text-xs truncate">
                      <FileText class="w-4 h-4 text-emerald-600 shrink-0" />
                      <span class="truncate">{{ skDirutDoc.fileName }}</span>
                    </div>
                    <span v-if="skDirutDoc.uploadedBy" class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 ml-6">
                      Diunggah oleh {{ skDirutDoc.uploadedBy }}<template v-if="skDirutDoc.uploadedAtFormatted"> • {{ skDirutDoc.uploadedAtFormatted }}</template>
                    </span>
                  </div>
                  <div class="flex items-center gap-2 shrink-0">
                    <button
                      v-if="skDirutDoc.fileUrl"
                      type="button"
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      @click="openUrlPreview(skDirutDoc.fileUrl, 'Dokumen SK Dirut')"
                    >
                      <Eye class="w-3.5 h-3.5" />
                      <span>Pratinjau</span>
                    </button>
                    <a
                      v-if="skDirutDoc.fileUrl"
                      :href="skDirutDoc.fileUrl"
                      download
                      class="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#066C2A] text-white hover:bg-emerald-800 flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Download class="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Logs History -->
          <LogStatusUsulan :logs="(activeUsulan as any).logs || (activeUsulan as any).trackingStatus || []" />

          <!-- Bottom Navigation -->
          <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
            <button
              type="button"
              @click="currentStep = 1"
              class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <ChevronLeft class="w-4 h-4" />
              <span>Kembali ke Pratinjau</span>
            </button>
          </div>
        </div>

        <!-- Right Panel: SK Dirut generator -->
        <div class="flex flex-col gap-5">
          <!-- SK Dirut Finalization Card -->
          <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
            <h3 class="text-[14px] font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-3">
              Penerbitan SK Dirut
            </h3>

            <!-- Case 1: Status is Selesai / SK_DIRUT_PUBLISHED -->
            <div v-if="isPublished" class="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 text-center gap-2.5 text-slate-500">
              <CheckCircle2 class="w-8 h-8 text-emerald-600" />
              <p class="text-[13px] font-semibold text-slate-700 dark:text-slate-350">
                SK Dirut Resmi Terbit
              </p>
              <p class="text-[11px] leading-relaxed">
                SK Terbit dengan nomor <span class="font-bold text-[#066C2A] dark:text-emerald-400">{{ activeUsulan.no_sk_dirut || nomorSk || '-' }}</span><template v-if="(activeUsulan as any).tanggal_sk_dirut || tanggalSk">, tanggal <span class="font-bold text-[#066C2A] dark:text-emerald-400">{{ formatDate((activeUsulan as any).tanggal_sk_dirut || tanggalSk) }}</span></template>.
              </p>
              <div v-if="skDirutDoc?.fileUrl" class="pt-2 w-full flex flex-col gap-1.5">
                <button
                  type="button"
                  class="w-full h-9 rounded-lg border border-emerald-250 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  @click="openUrlPreview(skDirutDoc.fileUrl, 'SK Dirut Resmi Bertanda Tangan')"
                >
                  <Eye class="w-4 h-4" />
                  <span>Lihat Dokumen SK Dirut Signed</span>
                </button>
                <div v-if="skDirutDoc?.uploadedBy" class="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                  Diunggah oleh {{ skDirutDoc.uploadedBy }}<template v-if="skDirutDoc.uploadedAtFormatted"> • {{ skDirutDoc.uploadedAtFormatted }}</template>
                </div>
              </div>
            </div>

            <!-- Case 2: Actions to publish SK -->
            <div v-else class="flex flex-col gap-5">
              <!-- Download & Upload Signed SK Form -->
              <div class="flex flex-col gap-4">
                <!-- 1. Unduh Format SK Dirut & Tanda Tangan -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                    1. Unduh Format SK Dirut & Tanda Tangan
                  </label>
                  <button
                    type="button"
                    @click="downloadSkFormat"
                    class="w-full h-9 rounded-lg border border-emerald-250 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                  >
                    <Download class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" />
                    <span>Unduh Format SK Dirut (.pdf / .txt)</span>
                  </button>
                </div>

                <!-- 2. Input Nomor SK -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                    2. Nomor SK Dirut <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    v-model="nomorSk"
                    placeholder="Contoh: SK/DIRUT/BPDP/005/2026"
                    class="w-full h-10 px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-[13px] bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#066C2A] focus:ring-1 focus:ring-[#066C2A]"
                  />
                </div>

                <!-- 3. Input Tanggal SK -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                    3. Tanggal SK Dirut <span class="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    v-model="tanggalSk"
                    class="w-full h-10 px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-[13px] bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#066C2A] focus:ring-1 focus:ring-[#066C2A] cursor-pointer"
                  />
                </div>

                <!-- 4. File Uploader -->
                <div class="flex flex-col gap-1.5">
                  <div class="flex items-center justify-between">
                    <label class="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                      4. Unggah SK Dirut Signed (Tanda Tangan) <span class="text-rose-500">*</span>
                    </label>
                    <span v-if="skDirutDoc?.fileUrl" class="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <Check class="w-3 h-3" /> Berkas ada di sistem
                    </span>
                  </div>

                  <FileUpload
                    id="sk-signed-uploader"
                    placeholder="Pilih berkas PDF SK Dirut Signed (Max 10MB)"
                    accept=".pdf"
                    document-label="SK-Dirut"
                    :proposal-number="activeUsulan?.nomor_proposal || (activeUsulan as any)?.nomorProposal || (activeUsulan as any)?.nomorUsulan || 'DRAFT'"
                    :institution-name="activeUsulan?.lembaga?.namaLembaga || (activeUsulan as any)?.kelembagaan?.nama_lembaga || activeUsulan?.namaKelompokTani || 'Kelembagaan'"
                    :initial-file-name="skDirutDoc?.fileName || (activeUsulan.no_sk_dirut ? 'sk_dirut_signed.pdf' : '')"
                    @file-selected="handleFileSelected"
                  />

                  <!-- Preview shortcut if doc already uploaded -->
                  <div v-if="skDirutDoc?.fileUrl && !selectedFile" class="pt-1 flex flex-col gap-1 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div class="flex items-center justify-between">
                      <span class="truncate">{{ skDirutDoc.fileName }}</span>
                      <button
                        type="button"
                        class="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
                        @click="openUrlPreview(skDirutDoc.fileUrl, 'SK Dirut')"
                      >
                        <Eye class="w-3.5 h-3.5" />
                        <span>Pratinjau</span>
                      </button>
                    </div>
                    <div v-if="skDirutDoc?.uploadedBy" class="text-[11px] text-slate-500 dark:text-slate-400">
                      Diunggah oleh {{ skDirutDoc.uploadedBy }}<template v-if="skDirutDoc.uploadedAtFormatted"> • {{ skDirutDoc.uploadedAtFormatted }}</template>
                    </div>
                  </div>
                </div>

                <!-- Final Submit Button -->
                <button
                  type="button"
                  @click="handleSelesai"
                  :disabled="!nomorSk.trim() || !tanggalSk || (!selectedFile && !skDirutDoc?.fileUrl) || isSubmitting"
                  :class="[
                    'w-full h-10 rounded-xl text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200 cursor-pointer',
                    nomorSk.trim() && tanggalSk && (selectedFile || skDirutDoc?.fileUrl) && !isSubmitting
                      ? 'bg-[#066C2A] hover:bg-[#065A23]'
                      : 'bg-slate-300 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed',
                  ]"
                >
                  <span>Selesaikan Penerbitan SK Dirut</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <DocumentPreviewModal
      :is-open="showPreview && !!previewDoc"
      :title="previewDoc?.title ?? ''"
      :data-url="previewDoc?.dataUrl ?? ''"
      :mime-type="previewDoc?.mimeType ?? 'application/pdf'"
      @close="showPreview = false"
    />
  </div>
</template>
