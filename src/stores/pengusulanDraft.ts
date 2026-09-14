import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import {
  JenisSarpras,
  DokumenUpload,
  StorageArea,
  RabItem,
  LahanDokumenOwnership,
  Step3ValidationResult,
  SyncProposalDocumentItem,
  BulkCreateDocumentItem,
  CreateProposalPayload,
  CreateFullProposalPayload,
} from '@/types/pengusulan';
import { getRabTahapCount } from '@/types/rab';
import { usePengusulanStore } from './pengusulan';
import { useAuthStore } from './auth';
import { usePekebunStore } from './pekebun';
import { useLahanStore } from './lahan';
import { useMasterSarprasStore } from './masterSarpras';
import { PAKET_PERSYARATAN_CONFIG, PAKET_MINIMUM_REQUIREMENTS } from '@/lib/pengusulan-persyaratan.config';
import { extractFileObject, proposalService } from '@/services/proposal.service';
import { rabService } from '@/services/rab.service';
import dokumenSyncService from '@/services/dokumenSync.service';

export function mapToCanonicalDocumentType(persyaratanId: string): string {
  if (!persyaratanId) return 'DOKUMEN_PENDUKUNG';
  const upper = persyaratanId.toUpperCase().trim();
  if (
    upper === 'RAB-SIGNED' ||
    upper === 'RAB_SIGNED' ||
    upper === 'RABDITANDATANGANI' ||
    upper === 'RAB_PROPOSAL' ||
    upper === 'RAB-PROPOSAL' ||
    upper === 'RABPROPOSAL'
  ) {
    return 'RAB_PROPOSAL';
  }
  return upper;
}

