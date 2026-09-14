<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePengusulanStore } from '@/stores/pengusulan';
import { useRekomtekStore } from '@/stores/rekomtek';
import { useVerifikasiDitjenbunStore } from '@/stores/verifikasiDitjenbun';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composables/useToast';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Badge from '@/components/ui/Badge.vue';
import VerifikasiDokumenItem from '@/components/rekomtek/VerifikasiDokumenItem.vue';
import FormPengembalianModal from '@/components/rekomtek/FormPengembalianModal.vue';
import ApprovalConfirmationModal from '@/components/approval/ApprovalConfirmationModal.vue';
import LogStatusUsulan from '@/components/rekomtek/LogStatusUsulan.vue';
import PratinjauPekebunDanDokumenTab from '@/components/verification/PratinjauPekebunDanDokumenProposal.vue';
import FileUpload from '@/components/ui/FileUpload.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import { parseCoordinatePolygon } from '@/lib/coordinatePolygon';
import { ChevronLeft, ChevronRight, CheckCircle2, Download, FileCheck, X, History, Eye, AlertCircle } from 'lucide-vue-next';
import AuditTrailSidebar from '@/components/ui/AuditTrailSidebar.vue';
import Button from '@/components/ui/Button.vue';
import DocumentPreviewModal from '@/components/ui/DocumentPreviewModal.vue';
import RekomtekPreviewModal from '@/components/ditjenbun/RekomtekPreviewModal.vue';
import {
  printRekomtekDocument,
  getFallbackNomorRekomtek,
  type RekomtekDocumentData,
  type RekomtekItemRAB,
} from '@/utils/rekomtekPdfGenerator';
import { rabService } from '@/services/rab.service';
import type { SpatialOverlapResponse, Proposal } from '@/types/pengusulan';
import { getRoleAwareStatusLabel, getRoleAwareStatusVariant } from '@/lib/statusRoleHelper';
import { formatUploadedAt } from '@/utils/formatUploadedAt';

const route = useRoute();
const router = useRouter();
const pengusulanStore = usePengusulanStore();
const store = useRekomtekStore();
const verifikasiDitjenbunStore = useVerifikasiDitjenbunStore();
const authStore = useAuthStore();
const toast = useToast();

const usulanId = route.params.id as string;
const pageLoading = ref(true);
const isReturnModalOpen = ref(false);
const showAuditTrail = ref(false);
const currentStep = ref(1);

const steps = [
  { id: 1, title: 'Pratinjau Pekebun & Dokumen', description: 'Tinjau Data & Lahan', icon: Eye },
  { id: 2, title: 'Asistensi Dokumen', description: 'Validasi Berkas & Rekomtek', icon: FileCheck },
];



const assistanceType = ref<'UANG' | 'BARANG' | ''>('');
const nomorRekomtek = ref('');
const isUploading = ref(false);
const isSubmitting = ref(false);
const signedFileUploaded = ref(false);
const showRekomtekPreviewModal = ref(false);
const rabItems = ref<any[]>([]);

const showConfirmModal = ref(false);
const confirmActionType = ref<'approve' | 'reject'>('approve');
const confirmDestination = ref('');
const confirmNotes = ref('');
const pendingConfirmAction = ref<(() => Promise<void>) | null>(null);

const loadProposalRab = async (propId: string | number) => {
  try {
    const res = await rabService.getByProposalId(propId);
    if (res && (res as any).data && (res as any).data.items) {
      rabItems.value = (res as any).data.items;
    }
  } catch (e) {
    console.warn('Gagal memuat item RAB proposal untuk rekomtek:', e);
  }
};

const currentRekomtekDocData = computed<RekomtekDocumentData | null>(() => {
  if (!activeUsulan.value) return null;
  const u = activeUsulan.value as any;

  const namaLembaga = u?.lembaga?.namaLembaga || u?.kelembagaan?.nama_lembaga || u?.namaKelompokTani || u?.namaLembagaPekebun || 'Lembaga Pengusul';
  const alamat = u?.lembaga?.alamat || u?.kelembagaan?.alamat || u?.alamat || u?.desa || u?.alamatLembaga || 'Alamat Lembaga Pengusul';
  const luas = Number(u?.luas_kebun || u?.luasKebun || u?.luas_lahan || u?.luasLahan || 0);
  const pekebun = Number(u?.total_pekebun || u?.totalPekebun || u?.pekebuns?.length || 0);
  const paket = u?.paket_sarpras || u?.paketSarpras || u?.namaPaket || 'Sarana dan Prasarana Perkebunan Kelapa Sawit';
  const total = Number(u?.total_anggaran || u?.totalAnggaran || 0);

  const mappedItems: RekomtekItemRAB[] = (rabItems.value && rabItems.value.length > 0)
    ? rabItems.value.map((it: any, idx: number) => ({
        no: idx + 1,
        namaBarang: it.uraian || it.namaBarang || it.jenis || 'Barang/Jasa Sarpras',
        satuan: it.satuan || it.unit || 'Unit',
        volume: Number(it.volume || it.jumlahTotal || 1),
        hargaSatuan: Number(it.hargaSatuan || it.price_per_unit || 0),
        totalHarga: Number(it.subTotal || it.total_price || 0),
      }))
    : [];

  return {
    nomorSurat: nomorRekomtek.value.trim() || undefined,
    sifat: 'Biasa',
    lampiran: 'Satu Berkas',
    hal: `Rekomendasi Teknis Sarana dan Prasarana Kegiatan ${paket} ${namaLembaga}`,
    kelembagaan: {
      namaLembaga,
      badanHukum: u?.lembaga?.nomorBadanHukum || u?.nomor_sk_kumham || 'No. AHU-0001234.AH.01.26.TAHUN 2020',
      alamatLembaga: alamat,
      luasArealHa: luas,
      jumlahPekebun: pekebun,
      lokasiKebun: alamat,
    },
    paketSarpras: {
      namaPaket: paket,
      jenisBantuan: assistanceType.value || 'BARANG',
      totalNilaiRp: total,
    },
    itemsRAB: mappedItems,
    pejabatDitjenbun: {
      jabatan: 'Plt. Direktur Jenderal Perkebunan',
      nama: 'Heru Tri Widarto, S.Si., M.Sc',
      nip: '197204121999031004',
      isDraft: true,
    },
  };
});

