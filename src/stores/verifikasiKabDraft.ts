import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { DokumenUpload } from '@/types/pengusulan';
import type { RabItem } from '@/types/pengusulan';
import { usePekebunStore } from '@/stores/pekebun';
import { usePengusulanStore } from '@/stores/pengusulan';

type VerificationStatus = 'APPROVED' | 'REJECTED' | 'PENDING';

interface VerificationItem {
  status: VerificationStatus;
  notes: string;
  validatedByRole?: string;
}

export const PROPOSAL_ALIAS_MAP: Record<string, string[]> = {
  'SK_CPCL': ['sk-cpcl', 'SK_CPCL'],
  'BERITA_ACARA_DOKUMEN': ['berita-acara-dokumen', 'BA_VERIFIKASI', 'BERITA_ACARA_DOKUMEN', 'BA_DOKUMEN'],
  'BERITA_ACARA_LAPANGAN': ['berita-acara-lapangan', 'BA_VERIFIKASI_LAPANGAN', 'BERITA_ACARA_LAPANGAN', 'BA_LAPANGAN'],
  'BA_VERIFIKASI': ['berita-acara-dokumen', 'BA_VERIFIKASI', 'BERITA_ACARA_DOKUMEN', 'BA_DOKUMEN'],
  'BA_VERIFIKASI_LAPANGAN': ['berita-acara-lapangan', 'BA_VERIFIKASI_LAPANGAN', 'BERITA_ACARA_LAPANGAN', 'BA_LAPANGAN'],
  'sk-cpcl': ['SK_CPCL', 'sk-cpcl'],
  'berita-acara-dokumen': ['BERITA_ACARA_DOKUMEN', 'BA_VERIFIKASI', 'berita-acara-dokumen', 'BA_DOKUMEN'],
  'berita-acara-lapangan': ['BERITA_ACARA_LAPANGAN', 'BA_VERIFIKASI_LAPANGAN', 'berita-acara-lapangan', 'BA_LAPANGAN'],
  'DOKUMEN_LEGALITAS_KELEMBAGAAN': ['LEGALITAS_KP', 'DOKUMEN_LEGALITAS_KELEMBAGAAN'],
  'LEGALITAS_KP': ['DOKUMEN_LEGALITAS_KELEMBAGAAN', 'LEGALITAS_KP'],
  'SURAT_PERMOHONAN': ['SIMLUHTAN', 'SURAT_PERMOHONAN'],
  'SIMLUHTAN': ['SURAT_PERMOHONAN', 'SIMLUHTAN'],
  'SURAT_PERNYATAAN_LUAS': ['PERNYATAAN_LUAS', 'SURAT_PERNYATAAN_LUAS'],
  'PERNYATAAN_LUAS': ['SURAT_PERNYATAAN_LUAS', 'PERNYATAAN_LUAS'],
  'SURAT_PERNYATAAN_TANPA_BAKAR': ['PERNYATAAN_TANPA_BAKAR', 'SURAT_PERNYATAAN_TANPA_BAKAR'],
  'PERNYATAAN_TANPA_BAKAR': ['SURAT_PERNYATAAN_TANPA_BAKAR', 'PERNYATAAN_TANPA_BAKAR'],
  'PETA_LAHAN': ['GAMBAR_LAHAN', 'PETA_LAHAN'],
  'GAMBAR_LAHAN': ['PETA_LAHAN', 'GAMBAR_LAHAN'],
};

