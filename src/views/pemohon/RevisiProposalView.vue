<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import Breadcrumb from '@/components/ui/Breadcrumb.vue';
import Skeleton from '@/components/ui/Skeleton.vue';
import RejectedDocumentAlert from '@/components/pengusulan/RejectedDocumentAlert.vue';
import RabTable from '@/components/pengusulan/RabTable.vue';
import ApprovalConfirmationModal from '@/components/approval/ApprovalConfirmationModal.vue';
import LahanPolygonRevisionEditor from '@/components/pemohon/LahanPolygonRevisionEditor.vue';
import { useProposalRevisionStore } from '@/stores/proposalRevisionStore';
import { useAuthStore } from '@/stores/auth';
import { LOCALIZATION } from '@/config/localization';
import type { RabItem } from '@/types/rab';
import { getRabTahapCount } from '@/types/rab';
import { PAKET_OPTIONS } from '@/lib/pengusulan-persyaratan.config';
import {
  AlertTriangle,
  Upload,
  CheckCircle2,
  FileText,
  ExternalLink,
  Warehouse,
  Users,
  Calculator,
  MapPin,
  Home,
  Printer,
  ChevronDown,
  RefreshCw,
  Save,
} from 'lucide-vue-next';
import api from '@/services/api';
import { useToast } from '@/composables/useToast';
import { formatDocumentTypeLabel, EXCLUDED_VERIFIER_DOC_TYPES } from '@/lib/formatDocumentType';
import { formatStandardFileName } from '@/utils/fileNaming';
import dokumenSyncService from '@/services/dokumenSync.service';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const revisionStore = useProposalRevisionStore();
const authStore = useAuthStore();

const proposalId = computed(() => (route.params.id as string) || (route.query.id as string));

const activeCategoryTab = ref<'PROPOSAL_DOC' | 'GUDANG' | 'PEKEBUN' | 'RAB'>('PROPOSAL_DOC');
const uploadingDocId = ref<number | string | null>(null);
const isSyncingIam = ref(false);
const applicantDocNotes = ref<Record<number | string, string>>({});

const handleBulkReSyncIam = async () => {
  if (!proposalId.value) return;
  isSyncingIam.value = true;
  try {
    const res = await dokumenSyncService.reSyncIamDocuments(Number(proposalId.value));
    if (res.hasChanges) {
      toast.success('Pembaruan berkas dari IAM berhasil disinkronkan!');
      await revisionStore.loadRevisionDetail(Number(proposalId.value));
    } else {
      toast.info('Berkas di IAM sudah sesuai dengan berkas revisi usulan saat ini.');
    }
  } catch (err: any) {
    toast.error(err?.message || 'Gagal menyinkronkan dokumen dari IAM');
  } finally {
    isSyncingIam.value = false;
  }
};

const gudangForm = ref<{
  address?: string;
  coordinate?: string;
  exterior_photo_file_id?: number;
  interior_photo_file_id?: number;
}>({});

const rabItems = ref<RabItem[]>([]);

const rawCatatan = computed(() => {
  const p = revisionStore.proposalData;
  return p?.notes || p?.catatanDinas || p?.catatan || null;
});

const filteredRevisionDocuments = computed(() => {
  return revisionStore.revisionDocuments
    .filter((doc) => !EXCLUDED_VERIFIER_DOC_TYPES.includes(doc.document_type))
    .map((doc) => ({
      ...doc,
      document_type_label: formatDocumentTypeLabel(doc.document_type),
    }));
});

const rejectedAlertItems = computed(() => {
  const items = revisionStore.rejectedDocuments
    .filter((doc) => !EXCLUDED_VERIFIER_DOC_TYPES.includes(doc.document_type))
    .map((doc) => ({
      id: doc.id,
      documentType: formatDocumentTypeLabel(doc.document_type),
      notes: doc.validation?.notes,
      isResolved: !!revisionStore.updatedFilesMap[doc.id] || doc.is_updated,
    }));

  for (const cat of revisionStore.categorizedRejections) {
    if (cat.category === 'PEKEBUN') {
      const fName = cat.farmer_name ? ` (${cat.farmer_name})` : '';
      items.push({
        id: cat.target_id,
        documentType: `${cat.item_label || 'Data/Dokumen Pekebun'}${fName}`,
        notes: cat.notes,
        isResolved: revisionStore.isFarmerItemResolved(cat),
      });
    } else if (cat.category === 'RAB') {
      const isAlreadyInList = items.some((i) => i.id === cat.target_id);
      if (!isAlreadyInList) {
        items.push({
          id: cat.target_id,
          documentType: cat.item_label || 'Dokumen RAB Ditandatangani',
          notes: cat.notes,
          isResolved: !!revisionStore.updatedRabSignedFileId || cat.is_resolved,
        });
      }
    }
  }

  return items;
});

const rabDocInRevision = computed(() => {
  return (
    revisionStore.revisionDocuments.find((d) => {
      const t = String(d.document_type || '').toUpperCase();
      return t === 'RAB_PROPOSAL' || t === 'RAB_RK' || t === 'RAB_SIGNED' || t.includes('RAB');
    }) || null
  );
});

const rabRejectionItem = computed(() => {
  return revisionStore.categorizedRejections.find((i) => i.category === 'RAB') || null;
});

const isRabResolved = computed(() => {
  if (revisionStore.updatedRabSignedFileId) return true;
  if (rabDocInRevision.value && revisionStore.updatedFilesMap[rabDocInRevision.value.id]) return true;
  if (rabRejectionItem.value && rabRejectionItem.value.is_resolved) return true;
  return false;
});

watch(
  () => revisionStore.proposalData,
  (pData) => {
    if (pData?.storage_area) {
      gudangForm.value.address = pData.storage_area.address || '';
      gudangForm.value.coordinate = pData.storage_area.coordinate || '';
    }
    if (pData?.rab_proposal?.items && Array.isArray(pData.rab_proposal.items)) {
      rabItems.value = pData.rab_proposal.items.map((item: any) => ({
        id: String(item.id),
        tahap: 'Semua Tahap',
        uraian: item.uraian || item.item_name || '',
        volume: item.volume ?? 1,
        satuan: item.unit || item.satuan || '',
        hargaSatuan: item.price_per_unit ?? item.pricePerUnit ?? 0,
        subTotal: item.total_price ?? (item.volume ?? 1) * (item.price_per_unit ?? 0),
        jenis: item.item_type || item.jenis || '',
        varietas: item.details?.varietas ?? item.varietas ?? '',
        varietasCustom: item.details?.varietasCustom ?? item.details?.varietas_custom ?? item.varietasCustom ?? '',
        jumlahTahap1: item.details?.jumlahTahap1 ?? null,
        jumlahTahap2: item.details?.jumlahTahap2 ?? null,
        jumlahTahap3: item.details?.jumlahTahap3 ?? null,
        jumlahTahap4: item.details?.jumlahTahap4 ?? null,
        jumlahTotal: item.volume ?? 1,
      }));
    } else if (pData?.rabs && Array.isArray(pData.rabs) && pData.rabs.length > 0) {
      const activeRab = pData.rabs.find((r: any) => r.flag === 'PROPOSAL') || pData.rabs[0];
      if (activeRab?.items && Array.isArray(activeRab.items)) {
        rabItems.value = activeRab.items.map((item: any) => ({
          id: String(item.id),
          tahap: 'Semua Tahap',
          uraian: item.uraian || item.item_name || '',
          volume: item.volume ?? 1,
          satuan: item.unit || item.satuan || '',
          hargaSatuan: item.price_per_unit ?? item.pricePerUnit ?? 0,
          subTotal: item.total_price ?? (item.volume ?? 1) * (item.price_per_unit ?? 0),
          jenis: item.item_type || item.jenis || '',
          varietas: item.details?.varietas ?? item.varietas ?? '',
          varietasCustom: item.details?.varietasCustom ?? item.details?.varietas_custom ?? item.varietasCustom ?? '',
          jumlahTahap1: item.details?.jumlahTahap1 ?? null,
          jumlahTahap2: item.details?.jumlahTahap2 ?? null,
          jumlahTahap3: item.details?.jumlahTahap3 ?? null,
          jumlahTahap4: item.details?.jumlahTahap4 ?? null,
          jumlahTotal: item.volume ?? 1,
        }));
      }
    } else if (pData?.rabItems && Array.isArray(pData.rabItems)) {
      rabItems.value = pData.rabItems.map((item: any) => ({ ...item }));
    }
  },
  { immediate: true, deep: true }
);