function persistRekomtekGeneratedDate() {
  const nowIso = new Date().toISOString();
  if (activeUsulan.value) {
    (activeUsulan.value as any).tanggal_rekomtek = nowIso;
    (activeUsulan.value as any).tanggalRekomtek = nowIso;
    if ((activeUsulan.value as any).rekomtek) {
      (activeUsulan.value as any).rekomtek.tanggalTerbit = nowIso;
    }
  }
  if (pengajuan.value) {
    (pengajuan.value as any).tanggal_rekomtek = nowIso;
    (pengajuan.value as any).tanggalRekomtek = nowIso;
  }
  if (store.activeUsulan) {
    (store.activeUsulan as any).tanggal_rekomtek = nowIso;
    (store.activeUsulan as any).tanggalRekomtek = nowIso;
    if ((store.activeUsulan as any).rekomtek) {
      (store.activeUsulan as any).rekomtek.tanggalTerbit = nowIso;
    }
  }
}

const handlePreviewRekomtekDraft = () => {
  if (!currentRekomtekDocData.value) {
    toast.error('Data usulan belum lengkap untuk membuat draf Rekomtek.');
    return;
  }
  persistRekomtekGeneratedDate();
  showRekomtekPreviewModal.value = true;
};

const handleDownloadRekomtekDraft = () => {
  if (!currentRekomtekDocData.value) {
    toast.error('Data usulan belum lengkap untuk mengunduh draf Rekomtek.');
    return;
  }
  persistRekomtekGeneratedDate();
  printRekomtekDocument(currentRekomtekDocData.value);
  toast.success('Draf Rekomtek siap dicetak / diunduh sebagai PDF.', 'Generate Sukses');
};

interface DocValidationState {
  docId?: number;
  valid: boolean | null;
  note: string;
  url: string;
  fileName?: string;
  uploadedBy?: string;
  uploadedAtFormatted?: string;
}

const validations = ref<{
  skCpcl: DocValidationState;
  suratPengantarProv: DocValidationState;
  beritaAcara: DocValidationState;
  beritaAcaraLapangan: DocValidationState;
}>({
  skCpcl: { valid: null, note: '', url: '', uploadedBy: '', uploadedAtFormatted: '' },
  suratPengantarProv: { valid: null, note: '', url: '', uploadedBy: '', uploadedAtFormatted: '' },
  beritaAcara: { valid: null, note: '', url: '', uploadedBy: '', uploadedAtFormatted: '' },
  beritaAcaraLapangan: { valid: null, note: '', url: '', uploadedBy: '', uploadedAtFormatted: '' },
});

const previewDoc = ref<{ dataUrl: string; mimeType: string; title: string } | null>(null);
const showPreview = ref(false);
const currentSpatialOverlap = ref<SpatialOverlapResponse | null>(null);
const rekomtekValidationNote = ref<string>('');
const existingRekomtekDocId = ref<number | undefined>(undefined);
const existingRekomtekFileName = ref<string>('');
const existingRekomtekFileUrl = ref<string>('');
const existingRekomtekUploadedBy = ref<string>('');
const existingRekomtekUploadedAtFormatted = ref<string>('');

function openUrlPreview(url: string, title: string) {
  if (!url) return;
  previewDoc.value = { dataUrl: url, mimeType: 'application/pdf', title };
  showPreview.value = true;
}

const pengajuan = computed<Proposal | null>(() => {
  if (pengusulanStore.activePengajuan && String(pengusulanStore.activePengajuan.id) === String(usulanId)) {
    return pengusulanStore.activePengajuan;
  }
  return pengusulanStore.listPengajuan.find((p) => String(p.id) === String(usulanId)) || null;
});

const activeUsulan = computed(() => {
  return pengajuan.value || store.activeUsulan || store.usulans.find((u) => String(u.id) === String(usulanId)) || null;
});

const regionalLetterMetadata = computed(() => {
  const u = (pengajuan.value || activeUsulan.value) as any;
  if (!u) return { noSurat: '', tglSurat: '', namaDinas: '' };
  const noSurat = u.no_surat_provinsi || u.noSuratProvinsi || '';
  const tglSurat = u.tgl_surat_provinsi || u.tglSuratProvinsi || '';
  const namaDinas = u.nama_dinas_provinsi || u.namaDinasProvinsi || u.nama_dinas_kabupaten || u.namaDinasKabupaten || '';
  return { noSurat, tglSurat, namaDinas };
});

const isPaketJalan = computed(() => {
  const u = (pengajuan.value || activeUsulan.value) as any;
  if (!u) return false;
  const js = String(u.jenisSarpras || u.paket || u.paket_sarpras || u.jenis_sarpras || '').toUpperCase();
  return js.includes('JALAN');
});

watch(
  isPaketJalan,
  (isJalan) => {
    if (!isJalan && assistanceType.value === 'UANG') {
      assistanceType.value = 'BARANG';
    } else if (!assistanceType.value) {
      assistanceType.value = 'BARANG';
    }
  },
  { immediate: true },
);

const isReadonly = computed(() => {
  const st = activeUsulan.value?.status || (activeUsulan.value as any)?.currentStatus;
  if (!st) return false;
  return !['PROV_SUBMITTED', 'VERIFIKASI_DITJENBUN', 'REV_FROM_DITJEN_VERIF', 'REV_FROM_DITJEN_APPR'].includes(st);
});

async function loadSpatialOverlap(proposalId: string | number) {
  currentSpatialOverlap.value = null;
  try {
    const res = await pengusulanStore.getSpatialOverlap(proposalId);
    currentSpatialOverlap.value = res;
  } catch {
    currentSpatialOverlap.value = null;
  }
}

function findProposalDoc(docType: string) {
  const p = pengajuan.value || (activeUsulan.value as any);
  if (!p) return null;
  const target = docType.toUpperCase();

  if (p.documents && Array.isArray(p.documents)) {
    const d = p.documents.find((doc: any) => (doc.document_type || '').toUpperCase() === target);
    if (d) {
      return {
        id: d.id !== undefined ? Number(String(d.id).replace(/[^\d]/g, '')) || d.id : undefined,
        fileName: d.file_name,
        fileUrl: d.file_url || '',
        uploadedBy: d.updated_by_name || d.created_by_name || d.uploadedBy || '',
        uploadedAtFormatted: formatUploadedAt(d.uploaded_at_formatted || d.uploadedAtFormatted, d.updated_at || d.created_at),
      };
    }
  }

  if (p.dokumen && Array.isArray(p.dokumen)) {
    const d = p.dokumen.find((doc: any) => (doc.tipeDokumen || '').toUpperCase() === target);
    if (d) {
      return {
        id: (d as any).id !== undefined ? Number(String((d as any).id).replace(/[^\d]/g, '')) || (d as any).id : undefined,
        fileName: d.namaFile,
        fileUrl: d.urlFile || '',
        uploadedBy: (d as any).updated_by_name || (d as any).created_by_name || (d as any).uploadedBy || '',
        uploadedAtFormatted: formatUploadedAt((d as any).uploaded_at_formatted || (d as any).uploadedAtFormatted, (d as any).updated_at || (d as any).created_at),
      };
    }
  }

  return null;
}

