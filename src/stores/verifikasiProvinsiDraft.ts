import { defineStore } from 'pinia';
import { ref } from 'vue';
import { DokumenUpload } from '@/types/pengusulan';

type VerificationStatus = 'APPROVED' | 'REJECTED' | 'PENDING';

interface VerificationItem {
  status: VerificationStatus;
  notes: string;
}

export const PROPOSAL_ALIAS_MAP: Record<string, string[]> = {
  'SK_CPCL': ['sk-cpcl', 'SK_CPCL', 'SK_CPCL_KABUPATEN'],
  'BERITA_ACARA_DOKUMEN': ['berita-acara-dokumen', 'BA_VERIFIKASI', 'BERITA_ACARA_DOKUMEN', 'BA_DOKUMEN'],
  'BERITA_ACARA_LAPANGAN': ['berita-acara-lapangan', 'BA_VERIFIKASI_LAPANGAN', 'BERITA_ACARA_LAPANGAN', 'BA_LAPANGAN'],
  'BA_VERIFIKASI': ['berita-acara-dokumen', 'BA_VERIFIKASI', 'BERITA_ACARA_DOKUMEN', 'BA_DOKUMEN'],
  'BA_VERIFIKASI_LAPANGAN': ['berita-acara-lapangan', 'BA_VERIFIKASI_LAPANGAN', 'BERITA_ACARA_LAPANGAN', 'BA_LAPANGAN'],
  'sk-cpcl': ['SK_CPCL', 'sk-cpcl'],
  'berita-acara-dokumen': ['BERITA_ACARA_DOKUMEN', 'BA_VERIFIKASI', 'berita-acara-dokumen', 'BA_DOKUMEN'],
  'berita-acara-lapangan': ['BERITA_ACARA_LAPANGAN', 'BA_VERIFIKASI_LAPANGAN', 'berita-acara-lapangan', 'BA_LAPANGAN'],
  'DOKUMEN_LEGALITAS_KELEMBAGAAN': ['LEGALITAS_KP', 'DOKUMEN_LEGALITAS_KELEMBAGAAN', 'LEGALITAS_KELEMBAGAAN'],
  'LEGALITAS_KP': ['DOKUMEN_LEGALITAS_KELEMBAGAAN', 'LEGALITAS_KP', 'LEGALITAS_KELEMBAGAAN'],
  'SURAT_PERMOHONAN': ['SIMLUHTAN', 'SURAT_PERMOHONAN'],
  'SIMLUHTAN': ['SURAT_PERMOHONAN', 'SIMLUHTAN'],
  'SURAT_PERNYATAAN_LUAS': ['PERNYATAAN_LUAS', 'SURAT_PERNYATAAN_LUAS'],
  'PERNYATAAN_LUAS': ['SURAT_PERNYATAAN_LUAS', 'PERNYATAAN_LUAS'],
  'SURAT_PERNYATAAN_TANPA_BAKAR': ['PERNYATAAN_TANPA_BAKAR', 'SURAT_PERNYATAAN_TANPA_BAKAR'],
  'PERNYATAAN_TANPA_BAKAR': ['SURAT_PERNYATAAN_TANPA_BAKAR', 'PERNYATAAN_TANPA_BAKAR'],
  'PETA_LAHAN': ['GAMBAR_LAHAN', 'PETA_LAHAN'],
  'GAMBAR_LAHAN': ['PETA_LAHAN', 'GAMBAR_LAHAN'],
  'RAB_FINAL': ['RAB_FINAL', 'rabDocument', 'rabItems'],
  'rabDocument': ['RAB_FINAL', 'rabDocument'],
  'rabItems': ['RAB_FINAL', 'rabItems'],
};