onMounted(async () => {
  if (proposalId.value) {
    await revisionStore.loadRevisionDetail(proposalId.value);
  }
});


const rabTotal = computed(() => rabItems.value.reduce((sum, r) => sum + (r.subTotal || 0), 0));
const rabTotalRounded = computed(() => Math.floor(rabTotal.value));


// ─── RAB Printable PDF Generator ─────────────────────────────────────────────
const showDownloadConfirm = ref(false);

function formatDecimal(val: number | null | undefined, decimals = 2) {
  if (val === null || val === undefined) return '';
  return val.toLocaleString('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function requestDownloadRAB() {
  if (rabItems.value.length === 0) {
    toast.error('Harap isi minimal 1 item RAB');
    return;
  }
  showDownloadConfirm.value = true;
}

function confirmDownloadRAB() {
  showDownloadConfirm.value = false;

  let kelompokTaniName =
    authStore.user?.kelembagaan_name ||
    authStore.user?.kelembagaanName ||
    revisionStore.proposalData?.lembaga?.namaLembaga ||
    authStore.user?.name ||
    '';
  if (!kelompokTaniName || kelompokTaniName === 'Administrator Sarpras') {
    kelompokTaniName = 'Kelompok Tani / Pemohon Proposal';
  }
  const kelompokTaniAddress = revisionStore.proposalData?.storage_area?.address || '-';

  const ketuaName =
    revisionStore.proposalData?.lembaga?.namaKetua ||
    (revisionStore.proposalData as any)?.nama_ketua ||
    (authStore.user as any)?.nama_ketua ||
    (authStore.user as any)?.namaKetua ||
    'Budi Santoso';

  const paketId = revisionStore.proposalData?.paketSarpras || '';
  const activePaket = PAKET_OPTIONS.find((p) => p.id === paketId);
  const paketLabel = activePaket ? activePaket.label : paketId;
  const tahapCount = getRabTahapCount(paketId);

  let headersHTML = '';
  let rowsHTML = '';
  let summaryHTML = '';
  let colspan = 8;

  let headers: string[] = [];
  if (tahapCount === 4) {
    colspan = 10;
    headers = [
      LOCALIZATION.rabTable.jenisLabel,
      LOCALIZATION.rabTable.barangLabel,
      LOCALIZATION.rabTable.jumlahTahap1Label,
      LOCALIZATION.rabTable.jumlahTahap2Label,
      LOCALIZATION.rabTable.jumlahTahap3Label,
      LOCALIZATION.rabTable.jumlahTahap4Label,
      LOCALIZATION.rabTable.jumlahTotalLabel,
      LOCALIZATION.rabTable.satuanLabel,
      LOCALIZATION.rabTable.hargaLabel,
      LOCALIZATION.rabTable.biayaLabel,
    ];
  } else if (tahapCount === 2) {
    colspan = 8;
    headers = [
      LOCALIZATION.rabTable.jenisLabel,
      LOCALIZATION.rabTable.barangLabel,
      LOCALIZATION.rabTable.jumlahTahap1Label,
      LOCALIZATION.rabTable.jumlahTahap2Label,
      LOCALIZATION.rabTable.jumlahTotalLabel,
      LOCALIZATION.rabTable.satuanLabel,
      LOCALIZATION.rabTable.hargaLabel,
      LOCALIZATION.rabTable.biayaLabel,
    ];
  } else {
    colspan = 6;
    headers = [
      LOCALIZATION.rabTable.jenisLabel,
      LOCALIZATION.rabTable.barangLabel,
      LOCALIZATION.rabTable.volumeLabel,
      LOCALIZATION.rabTable.satuanLabel,
      LOCALIZATION.rabTable.hargaLabel,
      LOCALIZATION.rabTable.biayaLabel,
    ];
  }
  headersHTML = headers.map((h) => `<th>${h}</th>`).join('');

  rowsHTML = rabItems.value
    .map((r) => {
      let stageCols = '';
      if (tahapCount === 4) {
        stageCols = `
          <td class="right-align">${formatDecimal(r.jumlahTahap1, 2)}</td>
          <td class="right-align">${formatDecimal(r.jumlahTahap2, 2)}</td>
          <td class="right-align">${formatDecimal(r.jumlahTahap3, 2)}</td>
          <td class="right-align">${formatDecimal(r.jumlahTahap4, 2)}</td>
          <td class="right-align">${formatDecimal(r.jumlahTotal, 2)}</td>
        `;
      } else if (tahapCount === 2) {
        stageCols = `
          <td class="right-align">${formatDecimal(r.jumlahTahap1, 2)}</td>
          <td class="right-align">${formatDecimal(r.jumlahTahap2, 2)}</td>
          <td class="right-align">${formatDecimal(r.jumlahTotal, 2)}</td>
        `;
      } else {
        stageCols = `
          <td class="right-align">${formatDecimal(r.volume || r.jumlahTotal || r.jumlahTahap1, 2)}</td>
        `;
      }

      return `
        <tr>
          <td>${r.jenis || ''}</td>
          <td>${r.uraian || ''}</td>
          ${stageCols}
          <td>${r.satuan || ''}</td>
          <td class="right-align">${formatDecimal(r.hargaSatuan, 2)}</td>
          <td class="right-align">${formatDecimal(r.subTotal, 1)}</td>
        </tr>
      `;
    })
    .join('');

  summaryHTML = `
    <tr class="total-row">
      <td colspan="${colspan - 1}" class="right-align font-semibold">Total Harga</td>
      <td class="right-align font-semibold">${formatDecimal(rabTotal.value, 1)}</td>
    </tr>
  `;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Rancangan Anggaran Biaya (Revisi)</title>
      <style>
        @media print {
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          @page { size: A4 portrait; margin: 20mm; }
        }
        body { font-family: 'Inter', -apple-system, sans-serif; color: #1e293b; margin: 0; padding: 10px; font-size: 11px; line-height: 1.5; }
        .header { text-align: center; margin-bottom: 25px; }
        .header h1 { font-size: 16px; font-weight: 700; margin: 0 0 4px 0; color: #0f172a; }
        .header h2 { font-size: 13px; font-weight: 600; margin: 0; color: #334155; }
        .info { font-size: 11px; margin-top: 15px; margin-bottom: 15px; color: #334155; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
        th { background-color: #f8fafc !important; font-weight: 600; color: #334155; }
        .right-align { text-align: right; }
        .font-semibold { font-weight: 600; }
        .font-bold { font-weight: 700; }
        .signature-container { float: right; margin-top: 40px; text-align: right; width: 240px; page-break-inside: avoid; }
        .signature-container p { margin: 0 0 4px 0; }
        .signature-space { height: 60px; }
        .signature-name { font-weight: 700; text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Rancangan Anggaran Biaya (Revisi)</h1>
        <h2>${kelompokTaniName}</h2>
      </div>
      <div class="info">
        Paket Sarpras: ${paketLabel}<br/>
        Alamat: ${kelompokTaniAddress}
      </div>
      <table>
        <thead>
          <tr>${headersHTML}</tr>
        </thead>
        <tbody>
          ${rowsHTML}
          ${summaryHTML}
        </tbody>
      </table>
      <div style="clear: both;"></div>
      <div class="signature-container">
        <p>Mengetahui,</p>
        <p style="font-weight: 600;">${kelompokTaniName}</p>
        <div class="signature-space"></div>
        <p class="signature-name">${ketuaName}</p>
        <p>Ketua</p>
      </div>
      <script>
        window.onload = function() {
          window.print();
        };
      <\/script>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}

const handleRabSignedUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;
  const file = target.files[0];
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Ukuran file melebihi 5MB.');
    target.value = '';
    return;
  }
  uploadingDocId.value = 'rab_signed';
  try {
    const pNumber = revisionStore.proposalData?.nomor_proposal || revisionStore.proposalData?.nomorProposal || 'DRAFT';
    const instName = revisionStore.proposalData?.lembaga?.namaLembaga || revisionStore.proposalData?.namaLembagaPekebun || authStore.user?.name || 'Kelembagaan';
    const renamedFile = formatStandardFileName(file, {
      documentLabel: 'RAB-Usulan',
      proposalNumber: pNumber,
      institutionName: instName,
    }).file;

    const formData = new FormData();
    formData.append('file', renamedFile);
    formData.append('folder', 'sarpras-kelapa/revisi_rab');

    const res: any = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const fileId = res?.data?.id || res?.id;
    if (!fileId) throw new Error('ID File tidak ditemukan');

    const docId = rabDocInRevision.value?.id;
    revisionStore.setPendingRabSignedReplacement(fileId, docId);
  } catch (err: any) {
    toast.error(err?.message || 'Gagal mengunggah dokumen RAB bertandatangan');
  } finally {
    uploadingDocId.value = null;
    target.value = '';
  }
};


const handleFileUpload = async (event: Event, docId: number | string) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Ukuran file melebihi 5MB.');
    target.value = '';
    return;
  }

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    toast.error('Format file tidak didukung. Gunakan PDF, JPG, atau PNG.');
    target.value = '';
    return;
  }

  uploadingDocId.value = docId;
  try {
    const docItem = filteredRevisionDocuments.value.find((d) => d.id === docId);
    const docLabel = docItem?.document_type_label || (docItem as any)?.document_type || 'Dokumen-Revisi';
    const pNumber = revisionStore.proposalData?.nomor_proposal || revisionStore.proposalData?.nomorProposal || 'DRAFT';
    const instName = revisionStore.proposalData?.lembaga?.namaLembaga || revisionStore.proposalData?.namaLembagaPekebun || authStore.user?.name || 'Kelembagaan';
    const renamedFile = formatStandardFileName(file, {
      documentLabel: docLabel,
      proposalNumber: pNumber,
      institutionName: instName,
    }).file;

    const formData = new FormData();
    formData.append('file', renamedFile);
    formData.append('folder', 'sarpras-kelapa/revisi');

    const res: any = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const fileId = res?.data?.id || res?.id;
    if (!fileId) throw new Error('ID File tidak ditemukan');

    if (typeof docId === 'number') {
      revisionStore.setPendingReplacement(docId, fileId);
    } else {
      toast.success('Berkas berhasil diunggah');
    }
  } catch (err: any) {
    toast.error(err?.message || 'Gagal mengunggah berkas');
  } finally {
    uploadingDocId.value = null;
    target.value = '';
  }
};

const handleGudangPhotoUpload = async (event: Event, type: 'exterior' | 'interior') => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Ukuran foto melebihi 5MB.');
    target.value = '';
    return;
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    toast.error('Format foto tidak didukung. Gunakan JPG, PNG, atau WebP.');
    target.value = '';
    return;
  }

  uploadingDocId.value = `gudang_${type}`;
  try {
    const pNumber = revisionStore.proposalData?.nomor_proposal || revisionStore.proposalData?.nomorProposal || 'DRAFT';
    const instName = revisionStore.proposalData?.lembaga?.namaLembaga || revisionStore.proposalData?.namaLembagaPekebun || authStore.user?.name || 'Kelembagaan';
    const renamedFile = formatStandardFileName(file, {
      documentLabel: 'Foto-Gudang',
      subLabel: type === 'exterior' ? 'Depan' : 'Dalam',
      proposalNumber: pNumber,
      institutionName: instName,
    }).file;

    const formData = new FormData();
    formData.append('file', renamedFile);
    formData.append('folder', 'sarpras-kelapa/storage_area');

    const res: any = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const fileId = res?.data?.id || res?.id;
    if (!fileId) throw new Error('ID File tidak ditemukan');

    if (type === 'exterior') {
      gudangForm.value.exterior_photo_file_id = fileId;
    } else {
      gudangForm.value.interior_photo_file_id = fileId;
    }
    toast.success(`Foto ${type === 'exterior' ? 'depan' : 'dalam'} gudang berhasil diunggah`);
  } catch (err: any) {
    toast.error(err?.message || 'Gagal mengunggah foto gudang');
  } finally {
    uploadingDocId.value = null;
    target.value = '';
  }
};