export const useVerifikasiKabDraftStore = defineStore(
  'verifikasi-kab-draft',
  () => {
    const currentStep = ref<1 | 2 | 3 | 4>(1);
    const verifications = ref<Record<string, VerificationItem>>({});
    const pekebunVerifications = ref<Record<string, VerificationItem>>({});
    const skCpcl = ref<DokumenUpload | null>(null);
    const skCpclRemoved = ref<boolean>(false);
    const beritaAcaraDokumen = ref<DokumenUpload | null>(null);
    const beritaAcaraDokumenRemoved = ref<boolean>(false);
    const beritaAcaraLapangan = ref<DokumenUpload | null>(null);
    const beritaAcaraLapanganRemoved = ref<boolean>(false);
    const fotoUdaraPerPekebun = ref<Record<string, DokumenUpload>>({});
    const rabItems = ref<RabItem[]>([]);
    const rabDitandatangani = ref<DokumenUpload | null>(null);

    function setSkCpcl(doc: DokumenUpload | null) {
      skCpcl.value = doc;
      if (doc) skCpclRemoved.value = false;
    }

    function removeSkCpcl() {
      skCpcl.value = null;
      skCpclRemoved.value = true;
    }

    function setBeritaAcaraDokumen(doc: DokumenUpload | null) {
      beritaAcaraDokumen.value = doc;
      if (doc) beritaAcaraDokumenRemoved.value = false;
    }

    function removeBeritaAcaraDokumen() {
      beritaAcaraDokumen.value = null;
      beritaAcaraDokumenRemoved.value = true;
    }

    function setBeritaAcaraLapangan(doc: DokumenUpload | null) {
      beritaAcaraLapangan.value = doc;
      if (doc) beritaAcaraLapanganRemoved.value = false;
    }

    function removeBeritaAcaraLapangan() {
      beritaAcaraLapangan.value = null;
      beritaAcaraLapanganRemoved.value = true;
    }

    const rabTotal = computed(() =>
      rabItems.value.reduce((sum, r) => sum + r.subTotal, 0),
    );

    function getVerification(key: string): VerificationItem {
      if (!verifications.value[key]) {
        verifications.value[key] = { status: 'PENDING', notes: '' };
      }
      return verifications.value[key];
    }

    function setVerificationStatus(key: string, status: VerificationStatus, syncAliases = true) {
      if (!verifications.value[key]) {
        verifications.value[key] = { status, notes: '' };
      } else {
        verifications.value[key].status = status;
        if (status === 'APPROVED') {
          verifications.value[key].notes = '';
        }
      }

      if (syncAliases && PROPOSAL_ALIAS_MAP[key]) {
        for (const alias of PROPOSAL_ALIAS_MAP[key]) {
          if (alias !== key) {
            setVerificationStatus(alias, status, false);
            if (status === 'APPROVED' && verifications.value[alias]) {
              verifications.value[alias].notes = '';
            }
          }
        }
      }
    }

    function addRabItem() {
      rabItems.value.push({
        id: `rab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        tahap: 'Semua Tahap',
        uraian: '',
        volume: null,
        satuan: '',
        hargaSatuan: null,
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

      // If patch specifies jumlahTotal directly or has tahap 3/4
      if (patch.jumlahTotal !== undefined && patch.jumlahTotal !== null) {
        item.jumlahTotal = patch.jumlahTotal;
      } else if (item.jumlahTahap3 != null || item.jumlahTahap4 != null) {
        item.jumlahTotal = q1 + q2 + q3 + q4;
      } else if (item.jumlahTahap2 != null) {
        item.jumlahTotal = q1 + q2;
      } else {
        item.jumlahTotal = item.jumlahTahap1 ?? item.volume ?? item.jumlahTotal ?? 0;
      }

      item.volume = item.jumlahTotal;
      item.subTotal = (item.jumlahTotal ?? 0) * (item.hargaSatuan ?? 0);
      item.total_price = item.subTotal;
    }

    function removeRabItem(id: string) {
      rabItems.value = rabItems.value.filter((r) => r.id !== id);
    }

    function setRabDitandatangani(doc: DokumenUpload | null) {
      rabDitandatangani.value = doc;
    }

    const activeProposalId = ref<string | null>(null);

    function initForProposal(proposalId: string, initialRabItems?: RabItem[]) {
      if (activeProposalId.value !== String(proposalId)) {
        activeProposalId.value = String(proposalId);
        verifications.value = {};
        pekebunVerifications.value = {};
        rabDitandatangani.value = null;
        skCpclRemoved.value = false;
        beritaAcaraDokumenRemoved.value = false;
        beritaAcaraLapanganRemoved.value = false;
        if (initialRabItems && Array.isArray(initialRabItems)) {
          rabItems.value = initialRabItems.map((r) => ({
            ...r,
            varietas: r.varietas || r.details?.varietas || '',
            varietasCustom: r.varietasCustom || r.details?.varietasCustom || '',
          }));
        } else {
          rabItems.value = [];
        }
      } else if (initialRabItems && Array.isArray(initialRabItems)) {
        if (rabItems.value.length === 0) {
          rabItems.value = initialRabItems.map((r) => ({
            ...r,
            varietas: r.varietas || r.details?.varietas || '',
            varietasCustom: r.varietasCustom || r.details?.varietasCustom || '',
          }));
        } else {
          rabItems.value.forEach((r, idx) => {
            if (!r.varietas) {
              const match = initialRabItems.find((init) => init.uraian === r.uraian || init.id === r.id) || initialRabItems[idx];
              if (match && (match.varietas || match.details?.varietas)) {
                r.varietas = match.varietas || match.details?.varietas || '';
                r.varietasCustom = match.varietasCustom || match.details?.varietasCustom || '';
              }
            }
          });
        }
      }
    }

    function syncProposalValidations(validations: any[], documents: any[], proposal?: any) {
      if (!Array.isArray(validations) || !Array.isArray(documents)) return;
      const sorted = [...validations].sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));

      for (const val of sorted) {
        let docType = '';
        const doc = documents.find((d: any) => Number(d.id) === Number(val.dokumen_proposal_id));
        if (doc) {
          docType = doc.document_type || doc.documentType || doc.tipeDokumen || doc.persyaratanId || '';
        } else if (val.document_type || val.tipe_dokumen) {
          docType = val.document_type || val.tipe_dokumen;
        }

        if (docType) {
          if (docType.toUpperCase().includes('RAB')) {
            continue;
          }
          const isApproved = val.is_valid === true;
          const statusStr: VerificationStatus = isApproved ? 'APPROVED' : 'REJECTED';

          setVerificationStatus(docType, statusStr);
          if (verifications.value[docType]) {
            if (val.notes) verifications.value[docType].notes = val.notes;
            if (val.validated_by_role) verifications.value[docType].validatedByRole = val.validated_by_role;
          }

          const aliases = PROPOSAL_ALIAS_MAP[docType] || [];
          for (const alias of aliases) {
            setVerificationStatus(alias, statusStr);
            if (verifications.value[alias]) {
              if (val.notes) verifications.value[alias].notes = val.notes;
              if (val.validated_by_role) verifications.value[alias].validatedByRole = val.validated_by_role;
            }
          }
        }
      }

      // Sync Storage Area validations from proposal payload if present
      const sa = proposal?.storage_area || proposal?.gudangSerahTerima;
      if (sa) {
        if (sa.address_is_valid !== null && sa.address_is_valid !== undefined) {
          setVerificationStatus('gudangAlamat', sa.address_is_valid ? 'APPROVED' : 'REJECTED');
          if (sa.address_notes && verifications.value['gudangAlamat']) {
            verifications.value['gudangAlamat'].notes = sa.address_notes;
          }
        }
        if (sa.coordinate_is_valid !== null && sa.coordinate_is_valid !== undefined) {
          setVerificationStatus('gudangKoordinat', sa.coordinate_is_valid ? 'APPROVED' : 'REJECTED');
          if (sa.coordinate_notes && verifications.value['gudangKoordinat']) {
            verifications.value['gudangKoordinat'].notes = sa.coordinate_notes;
          }
        }
        if (sa.exterior_photo_is_valid !== null && sa.exterior_photo_is_valid !== undefined) {
          setVerificationStatus('fotoTampakDepan', sa.exterior_photo_is_valid ? 'APPROVED' : 'REJECTED');
          if (sa.exterior_photo_notes && verifications.value['fotoTampakDepan']) {
            verifications.value['fotoTampakDepan'].notes = sa.exterior_photo_notes;
          }
        }
        if (sa.interior_photo_is_valid !== null && sa.interior_photo_is_valid !== undefined) {
          setVerificationStatus('fotoTampakDalam', sa.interior_photo_is_valid ? 'APPROVED' : 'REJECTED');
          if (sa.interior_photo_notes && verifications.value['fotoTampakDalam']) {
            verifications.value['fotoTampakDalam'].notes = sa.interior_photo_notes;
          }
        }
      }
    }

    function syncFarmerDocumentValidations(validations: any[], pekebuns?: any[], cpclListParam?: any[]) {
      if (!Array.isArray(validations)) return;
      const pekebunStore = usePekebunStore();
      const pengusulanStore = usePengusulanStore();
      const cpclRows = cpclListParam || pengusulanStore.activePengajuan?.daftarCPCL || [];
      const farmerProfiles = Array.isArray(pekebuns) ? pekebuns : [];

      for (const val of validations) {
        const isApproved = val.is_valid === true;
        const statusStr: VerificationStatus = isApproved ? 'APPROVED' : 'REJECTED';
        const docId = val.dokumen_pekebun_id || val.document_id || val.dokumen_id || val.id;
        if (!docId) continue;

        const targetIds = new Set<string>();

        // 0. Direct match by farmer_profile_id / pekebun_id
        if (val.farmer_profile_id || val.pekebun_id || val.farmer_id) {
          const fId = String(val.farmer_profile_id || val.pekebun_id || val.farmer_id);
          targetIds.add(fId);
          const matchedFp = farmerProfiles.find((fp: any) => String(fp.id) === fId);
          if (matchedFp?.nik) targetIds.add(String(matchedFp.nik).trim());
          for (const c of cpclRows) {
            if (
              String(c.pekebun_id) === fId ||
              String(c.farmer_id) === fId ||
              (matchedFp?.nik && c.nik && String(c.nik).trim() === String(matchedFp.nik).trim())
            ) {
              targetIds.add(String(c.id));
              if (c.nik) targetIds.add(String(c.nik).trim());
            }
          }
        }

        // 1. Check in farmerProfiles
        for (const fp of farmerProfiles) {
          const docs = fp.documents || fp.dokumen || fp.dokumen_pekebun || [];
          let match = docs.some((d: any) => Number(d.id) === Number(docId));
          if (!match && fp.nik) {
            const enriched = (pekebunStore.listPekebun || []).find((pk) => String(pk.nik || '').trim() === String(fp.nik || '').trim());
            if (enriched && Array.isArray(enriched.dokumen)) {
              match = enriched.dokumen.some((d: any) => Number(d.id) === Number(docId));
            }
          }
          if (match) {
            if (fp.id) targetIds.add(String(fp.id));
            if (fp.nik) targetIds.add(String(fp.nik).trim());
            for (const c of cpclRows) {
              const nikMatch = c.nik && fp.nik && String(c.nik).trim() === String(fp.nik).trim();
              const idMatch = String(c.id) === String(fp.id);
              const pekebunIdMatch = (c.pekebun_id && Number(c.pekebun_id) === Number(fp.id)) || (c.farmer_id && Number(c.farmer_id) === Number(fp.id));
              const nameMatch = c.namaPekebun && fp.name && String(c.namaPekebun).trim().toLowerCase() === String(fp.name).trim().toLowerCase();
              if (nikMatch || idMatch || pekebunIdMatch || nameMatch) {
                targetIds.add(String(c.id));
                if (c.nik) targetIds.add(String(c.nik).trim());
                if (c.pekebun_id) targetIds.add(String(c.pekebun_id));
              }
            }
          }
        }

        // 2. Check in cpclRows directly
        for (const c of cpclRows) {
          const docs = c.documents || c.dokumen || [];
          let match = docs.some((d: any) => Number(d.id) === Number(docId));
          if (!match && c.nik) {
            const enriched = (pekebunStore.listPekebun || []).find((pk) => String(pk.nik || '').trim() === String(c.nik || '').trim());
            if (enriched && Array.isArray(enriched.dokumen)) {
              match = enriched.dokumen.some((d: any) => Number(d.id) === Number(docId));
            }
          }
          if (match) {
            targetIds.add(String(c.id));
            if (c.nik) targetIds.add(String(c.nik).trim());
            if (c.pekebun_id) targetIds.add(String(c.pekebun_id));
            if (c.farmer_id) targetIds.add(String(c.farmer_id));
          }
        }

        // Fallback: If targetIds is empty, and there is only 1 CPCL or farmer in the proposal
        if (targetIds.size === 0) {
          if (cpclRows.length === 1) {
            targetIds.add(String(cpclRows[0].id));
            if (cpclRows[0].nik) targetIds.add(String(cpclRows[0].nik).trim());
          }
          if (farmerProfiles.length === 1) {
            targetIds.add(String(farmerProfiles[0].id));
            if (farmerProfiles[0].nik) targetIds.add(String(farmerProfiles[0].nik).trim());
          }
        }

        for (const targetId of targetIds) {
          const mainKey = `doc-${targetId}-${docId}`;
          setVerificationStatus(mainKey, statusStr);
          if (val.notes && verifications.value[mainKey]) {
            verifications.value[mainKey].notes = val.notes;
          }

          if (!isApproved) {
            pekebunVerifications.value[targetId] = { status: 'REJECTED', notes: val.notes || '' };
          } else {
            if (!pekebunVerifications.value[targetId] || pekebunVerifications.value[targetId].status !== 'REJECTED') {
              pekebunVerifications.value[targetId] = { status: 'APPROVED', notes: '' };
            }
          }

          const detailMap: Record<string, boolean> = {};
          if (Array.isArray(val.details)) {
            for (const d of val.details) {
              if (d.field_name) {
                const subKey = `doc-${targetId}-${docId}-${d.field_name}`;
                const subStatus: VerificationStatus = d.is_valid === true ? 'APPROVED' : 'REJECTED';
                setVerificationStatus(subKey, subStatus);
                if (d.notes && verifications.value[subKey]) {
                  verifications.value[subKey].notes = d.notes;
                }
                detailMap[d.field_name] = d.is_valid === true;
              }
            }
          }

          if (isApproved) {
            const defaultFields = ['namaLengkap', 'nik', 'nomorKK'];
            for (const field of defaultFields) {
              if (detailMap[field] === undefined) {
                const subKey = `doc-${targetId}-${docId}-${field}`;
                setVerificationStatus(subKey, 'APPROVED');
              }
            }
          }
        }
      }
    }

    function syncLandDocumentValidations(validations: any[], pekebuns?: any[], lahansList?: any[], cpclListParam?: any[]) {
      if (!Array.isArray(validations)) return;
      const pengusulanStore = usePengusulanStore();
      const allLahans = lahansList || (pengusulanStore.activePengajuan as any)?.lahans || [];
      const cpclRows = cpclListParam || pengusulanStore.activePengajuan?.daftarCPCL || [];
      const farmerProfiles = Array.isArray(pekebuns) ? pekebuns : [];

      for (const val of validations) {
        const isApproved = val.is_valid === true;
        const statusStr: VerificationStatus = isApproved ? 'APPROVED' : 'REJECTED';
        const landDocId = val.dokumen_lahan_id || val.document_id || val.dokumen_id || val.id;
        if (!landDocId) continue;

        const targetIds = new Set<string>();

        // 0. Direct match by land_id / lahan_id
        if (val.land_id || val.lahan_id) {
          const lId = String(val.land_id || val.lahan_id);
          targetIds.add(lId);
          for (const c of cpclRows) {
            if (String(c.id) === lId) {
              if (c.nik) targetIds.add(String(c.nik).trim());
              if (c.pekebun_id) targetIds.add(String(c.pekebun_id));
            }
          }
        }

        // 1. Scan lahans in allLahans
        for (const l of allLahans) {
          const lDocs = l.documents || l.dokumen || [];
          if (lDocs.some((d: any) => Number(d.id) === Number(landDocId))) {
            targetIds.add(String(l.id)); // lahan ID matches cpclId
            if (l.pekebun_id) targetIds.add(String(l.pekebun_id));
            for (const c of cpclRows) {
              const idMatch = String(c.id) === String(l.id);
              const pekebunIdMatch = l.pekebun_id && (Number(c.pekebun_id) === Number(l.pekebun_id) || Number(c.farmer_id) === Number(l.pekebun_id));
              const lahanObjMatch = c.lahan && String(c.lahan.id) === String(l.id);
              if (idMatch || pekebunIdMatch || lahanObjMatch) {
                targetIds.add(String(c.id));
                if (c.nik) targetIds.add(String(c.nik).trim());
                if (c.pekebun_id) targetIds.add(String(c.pekebun_id));
              }
            }
          }
        }

        // 2. Scan lahans on farmer profiles
        for (const fp of farmerProfiles) {
          const lahans = fp.lahans || (fp.enriched?.lahan ? [fp.enriched.lahan] : []);
          for (const l of lahans) {
            const lDocs = l.documents || l.dokumen || [];
            if (lDocs.some((d: any) => Number(d.id) === Number(landDocId))) {
              if (l.id) targetIds.add(String(l.id));
              if (fp.id) targetIds.add(String(fp.id));
              if (fp.nik) targetIds.add(String(fp.nik).trim());
            }
          }
        }

        // Fallback: If only 1 CPCL or lahan exists
        if (targetIds.size === 0) {
          if (cpclRows.length === 1) {
            targetIds.add(String(cpclRows[0].id));
            if (cpclRows[0].nik) targetIds.add(String(cpclRows[0].nik).trim());
          }
          if (allLahans.length === 1) {
            targetIds.add(String(allLahans[0].id));
            if (allLahans[0].pekebun_id) targetIds.add(String(allLahans[0].pekebun_id));
          }
        }

        for (const targetId of targetIds) {
          const key = `doc-${targetId}-${landDocId}`;
          setVerificationStatus(key, statusStr);
          if (val.notes && verifications.value[key]) {
            verifications.value[key].notes = val.notes;
          }

          if (!isApproved) {
            pekebunVerifications.value[targetId] = { status: 'REJECTED', notes: val.notes || '' };
          } else {
            if (!pekebunVerifications.value[targetId] || pekebunVerifications.value[targetId].status !== 'REJECTED') {
              pekebunVerifications.value[targetId] = { status: 'APPROVED', notes: '' };
            }
          }

          const detailMap: Record<string, boolean> = {};
          if (Array.isArray(val.details)) {
            for (const d of val.details) {
              if (d.field_name) {
                const subKey = `doc-${targetId}-${landDocId}-${d.field_name}`;
                const subStatus: VerificationStatus = d.is_valid === true ? 'APPROVED' : 'REJECTED';
                setVerificationStatus(subKey, subStatus);
                if (d.notes && verifications.value[subKey]) {
                  verifications.value[subKey].notes = d.notes;
                }
                if (d.field_name === 'polygon' || d.field_name === 'koordinat_poligon') {
                  const lahanPolygonKey = `lahan-${targetId}-polygon`;
                  setVerificationStatus(lahanPolygonKey, subStatus);
                  if (d.notes && verifications.value[lahanPolygonKey]) {
                    verifications.value[lahanPolygonKey].notes = d.notes;
                  }
                }
                detailMap[d.field_name] = d.is_valid === true;
              }
            }
          }

          if (isApproved) {
            const defaultFields = ['jenis_legalitas', 'nomor_legalitas', 'tanggal_penerbitan_legalitas', 'luas_lahan', 'nomor_surat_beda_nama', 'polygon'];
            for (const field of defaultFields) {
              if (detailMap[field] === undefined) {
                const subKey = `doc-${targetId}-${landDocId}-${field}`;
                setVerificationStatus(subKey, 'APPROVED');
                if (field === 'polygon') {
                  setVerificationStatus(`lahan-${targetId}-polygon`, 'APPROVED');
                }
              }
            }
          }
        }
      }
    }

    function resetDraft() {
      activeProposalId.value = null;
      currentStep.value = 1;
      verifications.value = {};
      pekebunVerifications.value = {};
      skCpcl.value = null;
      skCpclRemoved.value = false;
      beritaAcaraDokumen.value = null;
      beritaAcaraDokumenRemoved.value = false;
      beritaAcaraLapangan.value = null;
      beritaAcaraLapanganRemoved.value = false;
      fotoUdaraPerPekebun.value = {};
      rabItems.value = [];
      rabDitandatangani.value = null;
    }

    return {
      activeProposalId,
      currentStep,
      verifications,
      pekebunVerifications,
      skCpcl,
      skCpclRemoved,
      beritaAcaraDokumen,
      beritaAcaraDokumenRemoved,
      beritaAcaraLapangan,
      beritaAcaraLapanganRemoved,
      fotoUdaraPerPekebun,
      rabItems,
      rabDitandatangani,
      rabTotal,
      setSkCpcl,
      removeSkCpcl,
      setBeritaAcaraDokumen,
      removeBeritaAcaraDokumen,
      setBeritaAcaraLapangan,
      removeBeritaAcaraLapangan,
      getVerification,
      setVerificationStatus,
      syncProposalValidations,
      syncFarmerDocumentValidations,
      syncLandDocumentValidations,
      addRabItem,
      updateRabItem,
      removeRabItem,
      setRabDitandatangani,
      initForProposal,
      resetDraft,
    };
  },
  { persist: true },
);