function syncProposalDocuments() {
  const skDoc = findProposalDoc('SK_CPCL');
  validations.value.skCpcl.docId = skDoc?.id;
  validations.value.skCpcl.url = skDoc?.fileUrl || '';
  validations.value.skCpcl.fileName = skDoc?.fileName || '';
  validations.value.skCpcl.uploadedBy = skDoc?.uploadedBy || '';
  validations.value.skCpcl.uploadedAtFormatted = skDoc?.uploadedAtFormatted || '';

  const suratDoc = findProposalDoc('SURAT_PENGANTAR_SK_CPCL') || findProposalDoc('SURAT_PENGANTAR');
  validations.value.suratPengantarProv.docId = suratDoc?.id;
  validations.value.suratPengantarProv.url = suratDoc?.fileUrl || '';
  validations.value.suratPengantarProv.fileName = suratDoc?.fileName || '';
  validations.value.suratPengantarProv.uploadedBy = suratDoc?.uploadedBy || '';
  validations.value.suratPengantarProv.uploadedAtFormatted = suratDoc?.uploadedAtFormatted || '';

  const baDoc = findProposalDoc('BERITA_ACARA_DOKUMEN');
  validations.value.beritaAcara.docId = baDoc?.id;
  validations.value.beritaAcara.url = baDoc?.fileUrl || '';
  validations.value.beritaAcara.fileName = baDoc?.fileName || '';
  validations.value.beritaAcara.uploadedBy = baDoc?.uploadedBy || '';
  validations.value.beritaAcara.uploadedAtFormatted = baDoc?.uploadedAtFormatted || '';

  const baLapDoc = findProposalDoc('BERITA_ACARA_LAPANGAN');
  validations.value.beritaAcaraLapangan.docId = baLapDoc?.id;
  validations.value.beritaAcaraLapangan.url = baLapDoc?.fileUrl || '';
  validations.value.beritaAcaraLapangan.fileName = baLapDoc?.fileName || '';
  validations.value.beritaAcaraLapangan.uploadedBy = baLapDoc?.uploadedBy || '';
  validations.value.beritaAcaraLapangan.uploadedAtFormatted = baLapDoc?.uploadedAtFormatted || '';

  // Auto-fill REKOMTEK document
  const rekomtekDoc = findProposalDoc('REKOMTEK');
  if (rekomtekDoc) {
    existingRekomtekDocId.value = rekomtekDoc.id;
    existingRekomtekFileName.value = rekomtekDoc.fileName || 'rekomtek_signed.pdf';
    existingRekomtekFileUrl.value = rekomtekDoc.fileUrl || '';
    existingRekomtekUploadedBy.value = rekomtekDoc.uploadedBy || '';
    existingRekomtekUploadedAtFormatted.value = rekomtekDoc.uploadedAtFormatted || '';
    signedFileUploaded.value = true;
  }
}

function isAllowedValidationRole(roleRaw?: string | null): boolean {
  if (!roleRaw) return false;
  const role = String(roleRaw).toUpperCase().trim();

  // Explicitly ignore validations from PROVINSI or KABUPATEN
  const isProvinsi = role.includes('PROVINSI') || role === 'PROV' || role.startsWith('PROV_') || role.endsWith('_PROV') || role.includes('_PROV_');

  const isKabupaten = role.includes('KABUPATEN') || role === 'KAB' || role.startsWith('KAB_') || role.endsWith('_KAB') || role.includes('_KAB_');

  if (isProvinsi || isKabupaten) {
    return false;
  }

  // Only allow DITJENBUN (verif & approval) and BPDP (verif & approval)
  const isDitjenbun = role === 'DITJENBUN_VERIFIKATOR' || role === 'DITJENBUN_APPROVAL' || role === 'DITJENBUN' || role.startsWith('DITJENBUN');

  const isBpdp = role === 'BPDP_VERIFIKATOR' || role === 'BPDP_APPROVAL' || role === 'BPDP' || role.startsWith('BPDP');

  return isDitjenbun || isBpdp;
}

const docAliases: Record<string, string[]> = {
  skCpcl: ['SKCPCL', 'SKCPCLKABUPATEN'],
  suratPengantarProv: ['SURATPENGANTARSKCPCL', 'SURATPENGANTAR', 'SURATPENGANTARPROV', 'SURATPENGANTARPROVINSI'],
  beritaAcara: ['BAVERIFIKASI', 'BERITAACARADOKUMEN', 'BERITAACARAVERIFIKASI', 'BERITAACARA', 'BADOKUMEN'],
  beritaAcaraLapangan: ['BAVERIFIKASILAPANGAN', 'BALAPANGAN', 'BERITAACARALAPANGAN', 'BERITAACARAVERIFIKASILAPANGAN'],
};