const expandedFarmerIds = ref<Record<number, boolean>>({});
function toggleFarmerAccordion(farmerId: number) {
  expandedFarmerIds.value[farmerId] = !isFarmerExpanded(farmerId);
}
function isFarmerExpanded(farmerId: number): boolean {
  return expandedFarmerIds.value[farmerId] !== false;
}

const handleFarmerDocUpload = async (event: Event, farmerId: number, docType: string, targetDocId?: number) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Ukuran file melebihi 5MB.');
    target.value = '';
    return;
  }

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    toast.error('Format file tidak didukung. Gunakan PDF, JPG, atau PNG.');
    target.value = '';
    return;
  }

  const uploadKey = `farmer-${farmerId}-${docType}`;
  uploadingDocId.value = uploadKey;
  try {
    const pNumber = revisionStore.proposalData?.nomor_proposal || revisionStore.proposalData?.nomorProposal || 'DRAFT';
    const instName = revisionStore.proposalData?.lembaga?.namaLembaga || revisionStore.proposalData?.namaLembagaPekebun || authStore.user?.name || 'Kelembagaan';
    const renamedFile = formatStandardFileName(file, {
      documentLabel: `Pekebun-${docType}`,
      proposalNumber: pNumber,
      institutionName: instName,
    }).file;

    const formData = new FormData();
    formData.append('file', renamedFile);
    formData.append('folder', 'sarpras-kelapa/revisi-pekebun');

    const res: any = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const fileId = res?.data?.id || res?.id;
    if (!fileId) throw new Error('ID File tidak ditemukan');

    revisionStore.setPendingFarmerDocReplacement(farmerId, docType, fileId, targetDocId);
  } catch (err: any) {
    toast.error(err?.message || 'Gagal mengunggah berkas dokumen pekebun');
  } finally {
    uploadingDocId.value = null;
    target.value = '';
  }
};