export const useVerifikasiProvinsiDraftStore = defineStore(
  'verifikasi-provinsi-draft',
  () => {
    const proposalId = ref<string | null>(null);
    const currentStep = ref<1 | 2 | 3 | 4>(1);
    const verifications = ref<Record<string, VerificationItem>>({});
    const kabValidations = ref<Record<string, VerificationItem>>({});
    const pekebunVerifications = ref<Record<string, VerificationItem>>({});
    const kabSkCpcl = ref<DokumenUpload | null>(null);
    const kabBaVerifikasi = ref<DokumenUpload | null>(null);
    const kabBaVerifikasiLapangan = ref<DokumenUpload | null>(null);
    const skCpcl = ref<DokumenUpload | null>(null);
    const noSuratProvinsi = ref<string>('');
    const tglSuratProvinsi = ref<string>('');
    const namaDinasProvinsi = ref<string>('');
    const beritaAcara = ref<DokumenUpload | null>(null);
    const fotoLayoutUdara = ref<DokumenUpload | null>(null);
    const fotoUdaraPerPekebun = ref<Record<string, DokumenUpload>>({});

    function getVerification(key: string): VerificationItem {
      if (!verifications.value[key]) {
        verifications.value[key] = { status: 'PENDING', notes: '' };
      }
      return verifications.value[key];
    }

    function getKabupatenVerification(key: string): VerificationItem {
      if (kabValidations.value[key] && kabValidations.value[key].status !== 'PENDING') {
        return kabValidations.value[key];
      }
      const normKey = key.toUpperCase().replace(/[-_]/g, '');
      for (const [k, v] of Object.entries(kabValidations.value)) {
        if (k.toUpperCase().replace(/[-_]/g, '') === normKey && v.status !== 'PENDING') {
          return v;
        }
      }
      const aliases = PROPOSAL_ALIAS_MAP[key] || [];
      for (const a of aliases) {
        if (kabValidations.value[a] && kabValidations.value[a].status !== 'PENDING') {
          return kabValidations.value[a];
        }
        const normA = a.toUpperCase().replace(/[-_]/g, '');
        for (const [k, v] of Object.entries(kabValidations.value)) {
          if (k.toUpperCase().replace(/[-_]/g, '') === normA && v.status !== 'PENDING') {
            return v;
          }
        }
      }
      if (verifications.value[key] && verifications.value[key].status !== 'PENDING') {
        return verifications.value[key];
      }
      return { status: 'PENDING', notes: '' };
    }

    function setVerification(key: string, item: { status: VerificationStatus; notes?: string }) {
      verifications.value = {
        ...verifications.value,
        [key]: {
          status: item.status,
          notes: item.notes || '',
        },
      };
    }

    function setVerificationStatus(key: string, status: VerificationStatus, notes?: string) {
      const current = verifications.value[key] || { status: 'PENDING', notes: '' };
      verifications.value = {
        ...verifications.value,
        [key]: {
          status,
          notes: notes !== undefined ? notes : status === 'APPROVED' ? '' : current.notes,
        },
      };
    }

    function syncProposalValidations(validations: any[], documents: any[], proposal?: any) {
      if (!Array.isArray(validations) || validations.length === 0) return;

      const aliases: Record<string, string[]> = {
        BA_VERIFIKASI: ['BA_VERIFIKASI', 'BERITA_ACARA_DOKUMEN', 'BERITA_ACARA_VERIFIKASI', 'BERITA_ACARA', 'BA_DOKUMEN', 'BA-VERIFIKASI', 'BERITA-ACARA-DOKUMEN'],
        BA_VERIFIKASI_LAPANGAN: ['BA_VERIFIKASI_LAPANGAN', 'BERITA_ACARA_LAPANGAN', 'BA_LAPANGAN', 'BA-VERIFIKASI-LAPANGAN', 'BERITA-ACARA-LAPANGAN'],
        SK_CPCL: ['SK_CPCL', 'SK-CPCL', 'SK_CPCL_KABUPATEN', 'SK-CPCL-KABUPATEN'],
      };

      const keyMapping: Record<string, string> = {
        BA_VERIFIKASI: 'baVerifikasiDoc',
        BA_VERIFIKASI_LAPANGAN: 'baVerifikasiLapanganDoc',
        SK_CPCL: 'skCpclDoc',
      };

      const allDocs = Array.isArray(documents) ? documents : [];

      // 1. Validator Documents (Provinsi validation sync)
      for (const [docKey, keyName] of Object.entries(keyMapping)) {
        const allowed = (aliases[docKey] || [docKey]).map((a) => a.toUpperCase().replace(/[-_]/g, ''));
        const doc = allDocs.find((d: any) => {
          const t = (d.document_type || d.documentType || d.tipe_dokumen || d.tipeDokumen || '').toUpperCase().replace(/[-_]/g, '');
          return allowed.includes(t);
        });
        const docIdNum = doc?.id ? Number(String(doc.id).replace(/[^\d]/g, '')) || 0 : 0;

        const matched = validations.filter((v: any) => {
          const vDocId = Number(v.dokumen_proposal_id || v.proposal_document_id || v.dokumen_id || 0);
          const vDocType = (v.document_type || v.documentType || v.tipe_dokumen || v.tipeDokumen || '').toUpperCase().replace(/[-_]/g, '');
          const matchId = docIdNum > 0 && vDocId === docIdNum;
          const matchType = vDocType && allowed.includes(vDocType);
          return matchId || matchType;
        });

        if (matched.length > 0) {
          const latest = matched.slice().sort((a: any, b: any) => {
            const timeA = new Date(a.validated_at || a.created_at || 0).getTime();
            const timeB = new Date(b.validated_at || b.created_at || 0).getTime();
            if (timeA !== timeB) return timeB - timeA;
            return Number(b.id || 0) - Number(a.id || 0);
          })[0];

          const isValid = latest.is_valid === true || latest.is_valid === 1 || String(latest.is_valid).toLowerCase() === 'true';
          const isRejected = latest.is_valid === false || latest.is_valid === 0 || String(latest.is_valid).toLowerCase() === 'false';
          const status = isValid ? 'APPROVED' : isRejected ? 'REJECTED' : 'PENDING';

          setVerification(keyName, {
            status,
            notes: latest.notes || '',
          });
        }
      }

      // 2. Sync proposal package documents validation state (Kabupaten validations)
      const sortedVals = [...validations].sort((a: any, b: any) => {
        const timeA = new Date(a.validated_at || a.created_at || 0).getTime();
        const timeB = new Date(b.validated_at || b.created_at || 0).getTime();
        if (timeA !== timeB) return timeA - timeB;
        return (Number(a.id) || 0) - (Number(b.id) || 0);
      });

      for (const val of sortedVals) {
        let docType = '';
        const vDocId = Number(val.dokumen_proposal_id || val.proposal_document_id || val.dokumen_id || 0);
        const doc = allDocs.find((d: any) => Number(d.id) === vDocId);
        if (doc) {
          docType = doc.document_type || doc.documentType || doc.tipeDokumen || doc.persyaratanId || '';
        } else if (val.document_type || val.tipe_dokumen) {
          docType = val.document_type || val.tipe_dokumen;
        }

        if (docType) {
          const isValid = val.is_valid === true || val.is_valid === 1 || String(val.is_valid).toLowerCase() === 'true';
          const isRejected = val.is_valid === false || val.is_valid === 0 || String(val.is_valid).toLowerCase() === 'false';
          const statusStr: VerificationStatus = isValid ? 'APPROVED' : isRejected ? 'REJECTED' : 'PENDING';

          kabValidations.value[docType] = { status: statusStr, notes: val.notes || '' };

          const mappedAliases = PROPOSAL_ALIAS_MAP[docType] || [];
          for (const alias of mappedAliases) {
            kabValidations.value[alias] = { status: statusStr, notes: val.notes || '' };
          }
          if (vDocId) {
            kabValidations.value[`doc_${vDocId}`] = { status: statusStr, notes: val.notes || '' };
          }
        }
      }

      // 3. Sync Storage Area validations from proposal payload
      const sa = proposal?.storage_area || proposal?.gudangSerahTerima;
      if (sa) {
        if (sa.address_is_valid !== null && sa.address_is_valid !== undefined) {
          const st: VerificationStatus = sa.address_is_valid ? 'APPROVED' : 'REJECTED';
          kabValidations.value['gudangAlamat'] = { status: st, notes: sa.address_notes || '' };
        }
        if (sa.coordinate_is_valid !== null && sa.coordinate_is_valid !== undefined) {
          const st: VerificationStatus = sa.coordinate_is_valid ? 'APPROVED' : 'REJECTED';
          kabValidations.value['gudangKoordinat'] = { status: st, notes: sa.coordinate_notes || '' };
        }
        if (sa.exterior_photo_is_valid !== null && sa.exterior_photo_is_valid !== undefined) {
          const st: VerificationStatus = sa.exterior_photo_is_valid ? 'APPROVED' : 'REJECTED';
          kabValidations.value['fotoTampakDepan'] = { status: st, notes: sa.exterior_photo_notes || '' };
        }
        if (sa.interior_photo_is_valid !== null && sa.interior_photo_is_valid !== undefined) {
          const st: VerificationStatus = sa.interior_photo_is_valid ? 'APPROVED' : 'REJECTED';
          kabValidations.value['fotoTampakDalam'] = { status: st, notes: sa.interior_photo_notes || '' };
        }
      }
    }

    function resetDraft(newProposalId: string | null = null) {
      currentStep.value = 1;
      proposalId.value = newProposalId;
      verifications.value = {};
      kabValidations.value = {};
      pekebunVerifications.value = {};
      kabSkCpcl.value = null;
      kabBaVerifikasi.value = null;
      kabBaVerifikasiLapangan.value = null;
      skCpcl.value = null;
      noSuratProvinsi.value = '';
      tglSuratProvinsi.value = '';
      namaDinasProvinsi.value = '';
      beritaAcara.value = null;
      fotoLayoutUdara.value = null;
      fotoUdaraPerPekebun.value = {};
    }

    function initProposal(id: string) {
      if (proposalId.value !== id) {
        resetDraft(id);
      }
    }

    return {
      proposalId,
      currentStep,
      verifications,
      kabValidations,
      pekebunVerifications,
      kabSkCpcl,
      kabBaVerifikasi,
      kabBaVerifikasiLapangan,
      skCpcl,
      noSuratProvinsi,
      tglSuratProvinsi,
      namaDinasProvinsi,
      beritaAcara,
      fotoLayoutUdara,
      fotoUdaraPerPekebun,
      getVerification,
      getKabupatenVerification,
      setVerification,
      setVerificationStatus,
      syncProposalValidations,
      resetDraft,
      initProposal,
    };
  },
  { persist: true },
);