async function loadProposalDocumentValidations() {
  const proposalIdNum = Number(String(usulanId).replace(/[^\d]/g, '')) || usulanId;
  try {
    const res = await pengusulanStore.getProposalDocumentValidations({
      proposal_id: proposalIdNum,
    });

    const validationList = Array.isArray(res) ? res : (res as any)?.data || [];
    if (!validationList || validationList.length === 0) {
      validations.value.skCpcl.valid = null;
      validations.value.skCpcl.note = '';
      validations.value.suratPengantarProv.valid = null;
      validations.value.suratPengantarProv.note = '';
      validations.value.beritaAcara.valid = null;
      validations.value.beritaAcara.note = '';
      validations.value.beritaAcaraLapangan.valid = null;
      validations.value.beritaAcaraLapangan.note = '';
      rekomtekValidationNote.value = '';
      return;
    }

    // Filter only validations from DITJENBUN (verif & approval) and BPDP (verif & approval), not from PROVINSI or KABUPATEN
    const allowedValidationsList = validationList.filter((v: any) => {
      const role = v.validated_by_role || v.role || v.validatedByRole;
      return isAllowedValidationRole(role);
    });

    const applyVal = (key: 'skCpcl' | 'suratPengantarProv' | 'beritaAcara' | 'beritaAcaraLapangan') => {
      const docId = validations.value[key].docId;

      const matched = allowedValidationsList.filter((v: any) => {
        const vDocType = String(v.document_type || v.tipeDokumen || v.tipe_dokumen || '')
          .toUpperCase()
          .replace(/[-_\s]/g, '');

        if (vDocType.includes('REKOMTEK') || vDocType.includes('KELAYAKAN')) return false;

        const vDocId = Number(v.dokumen_proposal_id || v.proposal_document_id || v.document_id || v.dokumen_id);
        if (docId && vDocId && vDocId === Number(docId)) return true;
        if (vDocType && docAliases[key]?.includes(vDocType)) return true;

        return false;
      });

      if (matched.length > 0) {
        const latest = matched.slice().sort((a: any, b: any) => {
          const timeA = new Date(a.validated_at || a.created_at || 0).getTime();
          const timeB = new Date(b.validated_at || b.created_at || 0).getTime();
          if (timeA !== timeB) return timeB - timeA;
          return Number(b.id || 0) - Number(a.id || 0);
        })[0];

        validations.value[key].valid = latest.is_valid;
        validations.value[key].note = latest.notes || '';
      } else {
        validations.value[key].valid = null;
        validations.value[key].note = '';
      }
    };

    applyVal('skCpcl');
    applyVal('suratPengantarProv');
    applyVal('beritaAcara');
    applyVal('beritaAcaraLapangan');

    // Check REKOMTEK revision note if rejected by Ketua Tim or BPDP (is_valid === false)
    const matchedRekomtek = allowedValidationsList.filter((v: any) => {
      const vDocId = Number(v.dokumen_proposal_id || v.proposal_document_id || v.document_id || v.dokumen_id);
      if (existingRekomtekDocId.value && vDocId && vDocId === Number(existingRekomtekDocId.value)) return true;

      const dt = String(v.document_type || v.tipeDokumen || v.tipe_dokumen || '')
        .toUpperCase()
        .replace(/[-_\s]/g, '');
      return dt.includes('REKOMTEK');
    });

    if (matchedRekomtek.length > 0) {
      const latestRekomtek = matchedRekomtek.slice().sort((a: any, b: any) => {
        const timeA = new Date(a.validated_at || a.created_at || 0).getTime();
        const timeB = new Date(b.validated_at || b.created_at || 0).getTime();
        if (timeA !== timeB) return timeB - timeA;
        return Number(b.id || 0) - Number(a.id || 0);
      })[0];

      if (latestRekomtek.is_valid === false) {
        rekomtekValidationNote.value = latestRekomtek.notes || '';
      } else {
        rekomtekValidationNote.value = '';
      }
    } else {
      rekomtekValidationNote.value = '';
    }
  } catch (err) {
    console.error('Gagal memuat riwayat validasi dokumen proposal:', err);
  }
}

onMounted(async () => {
  if (authStore.activeRole !== 'DITJENBUN_VERIFIKATOR') {
    toast.error('Akses ditolak: Anda bukan Verifikator Ditjenbun', 'Forbidden');
    router.push('/access-denied');
    return;
  }

  pageLoading.value = true;
  try {
    await Promise.allSettled([pengusulanStore.getProposalDetail(usulanId), loadSpatialOverlap(usulanId)]);
    loadProposalRab(usulanId);

    if (!pengajuan.value) {
      const item = await store.fetchUsulanById(usulanId);
      if (!item) {
        toast.error('Usulan tidak ditemukan', 'Error');
        router.push('/ditjenbun/rekomtek');
        return;
      }
    }

    syncProposalDocuments();
    await loadProposalDocumentValidations();

    if (activeUsulan.value) {
      const u = activeUsulan.value as any;
      if (u.bantuanType || u.bentuk_bantuan) {
        assistanceType.value = (u.bantuanType || u.bentuk_bantuan) as 'UANG' | 'BARANG';
      }
      if (u.rekomtek?.nomorRekomtek || u.no_rekomtek || u.nomor_rekomtek) {
        nomorRekomtek.value = u.rekomtek?.nomorRekomtek || u.no_rekomtek || u.nomor_rekomtek;
      }
      if (u.rekomtek?.signedUrl || existingRekomtekFileUrl.value) {
        signedFileUploaded.value = true;
      }
    }
  } catch (err: any) {
    console.error('Gagal memuat usulan Ditjenbun:', err);
    toast.error(err.message || 'Gagal memuat usulan', 'Error');
  } finally {
    pageLoading.value = false;
  }
});

watch(
  () => usulanId,
  async (newId) => {
    if (newId) {
      pageLoading.value = true;
      try {
        await Promise.allSettled([pengusulanStore.getProposalDetail(newId), loadSpatialOverlap(newId)]);
        syncProposalDocuments();
        await loadProposalDocumentValidations();
      } finally {
        pageLoading.value = false;
      }
    }
  },
);

watch(
  () => pengajuan.value,
  async (newVal) => {
    if (newVal) {
      syncProposalDocuments();
      await loadProposalDocumentValidations();
    }
  },
);

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
  if (typeof lahan.koordinatPoligon === 'string') {
    return parsePolygonCoords(lahan.koordinatPoligon);
  }
  return [];
}