const handleLandDocUpload = async (event: Event, lahanId: number, docType: string, targetDocId?: number) => {
  const target = event.target as HTMLInputElement;
  if (!target.files || target.files.length === 0) return;

  const file = target.files[0];
  if (file.size > 5 * 1024 * 1024) {
    toast.error('Ukuran file melebihi 5MB.');
    target.value = '';
    return;
  }

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    toast.error('Format file tidak didukung. Gunakan PDF, JPG, atau PNG.');
    target.value = '';
    return;
  }

  const uploadKey = `land-${lahanId}-${docType}`;
  uploadingDocId.value = uploadKey;
  try {
    const pNumber = revisionStore.proposalData?.nomor_proposal || revisionStore.proposalData?.nomorProposal || 'DRAFT';
    const instName = revisionStore.proposalData?.lembaga?.namaLembaga || revisionStore.proposalData?.namaLembagaPekebun || authStore.user?.name || 'Kelembagaan';
    const renamedFile = formatStandardFileName(file, {
      documentLabel: `Lahan-${docType}`,
      proposalNumber: pNumber,
      institutionName: instName,
    }).file;

    const formData = new FormData();
    formData.append('file', renamedFile);
    formData.append('folder', 'sarpras-kelapa/revisi-lahan');

    const res: any = await api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    const fileId = res?.data?.id || res?.id;
    if (!fileId) throw new Error('ID File tidak ditemukan');

    revisionStore.setPendingLandDocReplacement(lahanId, docType, fileId, targetDocId);
  } catch (err: any) {
    toast.error(err?.message || 'Gagal mengunggah berkas dokumen lahan');
  } finally {
    uploadingDocId.value = null;
    target.value = '';
  }
};

function getFarmerFieldValue(farmerId: number, fieldName: string, fallback?: string): string {
  const farmerData = revisionStore.updatedFarmerDataMap[farmerId] as Record<string, any> | undefined;
  if (farmerData && farmerData[fieldName] !== undefined) {
    return String(farmerData[fieldName]);
  }
  return fallback || '';
}

function hasFarmerFieldEdited(farmerId: number, fieldName: string): boolean {
  const farmerData = revisionStore.updatedFarmerDataMap[farmerId] as Record<string, any> | undefined;
  return Boolean(farmerData && farmerData[fieldName] !== undefined && String(farmerData[fieldName]).trim() !== '');
}

function getLandInitialCoordinates(lahanId: number): string {
  const lahans = revisionStore.proposalData?.lahans || revisionStore.proposalData?.dataLahan || [];
  const found = lahans.find((l: any) => Number(l.id) === Number(lahanId) || Number(l.lahan_id) === Number(lahanId));
  if (found?.coordinates) {
    return typeof found.coordinates === 'string' ? found.coordinates : JSON.stringify(found.coordinates);
  }
  return '';
}

function getLandFieldValue(lahanId: number, fieldName: string, fallback?: string): string {
  const landData = revisionStore.updatedLandDataMap[lahanId] as Record<string, any> | undefined;
  if (landData && landData[fieldName] !== undefined) {
    return String(landData[fieldName]);
  }
  return fallback || '';
}

function hasLandFieldEdited(lahanId: number, fieldName: string): boolean {
  const landData = revisionStore.updatedLandDataMap[lahanId] as Record<string, any> | undefined;
  return Boolean(landData && landData[fieldName] !== undefined);
}

const handleSaveDraft = async () => {
  const payloadGudang = (gudangForm.value.address || gudangForm.value.coordinate || gudangForm.value.exterior_photo_file_id || gudangForm.value.interior_photo_file_id)
    ? gudangForm.value
    : undefined;

  await revisionStore.saveDraftRevision(payloadGudang);
};

const handleResubmit = async () => {
  const payloadGudang = (gudangForm.value.address || gudangForm.value.coordinate || gudangForm.value.exterior_photo_file_id || gudangForm.value.interior_photo_file_id)
    ? gudangForm.value
    : undefined;

  const success = await revisionStore.submitRevision(payloadGudang);
  if (success) {
    toast.success('Revisi proposal berhasil dikirim ulang');
    router.push('/pengusulan/tracking');
  }
};
</script>