export const usePengusulanDraftStore = defineStore('pengusulan-draft', () => {
  // ── State ─────────────────────────────────────────────────────────────────
  const draftProposalId = ref<number | null>(null);
  const draftNomorProposal = ref<string | null>(null);
  const isSavingDraft = ref(false);
  const selectedPaket = ref<JenisSarpras | null>(null);
  const dokumenUploads = ref<DokumenUpload[]>([]);
  const storage_area = ref<StorageArea | null>(null);
  const gudangSerahTerima = computed({
    get: () => storage_area.value,
    set: (val) => {
      storage_area.value = val;
    },
  });
  const rabItems = ref<RabItem[]>([]);
  const rabDitandatangani = ref<DokumenUpload | null>(null);
  const selectedPekebunIds = ref<string[]>([]);
  const selectedLahanIds = ref<string[]>([]);
  const selectedLahanDocs = ref<Record<string, LahanDokumenOwnership>>({});
  const currentStep = ref<1 | 2 | 3>(1);
  const isSubmitting = ref(false);
  const isLoadingIamDocs = ref(false);
  const namaBank = ref('');

  // ── Getters ───────────────────────────────────────────────────────────────

  const isPupukPaket = computed(() => {
    if (!selectedPaket.value) return false;
    const masterStore = useMasterSarprasStore();
    return masterStore.isPupukPaket(selectedPaket.value);
  });

  const rabTotal = computed(() => rabItems.value.reduce((sum, r) => sum + r.subTotal, 0));

  const rabTotalRounded = computed(() => Math.floor(rabTotal.value));

  const isStep1Valid = computed(() => {
    if (!selectedPaket.value) return false;
    if (missingStep1Docs.value.length > 0) return false;
    if (isPupukPaket.value) {
      const g = storage_area.value;
      if (!g || !g.alamat.trim() || !g.koordinat.trim() || !g.fotoTampakDepan || !g.fotoTampakDalam) return false;
    }
    if (selectedPaket.value === JenisSarpras.JALAN_KEBUN) {
      if (!namaBank.value.trim()) return false;
    }
    return true;
  });

  const missingStep1Docs = computed(() => {
    if (!selectedPaket.value) return [];
    const masterStore = useMasterSarprasStore();
    const dynamicDocs = masterStore.persyaratanMap[selectedPaket.value];
    const persyaratanList = dynamicDocs && dynamicDocs.length > 0
      ? dynamicDocs.map((d) => ({ id: d.dokumen_code, nama: d.nama, wajib: d.is_wajib }))
      : (PAKET_PERSYARATAN_CONFIG[selectedPaket.value] ?? []);

    return persyaratanList.filter((p) => {
      if (!p.wajib) return false;
      const normP = (p.id || '').toUpperCase();
      const normName = (p.nama || '').toUpperCase();

      const isLegalitas = (id: string, name?: string) =>
        id === 'LEGALITAS_KP' ||
        id === 'AKTA_LEMBAGA' ||
        id.includes('LEGALITAS') ||
        id.includes('AKTA') ||
        (!!name && (name.includes('LEGALITAS') || name.includes('AKTA')));

      const isKetua = (id: string, name?: string) =>
        id === 'SIMLUHTAN' ||
        id === 'PENUNJUKAN_KETUA' ||
        id.includes('KETUA') ||
        id.includes('SIMLUHTAN') ||
        (!!name && (name.includes('KETUA') || name.includes('SIMLUHTAN')));

      const exists = dokumenUploads.value.some((d) => {
        if (d.persyaratanId === p.id) return true;
        const normD = (d.persyaratanId || '').toUpperCase();
        if (isLegalitas(normP, normName) && isLegalitas(normD)) return true;
        if (isKetua(normP, normName) && isKetua(normD)) return true;
        return false;
      });

      return !exists;
    });
  });

  const isPekebunLahanValid = computed(() => {
    if (selectedPekebunIds.value.length === 0 || selectedLahanIds.value.length === 0) return false;
    return step2ValidationResult.value.isValid;
  });

  const isRabValid = computed(() => {
    if (rabItems.value.length === 0) return false;
    const allRowsFilled = rabItems.value.every((r) => r.jenis?.trim() && r.uraian?.trim() && r.satuan?.trim() && r.hargaSatuan !== null && r.hargaSatuan > 0 && (r.jumlahTotal ?? 0) > 0);
    return allRowsFilled && rabDitandatangani.value !== null;
  });

  // Step 2 is now Pekebun & Lahan
  const isStep2Valid = computed(() => isPekebunLahanValid.value);

  // Step 3 is now RAB & Submit
  const isStep3Valid = computed(() => isRabValid.value);

  const step2TotalPekebun = computed(() => selectedPekebunIds.value.length);
  const step3TotalPekebun = step2TotalPekebun;

  const step2TotalLuasHa = computed(() => {
    const pekebunStore = usePekebunStore();
    const lahanStore = useLahanStore();
    const allPekebun = pekebunStore.listPekebun.length > 0 ? pekebunStore.listPekebun : lahanStore.pekebunList;
    return selectedLahanIds.value.reduce((sum, lahanId) => {
      const pekebun = allPekebun.find((p) => {
        const lands = lahanStore.getPekebunLands(p);
        return lands.some((l) => String(l.id) === String(lahanId));
      });
      if (!pekebun) return sum;
      const lands = lahanStore.getPekebunLands(pekebun);
      const land = lands.find((l) => String(l.id) === String(lahanId));
      return sum + (land?.luasLahan ?? 0);
    }, 0);
  });
  const step3TotalLuasHa = step2TotalLuasHa;

  const step2MinimumRule = computed(() => {
    if (!selectedPaket.value) return null;
    const masterStore = useMasterSarprasStore();
    const dynamicRule = masterStore.getSyaratMinimum(selectedPaket.value);
    if (dynamicRule) {
      return {
        minimalPekebun: dynamicRule.minimal_pekebun,
        minimalLuasHa: dynamicRule.minimal_luas_ha,
        jarakAntarKebunKm: dynamicRule.jarak_antar_kebun_km,
        keterangan: dynamicRule.keterangan || '',
      };
    }
    return PAKET_MINIMUM_REQUIREMENTS[selectedPaket.value] ?? null;
  });

  const step3MinimumRule = step2MinimumRule;

  const step2ValidationResult = computed<Step3ValidationResult>(() => {
    const rule = step2MinimumRule.value;
    if (!rule) {
      return {
        isValid: true,
        totalPekebun: step2TotalPekebun.value,
        totalLuasHa: step2TotalLuasHa.value,
        minimalPekebun: null,
        minimalLuasHa: null,
        pekebunDefisit: 0,
        luasDefisit: 0,
        jarakAntarKebunKm: null,
        message: 'Tidak ada persyaratan minimum untuk paket ini.',
      };
    }
    const totalPek = step2TotalPekebun.value;
    const totalLuas = step2TotalLuasHa.value;
    const minPek = rule.minimalPekebun ?? 0;
    const minLuas = rule.minimalLuasHa ?? 0;
    const pekebunCukup = totalPek >= minPek;
    const luasCukup = totalLuas >= minLuas;
    const isValid = pekebunCukup || luasCukup;
    const pekebunDefisit = Math.max(0, minPek - totalPek);
    const luasDefisit = Math.max(0, minLuas - totalLuas);
    let message: string;
    if (isValid) {
      message = 'Memenuhi syarat minimum.';
    } else {
      const parts: string[] = [];
      if (pekebunDefisit > 0) parts.push(`kurang ${pekebunDefisit} pekebun`);
      if (luasDefisit > 0) parts.push(`kurang ${luasDefisit.toFixed(1)} Ha`);
      message = `Belum memenuhi syarat minimum: ${parts.join(' dan ')}. Total pekebun: ${totalPek} (min. ${minPek}), total luas: ${totalLuas.toFixed(1)} Ha (min. ${minLuas} Ha).`;
    }
    return {
      isValid,
      totalPekebun: totalPek,
      totalLuasHa: totalLuas,
      minimalPekebun: rule.minimalPekebun,
      minimalLuasHa: rule.minimalLuasHa,
      pekebunDefisit,
      luasDefisit,
      jarakAntarKebunKm: rule.jarakAntarKebunKm,
      message,
    };
  });
  const step3ValidationResult = step2ValidationResult;

  // ── Actions ───────────────────────────────────────────────────────────────

  function setPaket(paket: JenisSarpras) {
    const wasEkstInten = selectedPaket.value === JenisSarpras.EKSTENSIFIKASI || selectedPaket.value === JenisSarpras.INTENSIFIKASI;
    const nowEkstInten = paket === JenisSarpras.EKSTENSIFIKASI || paket === JenisSarpras.INTENSIFIKASI;
    // If switching away from a pupuk paket, clear storage area
    if (wasEkstInten && !nowEkstInten) {
      storage_area.value = null;
    }
    // If switching to pupuk paket from non-pupuk, initialize empty storage area
    if (!wasEkstInten && nowEkstInten && !storage_area.value) {
      storage_area.value = { alamat: '', koordinat: '', address: '', coordinate: '', fotoTampakDepan: null, fotoTampakDalam: null };
    }
    // Clear non-IAM dokumen uploads when paket changes
    if (selectedPaket.value !== paket) {
      dokumenUploads.value = dokumenUploads.value.filter((d) => d.source === 'IAM_SYNC');
      selectedPekebunIds.value = [];
      selectedLahanIds.value = [];
      selectedLahanDocs.value = {};
      rabItems.value = [];
      rabDitandatangani.value = null;
    }
    selectedPaket.value = paket;
    if (paket) {
      const masterStore = useMasterSarprasStore();
      masterStore.fetchPersyaratan(paket);

      // Re-check and ensure IAM legal documents are attached
      const authStore = useAuthStore();
      const kId =
        authStore.user?.kelembagaan_id ||
        authStore.user?.kelembagaanId;
      if (kId) {
        fetchAndAttachIamDocuments(Number(kId));
      }
    }
  }


  function addDokumenUpload(doc: DokumenUpload) {
    const isLegalitas = (id: string) => id === 'LEGALITAS_KP' || id === 'AKTA_LEMBAGA';
    const isKetua = (id: string) => id === 'SIMLUHTAN' || id === 'PENUNJUKAN_KETUA';

    const idx = dokumenUploads.value.findIndex((d) => {
      if (d.persyaratanId === doc.persyaratanId) return true;
      if (isLegalitas(doc.persyaratanId) && isLegalitas(d.persyaratanId)) return true;
      if (isKetua(doc.persyaratanId) && isKetua(d.persyaratanId)) return true;
      return false;
    });
    if (idx >= 0) {
      dokumenUploads.value[idx] = doc;
    } else {
      dokumenUploads.value.push(doc);
    }
  }

  function removeDokumenUpload(persyaratanId: string) {
    const idsToRemove = new Set([persyaratanId]);
    if (persyaratanId === 'LEGALITAS_KP' || persyaratanId === 'AKTA_LEMBAGA') {
      idsToRemove.add('LEGALITAS_KP');
      idsToRemove.add('AKTA_LEMBAGA');
    }
    if (persyaratanId === 'SIMLUHTAN' || persyaratanId === 'PENUNJUKAN_KETUA') {
      idsToRemove.add('SIMLUHTAN');
      idsToRemove.add('PENUNJUKAN_KETUA');
    }
    dokumenUploads.value = dokumenUploads.value.filter((d) => !idsToRemove.has(d.persyaratanId));
    if (
      persyaratanId === 'RAB_PROPOSAL' ||
      persyaratanId === 'SPTJM' ||
      persyaratanId === 'RAB_SIGNED' ||
      persyaratanId === 'rab-signed'
    ) {
      rabDitandatangani.value = null;
    }
  }

  function setGudang(data: Partial<StorageArea>) {
    if (!storage_area.value) {
      storage_area.value = { alamat: '', koordinat: '', address: '', coordinate: '', fotoTampakDepan: null, fotoTampakDalam: null };
    }
    Object.assign(storage_area.value, data);
    if (data.alamat) storage_area.value.address = data.alamat;
    if (data.koordinat) storage_area.value.coordinate = data.koordinat;
  }

  function setStorageArea(data: Partial<StorageArea>) {
    setGudang(data);
  }

  function getDraftTahapCount(): number {
    if (!selectedPaket.value) return 1;
    const masterStore = useMasterSarprasStore();
    const code = String(selectedPaket.value).toUpperCase().trim();
    const paket =
      masterStore.paketMap[code] ||
      masterStore.paketMap[selectedPaket.value] ||
      masterStore.paketList?.find(
        (p) =>
          p.code?.toUpperCase() === code ||
          p.name?.toUpperCase() === code ||
          String(p.id) === code
      );
    return getRabTahapCount(selectedPaket.value, paket?.jumlah_tahap);
  }

  function addRabItem() {
    const tahapCount = getDraftTahapCount();
    rabItems.value.push({
      id: `rab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      tahap: tahapCount === 4 ? 'Tahap 1 - 4' : tahapCount === 2 ? 'Tahap 1 & 2' : 'Tahap 1',
      uraian: '',
      volume: null,
      unit: '',
      satuan: '',
      hargaSatuan: null,
      price_per_unit: null,
      item_type: 'BARANG',
      total_price: 0,
      subTotal: 0,
      jenis: '',
      varietas: '',
      varietasCustom: '',
      jumlahTahap1: null,
      jumlahTahap2: null,
      jumlahTahap3: null,
      jumlahTahap4: null,
      jumlahTotal: 0,
    });
  }

  function updateRabItem(id: string, patch: Partial<RabItem>) {
    const item = rabItems.value.find((r) => r.id === id);
    if (!item) return;
    Object.assign(item, patch);

    const q1 = item.jumlahTahap1 ?? 0;
    const q2 = item.jumlahTahap2 ?? 0;
    const q3 = item.jumlahTahap3 ?? 0;
    const q4 = item.jumlahTahap4 ?? 0;
    const tahapCount = getDraftTahapCount();

    if (tahapCount === 4) {
      item.jumlahTotal = q1 + q2 + q3 + q4;
    } else if (tahapCount === 2) {
      item.jumlahTotal = q1 + q2;
    } else {
      item.jumlahTotal = item.jumlahTahap1 ?? item.jumlahTotal ?? item.volume ?? 0;
    }

    item.volume = item.jumlahTotal;
    item.unit = item.satuan || item.unit || '';
    item.price_per_unit = item.hargaSatuan;
    item.subTotal = (item.jumlahTotal ?? 0) * (item.hargaSatuan ?? 0);
    item.total_price = item.subTotal;
    item.item_type = item.jenis === 'JASA' ? 'JASA' : 'BARANG';
  }

  function removeRabItem(id: string) {
    rabItems.value = rabItems.value.filter((r) => r.id !== id);
  }

  function setRabDitandatangani(doc: DokumenUpload | null) {
    rabDitandatangani.value = doc;
    if (doc) {
      addDokumenUpload(doc);
    } else {
      dokumenUploads.value = dokumenUploads.value.filter(
        (d) =>
          d.persyaratanId !== 'RAB_PROPOSAL' &&
          d.persyaratanId !== 'SPTJM' &&
          d.persyaratanId !== 'RAB_SIGNED' &&
          d.persyaratanId !== 'rab-signed'
      );
    }
  }

  function setSelectedPekebun(ids: string[]) {
    selectedPekebunIds.value = ids.map(String);

    const newLahanIds: string[] = [];
    const newDocs: Record<string, LahanDokumenOwnership> = {};
    const pekebunStore = usePekebunStore();
    const lahanStore = useLahanStore();
    const allPekebun = pekebunStore.listPekebun.length > 0 ? pekebunStore.listPekebun : lahanStore.pekebunList;

    for (const pid of ids) {
      const pekebun = allPekebun.find((p) => String(p.id) === String(pid));
      if (!pekebun) continue;

      const lands = lahanStore.getPekebunLands(pekebun);

      for (const land of lands) {
        if (land.isInProposal || (land as any).is_in_proposal) continue;
        const landId = String(land.id);
        newLahanIds.push(landId);
        newDocs[landId] = selectedLahanDocs.value[landId] ?? {
          jenisDokumen: land.jenisLegalitas === 'SHM' ? 'SHM' : 'DOKUMEN_LAINNYA',
          nomorDokumen: land.nomorLegalitas ?? '',
          jenisDokumenLainnya: '',
        };
      }
    }
    selectedLahanIds.value = newLahanIds;
    selectedLahanDocs.value = newDocs;
  }

  function setSelectedLahan(ids: string[]) {
    selectedLahanIds.value = ids.map(String);
    const newDocs: Record<string, LahanDokumenOwnership> = {};
    for (const lid of ids) {
      const strId = String(lid);
      newDocs[strId] = selectedLahanDocs.value[strId] ?? { jenisDokumen: 'SHM', nomorDokumen: '', jenisDokumenLainnya: '' };
    }
    selectedLahanDocs.value = newDocs;
  }

  function setLahanDoc(lahanId: string, patch: Partial<LahanDokumenOwnership>) {
    const current = selectedLahanDocs.value[lahanId] ?? { jenisDokumen: 'SHM', nomorDokumen: '', jenisDokumenLainnya: '' };
    selectedLahanDocs.value = { ...selectedLahanDocs.value, [lahanId]: { ...current, ...patch } };
  }

  function removeLahanDoc(lahanId: string) {
    const newDocs = { ...selectedLahanDocs.value };
    delete newDocs[lahanId];
    selectedLahanDocs.value = newDocs;
  }

  function resetDraft() {
    draftProposalId.value = null;
    draftNomorProposal.value = null;
    isSavingDraft.value = false;
    selectedPaket.value = null;
    dokumenUploads.value = [];
    storage_area.value = null;
    rabItems.value = [];
    rabDitandatangani.value = null;
    selectedPekebunIds.value = [];
    selectedLahanIds.value = [];
    selectedLahanDocs.value = {};
    currentStep.value = 1;
    isSubmitting.value = false;
    namaBank.value = '';

    const authStore = useAuthStore();
    const kId =
      authStore.user?.kelembagaan_id ||
      authStore.user?.kelembagaanId;
    if (kId) {
      fetchAndAttachIamDocuments(Number(kId));
    }
  }

  /**
   * Constructs the full proposal payload from wizard draft state
   */
  function getSubmissionPayload(kelembagaanId?: number, isDraft = false): CreateFullProposalPayload {
    const authStore = useAuthStore();
    const effectiveKelembagaanId =
      kelembagaanId ??
      (authStore.user?.kelembagaan_id ? Number(authStore.user.kelembagaan_id) : undefined) ??
      (authStore.user?.kelembagaanId ? Number(authStore.user.kelembagaanId) : undefined) ??
      1;

    const lahanIds = selectedLahanIds.value.map((id) => {
      const parsed = parseInt(id.replace(/\D/g, ''), 10);
      return isNaN(parsed) ? 1 : parsed;
    });

    const totalAnggaran = rabItems.value.reduce(
      (sum, r) => sum + (Number(r.volume) || Number(r.jumlahTotal) || 1) * (Number(r.hargaSatuan) || Number(r.price_per_unit) || 0),
      0
    );

    const proposalPayload: CreateProposalPayload = {
      kelembagaan_id: effectiveKelembagaanId,
      paket_sarpras: selectedPaket.value ?? 'EKSTENSIFIKASI',
      detail_usulan: `Usulan Paket ${selectedPaket.value ?? ''}`,
      status: isDraft ? 'DRAFT' : 'SUBMITTED',
      total_anggaran: totalAnggaran,
      lahan_ids: isDraft ? lahanIds : (lahanIds.length > 0 ? lahanIds : [1]),
      storage_area: isPupukPaket.value && storage_area.value
        ? {
            address: storage_area.value.alamat || storage_area.value.address || '',
            coordinate: storage_area.value.koordinat || storage_area.value.coordinate || '',
            interior_photo_file_id: storage_area.value.fotoTampakDalam && 'fileId' in storage_area.value.fotoTampakDalam ? storage_area.value.fotoTampakDalam.fileId : (storage_area.value.interior_photo_file_id ?? null),
            exterior_photo_file_id: storage_area.value.fotoTampakDepan && 'fileId' in storage_area.value.fotoTampakDepan ? storage_area.value.fotoTampakDepan.fileId : (storage_area.value.exterior_photo_file_id ?? null),
            exterior_photo_file: storage_area.value.exterior_photo_file || (storage_area.value.fotoTampakDepan instanceof File ? storage_area.value.fotoTampakDepan : (storage_area.value.fotoTampakDepan as any)?.file || null),
            interior_photo_file: storage_area.value.interior_photo_file || (storage_area.value.fotoTampakDalam instanceof File ? storage_area.value.fotoTampakDalam : (storage_area.value.fotoTampakDalam as any)?.file || null),
            interiro_photo_file: storage_area.value.interiro_photo_file || storage_area.value.interior_photo_file || (storage_area.value.fotoTampakDalam instanceof File ? storage_area.value.fotoTampakDalam : (storage_area.value.fotoTampakDalam as any)?.file || null),
            fotoTampakDepan: storage_area.value.fotoTampakDepan,
            fotoTampakDalam: storage_area.value.fotoTampakDalam,
          }
        : null,
    };

    const seenDocTypes = new Set<string>();
    const docsToSync: (SyncProposalDocumentItem | BulkCreateDocumentItem)[] = [];

    dokumenUploads.value.forEach((d, index) => {
      const rawType = mapToCanonicalDocumentType(d.persyaratanId);
      let docType = rawType;
      if (docType === 'AKTA_LEMBAGA') docType = 'LEGALITAS_KP';
      if (docType === 'PENUNJUKAN_KETUA') docType = 'SIMLUHTAN';

      if (seenDocTypes.has(docType)) {
        return;
      }
      seenDocTypes.add(docType);

      const file = extractFileObject(d);
      docsToSync.push({
        document_type: docType,
        ...(d.fileId ? { file_id: d.fileId } : !file ? { file_id: index + 201 } : {}),
        ...(file ? { file, file_header: file } : {}),
      });
    });

    if (rabDitandatangani.value && !docsToSync.some((d) => d.document_type === 'RAB_PROPOSAL')) {
      const rFile = extractFileObject(rabDitandatangani.value);
      docsToSync.push({
        document_type: 'RAB_PROPOSAL',
        ...(rabDitandatangani.value.fileId ? { file_id: rabDitandatangani.value.fileId } : !rFile ? { file_id: 301 } : {}),
        ...(rFile ? { file: rFile, file_header: rFile } : {}),
      });
    }

    const rabPayloadItems = rabItems.value.map((r) => {
      const vol =
        r.volume ||
        r.jumlahTotal ||
        (r.jumlahTahap1 || 0) + (r.jumlahTahap2 || 0) + (r.jumlahTahap3 || 0) + (r.jumlahTahap4 || 0) ||
        1;
      return {
        uraian: r.uraian,
        volume: vol,
        unit: r.satuan || r.unit || 'unit',
        price_per_unit: r.hargaSatuan || r.price_per_unit || 0,
        item_type: r.jenis === 'JASA' ? 'JASA' : 'BARANG',
        details: {
          jenis: r.jenis,
          varietas: r.varietas,
          varietasCustom: r.varietasCustom,
          jumlahTahap1: r.jumlahTahap1,
          jumlahTahap2: r.jumlahTahap2,
          jumlahTahap3: r.jumlahTahap3,
          jumlahTahap4: r.jumlahTahap4,
          spesifikasi: r.spesifikasi,
        },
      };
    });

    return {
      proposal: proposalPayload,
      documents: docsToSync,
      rab: {
        flag: 'PROPOSAL',
        items: rabPayloadItems,
      },
    };
  }

  /**
   * Saves or updates proposal as DRAFT in backend
   */
  async function saveDraft(kelembagaanId?: number): Promise<{ id: number; nomor_proposal: string }> {
    isSavingDraft.value = true;
    try {
      const fullPayload = getSubmissionPayload(kelembagaanId, true);
      const proposalStore = usePengusulanStore();

      if (!draftProposalId.value) {
        // Create new draft
        const created = await proposalStore.createProposal(fullPayload);
        const pid = Number(created.id);
        draftProposalId.value = pid;
        draftNomorProposal.value = created.nomor_proposal;
        return { id: pid, nomor_proposal: created.nomor_proposal };
      } else {
        // Update existing draft in-place
        const pid = draftProposalId.value;
        await proposalService.update(pid, {
          paket_sarpras: fullPayload.proposal.paket_sarpras,
          detail_usulan: fullPayload.proposal.detail_usulan,
          status: 'DRAFT',
          total_anggaran: fullPayload.proposal.total_anggaran,
          lahan_ids: fullPayload.proposal.lahan_ids,
          storage_area: fullPayload.proposal.storage_area as any,
        });

        // Sync documents if any
        if (fullPayload.documents && (Array.isArray(fullPayload.documents) ? fullPayload.documents.length > 0 : true)) {
          try {
            await proposalService.bulkCreateDocuments(pid, fullPayload.documents);
          } catch (err) {
            console.warn('Gagal menyimpan dokumen draft:', err);
          }
        }

        // Sync RAB if any
        if (fullPayload.rab && fullPayload.rab.items && fullPayload.rab.items.length > 0) {
          try {
            await rabService.create({
              proposal_id: pid,
              flag: 'PROPOSAL',
              items: fullPayload.rab.items,
            });
          } catch (err: any) {
            if (err?.response?.status === 409 || err?.message?.includes('already exists')) {
              try {
                const existingRes = await rabService.getByProposalId(pid);
                const existingData = (existingRes as any)?.data || existingRes;
                if (existingData?.id) {
                  await rabService.update(existingData.id, {
                    flag: 'PROPOSAL',
                    items: fullPayload.rab.items,
                  });
                }
              } catch (updateErr) {
                console.warn('Gagal memperbarui RAB draft:', updateErr);
              }
            } else {
              console.warn('Gagal menyimpan RAB draft:', err);
            }
          }
        }

        return { id: pid, nomor_proposal: draftNomorProposal.value || '' };
      }
    } finally {
      isSavingDraft.value = false;
    }
  }

  /**
   * Fetches proposal detail and rehydrates wizard state
   */
  async function loadDraft(proposalId: number): Promise<void> {
    try {
      const res = await proposalService.getById(proposalId);
      const data = (res as any)?.data || res;
      if (!data) return;

      draftProposalId.value = Number(data.id);
      draftNomorProposal.value = data.nomor_proposal;

      // 1. Paket Sarpras
      if (data.paket_sarpras) {
        selectedPaket.value = data.paket_sarpras as JenisSarpras;
      }

      // 2. Storage Area
      if (data.storage_area) {
        storage_area.value = {
          id: data.storage_area.id,
          proposal_id: Number(data.id),
          address: data.storage_area.address || '',
          coordinate: data.storage_area.coordinate || '',
          alamat: data.storage_area.address || '',
          koordinat: data.storage_area.coordinate || '',
          interior_photo_file_id: data.storage_area.interior_photo_file_id,
          interior_photo_file_url: data.storage_area.interior_photo_file_url,
          exterior_photo_file_id: data.storage_area.exterior_photo_file_id,
          exterior_photo_file_url: data.storage_area.exterior_photo_file_url,
        };
      }

      // 3. Documents
      if (data.documents && data.documents.length > 0) {
        const loadedDocs: DokumenUpload[] = [];
        for (const doc of data.documents) {
          if (doc.document_type === 'RAB_PROPOSAL') {
            rabDitandatangani.value = {
              persyaratanId: 'RAB_PROPOSAL',
              namaFile: doc.file_name,
              mimeType: doc.mime_type,
              ukuranBytes: Number(doc.file_size) || 0,
              dataUrl: doc.file_url,
              fileUrl: doc.file_url,
              uploadedAt: doc.created_at,
              fileId: doc.file_id,
            };
          } else {
            loadedDocs.push({
              persyaratanId: doc.document_type,
              namaFile: doc.file_name,
              mimeType: doc.mime_type,
              ukuranBytes: Number(doc.file_size) || 0,
              dataUrl: doc.file_url,
              fileUrl: doc.file_url,
              uploadedAt: doc.created_at,
              fileId: doc.file_id,
            });
          }
        }
        dokumenUploads.value = loadedDocs;
      }

      // 4. Lahan & Pekebuns
      if (data.lahans && data.lahans.length > 0) {
        const lIds: string[] = [];
        const pIds = new Set<string>();
        for (const l of data.lahans) {
          lIds.push(String(l.id));
          if (l.pekebun_id) pIds.add(String(l.pekebun_id));
        }
        selectedLahanIds.value = lIds;
        selectedPekebunIds.value = Array.from(pIds);
      }

      // 5. RAB items
      const rabData = data.rab_proposal || (data.rabs && data.rabs.length > 0 ? data.rabs[0] : null);
      if (rabData && rabData.items && rabData.items.length > 0) {
        rabItems.value = rabData.items.map((it: any, idx: number) => ({
          id: String(it.id || idx + 1),
          tahap: 1,
          jenis: (it.details?.jenis || it.item_type || 'BARANG') as any,
          uraian: it.uraian || '',
          spesifikasi: it.details?.spesifikasi || '',
          varietas: it.details?.varietas,
          varietasCustom: it.details?.varietasCustom,
          satuan: it.unit || 'unit',
          volume: it.volume || 1,
          jumlahTahap1: it.details?.jumlahTahap1,
          jumlahTahap2: it.details?.jumlahTahap2,
          jumlahTahap3: it.details?.jumlahTahap3,
          jumlahTahap4: it.details?.jumlahTahap4,
          jumlahTotal: it.volume || 1,
          hargaSatuan: it.price_per_unit || 0,
          subTotal: (it.volume || 1) * (it.price_per_unit || 0),
        }));
      }

      // 6. Smart step navigation: land on first incomplete step
      if (!isStep1Valid.value) {
        currentStep.value = 1;
      } else if (!isStep2Valid.value) {
        currentStep.value = 2;
      } else {
        currentStep.value = 3;
      }
    } catch (err) {
      console.error('Failed to load draft:', err);
    }
  }

  /**
   * Delegates sequential 3-step submission to usePengusulanStore().createProposal() or proposalService.submitDraft()
   */
  async function submitProposal(kelembagaanId?: number): Promise<string> {
    isSubmitting.value = true;
    try {
      if (draftProposalId.value) {
        await saveDraft(kelembagaanId);
        const res = await proposalService.submitDraft(draftProposalId.value);
        return res.data.nomor_proposal;
      } else {
        const store = usePengusulanStore();
        const payload = getSubmissionPayload(kelembagaanId);
        const created = await store.createProposal(payload);
        return created.nomor_proposal;
      }
    } finally {
      isSubmitting.value = false;
    }
  }

  async function fetchAndAttachIamDocuments(kelembagaanId: number) {
    if (!kelembagaanId) return;
    try {
      isLoadingIamDocs.value = true;
      const res = await dokumenSyncService.getInitialDocuments(kelembagaanId);
      const docs = res?.documents || (res as any)?.data?.documents;
      if (Array.isArray(docs)) {
        for (const rawItem of docs) {
          const item: any = rawItem;
          const isAvailable = item.is_available ?? item.isAvailable ?? true;
          if (!isAvailable) continue;

          const docType = String(item.document_type || item.documentType || '').toUpperCase();
          const fileName = item.file_name || item.fileName || 'Dokumen-IAM.pdf';
          const fileUrl = item.file_url || item.fileUrl || '';
          const contentType = item.content_type || item.contentType || 'application/pdf';

          // Standardize slots: LEGALITAS_KP for Legalitas/Akta, SIMLUHTAN for Penunjukan Ketua
          const targetSlotId =
            docType === 'AKTA_LEMBAGA' || docType === 'LEGALITAS_KP'
              ? 'LEGALITAS_KP'
              : docType === 'PENUNJUKAN_KETUA' || docType === 'SIMLUHTAN'
                ? 'SIMLUHTAN'
                : docType;

          const existing = dokumenUploads.value.find((d) => {
            if (d.persyaratanId === targetSlotId) return true;
            if (
              (targetSlotId === 'LEGALITAS_KP' || targetSlotId === 'AKTA_LEMBAGA') &&
              (d.persyaratanId === 'LEGALITAS_KP' || d.persyaratanId === 'AKTA_LEMBAGA')
            ) return true;
            if (
              (targetSlotId === 'SIMLUHTAN' || targetSlotId === 'PENUNJUKAN_KETUA') &&
              (d.persyaratanId === 'SIMLUHTAN' || d.persyaratanId === 'PENUNJUKAN_KETUA')
            ) return true;
            return false;
          });

          if (!existing || existing.source === 'IAM_SYNC') {
            addDokumenUpload({
              persyaratanId: targetSlotId,
              namaFile: fileName,
              mimeType: contentType,
              ukuranBytes: 0,
              dataUrl: fileUrl,
              fileUrl: fileUrl,
              uploadedAt: new Date().toISOString(),
              source: 'IAM_SYNC',
              isVerifiedFromIam: true,
            });
          }
        }
      }
    } catch (err) {
      console.warn('Gagal memuat dokumen legalitas dari IAM:', err);
    } finally {
      isLoadingIamDocs.value = false;
    }
  }

  return {
    // State
    draftProposalId,
    draftNomorProposal,
    isSavingDraft,
    selectedPaket,
    dokumenUploads,
    storage_area,
    gudangSerahTerima,
    rabItems,
    rabDitandatangani,
    selectedPekebunIds,
    selectedLahanIds,
    selectedLahanDocs,
    currentStep,
    isSubmitting,
    isLoadingIamDocs,
    namaBank,
    // Getters
    isPupukPaket,
    rabTotal,
    rabTotalRounded,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    isRabValid,
    isPekebunLahanValid,
    missingStep1Docs,
    step2TotalPekebun,
    step3TotalPekebun,
    step2TotalLuasHa,
    step3TotalLuasHa,
    step2MinimumRule,
    step3MinimumRule,
    step2ValidationResult,
    step3ValidationResult,
    // Actions
    saveDraft,
    loadDraft,
    setPaket,
    addDokumenUpload,
    removeDokumenUpload,
    setGudang,
    setStorageArea,
    addRabItem,
    updateRabItem,
    removeRabItem,
    setRabDitandatangani,
    setSelectedPekebun,
    setSelectedLahan,
    setLahanDoc,
    removeLahanDoc,
    resetDraft,
    getSubmissionPayload,
    submitProposal,
    fetchAndAttachIamDocuments,
  };
});