const activePolygons = computed(() => {
  if (currentSpatialOverlap.value?.active_polygons?.length) {
    return currentSpatialOverlap.value.active_polygons.map((poly: any) => ({
      coordinates: poly.coordinates || [],
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
    }))
    .filter((p) => p.polygons.length > 0);
});

const allDocumentsChecked = computed(() => {
  const v = validations.value;
  return v.skCpcl.valid !== null && v.suratPengantarProv.valid !== null && v.beritaAcara.valid !== null && v.beritaAcaraLapangan.valid !== null;
});

const isReturnable = computed(() => {
  const v = validations.value;
  return v.skCpcl.valid === false || v.suratPengantarProv.valid === false || v.beritaAcara.valid === false || v.beritaAcaraLapangan.valid === false;
});

const hasEmptyRejectionNotes = computed(() => {
  const list = [validations.value.skCpcl, validations.value.suratPengantarProv, validations.value.beritaAcara, validations.value.beritaAcaraLapangan];
  const rejectedItems = list.filter((item) => item.valid === false);
  if (rejectedItems.length === 0) return true;
  return rejectedItems.some((item) => !item.note || item.note.trim() === '');
});

const saveValidations = async () => {
  if (store.activeUsulan) {
    await store.submitAsistensi(usulanId, {
      skCpcl: { ...validations.value.skCpcl },
      suratPengantarProv: { ...validations.value.suratPengantarProv },
      beritaAcara: { ...validations.value.beritaAcara },
      beritaAcaraLapangan: { ...validations.value.beritaAcaraLapangan },
      pekebun: (activeUsulan.value as any)?.asistensiChecklist?.pekebun ?? [],
    });
  }
};

const handleOpenReturnModal = () => {
  isReturnModalOpen.value = true;
};

const handleCloseReturnModal = () => {
  isReturnModalOpen.value = false;
};

function buildProposalValidationPayloads() {
  const payloads: any[] = [];
  const proposalIdNum = Number(String(usulanId).replace(/[^\d]/g, '')) || 0;

  const checkDoc = (type: string, docState: DocValidationState) => {
    if (docState.valid !== null) {
      const docId = docState.docId || 0;
      payloads.push({
        dokumen_proposal_id: docId,
        proposal_document_id: docId,
        pengajuan_id: proposalIdNum,
        proposal_id: proposalIdNum,
        document_type: type,
        is_valid: docState.valid === true,
        notes: docState.note || '',
        validated_by_role: 'DITJENBUN_VERIFIKATOR',
      });
    }
  };

  checkDoc('SK_CPCL', validations.value.skCpcl);
  checkDoc('SURAT_PENGANTAR_SK_CPCL', validations.value.suratPengantarProv);
  checkDoc('BERITA_ACARA_DOKUMEN', validations.value.beritaAcara);
  checkDoc('BERITA_ACARA_LAPANGAN', validations.value.beritaAcaraLapangan);

  return payloads;
}

const handleReturnSubmit = (payload: { tujuan: 'PERBAIKAN_DINAS_KAB' | 'PERBAIKAN_DINAS_PROV'; alasan: string }) => {
  confirmActionType.value = 'reject';
  confirmDestination.value = payload.tujuan === 'PERBAIKAN_DINAS_KAB' ? 'Dinas Kabupaten/Kota (Revisi)' : 'Dinas Provinsi (Revisi)';

  const notesArray: string[] = [];
  if (validations.value.skCpcl.valid === false && validations.value.skCpcl.note) {
    notesArray.push(`SK CPCL: ${validations.value.skCpcl.note}`);
  }
  if (validations.value.suratPengantarProv.valid === false && validations.value.suratPengantarProv.note) {
    notesArray.push(`Surat Pengantar SK CPCL: ${validations.value.suratPengantarProv.note}`);
  }
  if (validations.value.beritaAcara.valid === false && validations.value.beritaAcara.note) {
    notesArray.push(`Berita Acara Verifikasi: ${validations.value.beritaAcara.note}`);
  }
  if (validations.value.beritaAcaraLapangan.valid === false && validations.value.beritaAcaraLapangan.note) {
    notesArray.push(`Berita Acara Verifikasi Lapangan: ${validations.value.beritaAcaraLapangan.note}`);
  }
  if (payload.alasan) {
    notesArray.push(payload.alasan);
  }

  confirmNotes.value = notesArray.join('\n') || 'Dokumen usulan dikembalikan untuk perbaikan';

  pendingConfirmAction.value = async () => {
    try {
      const validationPayloads = buildProposalValidationPayloads();
      await verifikasiDitjenbunStore.submitForRevision(usulanId, validationPayloads, confirmNotes.value, payload.tujuan);
      await store.kembalikanUsulan(usulanId, payload.tujuan, confirmNotes.value, authStore.user?.name || 'Verifikator Ditjenbun');
      toast.warning('Perintah perbaikan berhasil dikirim ke dinas daerah.', 'Revisi Dikirim');
      isReturnModalOpen.value = false;
      showConfirmModal.value = false;
      router.push('/ditjenbun/rekomtek');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengembalikan proposal');
    }
  };
  showConfirmModal.value = true;
};

const uploadedRekomtekFile = ref<File | null>(null);

const handleFileSelected = async (file: File) => {
  isUploading.value = true;
  uploadedRekomtekFile.value = file;
  setTimeout(async () => {
    await store.uploadRekomtek(usulanId, nomorRekomtek.value, `/files/signed-rekomtek-${usulanId}.pdf`);
    signedFileUploaded.value = true;
    isUploading.value = false;
    toast.success('Berkas Rekomtek bertanda tangan berhasil diunggah.', 'Unggah Sukses');
  }, 1000);
};

const handleAjukan = () => {
  if (!nomorRekomtek.value.trim()) {
    toast.error('Mohon masukkan nomor Rekomtek.', 'Validasi Gagal');
    return;
  }
  if (!signedFileUploaded.value && !existingRekomtekFileUrl.value) {
    toast.error('Mohon unggah berkas Rekomtek yang sudah ditandatangani.', 'Validasi Gagal');
    return;
  }

  confirmActionType.value = 'approve';
  confirmDestination.value = 'Ketua Tim Ditjenbun (Approval)';
  confirmNotes.value = '';
  pendingConfirmAction.value = async () => {
    try {
      persistRekomtekGeneratedDate();
      const validationPayloads = buildProposalValidationPayloads();
      await verifikasiDitjenbunStore.submitToDitjenApproval(usulanId, {
        validations: validationPayloads,
        no_rekomtek: nomorRekomtek.value.trim(),
        bentuk_bantuan: (assistanceType.value as 'UANG' | 'BARANG') || 'UANG',
        rekomtekFile: uploadedRekomtekFile.value || undefined,
        rekomtekDocId: existingRekomtekDocId.value,
      });

      await store.uploadRekomtek(usulanId, nomorRekomtek.value.trim(), `/files/signed-rekomtek-${usulanId}.pdf`);
      await store.ajukanRekomtek(usulanId, authStore.user?.name || 'Verifikator Ditjenbun');
      toast.success('Usulan Rekomtek berhasil diajukan ke Ketua Tim Ditjenbun.', 'Berhasil Diajukan');
      showConfirmModal.value = false;
      router.push('/ditjenbun/rekomtek');
    } catch (err: any) {
      toast.error(err.message || 'Gagal mengajukan usulan Rekomtek');
    }
  };
  showConfirmModal.value = true;
};

const executePendingAction = async () => {
  if (!pendingConfirmAction.value) return;
  isSubmitting.value = true;
  try {
    await pendingConfirmAction.value();
  } catch {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="min-h-screen bg-transparent px-4 lg:px-6 py-4 flex flex-col gap-5">
    <!-- Header -->
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col gap-3">
      <div class="flex items-center gap-2">
        <router-link to="/ditjenbun/rekomtek" class="text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
          <ChevronLeft class="w-5 h-5" />
        </router-link>
        <Breadcrumb />
      </div>

      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-1" v-if="activeUsulan">
        <div class="flex flex-col gap-1">
          <div class="flex items-center gap-2">
            <Badge :variant="getRoleAwareStatusVariant(activeUsulan.status || (activeUsulan as any).currentStatus, 'DITJENBUN_VERIFIKATOR')">Status: {{ getRoleAwareStatusLabel(activeUsulan.status || (activeUsulan as any).currentStatus, 'DITJENBUN_VERIFIKATOR') }}</Badge>
            <span class="text-[11px] font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200/50 dark:border-slate-700/50">
              {{ (activeUsulan as any).komoditas || 'Kelapa' }}
            </span>
            <span class="text-[11px] font-mono text-slate-400">ID: {{ activeUsulan.id }}</span>
          </div>
          <h1 class="text-base md:text-lg font-bold text-slate-900 dark:text-white font-apple-display-lg mt-1">
            {{ (activeUsulan as any).lembaga?.namaLembaga || (activeUsulan as any).kelembagaan?.nama_lembaga || (activeUsulan as any).namaKelompokTani || 'Lembaga Pengusul' }}
          </h1>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Nomor Pengusulan: <span class="font-semibold text-slate-800 dark:text-slate-200">{{ (activeUsulan as any).nomor_proposal || (activeUsulan as any).nomorProposal || (activeUsulan as any).nomorUsulan || '-' }}</span>
          </p>
        </div>
        <div>
          <Button variant="primary" size="sm" @click="showAuditTrail = !showAuditTrail"> <History class="w-4 h-4" /> Lihat Riwayat </Button>
        </div>
      </div>
    </header>

    <div v-if="pageLoading" class="flex flex-col gap-5">
      <Skeleton class="h-20 w-full rounded-2xl" />
      <Skeleton class="h-60 w-full rounded-2xl" />
      <Skeleton class="h-40 w-full rounded-2xl" />
    </div>

    <div v-else-if="activeUsulan" class="flex flex-col gap-5">
      <!-- 2-Step Progress Indicator -->
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

        <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <router-link to="/ditjenbun/rekomtek">
            <Button variant="outline" size="sm" class="flex items-center gap-1.5 cursor-pointer"> <ChevronLeft class="w-4 h-4" /> Kembali ke Antrean </Button>
          </router-link>
          <button type="button" @click="currentStep = 2" class="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-[#066C2A] hover:bg-emerald-800 text-white transition-all shadow-sm active:scale-95 cursor-pointer">
            <span>Lanjut ke Asistensi Dokumen</span>
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Step 2: Asistensi Dokumen -->
      <div v-else-if="currentStep === 2" class="flex flex-col gap-5">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <!-- Left Panel: Validation & Logs -->
          <div class="lg:col-span-2 flex flex-col gap-5">
            <!-- Validation Card -->
            <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col gap-5">
              <div class="flex flex-col gap-1">
                <h3 class="text-[14px] font-semibold text-slate-900 dark:text-white">Pelaksanaan Asistensi Dokumen Usulan</h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">Verifikasi kelengkapan dan kesesuaian berkas pengantar dari dinas daerah serta data pekebun.</p>
              </div>

              <!-- SK CPCL -->
              <VerifikasiDokumenItem
                title="SK CPCL"
                subtitle="Dari Dinas Kabupaten"
                badgeType="emerald"
                v-model:valid="validations.skCpcl.valid"
                v-model:note="validations.skCpcl.note"
                :fileUrl="validations.skCpcl.url"
                :uploadedBy="validations.skCpcl.uploadedBy"
                :uploadedAtFormatted="validations.skCpcl.uploadedAtFormatted"
                downloadLabel="Download SK CPCL"
                :readonly="isReadonly"
                @update:valid="saveValidations"
                @update:note="saveValidations"
                @preview="openUrlPreview(validations.skCpcl.url, 'SK CPCL')"
              />

              <!-- Surat Pengantar SK CPCL -->
              <VerifikasiDokumenItem
                title="Surat Pengantar SK CPCL"
                subtitle="Dari Dinas Provinsi"
                badgeType="blue"
                v-model:valid="validations.suratPengantarProv.valid"
                v-model:note="validations.suratPengantarProv.note"
                :fileUrl="validations.suratPengantarProv.url"
                :uploadedBy="validations.suratPengantarProv.uploadedBy"
                :uploadedAtFormatted="validations.suratPengantarProv.uploadedAtFormatted"
                downloadLabel="Download Surat Pengantar"
                :readonly="isReadonly"
                @update:valid="saveValidations"
                @update:note="saveValidations"
                @preview="openUrlPreview(validations.suratPengantarProv.url, 'Surat Pengantar SK CPCL')"
              />

              <!-- Metadata Surat Pengantar SK CPCL Provinsi & Daerah -->
              <div
                v-if="regionalLetterMetadata.noSurat || regionalLetterMetadata.namaDinas"
                class="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/80 dark:border-slate-700/80 grid grid-cols-1 md:grid-cols-3 gap-3 -mt-2"
              >
                <div class="flex flex-col">
                  <span class="text-[10px] text-slate-400 font-medium">Nomor Surat Provinsi</span>
                  <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">{{ regionalLetterMetadata.noSurat || '-' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[10px] text-slate-400 font-medium">Tanggal Surat Provinsi</span>
                  <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">{{ regionalLetterMetadata.tglSurat || '-' }}</span>
                </div>
                <div class="flex flex-col">
                  <span class="text-[10px] text-slate-400 font-medium">Nomenklatur Nama Dinas</span>
                  <span class="text-xs font-semibold text-slate-800 dark:text-slate-200">{{ regionalLetterMetadata.namaDinas || '-' }}</span>
                </div>
              </div>

              <!-- Berita Acara Verifikasi -->
              <VerifikasiDokumenItem
                title="Berita Acara Verifikasi Dokumen"
                subtitle="Dari Dinas Kabupaten & Provinsi"
                badgeType="amber"
                v-model:valid="validations.beritaAcara.valid"
                v-model:note="validations.beritaAcara.note"
                :fileUrl="validations.beritaAcara.url"
                :uploadedBy="validations.beritaAcara.uploadedBy"
                :uploadedAtFormatted="validations.beritaAcara.uploadedAtFormatted"
                downloadLabel="Download Berita Acara"
                :readonly="isReadonly"
                @update:valid="saveValidations"
                @update:note="saveValidations"
                @preview="openUrlPreview(validations.beritaAcara.url, 'Berita Acara Verifikasi Dokumen')"
              />

              <!-- Berita Acara Verifikasi Lapangan -->
              <VerifikasiDokumenItem
                title="Berita Acara Verifikasi Lapangan"
                subtitle="Dari Dinas Kabupaten & Provinsi"
                badgeType="amber"
                v-model:valid="validations.beritaAcaraLapangan.valid"
                v-model:note="validations.beritaAcaraLapangan.note"
                :fileUrl="validations.beritaAcaraLapangan.url"
                :uploadedBy="validations.beritaAcaraLapangan.uploadedBy"
                :uploadedAtFormatted="validations.beritaAcaraLapangan.uploadedAtFormatted"
                downloadLabel="Download Berita Acara Lapangan"
                :readonly="isReadonly"
                @update:valid="saveValidations"
                @update:note="saveValidations"
                @preview="openUrlPreview(validations.beritaAcaraLapangan.url, 'Berita Acara Verifikasi Lapangan')"
              />
            </div>

            <!-- Logs History (Bottom) -->
            <LogStatusUsulan :logs="(activeUsulan as any).logs || (activeUsulan as any).trackingStatus || []" />
          </div>

          <!-- Right Panel: Actions -->
          <div class="flex flex-col gap-5">
            <!-- Verification Decision Card -->
            <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col gap-4">
              <h3 class="text-[14px] font-semibold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800/80 pb-3">Keputusan Asistensi</h3>

              <!-- Case 1: Status not waiting for verification -->
              <div v-if="isReadonly" class="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-850 text-center gap-2 text-slate-500">
                <CheckCircle2 class="w-8 h-8 text-emerald-600" />
                <p class="text-[13px] font-semibold text-slate-700 dark:text-slate-350">Tahap Asistensi Selesai</p>
                <p class="text-[11px] leading-relaxed">
                  Usulan saat ini berada pada status <span class="font-bold text-[#066C2A] dark:text-emerald-400">{{ (activeUsulan.status || (activeUsulan as any).currentStatus || '').replace(/_/g, ' ') }}</span
                  >.
                </p>
              </div>

              <!-- Case 2: Has invalid items - show return button -->
              <div v-else-if="isReturnable" class="flex flex-col gap-3.5">
                <div class="flex gap-2.5 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/30 p-3 rounded-xl">
                  <X class="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
                  <p class="text-[12px] text-rose-700 dark:text-rose-400 leading-normal">Ada dokumen yang ditandai <strong>tidak sesuai</strong>. Pastikan setiap dokumen yang ditolak memiliki catatan alasan perbaikan sebelum dikirim.</p>
                </div>

                <button
                  type="button"
                  @click="handleOpenReturnModal"
                  :disabled="hasEmptyRejectionNotes"
                  :class="[
                    'w-full h-10 rounded-lg text-xs font-semibold text-white transition-all duration-200 shadow-sm',
                    hasEmptyRejectionNotes ? 'bg-slate-300 dark:bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:scale-95 cursor-pointer',
                  ]"
                >
                  Kembalikan untuk Perbaikan
                </button>
              </div>

              <!-- Case 3: Still has unchecked items -->
              <div v-else-if="!allDocumentsChecked" class="flex flex-col gap-3.5">
                <div class="flex gap-2.5 bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 p-3 rounded-xl">
                  <FileCheck class="w-4.5 h-4.5 text-amber-500 shrink-0 mt-0.5" />
                  <p class="text-[12px] text-amber-700 dark:text-amber-400 leading-normal">Masih ada dokumen yang <strong>belum diverifikasi</strong>. Silakan periksa semua item sebelum melanjutkan.</p>
                </div>
              </div>

              <!-- Case 4: All checked - Choose assistance and upload Rekomtek -->
              <div v-else class="flex flex-col gap-5">
                <!-- 1. Tentukan Bentuk Bantuan -->
                <div class="flex flex-col gap-3">
                  <label class="text-[13px] font-semibold text-slate-700 dark:text-slate-300"> 1. Tentukan Bentuk Bantuan <span class="text-rose-500">*</span> </label>

                  <div class="grid grid-cols-2 gap-3">
                    <label
                      :class="[
                        'border rounded-xl px-3 py-2.5 flex items-center justify-between text-xs font-semibold transition-all',
                        !isPaketJalan
                          ? 'border-slate-200 dark:border-slate-800/60 bg-slate-100/70 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60'
                          : assistanceType === 'UANG'
                            ? 'border-[#066C2A] dark:border-emerald-500 bg-[#066C2A]/5 text-[#066C2A] dark:text-emerald-400 font-bold cursor-pointer'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40 cursor-pointer',
                      ]"
                      :title="!isPaketJalan ? 'Bantuan Uang hanya berlaku untuk paket jalan' : ''"
                    >
                      <div class="flex items-center gap-1.5">
                        <span>Uang</span>
                      </div>
                      <input type="radio" name="assistance" value="UANG" v-model="assistanceType" :disabled="!isPaketJalan" class="accent-[#066C2A] disabled:cursor-not-allowed" />
                    </label>

                    <label
                      :class="[
                        'border rounded-xl px-3 py-2.5 flex items-center justify-between text-xs font-semibold cursor-pointer transition-all',
                        assistanceType === 'BARANG'
                          ? 'border-[#066C2A] dark:border-emerald-500 bg-[#066C2A]/5 text-[#066C2A] dark:text-emerald-400 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/40',
                      ]"
                    >
                      <span>Barang</span>
                      <input type="radio" name="assistance" value="BARANG" v-model="assistanceType" class="accent-[#066C2A]" />
                    </label>
                  </div>
                </div>

                <!-- 2. Unduh & Tanda Tangan -->
                <div class="flex flex-col gap-1.5 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                  <label class="text-[13px] font-semibold text-slate-700 dark:text-slate-300"> 2. Unduh & Tanda Tangan <span class="text-rose-500">*</span> </label>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      class="flex-1 h-9 rounded-lg border border-emerald-200/80 dark:border-emerald-800 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-800 dark:text-emerald-400 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs cursor-pointer"
                      @click="handleDownloadRekomtekDraft"
                    >
                      <Download class="w-4 h-4 text-[#066C2A] dark:text-emerald-400" />
                      <span>Download Draf Rekomtek</span>
                    </button>
                    <button
                      type="button"
                      title="Pratinjau Draf 1:1"
                      class="h-9 w-9 rounded-lg border border-emerald-200/80 dark:border-emerald-800 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                      @click="handlePreviewRekomtekDraft"
                    >
                      <Eye class="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <!-- 3. Nomor Rekomendasi Teknis -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-[13px] font-semibold text-slate-700 dark:text-slate-300"> 3. Nomor Rekomendasi Teknis <span class="text-rose-500">*</span> </label>
                  <input
                    type="text"
                    v-model="nomorRekomtek"
                    placeholder="Contoh: 124/PI.400/E/08/2026"
                    class="w-full h-10 px-3 border border-slate-200 dark:border-slate-700 rounded-lg text-[13px] bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#066C2A] focus:ring-1 focus:ring-[#066C2A]"
                  />
                  <p class="text-[11px] text-slate-500 dark:text-slate-400">
                    Kosongkan jika ingin menggunakan format draf sementara: <span class="font-mono text-emerald-700 dark:text-emerald-400 font-medium">{{ getFallbackNomorRekomtek() }}</span>
                  </p>
                </div>

                <!-- 4. Unggah Rekomtek Bertanda Tangan -->
                <div class="flex flex-col gap-1.5">
                  <label class="text-[13px] font-semibold text-slate-700 dark:text-slate-300"> 4. Unggah Rekomtek Bertanda Tangan <span class="text-rose-500">*</span> </label>
                  <FileUpload
                    id="rekomtek-signed-uploader"
                    placeholder="Pilih berkas PDF Rekomtek Signed (Max 10MB)"
                    accept=".pdf"
                    document-label="Rekomtek"
                    :proposal-number="activeUsulan?.nomor_proposal || (activeUsulan as any)?.nomorProposal || 'DRAFT'"
                    :institution-name="(activeUsulan as any)?.lembaga?.namaLembaga || (activeUsulan as any)?.namaLembagaPekebun || 'Kelembagaan'"
                    :initial-file-name="uploadedRekomtekFile?.name || existingRekomtekFileName || ((activeUsulan as any)?.rekomtek?.signedUrl || signedFileUploaded ? 'rekomtek_signed.pdf' : '')"
                    @file-selected="handleFileSelected"
                  />
                  <button
                    v-if="existingRekomtekFileUrl || (activeUsulan as any).rekomtek?.signedUrl || signedFileUploaded"
                    type="button"
                    title="Pratinjau Rekomtek Tertanda Tangan"
                    class="w-full h-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors cursor-pointer"
                    @click="openUrlPreview(existingRekomtekFileUrl || (activeUsulan as any).rekomtek?.signedUrl || '/templates/spek-teknis.pdf', 'Rekomtek Tertanda Tangan')"
                  >
                    <Eye class="w-4 h-4" />
                    <span>Pratinjau Rekomtek Tertanda Tangan</span>
                  </button>
                  <div v-if="existingRekomtekUploadedBy" class="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                    Diunggah oleh {{ existingRekomtekUploadedBy }}<template v-if="existingRekomtekUploadedAtFormatted"> • {{ existingRekomtekUploadedAtFormatted }}</template>
                  </div>
                </div>

                <!-- Revision Note Warning Banner for Rekomtek if rejected by Ketua Tim -->
                <div v-if="rekomtekValidationNote" class="flex gap-2.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-3.5 rounded-xl">
                  <AlertCircle class="w-4.5 h-4.5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div class="flex flex-col gap-1 text-xs">
                    <span class="font-bold text-rose-800 dark:text-rose-300">Catatan Perbaikan dari Ketua Tim Ditjenbun:</span>
                    <p class="text-rose-700 dark:text-rose-400 whitespace-pre-line">{{ rekomtekValidationNote }}</p>
                  </div>
                </div>

                <button
                  type="button"
                  @click="handleAjukan"
                  :disabled="!nomorRekomtek.trim() || (!signedFileUploaded && !existingRekomtekFileUrl) || isSubmitting"
                  :class="[
                    'w-full h-10 rounded-lg text-xs font-semibold text-white shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-200 cursor-pointer',
                    nomorRekomtek.trim() && (signedFileUploaded || existingRekomtekFileUrl) && !isSubmitting ? 'bg-[#066C2A] hover:bg-[#065A23]' : 'bg-slate-300 cursor-not-allowed',
                  ]"
                >
                  <span>Ajukan ke Approval Ditjenbun</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom back button -->
        <div class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <button
            type="button"
            @click="currentStep = 1"
            class="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <ChevronLeft class="w-4 h-4" />
            <span>Kembali ke Pratinjau</span>
          </button>
          <div />
        </div>
      </div>

      <!-- Return Modal revision -->
      <FormPengembalianModal :is-open="isReturnModalOpen" :is-enable="false" :show-notes="false" :disabled="hasEmptyRejectionNotes" @close="handleCloseReturnModal" @submit="handleReturnSubmit" />

      <!-- Audit Trail Sidebar -->
      <Teleport to="body">
        <div v-if="showAuditTrail" class="fixed inset-0 z-40 bg-black/20" @click="showAuditTrail = false" />
        <AuditTrailSidebar v-if="showAuditTrail" :proposal-id="usulanId" @close="showAuditTrail = false" />
      </Teleport>

      <ApprovalConfirmationModal :is-open="showConfirmModal" :action-type="confirmActionType" :destination-stage="confirmDestination" :notes="confirmNotes" @close="showConfirmModal = false" @confirm="executePendingAction" />

      <DocumentPreviewModal :is-open="showPreview && !!previewDoc" :title="previewDoc?.title ?? ''" :data-url="previewDoc?.dataUrl ?? ''" :mime-type="previewDoc?.mimeType ?? 'application/octet-stream'" @close="showPreview = false" />

      <RekomtekPreviewModal
        :show="showRekomtekPreviewModal"
        :document-data="currentRekomtekDocData"
        :proposal-number="activeUsulan?.nomor_proposal || (activeUsulan as any)?.nomorProposal || 'DRAFT'"
        @close="showRekomtekPreviewModal = false"
      />
    </div>
  </div>
</template>