<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
    <Breadcrumb
      :items="[
        { label: 'Tracking Proposal', to: '/pengusulan/tracking' },
        { label: 'Revisi Proposal' },
      ]"
    />

    <!-- SKELETON LOADING -->
    <template v-if="revisionStore.isLoading">
      <div class="flex flex-col gap-4">
        <Skeleton class="h-12 w-full rounded-2xl" />
        <Skeleton class="h-64 w-full rounded-2xl" />
      </div>
    </template>

    <template v-else>
      <!-- REJECTION BANNER -->
      <RejectedDocumentAlert
        v-if="revisionStore.unresolvedRejectedCount > 0"
        :rejected-items="rejectedAlertItems"
      />

      <!-- GENERAL CATATAN BANNER (IF ANY) -->
      <div v-if="rawCatatan" class="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-start gap-3">
        <AlertTriangle class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div class="flex flex-col gap-1 text-xs text-amber-900 dark:text-amber-200">
          <span class="font-bold">Catatan Verifikator:</span>
          <p>{{ rawCatatan }}</p>
        </div>
      </div>

      <!-- MAIN CONTAINER -->
      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col gap-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 class="text-lg font-bold text-slate-900 dark:text-slate-100">Revisi Permohonan Proposal</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Silakan perbaiki dokumen atau rincian yang ditolak di bawah ini sebelum mengirim ulang.
            </p>
          </div>

          <div class="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span class="text-xs font-bold text-amber-800 dark:text-amber-300">
              {{ revisionStore.unresolvedRejectedCount }} Item Perlu Perbaikan
            </span>
          </div>
        </div>

        <!-- CATEGORY TABS -->
        <div class="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
          <button
            @click="activeCategoryTab = 'PROPOSAL_DOC'"
            class="px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
            :class="activeCategoryTab === 'PROPOSAL_DOC' ? 'bg-[#066C2A] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
          >
            <FileText class="w-4 h-4" />
            <span>Dokumen Proposal</span>
          </button>

          <button
            v-if="revisionStore.proposalData?.storage_area"
            @click="activeCategoryTab = 'GUDANG'"
            class="px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
            :class="activeCategoryTab === 'GUDANG' ? 'bg-[#066C2A] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
          >
            <Warehouse class="w-4 h-4" />
            <span>Data Gudang</span>
          </button>

          <button
            @click="activeCategoryTab = 'PEKEBUN'"
            class="px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
            :class="activeCategoryTab === 'PEKEBUN' ? 'bg-[#066C2A] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
          >
            <Users class="w-4 h-4" />
            <span>Pekebun & Lahan</span>
          </button>

          <button
            @click="activeCategoryTab = 'RAB'"
            class="px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-2"
            :class="activeCategoryTab === 'RAB' ? 'bg-[#066C2A] text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'"
          >
            <Calculator class="w-4 h-4" />
            <span>Rencana Anggaran Biaya (RAB)</span>
          </button>
        </div>

        <!-- TAB CONTENT: 1. PROPOSAL DOC -->
        <div v-if="activeCategoryTab === 'PROPOSAL_DOC'" class="flex flex-col gap-4">
          <!-- IAM Sync Banner -->
          <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
            <div class="flex items-center gap-2.5">
              <RefreshCw class="w-5 h-5 text-[#066C2A] shrink-0" :class="{ 'animate-spin': isSyncingIam }" />
              <div class="flex flex-col">
                <span class="text-xs font-bold text-emerald-950 dark:text-emerald-100">Sinkronisasi Dokumen Master dari IAM</span>
                <span class="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Perbarui Akta Lembaga &amp; SK Penunjukan Ketua otomatis jika profil kelembagaan di IAM sudah Anda revisi.
                </span>
              </div>
            </div>
            <button
              type="button"
              @click="handleBulkReSyncIam"
              :disabled="isSyncingIam"
              class="px-4 py-2 text-xs font-bold text-white bg-[#066C2A] hover:bg-emerald-800 rounded-xl transition-all shadow-xs flex items-center gap-1.5 shrink-0 disabled:opacity-50"
            >
              <RefreshCw class="w-3.5 h-3.5" :class="{ 'animate-spin': isSyncingIam }" />
              <span>{{ isSyncingIam ? 'Memeriksa Pembaruan...' : '🔄 Sinkronkan Seluruh Dokumen dari IAM' }}</span>
            </button>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="doc in filteredRevisionDocuments"
              :key="doc.id"
              class="p-4 rounded-2xl border flex flex-col gap-3 transition-all"
              :class="doc.validation && doc.validation.is_valid === false ? 'bg-amber-50/60 border-amber-300 dark:bg-amber-950/20 dark:border-amber-900' : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800'"
            >
              <div class="flex items-start justify-between gap-2">
                <div class="flex flex-col gap-0.5">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-xs text-slate-800 dark:text-slate-200">
                      {{ doc.document_type_label }}
                    </span>
                    <span v-if="(doc as any).version" class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      V{{ (doc as any).version }}
                    </span>
                  </div>
                  <span class="text-[11px] text-slate-500 truncate max-w-[200px]">
                    {{ doc.file_name || 'Dokumen Proposal.pdf' }}
                  </span>
                </div>

                <div class="shrink-0">
                  <span
                    v-if="revisionStore.updatedFilesMap[doc.id] || doc.is_updated"
                    class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                  >
                    Telah Diperbarui
                  </span>
                  <span
                    v-else-if="doc.validation && doc.validation.is_valid === false"
                    class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300"
                  >
                    Perlu Perbaikan
                  </span>
                  <span
                    v-else
                    class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300"
                  >
                    Disetujui
                  </span>
                </div>
              </div>

              <div v-if="doc.validation && doc.validation.is_valid === false" class="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800 flex items-start gap-2">
                <AlertTriangle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div class="text-[11px] text-amber-900 dark:text-amber-200">
                  <span class="font-bold">Alasan Penolakan:</span>
                  <p>{{ doc.validation.notes || 'Dokumen tidak sesuai persyaratan.' }}</p>
                </div>
              </div>

              <!-- Input Catatan Tanggapan Pemohon -->
              <div v-if="doc.validation && doc.validation.is_valid === false" class="flex flex-col gap-1">
                <label class="text-[10px] font-semibold text-slate-600 dark:text-slate-400">
                  Catatan Tanggapan Pemohon (Opsional):
                </label>
                <input
                  v-model="applicantDocNotes[doc.id]"
                  type="text"
                  placeholder="Keterangan perbaikan berkas..."
                  class="h-8 text-xs px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:border-[#066C2A]"
                />
              </div>

              <div class="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                <a
                  v-if="doc.file_url"
                  :href="doc.file_url"
                  target="_blank"
                  class="text-xs text-[#066C2A] font-semibold hover:underline flex items-center gap-1"
                >
                  <ExternalLink class="w-3.5 h-3.5" /> Pratinjau Berkas
                </a>

                <label
                  v-if="doc.validation && doc.validation.is_valid === false"
                  class="px-3 py-1.5 text-xs font-bold text-white bg-[#066C2A] hover:bg-emerald-800 rounded-xl cursor-pointer flex items-center gap-1 shadow-xs ml-auto"
                  :class="{ 'opacity-50 pointer-events-none': uploadingDocId === doc.id }"
                >
                  <Upload class="w-3.5 h-3.5" />
                  <span>{{ uploadingDocId === doc.id ? 'Mengunggah...' : 'Unggah Berkas Baru' }}</span>
                  <input type="file" class="hidden" @change="(e) => handleFileUpload(e, doc.id)" />
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB CONTENT: 2. GUDANG -->
        <div v-else-if="activeCategoryTab === 'GUDANG'" class="flex flex-col gap-4">
          <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-5">
            <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Warehouse class="w-4 h-4 text-[#066C2A]" /> Perbaikan Data & Foto Gudang
            </h4>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- ALAMAT GUDANG -->
              <div
                class="p-4 rounded-xl border flex flex-col gap-2 transition-all"
                :class="revisionStore.proposalData?.storage_area?.address_is_valid === false ? 'bg-amber-50/60 border-amber-300 dark:bg-amber-950/20 dark:border-amber-900' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Home class="w-4 h-4 text-[#066C2A]" /> Alamat Gudang
                  </span>
                  <span
                    v-if="revisionStore.proposalData?.storage_area?.address_is_valid === false"
                    class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-amber-100 text-amber-800"
                  >
                    Perlu Perbaikan
                  </span>
                  <span v-else class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                    Disetujui
                  </span>
                </div>

                <div v-if="revisionStore.proposalData?.storage_area?.address_is_valid === false" class="flex flex-col gap-2 mt-1">
                  <p class="text-xs text-amber-800 dark:text-amber-300 font-medium">
                    Catatan Verifikator: "{{ revisionStore.proposalData.storage_area.address_notes || 'Alamat perlu disesuaikan.' }}"
                  </p>
                  <textarea
                    v-model="gudangForm.address"
                    rows="3"
                    placeholder="Masukkan alamat gudang lengkap yang benar..."
                    class="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#066C2A]"
                  />
                </div>
                <p v-else class="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {{ revisionStore.proposalData?.storage_area?.address || '-' }}
                </p>
              </div>

              <!-- TITIK KOORDINAT GUDANG -->
              <div
                class="p-4 rounded-xl border flex flex-col gap-2 transition-all"
                :class="revisionStore.proposalData?.storage_area?.coordinate_is_valid === false ? 'bg-amber-50/60 border-amber-300 dark:bg-amber-950/20 dark:border-amber-900' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <MapPin class="w-4 h-4 text-[#066C2A]" /> Titik Koordinat Gudang (Lat, Lng)
                  </span>
                  <span
                    v-if="revisionStore.proposalData?.storage_area?.coordinate_is_valid === false"
                    class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-amber-100 text-amber-800"
                  >
                    Perlu Perbaikan
                  </span>
                  <span v-else class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                    Disetujui
                  </span>
                </div>

                <div v-if="revisionStore.proposalData?.storage_area?.coordinate_is_valid === false" class="flex flex-col gap-2 mt-1">
                  <p class="text-xs text-amber-800 dark:text-amber-300 font-medium">
                    Catatan Verifikator: "{{ revisionStore.proposalData.storage_area.coordinate_notes || 'Koordinat perlu diperbaiki.' }}"
                  </p>
                  <input
                    v-model="gudangForm.coordinate"
                    type="text"
                    placeholder="Contoh: -2.58, 120.35"
                    class="w-full h-9 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#066C2A]"
                  />
                </div>
                <p v-else class="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {{ revisionStore.proposalData?.storage_area?.coordinate || '-' }}
                </p>
              </div>
            </div>

            <!-- FOTO GUDANG GRID -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <!-- FOTO TAMPAK DEPAN -->
              <div
                class="p-4 rounded-xl border flex flex-col gap-3 transition-all"
                :class="revisionStore.proposalData?.storage_area?.exterior_photo_is_valid === false ? 'bg-amber-50/60 border-amber-300 dark:bg-amber-950/20 dark:border-amber-900' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Foto Tampak Depan Gudang</span>
                  <span
                    v-if="gudangForm.exterior_photo_file_id"
                    class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-blue-100 text-blue-800"
                  >
                    Telah Diperbarui
                  </span>
                  <span
                    v-else-if="revisionStore.proposalData?.storage_area?.exterior_photo_is_valid === false"
                    class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-amber-100 text-amber-800"
                  >
                    Perlu Perbaikan
                  </span>
                  <span v-else class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                    Disetujui
                  </span>
                </div>

                <p v-if="revisionStore.proposalData?.storage_area?.exterior_photo_notes && revisionStore.proposalData?.storage_area?.exterior_photo_is_valid === false" class="text-xs text-amber-800 dark:text-amber-300 font-medium">
                  Catatan Verifikator: "{{ revisionStore.proposalData.storage_area.exterior_photo_notes }}"
                </p>

                <div class="flex items-center justify-between gap-2 mt-auto pt-2">
                  <a
                    v-if="revisionStore.proposalData?.storage_area?.exterior_photo_file_url"
                    :href="revisionStore.proposalData.storage_area.exterior_photo_file_url"
                    target="_blank"
                    class="text-xs text-[#066C2A] font-semibold hover:underline flex items-center gap-1"
                  >
                    <ExternalLink class="w-3.5 h-3.5" /> Pratinjau Foto
                  </a>

                  <label
                    v-if="revisionStore.proposalData?.storage_area?.exterior_photo_is_valid === false"
                    class="px-3 py-1.5 text-xs font-bold text-white bg-[#066C2A] hover:bg-emerald-800 rounded-xl cursor-pointer flex items-center gap-1 shadow-xs ml-auto"
                    :class="{ 'opacity-50 pointer-events-none': uploadingDocId === 'gudang_exterior' }"
                  >
                    <Upload class="w-3.5 h-3.5" />
                    <span>{{ uploadingDocId === 'gudang_exterior' ? 'Mengunggah...' : 'Unggah Foto Baru' }}</span>
                    <input type="file" accept="image/*,.pdf" class="hidden" @change="(e) => handleGudangPhotoUpload(e, 'exterior')" />
                  </label>
                </div>
              </div>

              <!-- FOTO TAMPAK DALAM -->
              <div
                class="p-4 rounded-xl border flex flex-col gap-3 transition-all"
                :class="revisionStore.proposalData?.storage_area?.interior_photo_is_valid === false ? 'bg-amber-50/60 border-amber-300 dark:bg-amber-950/20 dark:border-amber-900' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'"
              >
                <div class="flex items-center justify-between">
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200">Foto Tampak Dalam Gudang</span>
                  <span
                    v-if="gudangForm.interior_photo_file_id"
                    class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-blue-100 text-blue-800"
                  >
                    Telah Diperbarui
                  </span>
                  <span
                    v-else-if="revisionStore.proposalData?.storage_area?.interior_photo_is_valid === false"
                    class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-amber-100 text-amber-800"
                  >
                    Perlu Perbaikan
                  </span>
                  <span v-else class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                    Disetujui
                  </span>
                </div>

                <p v-if="revisionStore.proposalData?.storage_area?.interior_photo_notes && revisionStore.proposalData?.storage_area?.interior_photo_is_valid === false" class="text-xs text-amber-800 dark:text-amber-300 font-medium">
                  Catatan Verifikator: "{{ revisionStore.proposalData.storage_area.interior_photo_notes }}"
                </p>

                <div class="flex items-center justify-between gap-2 mt-auto pt-2">
                  <a
                    v-if="revisionStore.proposalData?.storage_area?.interior_photo_file_url"
                    :href="revisionStore.proposalData.storage_area.interior_photo_file_url"
                    target="_blank"
                    class="text-xs text-[#066C2A] font-semibold hover:underline flex items-center gap-1"
                  >
                    <ExternalLink class="w-3.5 h-3.5" /> Pratinjau Foto
                  </a>

                  <label
                    v-if="revisionStore.proposalData?.storage_area?.interior_photo_is_valid === false"
                    class="px-3 py-1.5 text-xs font-bold text-white bg-[#066C2A] hover:bg-emerald-800 rounded-xl cursor-pointer flex items-center gap-1 shadow-xs ml-auto"
                    :class="{ 'opacity-50 pointer-events-none': uploadingDocId === 'gudang_interior' }"
                  >
                    <Upload class="w-3.5 h-3.5" />
                    <span>{{ uploadingDocId === 'gudang_interior' ? 'Mengunggah...' : 'Unggah Foto Baru' }}</span>
                    <input type="file" accept="image/*,.pdf" class="hidden" @change="(e) => handleGudangPhotoUpload(e, 'interior')" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- TAB CONTENT: 3. PEKEBUN & LAHAN -->
        <div v-else-if="activeCategoryTab === 'PEKEBUN'" class="flex flex-col gap-4">
          <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-4">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Users class="w-4 h-4 text-[#066C2A]" /> Berkas Dokumen Pekebun & Legalitas Lahan
              </h4>
              <span
                v-if="revisionStore.rejectedFarmerList.length > 0"
                class="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
              >
                {{ revisionStore.rejectedFarmerList.length }} {{ LOCALIZATION.proposalRevision?.farmerRejectionSummary || 'Pekebun Memerlukan Perbaikan' }}
              </span>
            </div>

            <!-- JIKA ADA PEKEBUN YANG DITOLAK -->
            <div v-if="revisionStore.rejectedFarmerList.length > 0" class="flex flex-col gap-4">
              <div
                v-for="farmer in revisionStore.rejectedFarmerList"
                :key="farmer.farmerId"
                class="rounded-xl bg-white dark:bg-slate-900 border transition-all overflow-hidden"
                :class="revisionStore.isFarmerGroupResolved(farmer)
                  ? 'border-blue-200 dark:border-blue-900 shadow-xs'
                  : 'border-amber-300 dark:border-amber-800 shadow-sm'"
              >
                <!-- ACCORDION HEADER -->
                <button
                  type="button"
                  @click="toggleFarmerAccordion(farmer.farmerId)"
                  class="w-full p-4 flex flex-wrap items-center justify-between gap-3 text-left transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0"
                      :class="revisionStore.isFarmerGroupResolved(farmer)
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'"
                    >
                      <Users class="w-4 h-4" />
                    </div>
                    <div class="flex flex-col">
                      <span class="font-bold text-sm text-slate-800 dark:text-slate-200">
                        {{ farmer.farmerName }}
                      </span>
                      <span class="text-xs text-slate-500 font-mono">
                        NIK: {{ farmer.farmerNik }}
                      </span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <span
                      v-if="revisionStore.isFarmerGroupResolved(farmer)"
                      class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 flex items-center gap-1"
                    >
                      <CheckCircle2 class="w-3.5 h-3.5" /> {{ LOCALIZATION.proposalRevision?.farmerCardUpdated || 'Telah Diperbarui' }}
                    </span>
                    <span
                      v-else
                      class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 flex items-center gap-1"
                    >
                      <AlertTriangle class="w-3.5 h-3.5" /> {{ LOCALIZATION.proposalRevision?.farmerCardItemsToFix || 'Perlu Perbaikan' }}
                    </span>
                    <ChevronDown
                      class="w-4 h-4 text-slate-400 transition-transform duration-200"
                      :class="{ 'rotate-180': isFarmerExpanded(farmer.farmerId) }"
                    />
                  </div>
                </button>

                <!-- ACCORDION BODY (HANYA DITAMPILKAN JIKA EXPANDED) -->
                <div v-show="isFarmerExpanded(farmer.farmerId)" class="p-4 pt-0 border-t border-slate-100 dark:border-slate-800/80 flex flex-col gap-4 mt-2">
                  <!-- 1. FIELD TEKS YANG DITOLAK -->
                  <div v-if="farmer.rejectedFields.length > 0" class="flex flex-col gap-3">
                    <span class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Koreksi Data Teks Pekebun
                    </span>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div
                        v-for="field in farmer.rejectedFields"
                        :key="field.fieldName"
                        class="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col gap-2"
                      >
                        <div class="flex items-center justify-between">
                          <label class="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {{ field.label }}
                          </label>
                          <span
                            v-if="hasFarmerFieldEdited(farmer.farmerId, field.fieldName)"
                            class="text-[10px] font-bold text-blue-700 bg-blue-100 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded"
                          >
                            Telah Dikoreksi
                          </span>
                        </div>
                        <p class="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                          Catatan Verifikator: "{{ field.notes || 'Data perlu diperbaiki.' }}"
                        </p>
                        <input
                          :value="getFarmerFieldValue(farmer.farmerId, field.fieldName, field.currentValue)"
                          @input="(e) => revisionStore.setFarmerFieldEdit(farmer.farmerId, field.fieldName, (e.target as HTMLInputElement).value)"
                          type="text"
                          :placeholder="'Ketik perbaikan ' + field.label"
                          class="w-full h-9 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#066C2A]"
                        />
                      </div>
                    </div>
                  </div>

                  <!-- 2. DOKUMEN IDENTITAS YANG DITOLAK -->
                  <div v-if="farmer.rejectedDocs.length > 0" class="flex flex-col gap-3">
                    <span class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Unggah Berkas Dokumen Pengganti
                    </span>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div
                        v-for="doc in farmer.rejectedDocs"
                        :key="doc.documentType"
                        class="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col gap-2"
                      >
                        <div class="flex items-center justify-between">
                          <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {{ doc.label }}
                          </span>
                          <span
                            v-if="revisionStore.updatedFarmerFilesMap[`${farmer.farmerId}-${doc.documentType}`] || (doc.docId && revisionStore.updatedFarmerFilesMap[String(doc.docId)])"
                            class="text-[10px] font-bold text-blue-700 bg-blue-100 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded"
                          >
                            Telah Diunggah
                          </span>
                          <span v-else class="text-[10px] font-bold text-amber-800 bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded">
                            Perlu Berkas Baru
                          </span>
                        </div>
                        <p class="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                          Catatan Verifikator: "{{ doc.notes || 'Dokumen ditolak dan perlu diunggah ulang.' }}"
                        </p>
                        <div class="flex items-center justify-between gap-2 mt-auto pt-2">
                          <label
                            class="w-full px-3 py-2 text-xs font-bold text-white bg-[#066C2A] hover:bg-emerald-800 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-all"
                            :class="{ 'opacity-50 pointer-events-none': uploadingDocId === `farmer-${farmer.farmerId}-${doc.documentType}` }"
                          >
                            <Upload class="w-3.5 h-3.5" />
                            <span>{{ uploadingDocId === `farmer-${farmer.farmerId}-${doc.documentType}` ? 'Mengunggah...' : 'Pilih Berkas Baru (.PDF / .JPG)' }}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,application/pdf"
                              class="hidden"
                              @change="(e) => handleFarmerDocUpload(e, farmer.farmerId, doc.documentType, doc.docId)"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- 3. LAHAN YANG DITOLAK (JIKA ADA) -->
                  <div v-if="farmer.rejectedLands.length > 0" class="flex flex-col gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                      Perbaikan Data & Legalitas Lahan
                    </span>
                    <div
                      v-for="land in farmer.rejectedLands"
                      :key="land.lahanId"
                      class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 flex flex-col gap-3"
                    >
                      <div class="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                        <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {{ land.lahanLabel }}
                        </span>
                      </div>

                      <!-- Field Lahan yang Ditolak -->
                      <div v-if="land.rejectedFields.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div
                          v-for="lField in land.rejectedFields"
                          :key="lField.fieldName"
                          :class="[
                            'p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col gap-1.5',
                            (lField.fieldName === 'polygon' || lField.fieldName === 'koordinat_poligon') ? 'col-span-1 md:col-span-2' : ''
                          ]"
                        >
                          <div class="flex items-center justify-between">
                            <label class="text-xs font-bold text-slate-800 dark:text-slate-200">
                              {{ lField.fieldName === 'polygon' || lField.fieldName === 'koordinat_poligon' ? 'Poligon / Koordinat Lahan' : lField.label }}
                            </label>
                            <span
                              v-if="hasLandFieldEdited(land.lahanId, lField.fieldName) || (lField.fieldName === 'polygon' && hasLandFieldEdited(land.lahanId, 'coordinates'))"
                              class="text-[10px] font-bold text-blue-700 bg-blue-100 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded"
                            >
                              Telah Dikoreksi
                            </span>
                          </div>
                          <p class="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                            Catatan: "{{ lField.notes || 'Perlu diperbaiki.' }}"
                          </p>
                          <div v-if="lField.fieldName === 'polygon' || lField.fieldName === 'koordinat_poligon'" class="w-full">
                            <LahanPolygonRevisionEditor
                              :lahan-id="land.lahanId"
                              :model-value="getLandFieldValue(land.lahanId, lField.fieldName, lField.currentValue) || getLandInitialCoordinates(land.lahanId)"
                              :rejected-coordinates="lField.currentValue || getLandInitialCoordinates(land.lahanId)"
                              :verifier-notes="lField.notes"
                              :lahan-label="land.lahanLabel"
                              @update:coordinates="(payload) => {
                                revisionStore.setLandFieldEdit(land.lahanId, lField.fieldName, payload.rawString);
                                revisionStore.setLandFieldEdit(land.lahanId, 'coordinates', payload.rawString);
                                revisionStore.setLandFieldEdit(land.lahanId, 'polygon', payload.rawString);
                              }"
                            />
                          </div>
                          <input
                            v-else
                            :value="getLandFieldValue(land.lahanId, lField.fieldName, lField.currentValue)"
                            @input="(e) => revisionStore.setLandFieldEdit(land.lahanId, lField.fieldName, (e.target as HTMLInputElement).value)"
                            type="text"
                            :placeholder="'Ketik perbaikan ' + lField.label"
                            class="w-full h-9 px-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#066C2A]"
                          />
                        </div>
                      </div>

                      <!-- Dokumen Lahan yang Ditolak -->
                      <div v-if="land.rejectedDocs.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div
                          v-for="lDoc in land.rejectedDocs"
                          :key="lDoc.documentType"
                          class="p-3 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/40 dark:bg-amber-950/20 flex flex-col gap-2"
                        >
                          <span class="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {{ lDoc.label }}
                          </span>
                          <p class="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
                            Catatan: "{{ lDoc.notes || 'Dokumen ditolak dan perlu diunggah ulang.' }}"
                          </p>
                          <label
                            class="w-full px-3 py-2 text-xs font-bold text-white bg-[#066C2A] hover:bg-emerald-800 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-all mt-auto"
                            :class="{ 'opacity-50 pointer-events-none': uploadingDocId === `land-${land.lahanId}-${lDoc.documentType}` }"
                          >
                            <Upload class="w-3.5 h-3.5" />
                            <span>{{ uploadingDocId === `land-${land.lahanId}-${lDoc.documentType}` ? 'Mengunggah...' : 'Pilih Berkas Baru (.PDF / .JPG)' }}</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,application/pdf"
                              class="hidden"
                              @change="(e) => handleLandDocUpload(e, land.lahanId, lDoc.documentType, lDoc.docId)"
                            />
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- JIKA SEMUA PEKEBUN SESUAI -->
            <div
              v-else
              class="p-6 text-center text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-center gap-2"
            >
              <CheckCircle2 class="w-4 h-4 text-emerald-600" />
              <span>{{ LOCALIZATION.proposalRevision?.farmerAllApproved || 'Seluruh data dan dokumen pekebun telah sesuai verifikasi.' }}</span>
            </div>
          </div>
        </div>

        <!-- TAB CONTENT: 4. RAB -->
        <div v-else-if="activeCategoryTab === 'RAB'" class="flex flex-col gap-4">
          <div class="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex flex-col gap-5">
            <div class="flex items-center justify-between">
              <h4 class="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Calculator class="w-4 h-4 text-[#066C2A]" /> Rencana Anggaran Biaya (RAB)
              </h4>
              <button
                type="button"
                @click="requestDownloadRAB"
                class="px-3.5 py-1.5 text-xs font-bold text-[#066C2A] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
              >
                <Printer class="w-3.5 h-3.5" />
                <span>Cetak / Unduh RAB (PDF)</span>
              </button>
            </div>

            <!-- BANNER CATATAN PENOLAKAN VERIFIKATOR (JIKA ADA) -->
            <div
              v-if="rabRejectionItem"
              class="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3"
            >
              <AlertCircle class="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div class="flex flex-col gap-1">
                <span class="text-xs font-bold text-amber-900 dark:text-amber-200 uppercase tracking-wider">
                  Catatan Penolakan Dinas Kabupaten/Kota
                </span>
                <p class="text-xs text-amber-800 dark:text-amber-300">
                  {{ rabRejectionItem.notes || 'Dokumen RAB ditolak dan memerlukan perbaikan berkas fisik bertandatangan.' }}
                </p>
              </div>
            </div>

            <!-- OVERVIEW RAB TABLE (READ-ONLY) -->
            <div class="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col gap-3">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span class="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Ringkasan Rincian Anggaran (Overview)
                  </span>
                  <p class="text-[11px] text-slate-500">Rincian kuantitas dan harga item usulan yang telah diverifikasi.</p>
                </div>
                <div class="text-right">
                  <span class="text-[11px] font-semibold text-slate-500 block">Total Anggaran:</span>
                  <span class="text-sm font-bold text-[#066C2A] font-mono">Rp {{ rabTotalRounded.toLocaleString('id-ID') }}</span>
                </div>
              </div>
              <RabTable
                :items="rabItems"
                :readonly="true"
                :paket="revisionStore.proposalData?.paketSarpras || revisionStore.proposalData?.paket_sarpras"
              />
            </div>

            <!-- UNGGAH DOKUMEN RAB BERTANDATANGAN -->
            <div class="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <FileText class="w-4 h-4 text-[#066C2A]" /> Dokumen RAB Bertandatangan
                </span>
                <span
                  v-if="isRabResolved"
                  class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-blue-100 text-blue-800"
                >
                  Telah Diperbarui
                </span>
                <span
                  v-else-if="rabRejectionItem"
                  class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-amber-100 text-amber-800"
                >
                  Perlu Perbaikan
                </span>
                <span v-else class="px-2.5 py-0.5 text-[11px] font-bold rounded-md bg-emerald-100 text-emerald-800">
                  Disetujui
                </span>
              </div>

              <p class="text-xs text-slate-500 dark:text-slate-400">
                Silakan unduh atau cetak format Dokumen RAB melalui tombol di atas, bubuhkan tanda tangan ketua/pengurus dan stempel basah, kemudian unggah kembali berkas hasil scan (.pdf / .jpg).
              </p>

              <!-- Existing/Current Document Info if Available -->
              <div
                v-if="rabDocInRevision"
                class="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 text-xs"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <FileText class="w-4 h-4 text-[#066C2A] shrink-0" />
                  <span class="font-medium text-slate-700 dark:text-slate-300 truncate">
                    {{ rabDocInRevision.file_name || 'Dokumen_RAB.pdf' }}
                  </span>
                  <span v-if="rabDocInRevision.file_size" class="text-[10px] text-slate-400">
                    ({{ (Number(rabDocInRevision.file_size) / 1024).toFixed(0) }} KB)
                  </span>
                </div>
                <a
                  v-if="rabDocInRevision.file_url"
                  :href="rabDocInRevision.file_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[#066C2A] hover:underline font-semibold flex items-center gap-1 shrink-0"
                >
                  <Eye class="w-3.5 h-3.5" /> Lihat
                </a>

              </div>

              <div class="flex items-center justify-between gap-2 pt-1">
                <label
                  class="px-3.5 py-2 text-xs font-bold text-white bg-[#066C2A] hover:bg-emerald-800 rounded-xl cursor-pointer flex items-center gap-1.5 shadow-xs ml-auto"
                  :class="{ 'opacity-50 pointer-events-none': uploadingDocId === 'rab_signed' }"
                >
                  <Upload class="w-3.5 h-3.5" />
                  <span>{{ uploadingDocId === 'rab_signed' ? 'Mengunggah...' : 'Unggah Dokumen RAB Baru' }}</span>
                  <input type="file" accept="application/pdf,image/*" class="hidden" @change="handleRabSignedUpload" />
                </label>
              </div>
            </div>
          </div>
        </div>


        <!-- FOOTER SUBMISSION ACTIONS -->
        <div class="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
          <button
            @click="router.push('/pengusulan/tracking')"
            class="px-5 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
          >
            {{ LOCALIZATION.proposalRevision.cancelButton }}
          </button>

          <div class="flex items-center gap-3">
            <button
              type="button"
              @click="handleSaveDraft"
              :disabled="revisionStore.isSubmitting || revisionStore.isDrafting"
              class="px-5 py-2.5 text-xs font-bold text-[#066C2A] bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-xl transition-all flex items-center gap-2 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save class="w-4 h-4" />
              <span>{{ revisionStore.isDrafting ? 'Menyimpan Draf...' : 'Simpan Draf' }}</span>
            </button>

            <button
              @click="handleResubmit"
              :disabled="!revisionStore.isAllRejectedResolved || revisionStore.isSubmitting || revisionStore.isDrafting"
              class="px-6 py-2.5 text-xs font-bold bg-[#066C2A] text-white rounded-xl hover:bg-emerald-800 flex items-center gap-2 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 class="w-4 h-4" />
              <span>{{ revisionStore.isSubmitting ? 'Mengirim Ulang...' : LOCALIZATION.proposalRevision.resubmitButton }}</span>
            </button>
          </div>
        </div>
      </div>
    </template>

    <ApprovalConfirmationModal
      :is-open="showDownloadConfirm"
      action-type="approve"
      destination-stage="Cetak Dokumen RAB"
      notes="Dokumen RAB akan diunduh/dicetak dengan rincian item terkini."
      @close="showDownloadConfirm = false"
      @confirm="confirmDownloadRAB"
    />
  </div>
</template>
