import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { DokumenUpload, SyncProposalDocumentItem, BulkCreateDocumentItem } from '@/types/pengusulan';
import { proposalService, extractFileObject } from '@/services/proposal.service';
import { usePengusulanStore } from './pengusulan';

type VerificationStatus = 'APPROVED' | 'REJECTED' | 'PENDING';

interface VerificationItem {
  status: VerificationStatus;
  notes: string;
}

export const useVerifikasiProvinsiStore = defineStore(
  'verifikasi-provinsi',
  () => {
    const verifications = ref<Record<string, VerificationItem>>({
      verif_1: { status: 'APPROVED', notes: 'Dokumen lengkap dan sesuai' },
      verif_2: { status: 'PENDING', notes: 'Menunggu verifikasi' },
      verif_3: { status: 'REJECTED', notes: 'File tidak terbaca, harap unggah ulang' },
    });
    const skCpcl = ref<DokumenUpload | null>({
      persyaratanId: 'sk-cpcl-prov-001',
      namaFile: 'sk_cpcl_prov_001.pdf',
      mimeType: 'application/pdf',
      ukuranBytes: 204800,
      dataUrl: '#',
      uploadedAt: '2026-07-28T10:00:00Z',
    });
    const fotoLayoutUdara = ref<DokumenUpload | null>({
      persyaratanId: 'foto-layout-prov-001',
      namaFile: 'layout_udara_prov_001.jpg',
      mimeType: 'image/jpeg',
      ukuranBytes: 512000,
      dataUrl: '#',
      uploadedAt: '2026-07-28T10:00:00Z',
    });
    const fotoUdaraPerPekebun = ref<Record<string, DokumenUpload>>({});

    function reset() {
      verifications.value = {};
      skCpcl.value = null;
      fotoLayoutUdara.value = null;
      fotoUdaraPerPekebun.value = {};
    }

    /**
     * Send back proposal for revision to Dinas Kabupaten:
     * 1. bulkProposalValidations (if validation payloads exist)
     * 2. update proposal status to "REV_FROM_PROV" in proposal.service.ts
     */
    async function sendBackForRevision(proposalId: string | number, validations?: any[], notes?: string) {
      const numId = Number(String(proposalId).replace(/[^\d]/g, '')) || proposalId;

      // (1) bulkProposalValidations
      if (validations && validations.length > 0) {
        await proposalService.bulkProposalValidations(validations);
      }

      // (2) update proposal status to REV_FROM_PROV
      const res = await proposalService.update(numId, {
        status: 'REV_FROM_PROV',
      });

      const pengusulanStore = usePengusulanStore();
      pengusulanStore.updateStatus(String(proposalId), 'REV_FROM_PROV', notes);

      return res;
    }

    /**
     * Submit proposal to Ditjenbun:
     * 1. bulkProposalValidations (if validation payloads exist)
     * 2. update proposal status to "PROV_SUBMITTED" in proposal.service.ts
     * 3. Flexible document handling:
     *    - 'update': updateProposalDocument for updating single existing document (PUT /proposals/{proposal_id}/documents/{id})
     *    - 'create': bulkCreateDocuments for creating new documents (POST /proposals/{proposal_id}/documents/bulk)
     *    - 'none' or no documents: skip upload/update
     */
    async function submitToDitjenbun(
      proposalId: string | number,
      validations?: any[],
      documents?: (SyncProposalDocumentItem | BulkCreateDocumentItem | any)[] | FormData | any,
      docAction: 'create' | 'update' | 'sync' | 'none' = 'create',
      documentIdToUpdate?: string | number,
      metadata?: {
        no_surat_provinsi?: string;
        tgl_surat_provinsi?: string;
        nama_dinas_provinsi?: string;
      },
    ) {
      const numId = Number(String(proposalId).replace(/[^\d]/g, '')) || proposalId;

      // (1) bulkProposalValidations
      if (validations && validations.length > 0) {
        await proposalService.bulkProposalValidations(validations);
      }

      // (2) Document upload / update handling (must run before status transition so file exists in DB)
      if (documents && docAction !== 'none') {
        const singleDoc = Array.isArray(documents) ? documents[0] : documents;
        const fileObj = extractFileObject(singleDoc);
        const docType = (singleDoc?.document_type || singleDoc?.persyaratanId || 'SURAT_PENGANTAR_SK_CPCL').toUpperCase().trim();

        if (fileObj) {
          if (docAction === 'update' && documentIdToUpdate) {
            const docIdNum = Number(String(documentIdToUpdate).replace(/[^\d]/g, '')) || documentIdToUpdate;
            console.log('FILE UPDATE');
            await proposalService.updateProposalDocument(numId, docIdNum, {
              document_type: docType,
              file: fileObj,
            });
          } else if (docAction === 'create' || !documentIdToUpdate) {
            await proposalService.bulkCreateDocuments(numId, [
              {
                document_type: docType,
                file: fileObj,
              },
            ]);
          } else if (docAction === 'sync') {
            await proposalService.syncDocuments(numId, documents);
          }
        } else if (docAction === 'sync') {
          await proposalService.syncDocuments(numId, documents);
        } else if (docAction === 'create' && Array.isArray(documents) && documents.length > 0) {
          await proposalService.bulkCreateDocuments(numId, documents);
        }
      }

      // (3) update proposal status to PROV_SUBMITTED and pass regional letter metadata
      const updatePayload: any = {
        status: 'PROV_SUBMITTED',
      };
      if (metadata?.no_surat_provinsi) updatePayload.no_surat_provinsi = metadata.no_surat_provinsi;
      if (metadata?.tgl_surat_provinsi) updatePayload.tgl_surat_provinsi = metadata.tgl_surat_provinsi;
      if (metadata?.nama_dinas_provinsi) updatePayload.nama_dinas_provinsi = metadata.nama_dinas_provinsi;

      const res = await proposalService.update(numId, updatePayload);

      const pengusulanStore = usePengusulanStore();
      pengusulanStore.updateStatus(String(proposalId), 'PROV_SUBMITTED');

      return res;
    }

    return {
      verifications,
      skCpcl,
      fotoLayoutUdara,
      fotoUdaraPerPekebun,
      reset,
      sendBackForRevision,
      submitToDitjenbun,
    };
  },
  { persist: true },
);
